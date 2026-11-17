import Link from "next/link";
import { Check, MapPin } from "lucide-react";
import { setPathwayStepAction, togglePathwayItemAction } from "@/app/actions/workspace";
import { Button, Callout, ExternalLink, PageTitle, Pill, cx } from "@/components/ui";
import { requireCaseAccess } from "@/lib/auth/current";
import { GUIDE_BOX, OFFICIAL_LINK_NOTE } from "@/lib/brand";
import { GUIDES } from "@/lib/content/guides";
import { pathwaysForCase } from "@/lib/content/pathways";
import { authorityById } from "@/lib/domain/authorities";
import { formatIsoDate } from "@/lib/domain/extract";

export default async function CaseGuidesPage({ params }: PageProps<"/app/cases/[caseId]/guides">) {
  const { caseId } = await params;
  const ctx = await requireCaseAccess(caseId);
  const pathways = pathwaysForCase(ctx.caseFile.kind);
  const progress = await ctx.repo.list("pathwayProgress", ctx.caseFile.id);
  const canWrite = ctx.membership.role !== "viewer";
  const criminalLocked = ctx.caseFile.kind === "criminal" && !ctx.caseFile.criminalAckAt;

  return (
    <>
      <PageTitle title="Guides and checklists" lede="The usual steps for your court, with checklists and official sources. General information only." />
      {pathways.map((p) => {
        const prog = progress.find((x) => x.pathwayId === p.id);
        const checked = new Set(prog?.checked ?? []);
        const here = prog?.currentStep ?? p.steps[0].id;
        const total = p.steps.reduce((n, s) => n + s.checklist.length, 0);
        return (
          <section key={p.id} aria-labelledby={`pw-${p.id}`} className="mb-12">
            <div className="mb-4">
              <h2 id={`pw-${p.id}`} className="font-display text-[1.7rem]">
                {p.title}
              </h2>
              <p className="text-sm text-ink-3">{p.court}</p>
            </div>
            <Callout tone="info" className="mb-5">
              {GUIDE_BOX} Last checked: {formatIsoDate(p.lastChecked)}. {p.reviewStatus}
            </Callout>
            {p.gated && criminalLocked ? (
              <Callout tone="neutral" title="Closed until criminal mode opens">
                See Get help now for legal aid and duty counsel.
              </Callout>
            ) : (
              <>
                <p className="mb-4 text-sm font-semibold text-ink-2">
                  {checked.size} of {total} checklist items done
                </p>
                <ol className="space-y-4">
                  {p.steps.map((s, i) => {
                    const isHere = s.id === here;
                    return (
                      <li key={s.id} className={cx("rounded-lg border bg-surface p-5", isHere ? "border-spruce shadow-card" : "border-line")}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="tabular text-sm font-bold text-ink-3">Step {i + 1}</span>
                          {isHere && (
                            <Pill tone="success" icon={<MapPin aria-hidden className="size-3.5" />}>
                              You are here
                            </Pill>
                          )}
                        </div>
                        <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
                        <div className="mt-2 max-w-[68ch] space-y-2 text-[0.97rem] text-ink-2">
                          {s.body.map((b, j) => (
                            <p key={j}>{b}</p>
                          ))}
                        </div>
                        <ul className="mt-4 space-y-2">
                          {s.checklist.map((item) => {
                            const done = checked.has(item.id);
                            return (
                              <li key={item.id}>
                                <form action={togglePathwayItemAction} className="flex items-start gap-3">
                                  <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                                  <input type="hidden" name="pathwayId" value={p.id} />
                                  <input type="hidden" name="itemId" value={item.id} />
                                  <input type="hidden" name="done" value={done ? "false" : "true"} />
                                  <button
                                    type="submit"
                                    disabled={!canWrite}
                                    role="checkbox"
                                    aria-checked={done}
                                    aria-label={item.text}
                                    className={cx("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2 text-white", done ? "border-moss-ink bg-moss-ink" : "border-line-strong bg-surface hover:border-spruce")}
                                  >
                                    {done && <Check aria-hidden className="size-3.5" strokeWidth={3} />}
                                  </button>
                                  <span className={done ? "text-ink-3 line-through decoration-1" : "text-ink"}>{item.text}</span>
                                </form>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-sm">
                          <span className="text-ink-3">{OFFICIAL_LINK_NOTE}</span>
                          {s.sources.map((id) => {
                            const a = authorityById(id);
                            return (
                              <ExternalLink key={id} href={a.url}>
                                {a.title}
                              </ExternalLink>
                            );
                          })}
                        </div>
                        {canWrite && !isHere && (
                          <form action={setPathwayStepAction} className="mt-3">
                            <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                            <input type="hidden" name="pathwayId" value={p.id} />
                            <input type="hidden" name="stepId" value={s.id} />
                            <Button type="submit" variant="quiet" size="sm">
                              I am at this step
                            </Button>
                          </form>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </section>
        );
      })}
      <section aria-labelledby="g-h" className="mt-6">
        <h2 id="g-h" className="text-lg font-bold">
          Guides
        </h2>
        <ul className="mt-2 space-y-1.5">
          {GUIDES.filter((g) => g.status === "published").map((g) => (
            <li key={g.slug}>
              <Link href={`/learn/${g.slug}`} className="text-spruce underline">
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
