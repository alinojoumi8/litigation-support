import { requireCaseAccess } from "@/lib/auth/current";
import { CASE_KIND_LABELS } from "@/lib/domain/origin";
import { CaseNav } from "./CaseNav";

export async function CaseSidebar({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const { caseFile } = await requireCaseAccess(caseId);
  return (
    <aside className="no-print border-b border-line bg-surface/70 lg:sticky lg:top-[57px] lg:h-[calc(100dvh-57px)] lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="px-4 pb-2 pt-4 lg:pt-6">
        <p className="text-[0.95rem] font-bold leading-snug text-ink">{caseFile.nickname}</p>
        <p className="mt-0.5 text-xs text-ink-3">{CASE_KIND_LABELS[caseFile.kind]}</p>
        {caseFile.isSample && (
          <p className="mt-2 inline-block rounded border border-dashed border-ochre-line bg-ochre-tint px-1.5 py-0.5 text-xs font-semibold text-ochre-ink">
            Sample case: fictional data
          </p>
        )}
      </div>
      <CaseNav caseId={caseFile.id} />
    </aside>
  );
}
