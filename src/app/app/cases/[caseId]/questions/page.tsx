import { addQuestionAction, deleteQuestionAction, updateQuestionAction } from "@/app/actions/workspace";
import { Button, Callout, EmptyState, Field, PageTitle, Pill, Section, Select, Textarea } from "@/components/ui";
import { requireCaseAccess } from "@/lib/auth/current";
import { REFUSAL_COPY } from "@/lib/brand";

const AUD = { lawyer: "For my lawyer", expert: "For an expert", self: "To find out myself" } as const;

export default async function QuestionsPage({ params }: PageProps<"/app/cases/[caseId]/questions">) {
  const { caseId } = await params;
  const ctx = await requireCaseAccess(caseId);
  const questions = (await ctx.repo.list("questions", ctx.caseFile.id)).sort((a, b) => Number(a.status === "answered") - Number(b.status === "answered") || (a.createdAt < b.createdAt ? -1 : 1));
  const canWrite = ctx.membership.role !== "viewer";

  return (
    <>
      <PageTitle title="Notes and questions" lede="A running list of what to ask your lawyer, an expert or the court office. Good questions make a paid hour count." />
      <Callout tone="neutral" className="mb-6" title="What this product can and cannot answer">
        {REFUSAL_COPY}
      </Callout>
      {canWrite && (
        <Section title="Add a question" id="add-h">
          <form action={addQuestionAction} className="rounded-lg border border-line bg-surface p-5">
            <input type="hidden" name="caseId" value={ctx.caseFile.id} />
            <Field label="Your question" htmlFor="text">
              <Textarea id="text" name="text" maxLength={800} required className="min-h-20" />
            </Field>
            <Field label="Who is it for?" htmlFor="audience">
              <Select id="audience" name="audience" defaultValue={ctx.caseFile.audience === "with_lawyer" ? "lawyer" : "self"}>
                <option value="lawyer">{AUD.lawyer}</option>
                <option value="expert">{AUD.expert}</option>
                <option value="self">{AUD.self}</option>
              </Select>
            </Field>
            <Button type="submit">Add question</Button>
          </form>
        </Section>
      )}
      <Section title={`Your questions (${questions.length})`} id="list-h">
        {questions.length === 0 ? (
          <EmptyState title="No questions yet">Write down anything you want to understand. You can add the answer when you get it.</EmptyState>
        ) : (
          <ol className="space-y-3">
            {questions.map((q, i) => (
              <li key={q.id} className="rounded-lg border border-line bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tabular font-bold text-ink-3">{i + 1}.</span>
                  <Pill tone={q.status === "answered" ? "success" : "neutral"}>{q.status === "answered" ? "Answered" : "Open"}</Pill>
                  <Pill>{AUD[q.audience]}</Pill>
                </div>
                <p className="mt-2 font-semibold">{q.text}</p>
                {canWrite ? (
                  <form action={updateQuestionAction} className="mt-3">
                    <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                    <input type="hidden" name="questionId" value={q.id} />
                    <label htmlFor={`a-${q.id}`} className="mb-1 block text-sm font-semibold">
                      Answer or notes
                    </label>
                    <textarea id={`a-${q.id}`} name="answer" defaultValue={q.answer} maxLength={2000} rows={2} className="block w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-[0.95rem]" />
                    <div className="mt-2 flex gap-2">
                      <Button type="submit" size="sm" variant="secondary">
                        Save
                      </Button>
                    </div>
                  </form>
                ) : (
                  q.answer && <p className="mt-2 text-ink-2">{q.answer}</p>
                )}
                {canWrite && (
                  <form action={deleteQuestionAction} className="mt-1">
                    <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                    <input type="hidden" name="questionId" value={q.id} />
                    <Button type="submit" size="sm" variant="quiet">
                      Delete
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ol>
        )}
      </Section>
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
