import Link from "next/link";
import { deleteAccountAction } from "@/app/actions/cases";
import { Button, Callout, Field, Input, PageTitle, Section } from "@/components/ui";
import { requireUser } from "@/lib/auth/current";
import { getConfig } from "@/lib/config";
import { getData } from "@/lib/data";

export default async function AccountPage({ searchParams }: PageProps<"/app/account">) {
  const user = await requireUser();
  const sp = await searchParams;
  const { repo } = await getData();
  const cases = await repo.listCasesForUser(user.id);
  const local = getConfig().DATA_BACKEND === "local";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageTitle title="Account, data and deletion" />
      <Section title="Profile" id="p-h">
        <dl className="grid grid-cols-[8rem_1fr] gap-y-1.5 rounded-lg border border-line bg-surface p-5">
          <dt className="text-ink-3">Name</dt>
          <dd>{user.displayName}</dd>
          <dt className="text-ink-3">Email</dt>
          <dd>{user.isDemo ? "Demo account (no email)" : user.email}</dd>
          <dt className="text-ink-3">Since</dt>
          <dd>{user.createdAt.slice(0, 10)}</dd>
        </dl>
      </Section>
      <Section title="Sign-in security" id="s-h">
        <p className="text-ink-2">
          {local
            ? "This demo build uses email and password only. Two-step sign-in (MFA) will be offered at sign-up once Supabase Auth is switched on."
            : "Two-step sign-in (MFA) settings are managed through Supabase Auth."}
        </p>
      </Section>
      <Section title="Export your data" id="e-h">
        {cases.length === 0 ? (
          <p className="text-ink-2">You have no cases.</p>
        ) : (
          <ul className="space-y-1.5">
            {cases.map((c) => (
              <li key={c.id}>
                <a href={`/api/cases/${c.id}/export`} className="text-spruce underline">
                  Download {c.nickname} (.zip)
                </a>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section title="Delete your account" id="d-h">
        <div className="rounded-lg border-2 border-[#eab9ae] bg-surface p-5">
          <p>
            This permanently deletes your account and every case you own, with all files and everything made from them. Activity log entries keep only record ids, never
            content. This cannot be undone.
          </p>
          {sp.delete === "confirm" && (
            <Callout tone="danger" role="alert" className="mt-3">
              Type DELETE to confirm.
            </Callout>
          )}
          <form action={deleteAccountAction} className="mt-4 flex flex-wrap items-end gap-3">
            <div className="w-56">
              <Field label="Type DELETE to confirm" htmlFor="confirm">
                <Input id="confirm" name="confirm" autoComplete="off" required />
              </Field>
            </div>
            <div className="pb-4">
              <Button type="submit" variant="danger">
                Delete my account
              </Button>
            </div>
          </form>
        </div>
      </Section>
      <p className="text-sm">
        <Link href="/legal/privacy" className="text-spruce underline">
          Privacy policy (draft)
        </Link>
      </p>
    </div>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
