/**
 * Accounting pattern flags (founder decision 5: in the first launch).
 * Output is "patterns worth asking an accountant about". A pattern is not
 * proof of wrongdoing, and the wording never says otherwise.
 */
import { daysBetween } from "./deadlines";
import { formatCents, formatIsoDate } from "./extract";

export interface ParsedRow {
  row: number;
  date: string;
  description: string;
  amountCents: number;
  balanceCents: number | null;
  account: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: string[];
}

/** RFC 4180-style CSV parsing with quoted fields. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function parseMoney(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const neg = /^\(.*\)$/.test(t) || /^-/.test(t) || /-$/.test(t);
  const digits = t.replace(/[()$,\sCAD-]/gi, "");
  if (!/^\d+(\.\d{1,2})?$/.test(digits)) return null;
  const [w, f = ""] = digits.split(".");
  const cents = Number(w) * 100 + Number(f.padEnd(2, "0"));
  return neg ? -cents : cents;
}

function parseDate(s: string): string | null {
  const t = s.trim();
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = t.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return null;
}

/**
 * Accepts a header row with: date, description, amount (or debit/credit),
 * optional balance and account. Dates must be yyyy-mm-dd to avoid guessing
 * between day-first and month-first formats.
 */
export function parseTransactions(text: string): ParseResult {
  const table = parseCsv(text);
  const errors: string[] = [];
  if (table.length < 2) return { rows: [], errors: ["The file has no data rows."] };
  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (...names: string[]) => header.findIndex((h) => names.includes(h));
  const iDate = col("date", "transaction date", "posted", "posting date");
  const iDesc = col("description", "details", "memo", "payee", "narrative");
  const iAmt = col("amount", "amount (cad)", "value");
  const iDebit = col("debit", "withdrawal", "withdrawals", "money out");
  const iCredit = col("credit", "deposit", "deposits", "money in");
  const iBal = col("balance", "running balance");
  const iAcct = col("account", "account name", "account number");
  if (iDate < 0) errors.push('No "date" column found.');
  if (iDesc < 0) errors.push('No "description" column found.');
  if (iAmt < 0 && iDebit < 0 && iCredit < 0) errors.push('No "amount" (or "debit"/"credit") column found.');
  if (errors.length) return { rows: [], errors };

  const rows: ParsedRow[] = [];
  table.slice(1).forEach((r, idx) => {
    const rowNo = idx + 2;
    const date = parseDate(r[iDate] ?? "");
    if (!date) {
      errors.push(`Row ${rowNo}: date must look like 2025-03-31.`);
      return;
    }
    let amount: number | null = null;
    if (iAmt >= 0) amount = parseMoney(r[iAmt] ?? "");
    else {
      const debit = iDebit >= 0 ? parseMoney(r[iDebit] ?? "") : null;
      const credit = iCredit >= 0 ? parseMoney(r[iCredit] ?? "") : null;
      if (debit !== null || credit !== null) amount = (credit ?? 0) - Math.abs(debit ?? 0);
    }
    if (amount === null) {
      errors.push(`Row ${rowNo}: amount is missing or not a number.`);
      return;
    }
    rows.push({
      row: rowNo,
      date,
      description: (r[iDesc] ?? "").trim().slice(0, 300),
      amountCents: amount,
      balanceCents: iBal >= 0 ? parseMoney(r[iBal] ?? "") : null,
      account: iAcct >= 0 ? (r[iAcct] ?? "").trim().slice(0, 100) : "",
    });
  });
  return { rows, errors };
}

export type MoneyFlagKind = "round_amount" | "duplicate" | "gap" | "large_transfer" | "balance_break" | "near_key_date";

export interface MoneyFlag {
  fingerprint: string;
  kind: MoneyFlagKind;
  title: string;
  detail: string;
  question: string;
  rows: number[];
}

export const MONEY_KIND_LABELS: Record<MoneyFlagKind, string> = {
  round_amount: "Round amounts",
  duplicate: "Repeated entries",
  gap: "Gaps in dates",
  large_transfer: "Large transfers",
  balance_break: "Balance does not carry forward",
  near_key_date: "Near a key date",
};

