import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderOpen, Plus } from "lucide-react";
import { addSampleCaseAction } from "@/app/actions/cases";
import { Button, ButtonLink, Callout, PageTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth/current";
import { getData } from "@/lib/data";
import { CASE_KIND_LABELS } from "@/lib/domain/origin";

export default async function CasesPage({ searchParams }: PageProps<"/app">) {
  const user = await requireUser();
  const sp = await searchParams;
  const { repo } = await getData();
  const cases = await repo.listCasesForUser(user.id);
  if (cases.length === 0 && !sp.deleted) redirect("/app/onboarding");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageTitle
        title="Your cases"
        actions={
          <>
            <ButtonLink href="/app/onboarding" variant="primary">
              <Plus aria-hidden className="size-4" /> New case
            </ButtonLink>
            <form action={addSampleCaseAction}>
              <Button type="submit" variant="secondary">
                Add the fictional sample case
              </Button>
            </form>
          </>
        }
      />
      {sp.deleted && (
        <Callout tone="success" role="status" className="mb-6" title="Case deleted">
          The case, its files and everything made from them have been removed.
        </Callout>
      )}
      {cases.length === 0 ? (
        <p className="text-ink-2">You have no cases yet.</p>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {cases.map((c) => (
            <li key={c.id}>
              <Link href={`/app/cases/${c.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-paper">
                <FolderOpen aria-hidden className="size-5 text-spruce" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">{c.nickname}</span>
                  <span className="block text-sm text-ink-3">
                    {CASE_KIND_LABELS[c.kind]} · {c.audience === "with_lawyer" ? "With a lawyer" : "Representing myself"}
                  </span>
                </span>
                {c.isSample && <span className="rounded-full border border-dashed border-line-strong px-2 py-0.5 text-xs font-semibold text-ink-3">Sample</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
