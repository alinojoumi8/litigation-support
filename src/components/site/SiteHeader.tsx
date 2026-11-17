import Link from "next/link";
import { Menu } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/brand";
import { buttonClass } from "@/components/ui";
import { Wordmark } from "@/components/site/Wordmark";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/with-a-lawyer", label: "With a lawyer" },
  { href: "/representing-yourself", label: "Representing yourself" },
  { href: "/for-lawyers", label: "For lawyers" },
  { href: "/learn", label: "Learn" },
  { href: "/pricing", label: "Pricing" },
  { href: "/safety", label: "Safety" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper/95">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-5 sm:py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-sm sm:mr-2" aria-label={`${PRODUCT_NAME} home`}>
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 xl:block">
          <ul className="flex items-center gap-1 text-[0.95rem]">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="whitespace-nowrap rounded-md px-2.5 py-2 text-ink-2 hover:bg-sunken hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link href="/sign-in" className="whitespace-nowrap rounded-md px-2 py-2 text-[0.95rem] font-semibold text-ink hover:bg-sunken sm:px-2.5">
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonClass("primary", "sm", "min-h-10 whitespace-nowrap px-3 sm:px-3.5")}>
            Start free
          </Link>
          <details className="group relative xl:hidden">
            <summary className="flex min-h-10 min-w-10 cursor-pointer list-none items-center justify-center gap-1.5 rounded-md border border-line-strong px-2.5 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              <Menu aria-hidden className="size-4" /> <span className="sr-only sm:not-sr-only">Menu</span>
            </summary>
            <nav aria-label="Main (mobile)" className="absolute right-0 z-40 mt-2 w-64 rounded-lg border border-line bg-surface p-2 shadow-lift">
              <ul>
                {NAV.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="block rounded-md px-3 py-2.5 text-ink hover:bg-sunken">
                      {n.label}
                    </Link>
                  </li>
                ))}
                <li className="mt-1 border-t border-line pt-1">
                  <Link href="/get-help" className="block rounded-md px-3 py-2.5 font-semibold text-spruce hover:bg-sunken">
                    Get help now
                  </Link>
                </li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
