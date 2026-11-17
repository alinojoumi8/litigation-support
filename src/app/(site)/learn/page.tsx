import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader, Prose } from "@/components/site/content";
import { GUIDES } from "@/lib/content/guides";

export const metadata: Metadata = { title: "Guides" };

export default function LearnPage() {
  const published = GUIDES.filter((g) => g.status === "published");
  const soon = GUIDES.filter((g) => g.status === "coming_soon");
  return (
    <>
      <MarketingHeader
        title="Guides"
        lede="Plain-language guides on preparing your case. General information only: it may not fit your situation."
      />
      <Prose>
        <section aria-labelledby="ready">
          <h2 id="ready" className="sr-only">
            Ready to read
          </h2>
          <ul className="max-w-4xl divide-y divide-line border-y border-line">
            {published.map((g) => (
              <li key={g.slug} className="py-6">
                <Link href={`/learn/${g.slug}`} className="group block">
                  <h3 className="font-display text-[1.55rem] leading-snug text-ink group-hover:text-spruce group-hover:underline">{g.title}</h3>
                  <p className="mt-1.5 text-ink-2">{g.summary}</p>
                  <p className="mt-1.5 text-sm text-ink-3">{g.minutes} minute read</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="soon" className="mt-14 max-w-4xl">
          <h2 id="soon" className="font-display text-[1.8rem]">
            Coming soon
          </h2>
          <p className="mt-2 text-ink-2">
            These guides explain legal process. We will publish each one after an Ontario lawyer has reviewed it, with the reviewer and the date shown on the page.
          </p>
          <ul className="mt-5 space-y-4">
            {soon.map((g) => (
              <li key={g.slug} className="rounded-lg border border-dashed border-line-strong px-5 py-4">
                <p className="font-semibold text-ink">{g.title}</p>
                <p className="mt-1 text-sm text-ink-2">{g.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      </Prose>
    </>
  );
}
