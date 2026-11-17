import Link from "next/link";
import { FOOTER_DISCLAIMER } from "@/lib/brand";
import { Wordmark } from "@/components/site/Wordmark";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  { title: "Product", links: [["/how-it-works", "How it works"], ["/features", "Features"], ["/pricing", "Pricing"], ["/safety", "Safety and trust"], ["/security", "Security"]] },
  { title: "Who it's for", links: [["/with-a-lawyer", "With a lawyer"], ["/representing-yourself", "Representing yourself"], ["/for-lawyers", "For lawyers"]] },
  { title: "Learn", links: [["/learn", "Guides"], ["/learn/case-readiness-checklist", "Readiness checklist"], ["/get-help", "Get help now"]] },
  { title: "Company", links: [["/about", "About"], ["/contact", "Contact"], ["/faq", "FAQ"]] },
  { title: "Legal", links: [["/legal/terms", "Terms"], ["/legal/privacy", "Privacy"], ["/legal/disclaimer", "Disclaimer"], ["/legal/ai-use", "AI use policy"], ["/accessibility", "Accessibility"]] },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-sunken/60">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <div className="sm:col-span-3 lg:col-span-1">
            <Wordmark />
            <p className="mt-3 text-sm text-ink-3">Case preparation for Ontario.</p>
          </div>
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="mb-2 text-sm font-bold text-ink">{c.title}</h2>
              <ul className="space-y-1.5 text-sm">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-ink-2 hover:text-spruce hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-10 max-w-3xl border-t border-line pt-6 text-sm text-ink-2">{FOOTER_DISCLAIMER}</p>
        <p className="mt-2 text-sm text-ink-3">
          In an emergency, call 911. For urgent legal help, see{" "}
          <Link href="/get-help" className="text-spruce underline">
            Get help now
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
