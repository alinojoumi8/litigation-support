/**
 * Citation guard (site plan 7.2, stack decision 0002 rule 3).
 *
 * The AI never produces case law or statute citations from model memory. Any
 * text that looks like a citation and is not in the curated authority list is
 * removed before the output is stored or shown, and replaced with a visible
 * "verify before filing" marker.
 */

export const CITATION_REMOVED = "[reference removed: verify before filing]";

const COURT_CODES = [
  "SCC", "ONCA", "ONSC", "ONSCDC", "ONCJ", "ONCT", "ONLTB", "HRTO", "FCA", "FC", "TCC",
  "BCCA", "BCSC", "ABCA", "ABKB", "ABQB", "SKCA", "MBCA", "QCCA", "QCCS", "NSCA", "NBCA",
  "NLCA", "PECA", "CanLII", "UKSC", "UKHL", "EWCA", "EWHC",
].join("|");

export const CITATION_PATTERNS: { name: string; re: RegExp }[] = [
  // Neutral citations: 2026 ONSC 698
  { name: "neutral", re: new RegExp(`\\b(?:19|20)\\d{2}\\s+(?:${COURT_CODES})\\s+\\d{1,6}\\b`, "g") },
  // Report citations: [2004] 3 S.C.R. 123 ; (2001), 55 O.R. (3d) 123 ; 12 D.L.R. (4th) 345
  { name: "report-bracket", re: /\[(?:19|20)\d{2}\]\s+\d{0,3}\s*[A-Z][A-Za-z.]*(?:\s+[A-Z][A-Za-z.]*)*\s*(?:\(\d+(?:st|nd|rd|th|d)\))?\s+\d{1,5}/g },
  { name: "report-paren", re: /\((?:19|20)\d{2}\),\s*\d{1,4}\s+[A-Z][A-Za-z.]*(?:\s*\(\d+(?:st|nd|rd|th|d)\))?\s+\d{1,5}/g },
  { name: "report-series", re: /\b\d{1,4}\s+(?:D\.L\.R\.|O\.R\.|S\.C\.R\.|C\.C\.C\.|C\.R\.|W\.W\.R\.|O\.A\.C\.)\s*(?:\(\d+(?:st|nd|rd|th|d)\))?\s+\d{1,5}/g },
  // Case names: Smith v. Jones ; R v Smith ; R. v. Smith
  { name: "case-name", re: /\b(?:R\.?|[A-Z][A-Za-z.&'-]+(?:\s+(?:[A-Z][A-Za-z.&'-]+|of|and|the|de|du))*)\s+v\.?\s+[A-Z][A-Za-z.&'-]+(?:\s+[A-Z][A-Za-z.&'-]+)*/g },
  // Rule / section / regulation references: s. 12 ; ss. 4-5 ; section 11 ; Rule 30.1.01 ; r. 4.1.01 ; O. Reg. 258/98
  { name: "section", re: /\b(?:ss?\.|sections?|subsections?|paras?\.|paragraphs?)\s*\d+(?:\.\d+)*(?:\(\d+(?:\.\d+)?\))*(?:\([a-z]\))?/gi },
  { name: "rule", re: /\b(?:rules?|r\.|rr\.)\s*\d+(?:\.\d+)+(?:\(\d+(?:\.\d+)?\))*/gi },
  { name: "regulation", re: /\bO\.\s?Reg\.\s*\d+\/\d+/gi },
  { name: "rso", re: /\bR\.?S\.?(?:O|C)\.?\s+(?:19|20)\d{2},?\s+c\.\s*[A-Z0-9.-]+/g },
];

export interface CitationMatch {
  text: string;
  index: number;
  pattern: string;
}

export function findCitations(text: string): CitationMatch[] {
  const matches: CitationMatch[] = [];
  for (const { name, re } of CITATION_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({ text: m[0].trim(), index: m.index, pattern: name });
    }
  }
  // Drop matches fully contained in an earlier, longer match.
  matches.sort((a, b) => a.index - b.index || b.text.length - a.text.length);
  const out: CitationMatch[] = [];
  let end = -1;
  for (const m of matches) {
    if (m.index >= end) {
      out.push(m);
      end = m.index + m.text.length;
    }
  }
  return out;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").replace(/\s*\.\s*/g, ".").trim();
}

export interface GuardResult {
  text: string;
  removed: string[];
}

/**
 * Remove citation-like text that is not on the allow list.
 * @param allowList citation strings from the curated authority list
 */
export function guardCitations(text: string, allowList: readonly string[] = []): GuardResult {
  const allowed = new Set(allowList.map(normalize));
  const found = findCitations(text);
  if (found.length === 0) return { text, removed: [] };
  let out = "";
  let cursor = 0;
  const removed: string[] = [];
  for (const m of found) {
    if (allowed.has(normalize(m.text))) continue;
    out += text.slice(cursor, m.index) + CITATION_REMOVED;
    cursor = m.index + m.text.length;
    removed.push(m.text);
  }
  out += text.slice(cursor);
  return { text: out, removed };
}

/**
 * Quotes must match the source exactly (site plan 7.2 rule 4). Whitespace
 * differences are tolerated; anything else is not a quote.
 */
export function quoteMatchesSource(quote: string, sourceText: string): boolean {
  const q = quote.replace(/\s+/g, " ").trim();
  if (q.length < 3) return false;
  return sourceText.replace(/\s+/g, " ").includes(q);
}
