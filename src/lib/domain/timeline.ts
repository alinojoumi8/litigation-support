import type { DocumentRecord, DocumentSummary, PageText, TimelineEvent } from "./types";
import { sentencesWithDates } from "./extract";

export interface TimelineFilter {
  person?: string;
  tag?: string;
  docId?: string;
  status?: "unconfirmed" | "confirmed";
  from?: string;
  to?: string;
  q?: string;
}

export interface TimelineRow extends TimelineEvent {
  sourceSeq: number | null;
  sourceTitle: string | null;
}

const PRECISION_RANK = { day: 0, month: 1, year: 2 } as const;

/** Sort: date ascending; full dates before month-only dates in the same month; then by source. */
export function compareEvents(a: TimelineEvent & { sourceSeq?: number | null }, b: TimelineEvent & { sourceSeq?: number | null }): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  const p = PRECISION_RANK[a.datePrecision] - PRECISION_RANK[b.datePrecision];
  if (p !== 0) return p;
  const sa = a.sourceSeq ?? Number.MAX_SAFE_INTEGER;
  const sb = b.sourceSeq ?? Number.MAX_SAFE_INTEGER;
  if (sa !== sb) return sa - sb;
  return (a.sourcePage ?? 0) - (b.sourcePage ?? 0) || a.id.localeCompare(b.id);
}

export function matchesFilter(e: TimelineRow, f: TimelineFilter): boolean {
  if (f.person && !e.people.some((p) => p.toLowerCase() === f.person!.toLowerCase())) return false;
  if (f.tag && !e.tags.includes(f.tag)) return false;
  if (f.docId && e.sourceDocId !== f.docId) return false;
  if (f.status && e.status !== f.status) return false;
  if (f.from && e.date < f.from) return false;
  if (f.to && e.date > f.to) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    if (!e.description.toLowerCase().includes(q) && !(e.quote ?? "").toLowerCase().includes(q)) return false;
  }
  return true;
}

/** Build the master timeline: join source info, filter, sort. */
export function buildTimeline(
  events: TimelineEvent[],
  docs: Pick<DocumentRecord, "id" | "seq" | "title">[],
  filter: TimelineFilter = {},
): TimelineRow[] {
  const byId = new Map(docs.map((d) => [d.id, d]));
  return events
    .map((e): TimelineRow => {
      const d = e.sourceDocId ? byId.get(e.sourceDocId) : undefined;
      return { ...e, sourceSeq: d?.seq ?? null, sourceTitle: d?.title ?? null };
    })
    .filter((e) => matchesFilter(e, filter))
    .sort(compareEvents);
}

export function timelineFacets(events: TimelineEvent[]): { people: string[]; tags: string[] } {
  const people = new Set<string>();
  const tags = new Set<string>();
  for (const e of events) {
    e.people.forEach((p) => people.add(p));
    e.tags.forEach((t) => tags.add(t));
  }
  return { people: [...people].sort(), tags: [...tags].sort() };
}

/** Turn an event draft into a dedupe key so re-running extraction does not double up. */
export function eventKey(e: Pick<TimelineEvent, "date" | "sourceDocId" | "sourcePage" | "description">): string {
  return [e.date, e.sourceDocId ?? "-", e.sourcePage ?? "-", e.description.toLowerCase().replace(/\W+/g, " ").trim().slice(0, 80)].join("|");
}

export interface DraftEvent {
  date: string;
  datePrecision: TimelineEvent["datePrecision"];
  description: string;
  page: number;
  quote: string;
  people: string[];
}

/** Extract dated events from page text. The quote is the exact sentence from the page. */
export function extractEventsFromPages(pages: Pick<PageText, "page" | "text">[], knownPeople: string[] = []): DraftEvent[] {
  const out: DraftEvent[] = [];
  for (const p of pages) {
    for (const { sentence, dates } of sentencesWithDates(p.text)) {
      // Skip header-like lines that only carry a date.
      if (/^(?:date|sent|received)\s*:/i.test(sentence)) continue;
      const d = dates[0];
      const description = sentence.length > 220 ? `${sentence.slice(0, 217).trimEnd()}...` : sentence;
      const people = knownPeople.filter((n) => sentence.includes(n) || sentence.includes(n.split(" ")[0]));
      out.push({ date: d.iso, datePrecision: d.precision, description, page: p.page, quote: sentence, people });
    }
  }
  return out;
}

/** CSV export of the timeline. Confirmed/unconfirmed status is always included. */
export function timelineToCsv(rows: TimelineRow[]): string {
  const header = ["Date", "Precision", "Event", "Status", "Source", "Page", "Source title", "People", "Tags", "Created by"];
  const lines = rows.map((r) => [
    r.date,
    r.datePrecision,
    r.description,
    r.status === "confirmed" ? "Confirmed by user" : "Unconfirmed (AI draft)",
    r.sourceSeq ? `Doc ${String(r.sourceSeq).padStart(4, "0")}` : "",
    r.sourcePage ? String(r.sourcePage) : "",
    r.sourceTitle ?? "",
    r.people.join("; "),
    r.tags.join("; "),
    r.createdBy === "ai" ? "AI draft" : "User",
  ]);
  return [header, ...lines].map((cols) => cols.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export function csvCell(v: string): string {
  // Neutralise spreadsheet formula injection, then quote.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function summaryPeople(summaries: Pick<DocumentSummary, "people">[]): string[] {
  const set = new Set<string>();
  summaries.forEach((s) => s.people.forEach((p) => set.add(p)));
  return [...set].sort();
}
