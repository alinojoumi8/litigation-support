import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { confirmEventAction, deleteEventAction, saveEventAction } from "@/app/actions/workspace";
import { AiDraftLabel, Button, EmptyState, Field, Input, PageTitle, Pill, Section, Select, SourceChip, buttonClass } from "@/components/ui";
import { requireCaseAccess } from "@/lib/auth/current";
import { formatIsoDate } from "@/lib/domain/extract";
import { formatSourceId } from "@/lib/domain/origin";
import { buildTimeline, timelineFacets, type TimelineFilter } from "@/lib/domain/timeline";

function one(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.length <= 200 ? s : undefined;
}

export default async function TimelinePage({ params, searchParams }: PageProps<"/app/cases/[caseId]/timeline">) {
  const { caseId } = await params;
  const sp = await searchParams;
  const ctx = await requireCaseAccess(caseId);
  const [events, docs] = await Promise.all([ctx.repo.list("events", ctx.caseFile.id), ctx.repo.list("documents", ctx.caseFile.id)]);
  const status = one(sp.status);
  const filter: TimelineFilter = {
    person: one(sp.person),
    tag: one(sp.tag),
    docId: one(sp.doc),
    status: status === "confirmed" || status === "unconfirmed" ? status : undefined,
    from: one(sp.from),
    to: one(sp.to),
    q: one(sp.q),
  };
  const rows = buildTimeline(events, docs, filter);
  const facets = timelineFacets(events);
  const confirmed = events.filter((e) => e.status === "confirmed").length;
  const base = `/app/cases/${ctx.caseFile.id}`;
  const canWrite = ctx.membership.role !== "viewer";
  const sortedDocs = [...docs].sort((a, b) => a.seq - b.seq);
  const filtered = Object.values(filter).some(Boolean);

  return (
    <>
      <PageTitle
        title="Master timeline"
        lede={`${events.length} events from ${docs.length} documents. ${confirmed} confirmed by you. Every event links to the page it came from.`}
        actions={
          <a href={`/api/cases/${ctx.caseFile.id}/timeline-csv`} className={buttonClass("secondary", "sm")}>
            <Download aria-hidden className="size-4" /> Export CSV
          </a>
        }
      />

      <form method="get" className="mb-6 grid gap-x-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Filter the timeline">
        <Field label="Search" htmlFor="q">
          <Input id="q" name="q" defaultValue={filter.q ?? ""} />
        </Field>
        <Field label="Person" htmlFor="person">
          <Select id="person" name="person" defaultValue={filter.person ?? ""}>
            <option value="">Anyone</option>
            {facets.people.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>
        </Field>
        <Field label="Document" htmlFor="doc">
          <Select id="doc" name="doc" defaultValue={filter.docId ?? ""}>
            <option value="">All documents</option>
            {sortedDocs.map((d) => (
              <option key={d.id} value={d.id}>
                {formatSourceId(d.seq)}: {d.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={filter.status ?? ""}>
            <option value="">Any status</option>
            <option value="unconfirmed">Unconfirmed</option>
            <option value="confirmed">Confirmed</option>
          </Select>
        </Field>
        <Field label="From" htmlFor="from">
          <Input id="from" name="from" type="date" defaultValue={filter.from ?? ""} />
        </Field>
        <Field label="To" htmlFor="to">
          <Input id="to" name="to" type="date" defaultValue={filter.to ?? ""} />
        </Field>
        {facets.tags.length > 0 && (
          <Field label="Tag" htmlFor="tag">
            <Select id="tag" name="tag" defaultValue={filter.tag ?? ""}>
              <option value="">Any tag</option>
              {facets.tags.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
        )}
        <div className="flex items-end gap-2 pb-4">
          <Button type="submit" size="sm">
            Apply filters
          </Button>
          {filtered && (
            <Link href={`${base}/timeline`} className="px-2 py-1.5 text-sm font-semibold text-spruce underline">
              Clear
            </Link>
          )}
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyState title={filtered ? "No events match these filters" : "No events yet"}>{filtered ? "Try clearing a filter." : "Upload documents and dated events will appear here."}</EmptyState>
      ) : (
        <ol className="relative space-y-3 border-l-2 border-line pl-5">
          {rows.map((e) => (
            <li key={e.id} id={e.id} className="relative scroll-mt-24">
              <span aria-hidden className={`absolute -left-[1.72rem] top-5 size-3 rounded-full border-2 ${e.status === "confirmed" ? "border-spruce bg-spruce" : "border-line-strong bg-paper"}`} />
              <article className={`rounded-lg border p-4 ${e.status === "confirmed" ? "border-line bg-surface shadow-card" : "border-dashed border-line-strong bg-paper"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="tabular font-bold text-ink">{formatIsoDate(e.date, e.datePrecision)}</p>
                  {e.status === "confirmed" ? <Pill tone="success">Confirmed</Pill> : e.createdBy === "ai" ? <AiDraftLabel /> : <Pill>Unconfirmed</Pill>}
                  {e.createdBy === "user" && <Pill tone="neutral">Added by you</Pill>}
                </div>
                <p className="mt-1.5 text-[0.98rem]">{e.description}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm">
                  {e.sourceDocId && e.sourceSeq ? (
                    <SourceChip caseId={ctx.caseFile.id} docId={e.sourceDocId} seq={e.sourceSeq} page={e.sourcePage} title={e.sourceTitle ?? undefined} />
                  ) : (
                    <span className="text-ink-3">No source document</span>
                  )}
                  {e.people.map((p) => (
                    <span key={p} className="rounded bg-sunken px-1.5 py-0.5 text-xs text-ink-2">
                      {p}
                    </span>
                  ))}
                  {canWrite && (
                    <span className="ml-auto flex flex-wrap items-center gap-1">
                      <form action={confirmEventAction}>
                        <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                        <input type="hidden" name="eventId" value={e.id} />
                        <input type="hidden" name="status" value={e.status === "confirmed" ? "unconfirmed" : "confirmed"} />
                        <Button type="submit" size="sm" variant={e.status === "confirmed" ? "quiet" : "secondary"}>
                          {e.status === "confirmed" ? "Mark unconfirmed" : "Confirm"}
                        </Button>
                      </form>
                      <details className="relative">
                        <summary className={buttonClass("quiet", "sm", "cursor-pointer list-none [&::-webkit-details-marker]:hidden")}>Edit</summary>
                        <form action={saveEventAction} className="absolute right-0 z-20 mt-1 w-80 rounded-lg border border-line bg-surface p-4 shadow-lift">
                          <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                          <input type="hidden" name="eventId" value={e.id} />
                          <Field label="Date" htmlFor={`d-${e.id}`}>
                            <Input id={`d-${e.id}`} name="date" type="date" defaultValue={e.date} required />
                          </Field>
                          <Field label="What happened" htmlFor={`t-${e.id}`}>
                            <Input id={`t-${e.id}`} name="description" defaultValue={e.description} maxLength={400} required />
                          </Field>
                          <Field label="People (commas)" htmlFor={`p-${e.id}`}>
                            <Input id={`p-${e.id}`} name="people" defaultValue={e.people.join(", ")} />
                          </Field>
                          <Field label="Tags (commas)" htmlFor={`g-${e.id}`}>
                            <Input id={`g-${e.id}`} name="tags" defaultValue={e.tags.join(", ")} />
                          </Field>
                          <Button type="submit" size="sm">
                            Save and confirm
                          </Button>
                        </form>
                      </details>
                      <form action={deleteEventAction}>
                        <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                        <input type="hidden" name="eventId" value={e.id} />
                        <Button type="submit" size="sm" variant="quiet" aria-label={`Delete event: ${e.description.slice(0, 60)}`}>
                          Delete
                        </Button>
                      </form>
                    </span>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}

      {canWrite && (
        <Section title="Add an event" id="add-h">
          <form action={saveEventAction} className="grid gap-x-4 rounded-lg border border-line bg-surface p-5 md:grid-cols-2">
            <input type="hidden" name="caseId" value={ctx.caseFile.id} />
            <Field label="Date" htmlFor="new-date">
              <Input id="new-date" name="date" type="date" required />
            </Field>
            <Field label="What happened" htmlFor="new-desc">
              <Input id="new-desc" name="description" maxLength={400} required />
            </Field>
            <Field label="Source document" htmlFor="new-doc" optional>
              <Select id="new-doc" name="sourceDocId" defaultValue="">
                <option value="">None</option>
                {sortedDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {formatSourceId(d.seq)}: {d.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Page" htmlFor="new-page" optional>
              <Input id="new-page" name="sourcePage" type="number" min={1} inputMode="numeric" />
            </Field>
            <Field label="People (commas)" htmlFor="new-people" optional>
              <Input id="new-people" name="people" />
            </Field>
            <Field label="Tags (commas)" htmlFor="new-tags" optional>
              <Input id="new-tags" name="tags" />
            </Field>
            <div>
              <Button type="submit">
                <Plus aria-hidden className="size-4" /> Add event
              </Button>
            </div>
          </form>
        </Section>
      )}
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
