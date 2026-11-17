import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink as ExtIcon, RefreshCw, Trash2 } from "lucide-react";
import { confirmAllFromDocAction, confirmEventAction, deleteDocumentAction, resummarizeAction, updateDocumentAction } from "@/app/actions/workspace";
import { AiDraftLabel, Button, Callout, Checkbox, Field, Input, Pill, Section, Select, SourceChip, buttonClass } from "@/components/ui";
import { audit, requireCaseAccess } from "@/lib/auth/current";
import { isSafeId } from "@/lib/auth/authz";
import { criminalEnabled } from "@/lib/config";
import { formatIsoDate } from "@/lib/domain/extract";
import { ORIGIN_LABELS, PRIVILEGE_WARNING, UNDERTAKING_REMINDER, allowedOrigins, formatSourceId, hasUseRestriction, isPrivileged } from "@/lib/domain/origin";

const GUARD_NOTES: Record<string, string> = {
  "citation-removed": "A reference that looked like a legal citation was removed. Verify before filing.",
  "wording-neutralized": "Some wording that drew a conclusion was replaced with neutral wording.",
  "quote-not-verbatim": "A quote did not match the page word for word, so it is shown as a paraphrase.",
  "page-corrected": "A page reference was outside this document and was corrected.",
  "invalid-date-dropped": "An event without a valid date was left out.",
};

