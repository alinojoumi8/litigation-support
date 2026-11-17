import { recordBriefExportAction, recordExpertExportAction } from "@/app/actions/workspace";
import { Button, Callout, Checkbox, Field, PageTitle, Pill, Section, Select, Textarea } from "@/components/ui";
import { requireCaseAccess } from "@/lib/auth/current";
import { EXPORT_CHECK_NOTICE, EXPORT_DISCLAIMER } from "@/lib/brand";
import { ORIGIN_SHORT, excludedFromExpertByDefault, formatSourceId, shareWarnings } from "@/lib/domain/origin";
import { authorityById } from "@/lib/domain/authorities";
import { loadCaseOverview } from "@/lib/services/caseData";

const EXAMINER_QUESTIONS =
  "1. Are there visible differences between the questioned signature and the known samples?\n2. What else would you need (originals, more known samples) to give an opinion?\n3. Can you say anything about how the questioned signature was produced?";
const ACCOUNTANT_QUESTIONS = "1. Do the statements we have cover the full period?\n2. Can these entries be traced to supporting documents?\n3. What other records would you need?";

export default async function PackagesPage({ params, searchParams }: PageProps<"/app/cases/[caseId]/packages">) {
  const { caseId } = await params;
  const sp = await searchParams;
  const ctx = await requireCaseAccess(caseId);
  const o = await loadCaseOverview(ctx);
  const c = ctx.caseFile;
  const docs = [...o.documents].sort((a, b) => a.seq - b.seq);
  const warn = shareWarnings(docs);
  const canExport = ctx.membership.role !== "viewer";
  const expertRule = authorityById("rcp-4-1");
  const drafts = c.expertDrafts ?? {};
  const unconfirmed = o.events.filter((e) => e.status === "unconfirmed").length;

  return (
    <>
      <PageTitle title="Packages" lede="Export your organized file for your lawyer, or a prep package for an expert." />
      {sp.error === "review" && (
        <Callout tone="danger" role="alert" className="mb-6">
          Please confirm you have reviewed the brief before exporting it.
        </Callout>
      )}
      {sp.error === "restricted" && (
        <Callout tone="danger" role="alert" className="mb-6">
          You included documents from the other side or from your lawyer. Confirm that you are allowed to share them with the expert, or leave them out.
        </Callout>
      )}

      <div className="grid gap-10 2xl:grid-cols-2">
        <Section title="Lawyer-ready brief" id="brief-h">
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="text-ink-2">
              Cover sheet, your one-page summary, the chronology, a document index, key people, flags you marked as mattering or for your lawyer, open questions, dates,
              and an AI-use statement. Every page carries this notice:
            </p>
            <p className="mt-2 rounded border border-line bg-paper px-3 py-2 text-sm">{EXPORT_DISCLAIMER}</p>
            <ul className="mt-4 space-y-1 text-sm text-ink-2">
              <li>
                {o.events.length} timeline events ({unconfirmed} still unconfirmed, and marked so in the brief)
              </li>
              <li>{docs.length} documents in the index</li>
              <li>{o.flags.filter((f) => f.status === "matters" || f.status === "ask_lawyer").length} flags marked &quot;Matters&quot; or &quot;Ask lawyer&quot;</li>
              <li>{o.questions.filter((q) => q.status === "open").length} open questions</li>
            </ul>
            {warn.messages.length > 0 && (
              <Callout tone="caution" className="mt-4" title={`This brief lists ${warn.total} documents, including ${warn.otherSide} from the other side and ${warn.privileged} marked privileged.`}>
                <p>Only share it with your lawyer or an expert working on this case.</p>
                {warn.messages.map((m) => (
                  <p key={m} className="mt-1">
                    {m}
                  </p>
                ))}
              </Callout>
            )}
            {canExport && (
              <form action={recordBriefExportAction} className="mt-5 space-y-3">
                <input type="hidden" name="caseId" value={c.id} />
                <Checkbox id="watermark" name="watermark" defaultChecked label="Add the watermark: Confidential. May be subject to undertakings or privilege." />
                <Checkbox id="reviewed" name="reviewed" required label="I have reviewed the timeline, flags and summary, and I will check every fact against its source page before relying on it." hint={EXPORT_CHECK_NOTICE} />
                <Button type="submit">Open the brief to print or save</Button>
              </form>
            )}
          </div>
        </Section>

        <Section title="Expert prep package" id="expert-h">
          <form action={recordExpertExportAction} className="rounded-lg border border-line bg-surface p-5">
            <input type="hidden" name="caseId" value={c.id} />
            <p className="mb-4 text-ink-2">
              Neutral background, the documents to examine with where each one came from, the questions to answer, a timeline extract, and your notes. It never writes
              conclusions for the expert.
            </p>
            <Callout tone="info" className="mb-4">
              In Ontario civil cases, experts owe a duty to the court to be fair, objective and non-partisan ({expertRule.citation}, Rules of Civil Procedure). If you
              have a lawyer, your lawyer should usually be the one to hire the expert.
            </Callout>
            <Field label="Who is it for?" htmlFor="type">
              <Select id="type" name="type" defaultValue={sp.type === "accountant" ? "accountant" : "examiner"}>
                <option value="examiner">Forensic document examiner</option>
                <option value="accountant">Forensic accountant</option>
              </Select>
            </Field>
            <Field label="Background, in neutral words" htmlFor="background" hint="What the documents are and how you came to have them. Facts only, no conclusions.">
              <Textarea id="background" name="background" maxLength={3000} defaultValue={drafts.examiner?.background ?? ""} />
            </Field>
            <Field label="Questions for the expert" htmlFor="questions" hint="Ask open questions. Avoid questions that assume an answer.">
              <Textarea id="questions" name="questions" maxLength={3000} defaultValue={drafts.examiner?.questions ?? EXAMINER_QUESTIONS} />
            </Field>
            <p className="-mt-2 mb-4 text-sm text-ink-3">For an accountant you might ask: {ACCOUNTANT_QUESTIONS.replace(/\n/g, " ")}</p>
            <fieldset className="mb-4">
              <legend className="mb-1 font-semibold">Documents to include</legend>
              <p className="mb-2 text-sm text-ink-3">Documents from the other side and from your lawyer are left out unless you tick them.</p>
              <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-md border border-line p-3">
                {docs.map((d) => (
                  <label key={d.id} className="flex items-start gap-2 text-[0.95rem]">
                    <input type="checkbox" name="docIds" value={d.id} defaultChecked={!excludedFromExpertByDefault(d)} className="mt-1 size-4 accent-spruce" />
                    <span>
                      <span className="font-mono text-xs text-ink-3">{formatSourceId(d.seq)}</span> {d.title}{" "}
                      {excludedFromExpertByDefault(d) && <Pill tone="caution">{ORIGIN_SHORT[d.origin]}</Pill>}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mb-4">
              <Checkbox
                id="confirmRestricted"
                name="confirmRestricted"
                label="If I ticked documents from the other side or my lawyer, I confirm I am allowed to share them with this expert for this case."
              />
            </div>
            {canExport && <Button type="submit">Open the expert package</Button>}
          </form>
        </Section>
      </div>
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
