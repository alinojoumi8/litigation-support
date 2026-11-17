/**
 * Rule-based discrepancy finder (site plan 5.1 item 5). Deterministic and
 * offline. Every flag shows both sources, uses "possible" wording, and has a
 * stable fingerprint so the user's review status survives a re-run.
 */
import type { DiscrepancyKind, EmailMeta, FlagSource } from "./types";
import { editDistance, findAmounts, findDates, findNameCandidates, findPeople, findReferences, formatCents, formatIsoDate, splitSentences } from "./extract";
import { formatSourceRef } from "./origin";
import { isNeutral } from "./wording";

export interface DocFacts {
  docId: string;
  seq: number;
  title: string;
  filename: string;
  sha256: string;
  pages: { page: number; text: string }[];
  emailMeta: EmailMeta | null;
}

export interface FlagDraft {
  fingerprint: string;
  kind: DiscrepancyKind;
  title: string;
  detail: string;
  sources: FlagSource[];
}

interface Mention {
  doc: DocFacts;
  page: number;
  sentence: string;
}

const ABBREV = /\b(Mr|Mrs|Ms|Dr|No|Inc|Ltd|Corp|Co|St|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\./g;

function sentencesOf(doc: DocFacts): Mention[] {
  const out: Mention[] = [];
  for (const p of doc.pages) {
    const prot = p.text.replace(ABBREV, "$1․");
    for (const s of splitSentences(prot)) {
      out.push({ doc, page: p.page, sentence: s.text.replace(/․/g, ".") });
    }
  }
  return out;
}

function excerpt(s: string): string {
  return s.length > 220 ? `${s.slice(0, 217).trimEnd()}...` : s;
}

function src(m: Mention): FlagSource {
  return { docId: m.doc.docId, page: m.page, excerpt: excerpt(m.sentence) };
}

function ref(m: Mention): string {
  return formatSourceRef(m.doc.seq, m.page);
}

const ACTION_RE = /\b(dated|issued|signed|delivered|paid|sent|received|due|completed|finished|started|began|installed|inspected|made)\b/i;
const SUBJECT_RE = /\b(agreement|contract|deposit|delivery|final payment|installation|inspection|project|work|renovation)\b[^.]{0,50}?\b(signed|paid|made|completed|finished|started|began|delivered|installed|inspected)\b/i;

function verbStem(v: string): string {
  const x = v.toLowerCase();
  if (x === "finished") return "completed";
  if (x === "began") return "started";
  if (x === "made") return "paid";
  return x;
}

export function findDiscrepancies(docs: DocFacts[]): FlagDraft[] {
  const flags: FlagDraft[] = [];
  const mentions = docs.flatMap(sentencesOf);

  // 1 and 2: reference-based amount and date conflicts across documents.
  const byRef = new Map<string, { label: string; m: Mention }[]>();
  for (const m of mentions) {
    for (const r of findReferences(m.sentence)) {
      const list = byRef.get(r.key) ?? [];
      list.push({ label: r.label, m });
      byRef.set(r.key, list);
    }
  }
  for (const [key, list] of byRef) {
    const withAmounts = list.filter((x) => findAmounts(x.m.sentence).length > 0);
    outer: for (let i = 0; i < withAmounts.length; i++) {
      for (let j = i + 1; j < withAmounts.length; j++) {
        const a = withAmounts[i];
        const b = withAmounts[j];
        if (a.m.doc.docId === b.m.doc.docId) continue;
        const aa = new Set(findAmounts(a.m.sentence).map((x) => x.cents));
        const bb = findAmounts(b.m.sentence).map((x) => x.cents);
        if (bb.some((c) => aa.has(c))) continue;
        flags.push({
          fingerprint: `amount|${key}|${a.m.doc.docId}|${b.m.doc.docId}`,
          kind: "amount_mismatch",
          title: `Possible amount difference: ${a.label} in ${ref(a.m)} vs ${ref(b.m)}`,
          detail: `${ref(a.m)} mentions ${[...aa].map(formatCents).join(", ")} for ${a.label}. ${ref(b.m)} mentions ${bb.map(formatCents).join(", ")}. Check both pages. A later revision, a partial payment or tax can explain a difference.`,
          sources: [src(a.m), src(b.m)],
        });
        break outer;
      }
    }

    const dated = list
      .map((x) => ({ ...x, action: x.m.sentence.match(ACTION_RE)?.[1], dates: findDates(x.m.sentence) }))
      .filter((x) => x.action && x.dates.length > 0 && x.dates[0].precision === "day");
    outerD: for (let i = 0; i < dated.length; i++) {
      for (let j = i + 1; j < dated.length; j++) {
        const a = dated[i];
        const b = dated[j];
        if (a.m.doc.docId === b.m.doc.docId) continue;
        if (verbStem(a.action!) !== verbStem(b.action!)) continue;
        if (a.dates[0].iso === b.dates[0].iso) continue;
        flags.push({
          fingerprint: `date|${key}|${verbStem(a.action!)}|${a.m.doc.docId}|${b.m.doc.docId}`,
          kind: "date_conflict",
          title: `Possible date mismatch: ${ref(a.m)} vs ${ref(b.m)}`,
          detail: `${a.label} is described as ${verbStem(a.action!)} on ${formatIsoDate(a.dates[0].iso)} in ${ref(a.m)} and on ${formatIsoDate(b.dates[0].iso)} in ${ref(b.m)}.`,
          sources: [src(a.m), src(b.m)],
        });
        break outerD;
      }
    }
  }

  // 2b: subject + action date conflicts ("the deposit was paid on ...").
  const bySubject = new Map<string, (Mention & { iso: string })[]>();
  for (const m of mentions) {
    const s = m.sentence.match(SUBJECT_RE);
    if (!s) continue;
    const d = findDates(m.sentence).find((x) => x.precision === "day");
    if (!d) continue;
    const key = `${s[1].toLowerCase()}:${verbStem(s[2])}`;
    const list = bySubject.get(key) ?? [];
    list.push({ ...m, iso: d.iso });
    bySubject.set(key, list);
  }
  for (const [key, list] of bySubject) {
    outerS: for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (a.doc.docId === b.doc.docId || a.iso === b.iso) continue;
        const fp = `subject|${key}|${a.doc.docId}|${b.doc.docId}`;
        if (flags.some((f) => f.kind === "date_conflict" && f.sources.some((x) => x.docId === a.doc.docId) && f.sources.some((x) => x.docId === b.doc.docId))) continue;
        const [subject, verb] = key.split(":");
        flags.push({
          fingerprint: fp,
          kind: "date_conflict",
          title: `Possible date mismatch: ${ref(a)} vs ${ref(b)}`,
          detail: `The ${subject} is described as ${verb} on ${formatIsoDate(a.iso)} in ${ref(a)} and on ${formatIsoDate(b.iso)} in ${ref(b)}.`,
          sources: [src(a), src(b)],
        });
        break outerS;
      }
    }
  }

  // 3: name spelling variations across documents.
  const nameMentions = new Map<string, Mention>();
  for (const m of mentions) {
    const names = new Set([...findNameCandidates(m.sentence), ...findPeople(m.sentence)]);
    for (const n of names) {
      const k = `${n}|${m.doc.docId}`;
      if (!nameMentions.has(k)) nameMentions.set(k, m);
    }
  }
  const entries = [...nameMentions.entries()].map(([k, m]) => ({ name: k.split("|")[0], m }));
  const seenPairs = new Set<string>();
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      if (a.m.doc.docId === b.m.doc.docId || a.name === b.name) continue;
      if (a.name.length < 8 || a.name[0] !== b.name[0]) continue;
      const [af] = a.name.split(" ");
      const [bf] = b.name.split(" ");
      if (af !== bf) continue; // same first name, different spelling of the rest
      const dist = editDistance(a.name.toLowerCase(), b.name.toLowerCase());
      if (dist < 1 || dist > 2) continue;
      const pair = [a.name, b.name].sort().join("~");
      if (seenPairs.has(pair)) continue;
      // If both spellings appear in the same document, the author uses both: still worth a look.
      seenPairs.add(pair);
      flags.push({
        fingerprint: `name|${pair}`,
        kind: "name_variation",
        title: `Possible name spelling difference: "${a.name}" and "${b.name}"`,
        detail: `"${a.name}" appears in ${ref(a.m)}. "${b.name}" appears in ${ref(b.m)}. This may be a typo, or two different people.`,
        sources: [src(a.m), src(b.m)],
      });
    }
  }

  // 4: emails that mention an attachment but have none.
  for (const doc of docs) {
    if (!doc.emailMeta || doc.emailMeta.attachments.length > 0) continue;
    const hit = sentencesOf(doc).find((m) => /\b(attached|enclosed|attachment|see the file)\b/i.test(m.sentence));
    if (!hit) continue;
    flags.push({
      fingerprint: `attachment|${doc.docId}`,
      kind: "missing_attachment",
      title: `Possible missing attachment: ${ref(hit)}`,
      detail: `This email mentions an attachment, but no attachment came with the copy you uploaded. You may have it elsewhere.`,
      sources: [src(hit)],
    });
  }

  // 5: two versions of the "same" document.
  const norm = (s: string) =>
    s.toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/\b(v\d+|final|draft|copy|signed|scan|revised)\b/g, "").replace(/\(\d+\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const byTitle = new Map<string, DocFacts[]>();
  for (const d of docs) {
    const k = norm(d.title) || norm(d.filename);
    if (!k) continue;
    byTitle.set(k, [...(byTitle.get(k) ?? []), d]);
  }
  for (const [k, group] of byTitle) {
    if (group.length < 2) continue;
    const [a, b] = group;
    if (a.sha256 === b.sha256) continue;
    const la = a.pages.flatMap((p) => p.text.split("\n").map((t) => ({ t: t.trim(), page: p.page }))).filter((x) => x.t);
    const lb = b.pages.flatMap((p) => p.text.split("\n").map((t) => ({ t: t.trim(), page: p.page }))).filter((x) => x.t);
    const setB = new Set(lb.map((x) => x.t));
    const setA = new Set(la.map((x) => x.t));
    const firstA = la.find((x) => !setB.has(x.t));
    const firstB = lb.find((x) => !setA.has(x.t));
    if (!firstA && !firstB) continue;
    flags.push({
      fingerprint: `version|${k}|${a.docId}|${b.docId}`,
      kind: "version_difference",
      title: `Possible different versions: ${formatSourceRef(a.seq, null)} and ${formatSourceRef(b.seq, null)}`,
      detail: `These look like two versions of the same document, but the text is not the same. The first lines that differ are shown below.`,
      sources: [
        { docId: a.docId, page: firstA?.page ?? 1, excerpt: excerpt(firstA?.t ?? "(no differing line)") },
        { docId: b.docId, page: firstB?.page ?? 1, excerpt: excerpt(firstB?.t ?? "(no differing line)") },
      ],
    });
  }

  // Safety net: every title and detail must use neutral wording.
  return flags.filter((f) => isNeutral(f.title) && isNeutral(f.detail));
}

export const FLAG_STATUS_LABELS = {
  new: "New",
  matters: "Matters",
  not_an_issue: "Not an issue",
  ask_lawyer: "Ask lawyer",
} as const;

export const FLAG_KIND_LABELS: Record<DiscrepancyKind, string> = {
  date_conflict: "Dates",
  amount_mismatch: "Amounts",
  name_variation: "Names",
  missing_attachment: "Attachments",
  version_difference: "Versions",
  statement_conflict: "Statements",
};