export interface MoneyOptions {
  roundThresholdCents?: number;
  gapDays?: number;
  largeMinCents?: number;
  keyDates?: { date: string; label: string }[];
  nearDays?: number;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

interface Txn {
  row: number;
  date: string;
  description: string;
  amountCents: number;
  balanceCents: number | null;
  account: string;
}

export function findMoneyPatterns(txns: Txn[], opts: MoneyOptions = {}): MoneyFlag[] {
  const roundMin = opts.roundThresholdCents ?? 100_000; // $1,000
  const gapDays = opts.gapDays ?? 35;
  const nearDays = opts.nearDays ?? 3;
  const flags: MoneyFlag[] = [];
  const sorted = [...txns].sort((a, b) => (a.date === b.date ? a.row - b.row : a.date < b.date ? -1 : 1));

  // Round amounts: multiples of $500 at or above the threshold.
  for (const t of sorted) {
    const abs = Math.abs(t.amountCents);
    if (abs >= roundMin && abs % 50_000 === 0) {
      flags.push({
        fingerprint: `round|${t.row}`,
        kind: "round_amount",
        title: `Round amount: ${formatCents(t.amountCents)} on ${formatIsoDate(t.date)}`,
        detail: `Row ${t.row}: "${t.description}". Round amounts are common and often ordinary, such as rent or a planned transfer.`,
        question: `What was the ${formatCents(Math.abs(t.amountCents))} on ${formatIsoDate(t.date)} for, and is there a document behind it?`,
        rows: [t.row],
      });
    }
  }

  // Repeated entries: same date, same amount, similar description.
  const seen = new Map<string, Txn>();
  for (const t of sorted) {
    const k = `${t.date}|${t.amountCents}|${t.description.toLowerCase().replace(/\W+/g, "").slice(0, 12)}`;
    const first = seen.get(k);
    if (first) {
      flags.push({
        fingerprint: `dup|${first.row}|${t.row}`,
        kind: "duplicate",
        title: `Repeated entry: ${formatCents(t.amountCents)} twice on ${formatIsoDate(t.date)}`,
        detail: `Rows ${first.row} and ${t.row} have the same date, amount and description. This can be a real second payment or a duplicate in the export.`,
        question: `Are rows ${first.row} and ${t.row} two separate payments, or one payment listed twice?`,
        rows: [first.row, t.row],
      });
    } else seen.set(k, t);
  }

  // Gaps in dates per account.
  const byAccount = new Map<string, Txn[]>();
  for (const t of sorted) byAccount.set(t.account, [...(byAccount.get(t.account) ?? []), t]);
  for (const [account, list] of byAccount) {
    for (let i = 1; i < list.length; i++) {
      const gap = daysBetween(list[i - 1].date, list[i].date);
      if (gap > gapDays) {
        flags.push({
          fingerprint: `gap|${account}|${list[i - 1].row}|${list[i].row}`,
          kind: "gap",
          title: `No entries for ${gap} days${account ? ` (${account})` : ""}`,
          detail: `Nothing between ${formatIsoDate(list[i - 1].date)} (row ${list[i - 1].row}) and ${formatIsoDate(list[i].date)} (row ${list[i].row}). A statement period may be missing, or the account was simply quiet.`,
          question: `Do we have every statement for ${formatIsoDate(list[i - 1].date)} to ${formatIsoDate(list[i].date)}?`,
          rows: [list[i - 1].row, list[i].row],
        });
      }
    }
  }

  // Large transfers: well above the usual size.
  const med = median(sorted.map((t) => Math.abs(t.amountCents)));
  const largeMin = Math.max(opts.largeMinCents ?? 500_000, med * 3);
  for (const t of sorted) {
    if (Math.abs(t.amountCents) >= largeMin && /transfer|e-?transfer|wire|withdrawal|draft/i.test(t.description)) {
      flags.push({
        fingerprint: `large|${t.row}`,
        kind: "large_transfer",
        title: `Large transfer: ${formatCents(t.amountCents)} on ${formatIsoDate(t.date)}`,
        detail: `Row ${t.row}: "${t.description}". This is much larger than the typical entry in this file (${formatCents(Math.round(med))}).`,
        question: `Where did the ${formatCents(Math.abs(t.amountCents))} transfer on ${formatIsoDate(t.date)} go, and who approved it?`,
        rows: [t.row],
      });
    }
  }

  // Running balance does not carry forward.
  for (const [account, list] of byAccount) {
    const inFileOrder = [...list].sort((a, b) => a.row - b.row);
    for (let i = 1; i < inFileOrder.length; i++) {
      const prev = inFileOrder[i - 1];
      const cur = inFileOrder[i];
      if (prev.balanceCents === null || cur.balanceCents === null) continue;
      const expected = prev.balanceCents + cur.amountCents;
      if (Math.abs(expected - cur.balanceCents) > 1) {
        flags.push({
          fingerprint: `balance|${account}|${cur.row}`,
          kind: "balance_break",
          title: `Balance does not follow from the previous line (row ${cur.row})`,
          detail: `Expected ${formatCents(expected)} after row ${prev.row} plus ${formatCents(cur.amountCents)}, but the file shows ${formatCents(cur.balanceCents)}. Rows may be missing or out of order.`,
          question: `Can the bank confirm the balance on ${formatIsoDate(cur.date)}, and are any entries missing before row ${cur.row}?`,
          rows: [prev.row, cur.row],
        });
      }
    }
  }

  // Near key timeline dates.
  for (const kd of opts.keyDates ?? []) {
    for (const t of sorted) {
      const d = Math.abs(daysBetween(kd.date, t.date));
      if (d <= nearDays && Math.abs(t.amountCents) >= roundMin) {
        flags.push({
          fingerprint: `near|${kd.date}|${t.row}`,
          kind: "near_key_date",
          title: `${formatCents(t.amountCents)} within ${d} day${d === 1 ? "" : "s"} of a timeline event`,
          detail: `Row ${t.row} (${formatIsoDate(t.date)}) is close to "${kd.label}" (${formatIsoDate(kd.date)}). Timing alone means nothing; it may be worth asking about.`,
          question: `Is the ${formatCents(Math.abs(t.amountCents))} on ${formatIsoDate(t.date)} connected to "${kd.label}"?`,
          rows: [t.row],
        });
      }
    }
  }
  return flags;
}
