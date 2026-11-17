import Link from "next/link";
import { ArrowRight, Check, Clock, Pause, Play } from "lucide-react";
import { setPlanPausedAction } from "@/app/actions/cases";
import { toggleTaskAction } from "@/app/actions/workspace";
import { Button, Callout, PageTitle, Section } from "@/components/ui";
import { ReadinessPanel, UrgencyPill } from "@/components/workspace/bits";
import { UrgentPanel } from "@/components/workspace/UrgentPanel";
import { requireCaseAccess } from "@/lib/auth/current";
import { DISCREPANCY_DISCLAIMER, DEADLINE_DISCLAIMER } from "@/lib/domain/wording";
import { formatIsoDate } from "@/lib/domain/extract";
import { loadCaseOverview } from "@/lib/services/caseData";

export default async function ThisWeekPage({ params, searchParams }: PageProps<"/app/cases/[caseId]">) {
  const { caseId } = await params;
  const sp = await searchParams;
  const ctx = await requireCaseAccess(caseId);
  const o = await loadCaseOverview(ctx);
  const c = ctx.caseFile;
  const base = `/app/cases/${c.id}`;
  const newFlags = o.flags.filter((f) => f.status === "new");

  return (
    <>
      <PageTitle
        title="This week"
        lede={c.planPaused ? "Your plan is paused. Pick up where you left off whenever you are ready." : "A short list of what to do next. Each task takes 10 to 30 minutes."}
      />
      {sp.urgent && (
        <div className="mb-8">
          <UrgentPanel />
        </div>
      )}
      <div className="grid gap-8 xl:grid-cols-[1fr_22rem]">
        <div>
          <Section
            title={`Your plan for ${o.weekKey.replace("-W", ", week ")}`}
            id="plan-h"
            aside={
              <form action={setPlanPausedAction}>
                <input type="hidden" name="caseId" value={c.id} />
                <input type="hidden" name="paused" value={c.planPaused ? "false" : "true"} />
                <Button type="submit" variant="quiet" size="sm">
                  {c.planPaused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
                  {c.planPaused ? "Resume my plan" : "Pause my plan"}
                </Button>
              </form>
            }
          >
            {c.planPaused ? (
              <Callout tone="neutral">Taking a break is fine. Your file is safe, and your deadlines below still show.</Callout>
            ) : (
              <ol className="space-y-3">
                {o.tasks.map((t) => {
                  const done = o.doneKeys.has(t.key);
                  return (
                    <li key={t.key} className="flex gap-4 rounded-lg border border-line bg-surface p-4 shadow-card">
                      <form action={toggleTaskAction} className="pt-0.5">
                        <input type="hidden" name="caseId" value={c.id} />
                        <input type="hidden" name="weekKey" value={o.weekKey} />
                        <input type="hidden" name="taskKey" value={t.key} />
                        <input type="hidden" name="done" value={done ? "false" : "true"} />
                        <button
                          type="submit"
                          className={`flex size-6 items-center justify-center rounded border-2 ${done ? "border-moss-ink bg-moss-ink text-white" : "border-line-strong bg-surface hover:border-spruce"}`}
                          aria-label={done ? `Mark "${t.title}" as not done` : `Mark "${t.title}" as done`}
                        >
                          {done && <Check aria-hidden className="size-4" strokeWidth={3} />}
                        </button>
                      </form>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold ${done ? "text-ink-3 line-through decoration-1" : "text-ink"}`}>{t.title}</p>
                        <p className="mt-0.5 text-sm text-ink-2">{t.why}</p>
                        <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                          <span className="inline-flex items-center gap-1 text-ink-3">
                            <Clock aria-hidden className="size-3.5" /> About {t.minutes} minutes
                          </span>
                          <Link href={t.href} className="inline-flex items-center gap-1 font-semibold text-spruce hover:underline">
                            Start <ArrowRight aria-hidden className="size-3.5" />
                          </Link>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>

          <Section title="Coming up" id="deadlines-h" aside={<Link href={`${base}/deadlines`} className="text-sm font-semibold text-spruce underline">All deadlines</Link>}>
            {o.warnings.length === 0 ? (
              <p className="text-ink-2">Nothing in the next 14 days.</p>
            ) : (
              <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
                {o.warnings.map((w) => (
                  <li key={w.deadline.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <UrgencyPill level={w.level} />
                    <span className="font-semibold">{w.deadline.title}</span>
                    <span className="tabular ml-auto text-sm text-ink-2">{formatIsoDate(w.deadline.date)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-sm text-ink-3">{DEADLINE_DISCLAIMER}</p>
          </Section>

          <Section title="New flags to review" id="flags-h" aside={<Link href={`${base}/flags`} className="text-sm font-semibold text-spruce underline">All flags</Link>}>
            {newFlags.length === 0 ? (
              <p className="text-ink-2">No new flags. Nice work.</p>
            ) : (
              <ul className="space-y-2">
                {newFlags.slice(0, 3).map((f) => (
                  <li key={f.id}>
                    <Link href={`${base}/flags#${f.id}`} className="block rounded-lg border border-ochre-line bg-ochre-tint px-4 py-3 text-ochre-ink hover:underline">
                      {f.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-sm text-ink-3">{DISCREPANCY_DISCLAIMER}</p>
          </Section>
        </div>
        <div className="space-y-6">
          <ReadinessPanel readiness={o.readiness} />
          <div className="rounded-lg border border-line bg-surface p-5 text-sm">
            <p className="font-bold">At a glance</p>
            <dl className="mt-3 grid grid-cols-2 gap-y-2">
              <dt className="text-ink-3">Documents</dt>
              <dd className="tabular text-right font-semibold">{o.documents.length}</dd>
              <dt className="text-ink-3">Timeline events</dt>
              <dd className="tabular text-right font-semibold">{o.events.length}</dd>
              <dt className="text-ink-3">Open questions</dt>
              <dd className="tabular text-right font-semibold">{o.questions.filter((q) => q.status === "open").length}</dd>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
