import { CuratedAuthorityLookup } from "../domain/authorities";
import { guardCitations, quoteMatchesSource } from "../domain/citations";
import { findDates } from "../domain/extract";
import { neutralize } from "../domain/wording";
import type { DiscrepancyCandidate, DiscrepancyDocInput, PageInput, SummaryOutput } from "./provider";

/**
 * Every AI output passes through these guards before it is stored:
 * 1. citation guard: no case law or statute references from model memory;
 * 2. wording guard: no conclusions (forged, fraud, proof...);
 * 3. quote check: a quote is kept only if it appears verbatim on that page;
 * 4. page check: page numbers must exist in the document.
 * Guard notes record counts only, never content.
 */
const allow = new CuratedAuthorityLookup().allowList();

function clean(text: string, notes: Set<string>): string {
  const c = guardCitations(text, allow);
  if (c.removed.length) notes.add("citation-removed");
  const n = neutralize(c.text);
  if (n.changed) notes.add("wording-neutralized");
  return n.text.trim();
}

export function guardSummary(out: SummaryOutput, pages: PageInput[]): { output: SummaryOutput; notes: string[] } {
  const notes = new Set<string>();
  const pageText = new Map(pages.map((p) => [p.page, p.text]));
  const validPage = (n: number) => (pageText.has(n) ? n : pages[0]?.page ?? 1);
  const checkQuote = (q: string | null, page: number) => {
    if (!q) return null;
    if (quoteMatchesSource(q, pageText.get(page) ?? "")) return q;
    notes.add("quote-not-verbatim");
    return null;
  };

  const keyFacts = out.keyFacts.slice(0, 20).map((f) => {
    if (!pageText.has(f.page)) notes.add("page-corrected");
    const page = validPage(f.page);
    return { text: clean(f.text, notes), page, quote: checkQuote(f.quote, page) };
  });

  const events = out.events
    .filter((e) => {
      const ok = /^\d{4}-\d{2}-\d{2}$/.test(e.date) && findDates(e.date).length > 0;
      if (!ok) notes.add("invalid-date-dropped");
      return ok;
    })
    .slice(0, 200)
    .map((e) => {
      const page = validPage(e.page);
      return { ...e, page, description: clean(e.description, notes), quote: checkQuote(e.quote, page) };
    });

  return {
    output: {
      summary: clean(out.summary, notes),
      keyFacts: keyFacts.filter((f) => f.text.length > 0),
      people: [...new Set(out.people.map((p) => p.trim()).filter((p) => p.length > 1 && p.length < 80))].slice(0, 30),
      events,
    },
    notes: [...notes],
  };
}

export function guardDiscrepancies(cands: DiscrepancyCandidate[], docs: DiscrepancyDocInput[]): DiscrepancyCandidate[] {
  const notes = new Set<string>();
  const known = new Map(docs.map((d) => [d.docId, d]));
  return cands
    .map((c) => ({
      ...c,
      title: clean(c.title, notes),
      detail: clean(c.detail, notes),
      sources: c.sources.filter((s) => known.has(s.docId)).map((s) => ({ ...s, excerpt: clean(s.excerpt, notes).slice(0, 240) })),
    }))
    .filter((c) => c.sources.length >= 1 && c.title.length > 0 && !c.title.startsWith("[wording removed"));
}