export default async function DocumentPage({ params, searchParams }: PageProps<"/app/cases/[caseId]/documents/[docId]">) {
  const { caseId, docId } = await params;
  const sp = await searchParams;
  const ctx = await requireCaseAccess(caseId);
  if (!isSafeId(docId)) notFound();
  const doc = await ctx.repo.get("documents", ctx.caseFile.id, docId);
  if (!doc) notFound();
  const [pages, summaries, events] = await Promise.all([ctx.repo.list("pages", ctx.caseFile.id), ctx.repo.list("summaries", ctx.caseFile.id), ctx.repo.list("events", ctx.caseFile.id)]);
  await audit(ctx, "document.viewed", ctx.caseFile.id, "document", doc.id);

  const myPages = pages.filter((p) => p.docId === doc.id).sort((a, b) => a.page - b.page);
  const summary = summaries.find((s) => s.docId === doc.id);
  const myEvents = events.filter((e) => e.sourceDocId === doc.id).sort((a, b) => (a.date < b.date ? -1 : 1));
  const current = Number(sp.page) || null;
  const fileUrl = `/api/cases/${ctx.caseFile.id}/documents/${doc.id}/file`;
  const base = `/app/cases/${ctx.caseFile.id}`;
  const isImage = doc.mimeType.startsWith("image/");
  const isPdf = doc.mimeType === "application/pdf";
  const origins = allowedOrigins(ctx.caseFile.kind, criminalEnabled() && Boolean(ctx.caseFile.criminalAckAt));
  const canWrite = ctx.membership.role !== "viewer";

  return (
    <>
      <p className="mb-3 text-sm">
        <Link href={`${base}/documents`} className="text-spruce underline">
          Documents
        </Link>
      </p>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="font-mono text-sm text-ink-3">{formatSourceId(doc.seq)}</p>
          <h1 className="font-display text-[1.9rem] leading-tight">{doc.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-2">
            <Pill tone={hasUseRestriction(doc) ? "caution" : "neutral"}>{ORIGIN_LABELS[doc.origin]}</Pill>
            {isPrivileged(doc) && <Pill tone="info">Privileged</Pill>}
            <span>
              {doc.docType} · {doc.pageCount} page{doc.pageCount === 1 ? "" : "s"}
              {doc.docDate ? ` · ${formatIsoDate(doc.docDate)}` : ""}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={fileUrl} target="_blank" rel="noopener" className={buttonClass("secondary", "sm")}>
            <ExtIcon aria-hidden className="size-4" /> Open original
          </a>
          <a href={`${fileUrl}?download=1`} className={buttonClass("secondary", "sm")}>
            <Download aria-hidden className="size-4" /> Download
          </a>
        </div>
      </div>

      {hasUseRestriction(doc) && (
        <Callout tone="caution" className="mb-4">
          {UNDERTAKING_REMINDER}
        </Callout>
      )}
      {isPrivileged(doc) && (
        <Callout tone="info" className="mb-4">
          {PRIVILEGE_WARNING}
        </Callout>
      )}

      <div className="grid gap-8 2xl:grid-cols-[1fr_26rem]">
        <div className="min-w-0">
          <Section title="Summary" id="summary-h" aside={summary ? <AiDraftLabel provider={summary.provider === "mock" ? "local demo extractor" : summary.model} /> : undefined}>
            {summary ? (
              <div className="rounded-lg border border-dashed border-line-strong bg-surface p-5">
                <p className="leading-relaxed">{summary.summary}</p>
                {summary.keyFacts.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-line pt-4">
                    {summary.keyFacts.map((f, i) => (
                      <li key={i} className="flex flex-wrap items-baseline gap-2 text-[0.95rem]">
                        <SourceChip caseId={ctx.caseFile.id} docId={doc.id} seq={doc.seq} page={f.page} />
                        <span>{f.text}</span>
                        {f.quote && <q className="text-sm italic text-ink-2">{f.quote}</q>}
                      </li>
                    ))}
                  </ul>
                )}
                {summary.guardNotes.length > 0 && (
                  <ul className="mt-4 space-y-1 text-sm text-ink-3">
                    {summary.guardNotes.map((n) => (
                      <li key={n}>Safety check: {GUARD_NOTES[n] ?? n}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-xs text-ink-3">
                  Made by {summary.provider === "mock" ? "the local demo extractor (no AI)" : summary.model}, prompt version {summary.promptVersion}.
                </p>
              </div>
            ) : (
              <Callout tone="neutral">
                {doc.extraction === "image-no-ocr"
                  ? "This is an image. No text was read from it, because text recognition (OCR) is not switched on. You can still view it, compare it and refer to it."
                  : "No summary yet."}
              </Callout>
            )}
            {canWrite && myPages.some((p) => p.text.trim()) && (
              <form action={resummarizeAction} className="mt-3">
                <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                <input type="hidden" name="docId" value={doc.id} />
                <Button type="submit" variant="quiet" size="sm">
                  <RefreshCw aria-hidden className="size-4" /> Summarize again
                </Button>
              </form>
            )}
          </Section>

          <Section title="Pages" id="pages-h">
            {isImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl} alt={`${doc.title} (image)`} className="mb-4 max-h-[32rem] w-auto rounded-lg border border-line bg-white" />
            )}
            {isPdf && <iframe title={`${doc.title} (original PDF)`} src={`${fileUrl}#page=${current ?? 1}`} className="mb-4 h-[34rem] w-full rounded-lg border border-line bg-white" />}
            <div className="space-y-4">
              {myPages.map((p) => (
                <section
                  key={p.page}
                  id={`page-${p.page}`}
                  aria-label={`Page ${p.page}`}
                  className={`scroll-mt-24 rounded-lg border bg-surface ${current === p.page ? "border-spruce ring-2 ring-spruce/30" : "border-line"}`}
                >
                  <header className="flex items-center justify-between border-b border-line px-4 py-2 text-sm">
                    <span className="font-mono font-semibold text-ink-2">
                      {formatSourceId(doc.seq)} p.{p.page}
                    </span>
                    {current === p.page && <span className="font-semibold text-spruce">Linked page</span>}
                  </header>
                  <div className="whitespace-pre-wrap px-4 py-3 font-[inherit] text-[0.95rem] leading-relaxed text-ink">
                    {p.text.trim() || <span className="text-ink-3">No readable text on this page.</span>}
                  </div>
                </section>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-8">
          <Section
            title={`Events from this document (${myEvents.length})`}
            id="events-h"
            aside={
              canWrite && myEvents.some((e) => e.status === "unconfirmed") ? (
                <form action={confirmAllFromDocAction}>
                  <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                  <input type="hidden" name="docId" value={doc.id} />
                  <Button type="submit" variant="quiet" size="sm">
                    Confirm all
                  </Button>
                </form>
              ) : undefined
            }
          >
            {myEvents.length === 0 ? (
              <p className="text-sm text-ink-2">No dated events found.</p>
            ) : (
              <ul className="space-y-2">
                {myEvents.map((e) => (
                  <li key={e.id} className={`rounded-md border p-3 text-sm ${e.status === "confirmed" ? "border-line bg-surface" : "border-dashed border-line-strong bg-paper"}`}>
                    <p className="tabular font-semibold">{formatIsoDate(e.date, e.datePrecision)}</p>
                    <p className="mt-0.5">{e.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {e.sourcePage && <SourceChip caseId={ctx.caseFile.id} docId={doc.id} seq={doc.seq} page={e.sourcePage} />}
                      {canWrite && (
                        <form action={confirmEventAction} className="ml-auto">
                          <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                          <input type="hidden" name="eventId" value={e.id} />
                          <input type="hidden" name="status" value={e.status === "confirmed" ? "unconfirmed" : "confirmed"} />
                          <Button type="submit" variant={e.status === "confirmed" ? "quiet" : "secondary"} size="sm">
                            {e.status === "confirmed" ? "Confirmed. Undo" : "Confirm"}
                          </Button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Where it came from" id="prov-h">
            <dl className="rounded-lg border border-line bg-surface p-4 text-sm">
              <dt className="text-ink-3">Who gave it to you</dt>
              <dd className="mb-2 font-semibold">{doc.providedBy || "Not recorded"}</dd>
              <dt className="text-ink-3">How you got it</dt>
              <dd className="mb-2 font-semibold">{doc.howObtained || "Not recorded"}</dd>
              <dt className="text-ink-3">Original available</dt>
              <dd className="mb-2 font-semibold">{doc.originalAvailable ? "Yes" : "No, or not recorded"}</dd>
              <dt className="text-ink-3">File</dt>
              <dd className="break-all font-mono text-xs">{doc.filename}</dd>
              <dt className="mt-2 text-ink-3">SHA-256 fingerprint</dt>
              <dd className="break-all font-mono text-xs">{doc.sha256}</dd>
            </dl>
            {canWrite && (
              <details className="mt-3 rounded-lg border border-line bg-surface p-4">
                <summary className="cursor-pointer font-semibold text-spruce">Edit details</summary>
                <form action={updateDocumentAction} className="mt-4">
                  <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                  <input type="hidden" name="docId" value={doc.id} />
                  <Field label="Title" htmlFor="title">
                    <Input id="title" name="title" defaultValue={doc.title} maxLength={160} required />
                  </Field>
                  <Field label="Origin" htmlFor="origin">
                    <Select id="origin" name="origin" defaultValue={doc.origin}>
                      {origins.map((o) => (
                        <option key={o} value={o}>
                          {ORIGIN_LABELS[o]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Who gave it to you" htmlFor="providedBy">
                    <Input id="providedBy" name="providedBy" defaultValue={doc.providedBy} maxLength={200} />
                  </Field>
                  <Field label="How you got it" htmlFor="howObtained">
                    <Input id="howObtained" name="howObtained" defaultValue={doc.howObtained} maxLength={200} />
                  </Field>
                  <div className="mb-4">
                    <Checkbox id="originalAvailable" name="originalAvailable" defaultChecked={doc.originalAvailable} label="I have the original (not just a copy)" />
                  </div>
                  <Button type="submit" size="sm">
                    Save details
                  </Button>
                </form>
              </details>
            )}
          </Section>

          {canWrite && (
            <form action={deleteDocumentAction} className="rounded-lg border border-line bg-surface p-4">
              <input type="hidden" name="caseId" value={ctx.caseFile.id} />
              <input type="hidden" name="docId" value={doc.id} />
              <p className="mb-3 text-sm text-ink-2">Deleting removes the file, its pages, summary, timeline events and flags. This cannot be undone.</p>
              <Checkbox id="confirmDelete" name="confirmDelete" required label="I understand this cannot be undone" />
              <Button type="submit" variant="danger" size="sm" className="mt-3">
                <Trash2 aria-hidden className="size-4" /> Delete this document
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
