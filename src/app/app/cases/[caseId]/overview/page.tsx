import { updateCaseDetailsAction, updateSummaryAction } from "@/app/actions/cases";
import { Button, Field, Input, PageTitle, Section, Select, Textarea } from "@/components/ui";
import { requireCaseAccess } from "@/lib/auth/current";
import { CASE_KIND_LABELS } from "@/lib/domain/origin";

export default async function OverviewPage({ params }: PageProps<"/app/cases/[caseId]/overview">) {
  const { caseId } = await params;
  const ctx = await requireCaseAccess(caseId);
  const c = ctx.caseFile;
  const canManage = ctx.membership.role === "owner";
  const canWrite = ctx.membership.role !== "viewer";

  return (
    <>
      <PageTitle title="Case overview" lede={CASE_KIND_LABELS[c.kind]} />
      <div className="grid gap-10 xl:grid-cols-[1fr_24rem]">
        <Section title="Your one-page summary" id="sum-h">
          <p className="mb-3 text-sm text-ink-2">
            In your own words: who is involved, what happened (in date order), where things stand, what you want, and your top questions. This goes at the front of your
            lawyer brief. It is never written by AI.
          </p>
          <form action={updateSummaryAction}>
            <input type="hidden" name="caseId" value={c.id} />
            <label htmlFor="summary" className="sr-only">
              One-page summary
            </label>
            <Textarea id="summary" name="summary" defaultValue={c.summary} maxLength={6000} readOnly={!canWrite} className="min-h-80 font-[inherit]" />
            <p className="mt-1 text-sm text-ink-3">About 250 to 400 words fits on one page.</p>
            {canWrite && (
              <Button type="submit" className="mt-3">
                Save summary
              </Button>
            )}
          </form>
        </Section>
        <Section title="Case details" id="det-h">
          <form action={updateCaseDetailsAction} className="rounded-lg border border-line bg-surface p-5">
            <input type="hidden" name="caseId" value={c.id} />
            <fieldset disabled={!canManage}>
              <Field label="Case name" htmlFor="nickname">
                <Input id="nickname" name="nickname" defaultValue={c.nickname} maxLength={80} required />
              </Field>
              <Field label="Court or courthouse" htmlFor="court">
                <Input id="court" name="court" defaultValue={c.court} maxLength={120} />
              </Field>
              <Field label="Where things stand" htmlFor="stage">
                <Input id="stage" name="stage" defaultValue={c.stage} maxLength={120} />
              </Field>
              <Field label="Your role" htmlFor="role">
                <Select id="role" name="role" defaultValue={c.role}>
                  <option value="plaintiff">Plaintiff</option>
                  <option value="defendant">Defendant</option>
                  <option value="applicant">Applicant</option>
                  <option value="respondent">Respondent</option>
                  <option value="accused">Accused</option>
                  <option value="other">Not sure yet / other</option>
                </Select>
              </Field>
              <Field label="Court file number" htmlFor="courtFileNumber">
                <Input id="courtFileNumber" name="courtFileNumber" defaultValue={c.courtFileNumber} maxLength={60} />
              </Field>
              <Field label="Who is working on this case?" htmlFor="audience">
                <Select id="audience" name="audience" defaultValue={c.audience}>
                  <option value="with_lawyer">I have a lawyer</option>
                  <option value="self_rep">I am representing myself</option>
                </Select>
              </Field>
              {canManage && <Button type="submit" variant="secondary">Save details</Button>}
            </fieldset>
          </form>
        </Section>
      </div>
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
