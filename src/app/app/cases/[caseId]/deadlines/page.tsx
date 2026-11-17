import { CalendarPlus } from "lucide-react";
import { setNoDeadlinesYetAction } from "@/app/actions/cases";
import { addDeadlineAction, deleteDeadlineAction, toggleDeadlineAction } from "@/app/actions/workspace";
import { Button, Callout, EmptyState, Field, Input, PageTitle, Section, Select, SourceChip, Textarea, buttonClass } from "@/components/ui";
import { UrgencyPill } from "@/components/workspace/bits";
import { requireCaseAccess } from "@/lib/auth/current";
import { REMINDER_DAYS, daysBetween, urgency } from "@/lib/domain/deadlines";
import { formatIsoDate } from "@/lib/domain/extract";
import { formatSourceId } from "@/lib/domain/origin";
import { DEADLINE_DISCLAIMER } from "@/lib/domain/wording";
import { todayInToronto } from "@/lib/ids";

export default async function DeadlinesPage({ params }: PageProps<"/app/cases/[caseId]/deadlines">) {
  const { caseId } = await params;
  const ctx = await requireCaseAccess(caseId);
  const [deadlines, docs] = await Promise.all([ctx.repo.list("deadlines", ctx.caseFile.id), ctx.repo.list("documents", ctx.caseFile.id)]);
  const today = todayInToronto();
  const byId = new Map(docs.map((d) => [d.id, d]));
  const sorted = [...deadlines].sort((a, b) => Number(a.done) - Number(b.done) || (a.date < b.date ? -1 : 1));
  const canWrite = ctx.membership.role !== "viewer";
  const sortedDocs = [...docs].sort((a, b) => a.seq - b.seq);

  return (
    <>
      <PageTitle
        title="Deadlines"
        lede={`Dates from orders, notices, letters and your lawyer, in one place. Reminders show at ${REMINDER_DAYS.join(", ")} days before.`}
        actions={
          deadlines.length > 0 ? (
            <a href={`/api/cases/${ctx.caseFile.id}/deadlines-ics`} className={buttonClass("secondary", "sm")}>
              <CalendarPlus aria-hidden className="size-4" /> Add to my calendar
            </a>
          ) : undefined
        }
      />
      <Callout tone="caution" className="mb-6" title="Confirm every date">
        {DEADLINE_DISCLAIMER} We never calculate court deadlines for you.
      </Callout>

      <Section title="Your dates" id="list-h">
        {sorted.length === 0 ? (
          <EmptyState title="No deadlines yet" action={canWrite && !ctx.caseFile.noDeadlinesYet ? (
            <form action={setNoDeadlinesYetAction}>
              <input type="hidden" name="caseId" value={ctx.caseFile.id} />
              <input type="hidden" name="value" value="true" />
              <Button type="submit" variant="secondary" size="sm">There are no deadlines yet</Button>
            </form>
          ) : undefined}>
            {ctx.caseFile.noDeadlinesYet ? "You noted there are no deadlines yet. Add one as soon as a date is set." : "Add the dates from your court papers below."}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {sorted.map((d) => {
              const level = urgency(d, today);
              const n = daysBetween(today, d.date);
              const src = d.sourceDocId ? byId.get(d.sourceDocId) : undefined;
              return (
                <li key={d.id} className="flex flex-wrap items-start gap-3 px-4 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <UrgencyPill level={level} />
                      <span className={`font-semibold ${d.done ? "text-ink-3 line-through" : ""}`}>{d.title}</span>
                    </div>
                    <p className="tabular mt-1 text-sm text-ink-2">
                      {formatIsoDate(d.date)}
                      {!d.done && (n >= 0 ? ` · in ${n} day${n === 1 ? "" : "s"}` : ` · ${-n} day${n === -1 ? "" : "s"} ago`)}
                    </p>
                    {d.notes && <p className="mt-1 text-sm text-ink-2">{d.notes}</p>}
                    {src && (
                      <p className="mt-1.5 text-sm">
                        Source: <SourceChip caseId={ctx.caseFile.id} docId={src.id} seq={src.seq} title={src.title} />
                      </p>
                    )}
                  </div>
                  {canWrite && (
                    <div className="flex gap-1">
                      <form action={toggleDeadlineAction}>
                        <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                        <input type="hidden" name="deadlineId" value={d.id} />
                        <input type="hidden" name="done" value={d.done ? "false" : "true"} />
                        <Button type="submit" variant="secondary" size="sm">
                          {d.done ? "Mark not done" : "Mark done"}
                        </Button>
                      </form>
                      <form action={deleteDeadlineAction}>
                        <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                        <input type="hidden" name="deadlineId" value={d.id} />
                        <Button type="submit" variant="quiet" size="sm" aria-label={`Delete ${d.title}`}>
                          Delete
                        </Button>
                      </form>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {canWrite && (
        <Section title="Add a date" id="add-h">
          <form action={addDeadlineAction} className="grid gap-x-4 rounded-lg border border-line bg-surface p-5 md:grid-cols-2">
            <input type="hidden" name="caseId" value={ctx.caseFile.id} />
            <Field label="What is due or happening" htmlFor="title">
              <Input id="title" name="title" maxLength={160} required placeholder="For example: settlement conference" />
            </Field>
            <Field label="Date" htmlFor="date">
              <Input id="date" name="date" type="date" required />
            </Field>
            <Field label="Where the date comes from" htmlFor="sourceDocId" optional>
              <Select id="sourceDocId" name="sourceDocId" defaultValue="">
                <option value="">Not from a document</option>
                {sortedDocs.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {formatSourceId(doc.seq)}: {doc.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Notes" htmlFor="notes" optional>
              <Textarea id="notes" name="notes" maxLength={600} className="min-h-11" />
            </Field>
            <div>
              <Button type="submit">Add date</Button>
            </div>
          </form>
        </Section>
      )}
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
