import { Download } from "lucide-react";
import { deleteCaseAction } from "@/app/actions/cases";
import { Button, Callout, Field, Input, PageTitle, Section, buttonClass } from "@/components/ui";
import { requireCaseAccess } from "@/lib/auth/current";
import { providerStatus } from "@/lib/config";

export default async function SettingsPage({ params, searchParams }: PageProps<"/app/cases/[caseId]/settings">) {
  const { caseId } = await params;
  const sp = await searchParams;
  const ctx = await requireCaseAccess(caseId);
  const status = providerStatus();
  const log = await ctx.repo.listAudit({ caseId: ctx.caseFile.id, limit: 25 });
  const isOwner = ctx.membership.role === "owner";

  return (
    <>
      <PageTitle title="Settings" lede="Privacy, export and deletion for this case." />

      <Section title="How this case is processed" id="proc-h">
        <dl className="grid gap-x-6 gap-y-2 rounded-lg border border-line bg-surface p-5 text-[0.95rem] sm:grid-cols-[12rem_1fr]">
          <dt className="text-ink-3">Storage</dt>
          <dd>{status.data}</dd>
          <dt className="text-ink-3">Summaries and timeline</dt>
          <dd>{status.ai}</dd>
          <dt className="text-ink-3">Reading scans (OCR)</dt>
          <dd>{status.ocr}</dd>
          <dt className="text-ink-3">Payments</dt>
          <dd>{status.payments}</dd>
        </dl>
        {status.aiIsExternal && (
          <Callout tone="caution" className="mt-3">
            Document text is sent to an AI provider outside this server to create summaries. It is not used to train AI. See the security page for where it is processed and
            how long the provider keeps it.
          </Callout>
        )}
      </Section>

      <Section title="Sharing" id="share-h">
        <p className="text-ink-2">
          Sharing with your lawyer or an expert inside the workspace is not built yet. When it is, shares will go only to named people you invite, can expire, and will be
          logged. For now, export a package and send it yourself.
        </p>
      </Section>

      <Section title="Export everything" id="export-h">
        <p className="mb-3 text-ink-2">A ZIP file with every record in this case (as JSON), the timeline as CSV, and your original files named by source number.</p>
        <a href={`/api/cases/${ctx.caseFile.id}/export`} className={buttonClass("secondary")}>
          <Download aria-hidden className="size-4" /> Download case export (.zip)
        </a>
      </Section>

      <Section title="Activity log" id="log-h">
        <p className="mb-3 text-sm text-ink-2">Who viewed, exported or changed what, by record. The log never stores document content.</p>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <caption className="sr-only">Recent activity in this case</caption>
            <thead className="border-b border-line bg-paper text-ink-2">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">When (UTC)</th>
                <th scope="col" className="px-3 py-2 font-semibold">Action</th>
                <th scope="col" className="px-3 py-2 font-semibold">Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {log.map((a) => (
                <tr key={a.id}>
                  <td className="tabular whitespace-nowrap px-3 py-1.5">{a.at.slice(0, 16).replace("T", " ")}</td>
                  <td className="px-3 py-1.5 font-mono text-xs">{a.action}</td>
                  <td className="px-3 py-1.5 font-mono text-xs text-ink-3">{a.targetType ? `${a.targetType} ${a.targetId?.slice(0, 12) ?? ""}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {isOwner && (
        <Section title="Delete this case" id="delete-h">
          <div className="rounded-lg border-2 border-[#eab9ae] bg-surface p-5">
            <p className="text-ink">
              This permanently deletes the case, every uploaded file, all extracted text, summaries, timeline events, flags, notes, questions and deadlines. It cannot be
              undone. Export first if you want a copy.
            </p>
            {sp.delete === "confirm" && (
              <Callout tone="danger" role="alert" className="mt-3">
                Type DELETE to confirm.
              </Callout>
            )}
            <form action={deleteCaseAction} className="mt-4 flex flex-wrap items-end gap-3">
              <input type="hidden" name="caseId" value={ctx.caseFile.id} />
              <div className="w-56">
                <Field label="Type DELETE to confirm" htmlFor="confirm">
                  <Input id="confirm" name="confirm" autoComplete="off" required pattern="[Dd][Ee][Ll][Ee][Tt][Ee]" />
                </Field>
              </div>
              <div className="pb-4">
                <Button type="submit" variant="danger">
                  Delete this case permanently
                </Button>
              </div>
            </form>
          </div>
        </Section>
      )}
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
