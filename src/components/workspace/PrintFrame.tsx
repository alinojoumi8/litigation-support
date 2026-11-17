import Link from "next/link";
import type { ReactNode } from "react";
import { EXPORT_DISCLAIMER } from "@/lib/brand";
import { WATERMARK_TEXT } from "@/lib/domain/origin";
import { PrintButton } from "./PrintButton";

/** Printable package frame: the disclaimer repeats as a header and footer on every printed page. */
export function PrintFrame({ backHref, title, watermark, children }: { backHref: string; title: string; watermark: boolean; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[52rem]">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3">
        <Link href={backHref} className="text-sm font-semibold text-spruce underline">
          Back to packages
        </Link>
        <PrintButton />
      </div>
      <div className="print-only print-running-header">
        {title} · {EXPORT_DISCLAIMER}
        {watermark && <strong> · {WATERMARK_TEXT}</strong>}
      </div>
      <div className="print-only print-running-footer">
        {EXPORT_DISCLAIMER} {watermark && WATERMARK_TEXT}
      </div>
      <article className="rounded-lg border border-line bg-white p-8 shadow-card print:border-0 print:p-0 print:shadow-none">
        <p className="mb-6 rounded border border-line bg-paper px-3 py-2 text-xs text-ink-2 print:hidden">
          {EXPORT_DISCLAIMER}
          {watermark && <strong className="block">{WATERMARK_TEXT}</strong>}
        </p>
        {children}
      </article>
    </div>
  );
}

export function PkgSection({ title, children, breakBefore }: { title: string; children: ReactNode; breakBefore?: boolean }) {
  return (
    <section className={`mt-10 ${breakBefore ? "print-break" : ""}`}>
      <h2 className="mb-3 border-b-2 border-ink pb-1 font-display text-[1.45rem]">{title}</h2>
      {children}
    </section>
  );
}
