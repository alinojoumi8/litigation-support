import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteComparisonAction } from "@/app/actions/workspace";
import { Button, PageTitle } from "@/components/ui";
import { CompareTool } from "@/components/workspace/CompareTool";
import { audit, requireCaseAccess } from "@/lib/auth/current";
import { isSafeId } from "@/lib/auth/authz";
import { formatSourceId } from "@/lib/domain/origin";

export default async function ComparePage({ params }: PageProps<"/app/cases/[caseId]/signatures/[sigId]">) {
  const { caseId, sigId } = await params;
  const ctx = await requireCaseAccess(caseId);
  if (!isSafeId(sigId)) notFound();
  const cmp = await ctx.repo.get("signatures", ctx.caseFile.id, sigId);
  if (!cmp) notFound();
  const docs = await ctx.repo.list("documents", ctx.caseFile.id);
  const byId = new Map(docs.map((d) => [d.id, d]));
  const q = byId.get(cmp.questionedDocId);
  const known = cmp.knownDocIds.map((k) => byId.get(k)).filter((d): d is NonNullable<typeof d> => Boolean(d));
  if (!q || known.length === 0) notFound();
  await audit(ctx, "signature.viewed", ctx.caseFile.id, "signature", cmp.id);
  const img = (d: typeof q) => ({ id: d.id, title: d.title, url: `/api/cases/${ctx.caseFile.id}/documents/${d.id}/file`, sourceRef: formatSourceId(d.seq) });
  const base = `/app/cases/${ctx.caseFile.id}`;

  return (
    <>
      <p className="mb-3 text-sm">
        <Link href={`${base}/signatures`} className="text-spruce underline">
          Signature compare
        </Link>
      </p>
      <PageTitle title={cmp.title} lede="Drag or use the arrow keys to move. Zoom and rotate to line up the samples. Add numbered notes on what looks different." />
      <CompareTool
        caseId={ctx.caseFile.id}
        comparisonId={cmp.id}
        questioned={img(q)}
        known={known.map(img)}
        initialObservations={cmp.observations}
        initialExaminerNote={cmp.examinerNote}
        flagged={cmp.flaggedForExaminer}
        readOnly={ctx.membership.role === "viewer"}
      />
      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <Link href={`${base}/packages`} className="font-semibold text-spruce underline">
          Build an expert prep package
        </Link>
        {ctx.membership.role !== "viewer" && (
          <form action={deleteComparisonAction} className="ml-auto">
            <input type="hidden" name="caseId" value={ctx.caseFile.id} />
            <input type="hidden" name="comparisonId" value={cmp.id} />
            <Button type="submit" variant="quiet" size="sm">
              Delete this comparison
            </Button>
          </form>
        )}
      </div>
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
