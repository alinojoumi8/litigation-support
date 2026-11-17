import { findAmounts, findDates, findPeople, findReferences, formatCents, formatIsoDate, splitSentences } from "../domain/extract";
import { extractEventsFromPages } from "../domain/timeline";
import type { AIProvider, DiscrepancyCandidate, SummaryInput, SummaryOutput } from "./provider";

/**
 * Local demo extractor: a deterministic, rule-based stand-in for the AI.
 * It runs on this server, sends nothing anywhere, and produces the same
 * output every time. It is not AI and it is much less capable; its output is
 * still labelled as a draft to check against the source.
 */
export class MockAIProvider implements AIProvider {
  readonly id = "mock" as const;
  readonly label = "Local demo extractor (no AI)";
  readonly model = "rules-v1";
  readonly external = false;

  async summarize(input: SummaryInput): Promise<SummaryOutput> {
    const allText = input.pages.map((p) => p.text).join("\n");
    const people = new Set(findPeople(allText));
    if (input.emailMeta) {
      for (const who of [input.emailMeta.from, input.emailMeta.to]) {
        const n = who.replace(/<[^>]*>/g, "").replace(/"/g, "").trim();
        if (/^[A-Z][a-z]+\s+[A-Z][a-z'-]+$/.test(n)) people.add(n);
      }
    }

    const body = input.pages
      .map((p) => p.text)
      .join("\n")
      .split("\n")
      .filter((l) => !/^(?:from|to|cc|date|subject|sent)\s*:/i.test(l.trim()))
      .join(" ");
    const sentences = splitSentences(body.replace(/\b(Mr|Mrs|Ms|Dr|No|Inc|Ltd)\./g, "$1․")).map((s) => s.text.replace(/․/g, "."));
    const lead = sentences.slice(0, 2).join(" ");

    let summary: string;
    if (input.emailMeta) {
      const date = input.emailMeta.date ? findDates(input.emailMeta.date)[0] : undefined;
      summary = `Email from ${input.emailMeta.from || "an unknown sender"} to ${input.emailMeta.to || "an unknown recipient"}${date ? ` dated ${formatIsoDate(date.iso)}` : ""}, subject "${input.emailMeta.subject || "(none)"}". ${lead}`;
    } else {
      summary = `${input.docType} titled "${input.title}", ${input.pages.length} page${input.pages.length === 1 ? "" : "s"}. ${lead}`;
    }
    if (summary.length > 600) summary = `${summary.slice(0, 597).trimEnd()}...`;

    const keyFacts: SummaryOutput["keyFacts"] = [];
    for (const p of input.pages) {
      for (const a of findAmounts(p.text).slice(0, 4)) {
        const s = splitSentences(p.text).find((x) => x.text.includes(a.text));
        keyFacts.push({ text: `Amount mentioned: ${formatCents(a.cents)}`, page: p.page, quote: s?.text ?? a.text });
      }
      for (const r of findReferences(p.text).slice(0, 3)) {
        keyFacts.push({ text: `Reference: ${r.label}`, page: p.page, quote: null });
      }
      for (const d of findDates(p.text).slice(0, 3)) {
        keyFacts.push({ text: `Date mentioned: ${formatIsoDate(d.iso, d.precision)}`, page: p.page, quote: d.text });
      }
    }
    const seen = new Set<string>();
    const dedupedFacts = keyFacts.filter((f) => (seen.has(f.text) ? false : (seen.add(f.text), true))).slice(0, 12);

    const emailEvents: SummaryOutput["events"] = [];
    if (input.emailMeta?.date) {
      const d = findDates(input.emailMeta.date)[0];
      const sender = input.emailMeta.from.replace(/<[^>]*>/g, "").replace(/"/g, "").trim() || "unknown sender";
      if (d) emailEvents.push({ date: d.iso, datePrecision: d.precision, description: `Email "${input.emailMeta.subject || "(no subject)"}" sent by ${sender}`, page: 1, quote: null, people: [...people].filter((p) => sender.includes(p)) });
    }
    const events = [...emailEvents, ...extractEventsFromPages(input.pages, [...people])].map((e) => ({
      date: e.date,
      datePrecision: e.datePrecision,
      description: e.description,
      page: e.page,
      quote: e.quote,
      people: e.people,
    }));

    return { summary, keyFacts: dedupedFacts, people: [...people], events };
  }

  /** The rule-based finder (src/lib/domain/discrepancies.ts) does the work in mock mode. */
  async findDiscrepancies(): Promise<DiscrepancyCandidate[]> {
    return [];
  }
}
