import { PRODUCT_NAME } from "@/lib/brand";

/** Wordmark: a folder tab mark and the working name, set in the display serif. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg aria-hidden width="26" height="22" viewBox="0 0 26 22" className="shrink-0">
        <path d="M1.5 4.5a2 2 0 0 1 2-2h6l2.2 2.4H22.5a2 2 0 0 1 2 2v12.6a2 2 0 0 1-2 2h-19a2 2 0 0 1-2-2z" fill="#1d5a50" />
        <path d="M6 11.2h14M6 15h9.5" stroke="#f6f3ec" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="font-display text-[1.35rem] font-[620] tracking-[-0.015em] text-ink">{PRODUCT_NAME}</span>
    </span>
  );
}
