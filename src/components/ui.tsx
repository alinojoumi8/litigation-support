import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { CircleCheck, Flag, Info, Lock, TriangleAlert, ArrowUpRight } from "lucide-react";
import { formatSourceRef } from "@/lib/domain/origin";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "quiet" | "danger";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-spruce text-white hover:bg-spruce-deep shadow-card",
  secondary: "bg-surface text-ink border border-line-strong hover:border-ink-3 hover:bg-paper",
  quiet: "text-spruce hover:bg-spruce-tint underline-offset-4 hover:underline",
  danger: "bg-brick-ink text-white hover:bg-[#7d2218]",
};
const sizes: Record<Size, string> = {
  md: "min-h-11 px-4.5 py-2.5 text-[0.98rem]",
  sm: "min-h-9 px-3 py-1.5 text-sm",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cx(base, variants[variant], sizes[size], extra);
}

export function Button({ variant = "primary", size = "md", className, ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

type Tone = "info" | "flag" | "caution" | "danger" | "success" | "neutral";
const toneClass: Record<Tone, string> = {
  info: "bg-slate-tint text-slate-ink border-[#c9d4e6]",
  flag: "bg-ochre-tint text-ochre-ink border-ochre-line",
  caution: "bg-ochre-tint text-ochre-ink border-ochre-line",
  danger: "bg-brick-tint text-brick-ink border-[#eab9ae]",
  success: "bg-moss-tint text-moss-ink border-[#bcd7c0]",
  neutral: "bg-sunken text-ink-2 border-line",
};
const toneIcon: Record<Tone, ReactNode> = {
  info: <Info aria-hidden className="mt-0.5 size-[1.1rem] shrink-0" />,
  flag: <Flag aria-hidden className="mt-0.5 size-[1.1rem] shrink-0" />,
  caution: <TriangleAlert aria-hidden className="mt-0.5 size-[1.1rem] shrink-0" />,
  danger: <TriangleAlert aria-hidden className="mt-0.5 size-[1.1rem] shrink-0" />,
  success: <CircleCheck aria-hidden className="mt-0.5 size-[1.1rem] shrink-0" />,
  neutral: <Lock aria-hidden className="mt-0.5 size-[1.1rem] shrink-0" />,
};

/** Notice with icon + text (never colour alone). */
export function Callout({ tone = "info", title, children, className, role }: { tone?: Tone; title?: ReactNode; children?: ReactNode; className?: string; role?: "status" | "alert" | "note" }) {
  return (
    <div role={role} className={cx("flex gap-3 rounded-md border px-4 py-3 text-[0.95rem] leading-relaxed", toneClass[tone], className)}>
      {toneIcon[tone]}
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : undefined}>{children}</div>}
      </div>
    </div>
  );
}

/** "Doc 0142 p.3": every line links back to its source page. */
export function SourceChip({ caseId, docId, seq, page, title }: { caseId: string; docId: string; seq: number; page?: number | null; title?: string }) {
  const href = `/app/cases/${caseId}/documents/${docId}${page ? `?page=${page}#page-${page}` : ""}`;
  return (
    <Link
      href={href}
      title={title ? `Open ${title}${page ? `, page ${page}` : ""}` : undefined}
      className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.78rem] font-medium text-spruce hover:border-spruce hover:bg-spruce-tint"
    >
      {formatSourceRef(seq, page)}
      <ArrowUpRight aria-hidden className="size-3" />
      <span className="sr-only">(open source)</span>
    </Link>
  );
}

export function Pill({ tone = "neutral", children, icon }: { tone?: Tone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.78rem] font-semibold leading-5", toneClass[tone])}>
      {icon}
      {children}
    </span>
  );
}

export function AiDraftLabel({ provider }: { provider?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-dashed border-line-strong bg-paper px-2 py-0.5 text-[0.78rem] font-semibold text-ink-2">
      <span aria-hidden className="size-1.5 rounded-full bg-ochre-line" />
      AI draft. Check against the source.
      {provider && <span className="font-normal text-ink-3">({provider})</span>}
    </span>
  );
}

export function PageTitle({ title, lede, actions }: { title: ReactNode; lede?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div className="min-w-0 max-w-3xl">
        <h1 className="font-display text-[2rem] font-[560] leading-tight tracking-[-0.01em] text-ink">{title}</h1>
        {lede && <div className="mt-2 text-ink-2">{lede}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Section({ title, children, aside, id }: { title: ReactNode; children: ReactNode; aside?: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className="mb-10">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={id} className="text-lg font-bold text-ink">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-lg border border-line bg-surface p-5 shadow-card", className)}>{children}</div>;
}

// Form controls ---------------------------------------------------------------

export function Field({ label, hint, error, children, htmlFor, optional }: { label: ReactNode; hint?: ReactNode; error?: string; children: ReactNode; htmlFor: string; optional?: boolean }) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="mb-1 block font-semibold text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-3">(optional)</span>}
      </label>
      {hint && (
        <p id={`${htmlFor}-hint`} className="mb-1.5 text-sm text-ink-3">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1 flex items-center gap-1 text-sm font-semibold text-brick-ink">
          <TriangleAlert aria-hidden className="size-4" /> {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "block w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-ink shadow-[inset_0_1px_1px_rgb(27_34_43/0.04)] hover:border-ink-3 focus-visible:border-spruce aria-[invalid=true]:border-brick-ink";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={cx(inputClass, props.className)} />;
}
export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={cx(inputClass, "min-h-28 leading-relaxed", props.className)} />;
}
export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={cx(inputClass, "pr-8", props.className)} />;
}

export function Checkbox({ id, label, hint, ...props }: ComponentProps<"input"> & { id: string; label: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex gap-3">
      <input id={id} type="checkbox" className="mt-1 size-5 shrink-0 accent-spruce" {...props} />
      <label htmlFor={id} className="leading-snug">
        <span className="text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-ink-3">{hint}</span>}
      </label>
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: ReactNode; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong bg-surface/60 px-6 py-10 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-prose text-ink-2">{children}</div>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cx("text-spruce underline hover:text-spruce-deep", className)}>
      {children}
      <ArrowUpRight aria-hidden className="ml-0.5 inline size-3.5 align-[-0.1em]" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
