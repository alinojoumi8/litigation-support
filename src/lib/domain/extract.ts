/**
 * Deterministic text extraction used by the local demo extractor (mock AI)
 * and by the rule-based discrepancy finder. Pure functions, no I/O.
 */
import type { DatePrecision } from "./types";

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9,
  september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

const MONTH_RE =
  "(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\.?";

export interface FoundDate {
  iso: string;
  precision: DatePrecision;
  text: string;
  index: number;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function validDay(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1) return false;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d <= days;
}

/** Find calendar dates in text. Ambiguous numeric dates like 03/04/2025 are skipped on purpose. */
export function findDates(text: string): FoundDate[] {
  const found: FoundDate[] = [];
  const push = (iso: string, precision: DatePrecision, t: string, index: number) => {
    if (!found.some((f) => f.index === index)) found.push({ iso, precision, text: t, index });
  };

  // March 3, 2025 / Mar. 3 2025
  const mdy = new RegExp(`\\b${MONTH_RE}\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+((?:19|20)\\d{2})\\b`, "gi");
  for (const m of text.matchAll(mdy)) {
    const mo = MONTHS[m[1].toLowerCase().replace(".", "")];
    const d = Number(m[2]);
    const y = Number(m[3]);
    if (mo && validDay(y, mo, d)) push(`${y}-${pad(mo)}-${pad(d)}`, "day", m[0], m.index ?? 0);
  }
  // 3 March 2025 / 4 Mar 2025 (also inside RFC 2822 email dates)
  const dmy = new RegExp(`\\b(\\d{1,2})\\s+${MONTH_RE},?\\s+((?:19|20)\\d{2})\\b`, "gi");
  for (const m of text.matchAll(dmy)) {
    const mo = MONTHS[m[2].toLowerCase().replace(".", "")];
    const d = Number(m[1]);
    const y = Number(m[3]);
    if (mo && validDay(y, mo, d)) push(`${y}-${pad(mo)}-${pad(d)}`, "day", m[0], m.index ?? 0);
  }
  // 2025-03-03
  for (const m of text.matchAll(/\b((?:19|20)\d{2})-(\d{2})-(\d{2})\b/g)) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (validDay(y, mo, d)) push(`${y}-${pad(mo)}-${pad(d)}`, "day", m[0], m.index ?? 0);
  }
  // March 2025 (month precision) when not already part of a full date
  const my = new RegExp(`\\b${MONTH_RE}\\s+((?:19|20)\\d{2})\\b`, "gi");
  for (const m of text.matchAll(my)) {
    const idx = m.index ?? 0;
    const overlaps = found.some((f) => idx >= f.index && idx < f.index + f.text.length);
    if (overlaps) continue;
    const mo = MONTHS[m[1].toLowerCase().replace(".", "")];
    if (mo) push(`${m[2]}-${pad(mo)}-01`, "month", m[0], idx);
  }
  return found.sort((a, b) => a.index - b.index);
}

export interface FoundAmount {
  cents: number;
  text: string;
  index: number;
}

/** Find dollar amounts: $12,400.00, $950, CAD 1,200.50 */
export function findAmounts(text: string): FoundAmount[] {
  const out: FoundAmount[] = [];
  const re = /(?:\$|CAD\s?|C\$)\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?\b/g;
  for (const m of text.matchAll(re)) {
    const whole = Number(m[1].replace(/,/g, ""));
    const cents = whole * 100 + (m[2] ? Number(m[2]) : 0);
    out.push({ cents, text: m[0], index: m.index ?? 0 });
  }
  return out;
}

export interface FoundReference {
  key: string;
  label: string;
  index: number;
}

const REF_TYPES: Record<string, string> = {
  invoice: "Invoice",
  inv: "Invoice",
  po: "Purchase order",
  "purchase order": "Purchase order",
  cheque: "Cheque",
  check: "Cheque",
  quote: "Quote",
  quotation: "Quote",
  receipt: "Receipt",
  order: "Order",
  contract: "Contract",
  agreement: "Agreement",
  "change order": "Change order",
};

