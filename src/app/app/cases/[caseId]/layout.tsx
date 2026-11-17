import { Suspense } from "react";
import { CaseSidebar } from "@/components/workspace/CaseSidebar";

export const instant = false;

export default function CaseLayout({ children, params }: LayoutProps<"/app/cases/[caseId]">) {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
      <Suspense fallback={<div className="no-print h-14 border-b border-line lg:h-auto lg:w-64 lg:border-b-0 lg:border-r" aria-hidden />}>
        <CaseSidebar params={params} />
      </Suspense>
      <div className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:py-10">{children}</div>
    </div>
  );
}
