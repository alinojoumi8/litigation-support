/**
 * Flag wording guard.
 *
 * The product flags things worth a closer look. It never reaches conclusions:
 * no "forged", "fake", "fraud", no match percentages, no verdicts. This guard
 * checks any generated text (rule engine or AI) before it is stored or shown.
 *
 * Negation-aware: "A pattern is not proof" and "It cannot tell whether a
 * signature is genuine" are allowed, because they deny the conclusion.
 */

export interface WordingViolation {
  term: string;
  index: number;
  reason: string;
}

interface Rule {
  re: RegExp;
  reason: string;
  /** If true, a nearby negation ("not", "cannot"...) makes the match acceptable. */
  negatable: boolean;
}

const CONCLUSION_RULES: Rule[] = [
  { re: /\bforg(?:ed|ery|eries|er|ers|ing)\b/gi, reason: "Only a qualified examiner can give an opinion on a signature.", negatable: true },
  { re: /\b(?:fake|faked|fakes|counterfeit|fabricated|falsified|doctored)\b/gi, reason: "Describe what looks different instead of drawing a conclusion.", negatable: true },
  { re: /\bfraud(?:ulent|ulently|ster|s)?\b/gi, reason: "Patterns are questions for an accountant, not findings.", negatable: true },
  { re: /\b(?:embezzle(?:d|ment)?|launder(?:ed|ing)?|stole|stolen|theft)\b/gi, reason: "Avoid alleging wrongdoing.", negatable: true },
  { re: /\b(?:lied|lying|liar|dishonest)\b/gi, reason: "Describe the difference between statements instead.", negatable: true },
  { re: /\bguilt(?:y)?\b/gi, reason: "The product never comments on guilt.", negatable: true },
  { re: /\b(?:proves?|proven|proof)\b/gi, reason: "Use \"worth a closer look\" instead of proof language.", negatable: true },
  { re: /\b(?:caught|exposed|suspicious|smoking gun)\b/gi, reason: "Use neutral, calm wording.", negatable: true },
  { re: /\b(?:not\s+)?(?:genuine|authentic)\b/gi, reason: "Only a qualified examiner can say whether a signature is genuine.", negatable: true },
  { re: /\b\d{1,3}(?:\.\d+)?\s?%\s*(?:match|similar(?:ity)?|likel(?:y|ihood)|probab(?:le|ility)|confiden(?:t|ce)|certain(?:ty)?)\b/gi, reason: "No match percentages or scores.", negatable: false },
  { re: /\b(?:match|similarity|confidence)\s+(?:score\s*)?(?:of\s*)?[:=]?\s*\d/gi, reason: "No match percentages or scores.", negatable: false },
  { re: /\b(?:definitely|certainly|clearly)\s+(?:the\s+)?(?:same|different)\s+(?:person|writer|hand|signer)\b/gi, reason: "No verdicts about who wrote something.", negatable: false },
];

const NEGATIONS = /\b(?:not|no|never|cannot|can't|can\s+not|isn't|aren't|doesn't|don't|won't|without|nor|neither|rather\s+than|instead\s+of|whether)\b/i;

function isNegated(text: string, index: number): boolean {
  // Look back up to 7 words before the match for a negation.
  const before = text.slice(Math.max(0, index - 80), index);
  const words = before.split(/\s+/).filter(Boolean).slice(-7).join(" ");
  return NEGATIONS.test(words);
}

export function findWordingViolations(text: string): WordingViolation[] {
  const out: WordingViolation[] = [];
  for (const rule of CONCLUSION_RULES) {
    rule.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.re.exec(text)) !== null) {
      if (rule.negatable && isNegated(text, m.index)) continue;
      out.push({ term: m[0], index: m.index, reason: rule.reason });
    }
  }
  return out.sort((a, b) => a.index - b.index);
}

export function isNeutral(text: string): boolean {
  return findWordingViolations(text).length === 0;
}

const REMOVED = "[wording removed: describe the difference, not a conclusion]";

/**
 * Replace any sentence that contains a conclusion with a neutral placeholder.
 * Used on AI output before it is stored.
 */
export function neutralize(text: string): { text: string; changed: boolean } {
  if (isNeutral(text)) return { text, changed: false };
  const sentences = text.split(/(?<=[.!?])\s+/);
  const kept = sentences.map((s) => (isNeutral(s) ? s : REMOVED));
  // Collapse repeated placeholders.
  const collapsed = kept.filter((s, i) => !(s === REMOVED && kept[i - 1] === REMOVED));
  return { text: collapsed.join(" "), changed: true };
}

/** Mandatory copy (site plan 5.1 item 10 and 7.3). Do not edit without lawyer review. */
export const SIGNATURE_DISCLAIMER =
  "This tool helps you compare documents visually. It cannot tell whether a signature is genuine. Only a qualified forensic document examiner can give an opinion.";

export const SIGNATURE_INNOCENT_CAUSES =
  "Differences can have innocent causes, such as age, health, pen, surface or scan quality. Only a qualified examiner can give an opinion.";

export const DISCREPANCY_DISCLAIMER =
  "Possible inconsistency for you to review. It may have an innocent explanation.";

export const MONEY_DISCLAIMER =
  "Patterns worth asking an accountant about. A pattern is not proof of wrongdoing.";

export const READINESS_CAPTION =
  "Readiness shows how organized your file is. It does not measure your chances in court.";

export const DEADLINE_DISCLAIMER =
  "Confirm every deadline with the court office, the order, or your lawyer.";

export const AI_DRAFT_LABEL = "AI draft. Check against the source.";

/**
 * Builds the note saved when a user flags a comparison for an examiner. The
 * mandatory wording is always included and cannot be removed by the user.
 */
export function buildExaminerNote(userNote: string): string {
  const clean = neutralize(userNote.trim()).text;
  const parts = [
    "Flagged for a qualified forensic document examiner to review.",
    clean ? `What I noticed: ${clean}` : "",
    SIGNATURE_INNOCENT_CAUSES,
    "This note records visible differences only. It is not an opinion about whether any signature or handwriting is genuine.",
  ].filter(Boolean);
  return parts.join("\n\n");
}

// ---------------------------------------------------------------------------
// Marketing copy check (site plan 1.5 to 1.6 and 7.7)

const MARKETING_RULES: Rule[] = [
  { re: /\brobot\s+lawyer\b/gi, reason: "Banned phrase.", negatable: false },
  { re: /\bAI\s+lawyer\b/gi, reason: "Implies legal services.", negatable: true },
  { re: /\bguarantee(?:d|s)?\b/gi, reason: "No outcome guarantees.", negatable: true },
  { re: /\bwin\s+your\s+case\b/gi, reason: "No outcome promises.", negatable: true },
  { re: /\breplace\s+your\s+lawyer\b/gi, reason: "Never position as a lawyer replacement.", negatable: true },
  { re: /\bchances?\s+of\s+success\b/gi, reason: "Never score case merits.", negatable: true },
  { re: /\bcase\s+strength\b/gi, reason: "Never score case merits.", negatable: true },
  { re: /\bcourt[-\s](?:ready|approved)\b/gi, reason: "No court-ready or court-approved claims.", negatable: true },
  { re: /\b100%\s+accurate\b/gi, reason: "No accuracy guarantees.", negatable: true },
];

export function findMarketingViolations(text: string): WordingViolation[] {
  const out: WordingViolation[] = [];
  for (const rule of MARKETING_RULES) {
    rule.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.re.exec(text)) !== null) {
      if (rule.negatable && isNegated(text, m.index)) continue;
      out.push({ term: m[0], index: m.index, reason: rule.reason });
    }
  }
  return out;
}
