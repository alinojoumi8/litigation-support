import Link from "next/link";
import { createComparisonAction } from "@/app/actions/workspace";
import { Button, Callout, EmptyState, Field, Input, PageTitle, Pill, Section, Select } from "@/components/ui";
import { requireCaseAccess } from "@/lib/auth/current";
import { formatSourceId } from "@/lib/domain/origin";
import { SIGNATURE_DISCLAIMER } from "@/lib/domain/wording";

export default async function SignaturesPage({ params, searchParams }: PageProps<"/app/cases/[caseId]/signatures">) {
  const { caseId } = await params;
  const sp = await searchParams;
  const ctx = await requireCaseAccess(caseId);
  const [docs, comparisons] = await Promise.all([ctx.repo.list("documents", ctx.caseFile.id), ctx.repo.list("signatures", ctx.caseFile.id)]);
  const images = docs.filter((d) => d.mimeType.startsWith("image/")).sort((a, b) => a.seq - b.seq);
  const byId = new Map(docs.map((d) => [d.id, d]));
  const base = `/app/cases/${ctx.caseFile.id}`;
  const canWrite = ctx.membership.role !== "viewer";

  return (
    <>
      <PageTitle title="Signature and handwriting compare" lede="Put a questioned sample next to known samples, zoom, overlay and note what looks different, for a qualified examiner." />
      <Callout tone="info" className="mb-6">
        {SIGNATURE_DISCLAIMER}
      </Callout>
      {sp.error === "known" && (
        <Callout tone="danger" role="alert" className="mb-6">
          Choose at least one known sample that is different from the questioned one.
        </Callout>
      )}

      <Section title="Your comparisons" id="cmp-h">
        {comparisons.length === 0 ? (
          <EmptyState title="No comparisons yet">Upload photos or scans of the signatures (PNG, JPG or WEBP), then start a comparison below.</EmptyState>
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {comparisons.map((c) => {
              const q = byId.get(c.questionedDocId);
              return (
                <li key={c.id}>
                  <Link href={`${base}/signatures/${c.id}`} className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-paper">
                    <span className="font-semibold">{c.title}</span>
                    <span className="text-sm text-ink-3">
                      Questioned {q ? formatSourceId(q.seq) : "(deleted)"} vs {c.knownDocIds.length} known sample{c.knownDocIds.length === 1 ? "" : "s"} · {c.observations.length} note
                      {c.observations.length === 1 ? "" : "s"}
                    </span>
                    {c.flaggedForExaminer && <Pill tone="info">Flagged for examiner</Pill>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {canWrite && (
        <Section title="Start a comparison" id="new-h">
          {images.length < 2 ? (
            <p className="text-ink-2">
              You need at least two images in{" "}
              <Link href={`${base}/documents`} className="text-spruce underline">
                Documents
              </Link>
              : the questioned signature and at least one known sample.
            </p>
          ) : (
            <form action={createComparisonAction} className="rounded-lg border border-line bg-surface p-5">
              <input type="hidden" name="caseId" value={ctx.caseFile.id} />
              <Field label="Name" htmlFor="title" optional>
                <Input id="title" name="title" maxLength={120} placeholder="For example: signature on the change order" />
              </Field>
              <Field label="Questioned sample" htmlFor="questionedDocId" hint="The signature or handwriting you want an examiner to look at.">
                <Select id="questionedDocId" name="questionedDocId" required>
                  {images.map((d) => (
                    <option key={d.id} value={d.id}>
                      {formatSourceId(d.seq)}: {d.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <fieldset className="mb-4">
                <legend className="mb-1 font-semibold">Known samples</legend>
                <p className="mb-2 text-sm text-ink-3">Signatures you know are genuine, ideally from around the same time. Note where each one came from.</p>
                <div className="space-y-2">
                  {images.map((d) => (
                    <label key={d.id} className="flex items-center gap-2">
                      <input type="checkbox" name="knownDocIds" value={d.id} className="size-4 accent-spruce" />
                      <span>
                        {formatSourceId(d.seq)}: {d.title}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button type="submit">Open the compare tool</Button>
            </form>
          )}
        </Section>
      )}
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
