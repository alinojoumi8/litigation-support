import Link from "next/link";
import { Lock, Upload } from "lucide-react";
import { Button, Callout, EmptyState, Field, Input, PageTitle, Pill, Select, Section } from "@/components/ui";
import { requireCaseAccess } from "@/lib/auth/current";
import { criminalEnabled, getConfig, providerStatus } from "@/lib/config";
import { formatIsoDate } from "@/lib/domain/extract";
import { ACCEPT_ATTR, ACCEPTED_LABEL } from "@/lib/files";
import { ORIGIN_LABELS, ORIGIN_SHORT, UNDERTAKING_REMINDER, allowedOrigins, formatSourceId, isPrivileged } from "@/lib/domain/origin";

const ERRORS: Record<string, string> = {
  "too-large": "The upload is too large.",
  "bad-form": "The upload could not be read. Please try again.",
  origin: "Choose where the documents came from.",
  "origin-blocked": "That origin is not available for this case.",
  "no-files": "Choose at least one file.",
  "too-many": "Upload up to 10 files at a time.",
};

export default async function DocumentsPage({ params, searchParams }: PageProps<"/app/cases/[caseId]/documents">) {
  const { caseId } = await params;
  const sp = await searchParams;
  const ctx = await requireCaseAccess(caseId);
  const [docs, summaries] = await Promise.all([ctx.repo.list("documents", ctx.caseFile.id), ctx.repo.list("summaries", ctx.caseFile.id)]);
  const summarized = new Set(summaries.map((s) => s.docId));
  const origins = allowedOrigins(ctx.caseFile.kind, criminalEnabled() && Boolean(ctx.caseFile.criminalAckAt));
  const status = providerStatus();
  const maxMb = getConfig().MAX_UPLOAD_MB;
  const sorted = [...docs].sort((a, b) => a.seq - b.seq);
  const canUpload = ctx.membership.role !== "viewer";

  return (
    <>
      <PageTitle title="Documents" lede="Every file gets a source number and page numbers, so each summary, event and flag can point back to it." />

      {sp.uploaded && (
        <Callout tone={Number(sp.uploaded) > 0 ? "success" : "danger"} role="status" className="mb-6" title={Number(sp.uploaded) > 0 ? `${sp.uploaded} document${sp.uploaded === "1" ? "" : "s"} added` : "Nothing was added"}>
          {sp.rejected ? `${sp.rejected} file${sp.rejected === "1" ? " was" : "s were"} not added${sp.reason ? `: ${sp.reason}` : "."}` : "Summaries and timeline events are ready to check. Flags have been refreshed."}
        </Callout>
      )}
      {typeof sp.error === "string" && ERRORS[sp.error] && (
        <Callout tone="danger" role="alert" className="mb-6">
          {ERRORS[sp.error]}
        </Callout>
      )}
      {sp.deleted && (
        <Callout tone="success" role="status" className="mb-6">
          The document and everything made from it (pages, summary, timeline events and flags) were deleted.
        </Callout>
      )}

      {canUpload && (
        <Section title="Add documents" id="upload-h">
          <form action={`/api/cases/${ctx.caseFile.id}/documents`} method="post" encType="multipart/form-data" className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <div className="grid gap-x-5 md:grid-cols-2">
              <Field label="Files" htmlFor="files" hint={`${ACCEPTED_LABEL}. Up to 10 files, ${maxMb} MB each.`}>
                <Input id="files" name="files" type="file" multiple required accept={ACCEPT_ATTR} className="file:mr-3 file:rounded file:border-0 file:bg-spruce-tint file:px-3 file:py-1.5 file:font-semibold file:text-spruce-deep" />
              </Field>
              <Field label="Where did these come from?" htmlFor="origin" hint="Required. This controls how they can be shared later.">
                <Select id="origin" name="origin" required defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  {origins.map((o) => (
                    <option key={o} value={o}>
                      {ORIGIN_LABELS[o]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Who gave them to you?" htmlFor="providedBy" optional>
                <Input id="providedBy" name="providedBy" maxLength={200} placeholder="For example: the contractor, my bank" />
              </Field>
              <Field label="How did you get them?" htmlFor="howObtained" optional>
                <Input id="howObtained" name="howObtained" maxLength={200} placeholder="For example: email, disclosure, court file" />
              </Field>
              <Field label="Tags" htmlFor="tags" optional hint="Separate with commas.">
                <Input id="tags" name="tags" maxLength={200} />
              </Field>
            </div>
            <Callout tone="info" className="mb-4">
              <strong>Documents from the other side:</strong> {UNDERTAKING_REMINDER}
              {ctx.caseFile.kind !== "criminal" && <> Crown disclosure is not accepted.</>}
            </Callout>
            <p className="mb-4 flex items-start gap-2 text-sm text-ink-2">
              <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                Processing: {status.ai}. Text extraction: {status.ocr}.{" "}
                {status.aiIsExternal ? "Document text is sent to the AI provider for summaries. " : "Nothing is sent outside this server. "}
                <Link href="/security" className="text-spruce underline">
                  How your data is handled
                </Link>
              </span>
            </p>
            <Button type="submit">
              <Upload aria-hidden className="size-4" /> Upload and summarize
            </Button>
          </form>
        </Section>
      )}

      <Section title={`All documents (${docs.length})`} id="list-h">
        {sorted.length === 0 ? (
          <EmptyState title="No documents yet">Start with the documents you look at most: the agreement, key emails, invoices.</EmptyState>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full min-w-[46rem] text-left text-[0.95rem]">
              <caption className="sr-only">Documents in this case</caption>
              <thead className="border-b border-line bg-paper text-sm text-ink-2">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Source</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Title</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Origin</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Pages</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Date</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sorted.map((d) => (
                  <tr key={d.id} className="align-top hover:bg-paper">
                    <td className="tabular px-4 py-3 font-mono text-[0.8rem] text-ink-2">{formatSourceId(d.seq)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/app/cases/${ctx.caseFile.id}/documents/${d.id}`} className="font-semibold text-ink hover:text-spruce hover:underline">
                        {d.title}
                      </Link>
                      <span className="block text-xs text-ink-3">{d.docType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1">
                        <Pill tone={d.origin === "other_side" || d.origin === "crown_disclosure" ? "caution" : "neutral"}>{ORIGIN_SHORT[d.origin]}</Pill>
                        {isPrivileged(d) && <Pill tone="info">Privileged</Pill>}
                      </span>
                    </td>
                    <td className="tabular px-4 py-3">{d.pageCount}</td>
                    <td className="tabular px-4 py-3 text-ink-2">{d.docDate ? formatIsoDate(d.docDate) : "Unknown"}</td>
                    <td className="px-4 py-3 text-sm">
                      {summarized.has(d.id) ? (
                        <span className="text-moss-ink">Ready to check</span>
                      ) : d.extraction === "image-no-ocr" ? (
                        <span className="text-ink-3">Image: no text read</span>
                      ) : (
                        <span className="text-ink-3">Not yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
