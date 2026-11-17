import Link from "next/link";
import { Suspense } from "react";
import { LifeBuoy, Scale } from "lucide-react";
import { Wordmark } from "@/components/site/Wordmark";
import { AccountMenu } from "@/components/workspace/AccountMenu";
import { APP_BADGE } from "@/lib/brand";

// Workspace routes read the session on every request.
export const instant = false;

export default function WorkspaceLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="no-print sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-[2px]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
          <Link href="/app" className="rounded-sm" aria-label="Your cases">
            <Wordmark />
          </Link>
          <p className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-[0.8rem] font-semibold text-ink-2">
            <Scale aria-hidden className="size-3.5" />
            {APP_BADGE}
          </p>
          <nav aria-label="Help" className="ml-auto flex items-center gap-1 text-sm">
            <Link href="/get-help" className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 font-semibold text-ink-2 hover:bg-sunken hover:text-ink">
              <LifeBuoy aria-hidden className="size-4" /> Find a lawyer or legal help
            </Link>
          </nav>
          <Suspense fallback={<span className="h-9 w-24 rounded-md bg-sunken" aria-hidden />}>
            <AccountMenu />
          </Suspense>
        </div>
      </header>
      <main id="main">{children}</main>
    </div>
  );
}
