import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth/current";

export async function AccountMenu() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/sign-in" className="text-sm font-semibold text-spruce underline">
        Sign in
      </Link>
    );
  }
  return (
    <details className="relative">
      <summary className="flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:bg-sunken [&::-webkit-details-marker]:hidden">
        <span className="max-w-40 truncate">{user.displayName || "Account"}</span>
        <ChevronDown aria-hidden className="size-4" />
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-line bg-surface p-1.5 shadow-lift">
        <p className="truncate px-3 py-2 text-xs text-ink-3">{user.isDemo ? "Demo account" : user.email}</p>
        <Link href="/app" className="block rounded-md px-3 py-2 text-sm hover:bg-sunken">
          Your cases
        </Link>
        <Link href="/app/account" className="block rounded-md px-3 py-2 text-sm hover:bg-sunken">
          Account, data and deletion
        </Link>
        <Link href="/app/billing" className="block rounded-md px-3 py-2 text-sm hover:bg-sunken">
          Billing
        </Link>
        <form action={signOutAction}>
          <button type="submit" className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-sunken">
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
