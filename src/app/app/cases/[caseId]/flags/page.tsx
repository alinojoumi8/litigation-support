import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { rerunFlagsAction, setFlagStatusAction } from "@/app/actions/workspace";
import { Button, Callout, EmptyState, PageTitle, Pill, SourceChip, cx } from "@/components/ui";
import { FlagStatusPill } from "@/components/workspace/bits";
import { requireCaseAccess } from "@/lib/auth/current";
import { FLAG_KIND_LABELS, FLAG_STATUS_LABELS } from "@/lib/domain/discrepancies";
import type { FlagStatus } from "@/lib/domain/types";
import { DISCREPANCY_DISCLAIMER } from "@/lib/domain/wording";

const ORDER: FlagStatus[] = ["new", "matters", "ask_lawyer", "not_an_issue"];

export default async function FlagsPage({ params, searchParams }: PageProps<"/app/cases/[caseId]/flags">) {
  const { caseId } = await params;
  const sp = await searchParams;
  const ctx = await requireCaseAccess(caseId);
  const [flags, docs] = await Promise.all([ctx.repo.list("flags", ctx.caseFile.id), ctx.repo.list("documents", ctx.caseFile.id)]);
  const byId = new Map(docs.map((d) => [d.id, d]));
  const show = typeof sp.status === "string" && (ORDER as string[]).includes(sp.status) ? (sp.status as FlagStatus) : null;
  const list = flags
    .filter((f) => !show || f.status === show)
    .sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status) || a.title.localeCompare(b.title));
  const base = `/app/cases/${ctx.caseFile.id}`;
  const canWrite = ctx.membership.role !== "viewer";

  return (
    <>
      <PageTitle
        title="Flags"
        lede="Places where your documents may not line up. You review each one and decide what matters."
        actions={
          canWrite ? (
            <form action={rerunFlagsAction}>
              <input type="hidden" name="caseId" value={ctx.caseFile.id} />
              <Button type="submit" variant="secondary" size="sm">
                <RefreshCw aria-hidden className="size-4" /> Check again
              </Button>
            </form>
          ) : undefined
        }
      />
      <Callout tone="flag" className="mb-6">
        {DISCREPANCY_DISCLAIMER} Flags show both sources side by side. They are questions, not findings.
      </Callout>
      <nav aria-label="Filter flags by status" className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link href={`${base}/flags`} aria-current={!show ? "page" : undefined} className={cx("rounded-full border px-3 py-1.5 font-semibold", !show ? "border-spruce bg-spruce-tint text-spruce-deep" : "border-line bg-surface text-ink-2")}>
          All ({flags.length})
        </Link>
        {ORDER.map((s) => (
          <Link
            key={s}
            href={`${base}/flags?status=${s}`}
            aria-current={show === s ? "page" : undefined}
            className={cx("rounded-full border px-3 py-1.5 font-semibold", show === s ? "border-spruce bg-spruce-tint text-spruce-deep" : "border-line bg-surface text-ink-2")}
          >
            {FLAG_STATUS_LABELS[s]} ({flags.filter((f) => f.status === s).length})
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <EmptyState title={flags.length === 0 ? "No flags" : "Nothing with this status"}>
          {flags.length === 0 ? "When documents give different dates, amounts or names for the same thing, a flag appears here." : "Choose another status above."}
        </EmptyState>
      ) : (
        <ul className="space-y-5">
          {list.map((f) => (
            <li key={f.id} id={f.id} className="scroll-mt-24">
              <article aria-labelledby={`${f.id}-t`} className={cx("rounded-lg border bg-surface p-5 shadow-card", f.status === "new" ? "border-ochre-line" : "border-line")}>
                <div className="flex flex-wrap items-center gap-2">
                  <FlagStatusPill status={f.status} />
                  <Pill tone="neutral">{FLAG_KIND_LABELS[f.kind]}</Pill>
                  {f.createdBy === "ai" && <Pill tone="neutral">AI suggestion</Pill>}
                </div>
                <h2 id={`${f.id}-t`} className="mt-2 text-lg font-bold">
                  {f.title}
                </h2>
                <p className="mt-1 text-ink-2">{f.detail}</p>
                <div className={cx("mt-4 grid gap-3", f.sources.length > 1 && "md:grid-cols-2")}>
                  {f.sources.map((s, i) => {
                    const d = byId.get(s.docId);
                    return (
                      <figure key={i} className="rounded-md border border-line bg-paper p-3">
                        <figcaption className="mb-1.5 flex flex-wrap items-center gap-2 text-sm">
                          {d ? <SourceChip caseId={ctx.caseFile.id} docId={d.id} seq={d.seq} page={s.page} title={d.title} /> : <span>Deleted document</span>}
                          <span className="truncate text-ink-3">{d?.title}</span>
                        </figcaption>
                        <blockquote className="text-[0.95rem] leading-relaxed text-ink">{s.excerpt}</blockquote>
                      </figure>
                    );
                  })}
                </div>
                {canWrite && (
                  <form action={setFlagStatusAction} className="mt-4 border-t border-line pt-4">
                    <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                    <input type="hidden" name="flagId" value={f.id} />
                    <label htmlFor={`${f.id}-note`} className="mb-1 block text-sm font-semibold">
                      Your note <span className="font-normal text-ink-3">(optional)</span>
                    </label>
                    <textarea
                      id={`${f.id}-note`}
                      name="userNote"
                      defaultValue={f.userNote}
                      maxLength={1000}
                      rows={2}
                      className="block w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-[0.95rem]"
                    />
                    <label className="mt-2 flex items-center gap-2 text-sm">
                      <input type="checkbox" name="addQuestion" className="size-4 accent-spruce" /> If I choose &quot;Ask lawyer&quot;, add this to my questions
                    </label>
                    <fieldset className="mt-3">
                      <legend className="mb-1.5 text-sm font-semibold">Mark as</legend>
                      <div className="flex flex-wrap gap-2">
                        {ORDER.map((s) => (
                          <Button key={s} type="submit" name="status" value={s} size="sm" variant={f.status === s ? "primary" : "secondary"} aria-pressed={f.status === s}>
                            {FLAG_STATUS_LABELS[s]}
                          </Button>
                        ))}
                      </div>
                    </fieldset>
                  </form>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
