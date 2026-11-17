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
      <header className="no-print z-30 border-b border-line bg-surface lg:sticky lg:top-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:gap-x-4">
          <Link href="/app" className="rounded-sm" aria-label="Your cases">
            <Wordmark />
          </Link>
          <p className="order-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-[0.8rem] font-semibold text-ink-2 sm:order-none">
            <Scale aria-hidden className="size-3.5" />
            {APP_BADGE}
          </p>
          <nav aria-label="Help" className="order-4 flex items-center gap-1 text-sm sm:order-none sm:ml-auto">
            <Link href="/get-help" className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 font-semibold text-ink-2 hover:bg-sunken hover:text-ink">
              <LifeBuoy aria-hidden className="size-4" /> <span className="sm:hidden">Get help</span>
              <span className="hidden sm:inline">Find a lawyer or legal help</span>
            </Link>
          </nav>
          <div className="order-2 ml-auto sm:order-none sm:ml-0">
            <Suspense fallback={<span className="block h-9 w-24 rounded-md bg-sunken" aria-hidden />}>
              <AccountMenu />
            </Suspense>
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
    </div>
  );
}