/** Document references such as "Invoice #1042", "PO 2231", "Change Order 3". */
export function findReferences(text: string): FoundReference[] {
  const out: FoundReference[] = [];
  const re =
    /\b(Invoice|INV|Purchase Order|PO|Cheque|Check|Quotation|Quote|Receipt|Change Order|Order|Contract|Agreement)\s*(?:No\.?|Number|#)?\s*#?\s*([A-Z]{0,3}-?\d{2,8}[A-Z]?)\b/gi;
  for (const m of text.matchAll(re)) {
    const type = m[1].toLowerCase();
    const label = REF_TYPES[type] ?? m[1];
    const id = m[2].toUpperCase().replace(/^-/, "");
    out.push({ key: `${label.toLowerCase()}:${id}`, label: `${label} ${id}`, index: m.index ?? 0 });
  }
  return out;
}

/** Split text into sentences, keeping the exact original wording. */
export function splitSentences(text: string): { text: string; index: number }[] {
  const out: { text: string; index: number }[] = [];
  // A period only ends a sentence when followed by whitespace or the end, so
  // "$12,400.00" and "e.g." style tokens stay inside their sentence.
  const re = /(?:[^.!?\n]|[.!?](?=[^\s.!?]))+(?:[.!?]+(?=\s|$)|(?=\n)|$)/g;
  for (const m of text.matchAll(re)) {
    const raw = m[0];
    const trimmed = raw.trim();
    if (trimmed.length < 3) continue;
    const lead = raw.length - raw.trimStart().length;
    out.push({ text: trimmed, index: (m.index ?? 0) + lead });
  }
  return out;
}

/**
 * Sentence splitting that does not break on abbreviations such as "Mar." or "No."
 * by first protecting them.
 */
export function sentencesWithDates(text: string): { sentence: string; dates: FoundDate[] }[] {
  const protectedText = text.replace(/\b(Mr|Mrs|Ms|Dr|No|Inc|Ltd|Corp|Co|St|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\./g, "$1․");
  return splitSentences(protectedText)
    .map((s) => {
      const sentence = s.text.replace(/․/g, ".");
      return { sentence, dates: findDates(sentence) };
    })
    .filter((s) => s.dates.length > 0);
}

/** People named in "From:", "To:", "Signed:" style lines, and "Name (role)" signatures. */
export function findPeople(text: string): string[] {
  const names = new Set<string>();
  const header = /^(?:From|To|Cc|Signed|Signature|Witness|Prepared by|Attention|Attn)\s*:\s*(.+)$/gim;
  for (const m of text.matchAll(header)) {
    for (const part of m[1].split(/[,;]/)) {
      const name = part.replace(/<[^>]*>/g, "").replace(/["']/g, "").trim();
      if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z'-]+){1,2}$/.test(name)) names.add(name);
    }
  }
  return [...names];
}

/** Two-word or three-word capitalised names anywhere in text. */
export function findNameCandidates(text: string): string[] {
  const out = new Set<string>();
  const stop = /^(?:The|This|That|Dear|From|To|Subject|Date|Invoice|Total|Page|Ontario|Superior|Court|Small|Claims|Sample|Order|Change|Purchase|Bank|Statement|Account|Agreement|Contract|Hello|Thanks|Regards|Best|Kind|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)$/;
  // Lookahead so overlapping pairs are found: "Call Jordan Whitfeld" -> "Jordan Whitfeld".
  for (const m of text.matchAll(/\b(?=([A-Z][a-z]{2,})\s+([A-Z][a-z]{2,}(?:-[A-Z][a-z]+)?)\b)/g)) {
    if (stop.test(m[1]) || stop.test(m[2])) continue;
    out.add(`${m[1]} ${m[2]}`);
  }
  return [...out];
}

/** Levenshtein distance, small inputs only. */
export function editDistance(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

export function guessDocType(title: string, text: string): string {
  const t = `${title}\n${text.slice(0, 600)}`.toLowerCase();
  if (/^from:|^subject:/m.test(t)) return "Email";
  if (/invoice/.test(t)) return "Invoice";
  if (/statement of account|bank statement|opening balance|closing balance/.test(t)) return "Statement";
  if (/agreement|contract/.test(t)) return "Agreement";
  if (/change order/.test(t)) return "Change order";
  if (/receipt/.test(t)) return "Receipt";
  if (/signature|signed/.test(t) && t.length < 400) return "Signature sample";
  if (/dear |sincerely|yours truly/.test(t)) return "Letter";
  if (/notes?|memo/.test(t)) return "Note";
  return "Document";
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString("en-CA");
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, "0")}`;
}

/** Human date for display, independent of server locale and timezone. */
export function formatIsoDate(iso: string, precision: DatePrecision = "day"): string {
  const [y, m, d] = iso.split("-").map(Number);
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  if (!y || !m) return iso;
  if (precision === "year") return String(y);
  if (precision === "month") return `${names[m - 1]} ${y}`;
  return `${names[m - 1]} ${d}, ${y}`;
}
