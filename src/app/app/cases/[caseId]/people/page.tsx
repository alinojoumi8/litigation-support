import Link from "next/link";
import { EmptyState, PageTitle, SourceChip } from "@/components/ui";
import { requireCaseAccess } from "@/lib/auth/current";

/** People named in summaries and timeline events, with where each one appears. */
export default async function PeoplePage({ params }: PageProps<"/app/cases/[caseId]/people">) {
  const { caseId } = await params;
  const ctx = await requireCaseAccess(caseId);
  const [summaries, events, docs] = await Promise.all([ctx.repo.list("summaries", ctx.caseFile.id), ctx.repo.list("events", ctx.caseFile.id), ctx.repo.list("documents", ctx.caseFile.id)]);
  const byId = new Map(docs.map((d) => [d.id, d]));
  const people = new Map<string, { docs: Set<string>; events: number }>();
  for (const s of summaries) for (const p of s.people) {
    const e = people.get(p) ?? { docs: new Set<string>(), events: 0 };
    e.docs.add(s.docId);
    people.set(p, e);
  }
  for (const ev of events) for (const p of ev.people) {
    const e = people.get(p) ?? { docs: new Set<string>(), events: 0 };
    e.events++;
    if (ev.sourceDocId) e.docs.add(ev.sourceDocId);
    people.set(p, e);
  }
  const list = [...people.entries()].sort((a, b) => b[1].docs.size - a[1].docs.size || a[0].localeCompare(b[0]));
  const base = `/app/cases/${ctx.caseFile.id}`;

  return (
    <>
      <PageTitle title="People" lede="Names found in your documents, and where each one appears. Spelling differences between documents show up as flags." />
      {list.length === 0 ? (
        <EmptyState title="No names found yet">Names appear here as documents are summarized.</EmptyState>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {list.map(([name, info]) => (
            <li key={name} className="px-5 py-4">
              <p className="font-semibold">{name}</p>
              <p className="mt-0.5 text-sm text-ink-3">
                In {info.docs.size} document{info.docs.size === 1 ? "" : "s"} ·{" "}
                <Link href={`${base}/timeline?person=${encodeURIComponent(name)}`} className="text-spruce underline">
                  {info.events} timeline event{info.events === 1 ? "" : "s"}
                </Link>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[...info.docs]
                  .map((id) => byId.get(id))
                  .filter((d): d is NonNullable<typeof d> => Boolean(d))
                  .sort((a, b) => a.seq - b.seq)
                  .map((d) => (
                    <SourceChip key={d.id} caseId={ctx.caseFile.id} docId={d.id} seq={d.seq} title={d.title} />
                  ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
