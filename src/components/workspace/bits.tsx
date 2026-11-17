import { CalendarClock, CircleCheck, Circle, Flag, TriangleAlert } from "lucide-react";
import type { DeadlineUrgency } from "@/lib/domain/deadlines";
import { URGENCY_LABEL } from "@/lib/domain/deadlines";
import type { FlagStatus } from "@/lib/domain/types";
import { FLAG_STATUS_LABELS } from "@/lib/domain/discrepancies";
import type { Readiness } from "@/lib/domain/readiness";
import { READINESS_CAPTION } from "@/lib/domain/wording";
import { Pill } from "@/components/ui";

export function UrgencyPill({ level }: { level: DeadlineUrgency }) {
  const tone = level === "overdue" ? "danger" : level === "today" || level === "within_2" ? "caution" : level === "done" ? "success" : "info";
  const Icon = level === "overdue" ? TriangleAlert : level === "done" ? CircleCheck : CalendarClock;
  return (
    <Pill tone={tone} icon={<Icon aria-hidden className="size-3.5" />}>
      {URGENCY_LABEL[level]}
    </Pill>
  );
}

export function FlagStatusPill({ status }: { status: FlagStatus }) {
  const tone = status === "new" ? "flag" : status === "matters" ? "info" : status === "ask_lawyer" ? "info" : "neutral";
  return (
    <Pill tone={tone} icon={status === "new" ? <Flag aria-hidden className="size-3.5" /> : status === "not_an_issue" ? <CircleCheck aria-hidden className="size-3.5" /> : undefined}>
      {FLAG_STATUS_LABELS[status]}
    </Pill>
  );
}

export function ReadinessPanel({ readiness, compact }: { readiness: Readiness; compact?: boolean }) {
  return (
    <section aria-labelledby="readiness-h" className="rounded-lg border border-line bg-surface p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="readiness-h" className="font-bold">
          File readiness
        </h2>
        <p className="tabular font-display text-3xl text-ink">{readiness.score}%</p>
      </div>
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-sunken"
        role="progressbar"
        aria-label="File readiness"
        aria-valuenow={readiness.score}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-spruce" style={{ width: `${readiness.score}%` }} />
      </div>
      <p className="mt-3 text-sm font-semibold text-ink-2">{READINESS_CAPTION}</p>
      {!compact && (
        <ul className="mt-4 space-y-2.5 border-t border-line pt-4">
          {readiness.items.map((i) => (
            <li key={i.key} className="flex gap-2.5">
              {i.done ? <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-moss-ink" /> : <Circle aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-3" />}
              <div className="min-w-0">
                <p className="text-[0.95rem] font-semibold text-ink">
                  {i.label} <span className="sr-only">{i.done ? "(done)" : "(not done yet)"}</span>
                </p>
                <p className="text-sm text-ink-3">{i.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
