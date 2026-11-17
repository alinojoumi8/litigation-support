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
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3.5">
        <Link href="/" className="mr-2 flex items-center gap-2 rounded-sm" aria-label={`${PRODUCT_NAME} home`}>
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
        <div className="ml-auto flex items-center gap-2">
          <Link href="/sign-in" className="whitespace-nowrap rounded-md px-2.5 py-2 text-[0.95rem] font-semibold text-ink hover:bg-sunken">
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonClass("primary", "sm", "min-h-10 px-3.5")}>
            Start free
          </Link>
          <details className="group relative xl:hidden">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              <Menu aria-hidden className="size-4" /> Menu
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
