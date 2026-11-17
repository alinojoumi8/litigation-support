import type { Metadata } from "next";
import { MarketingHeader, Prose } from "@/components/site/content";
import { ButtonLink, Callout } from "@/components/ui";

export const metadata: Metadata = { title: "With a lawyer" };

const ROWS = [
  { when: "You get a dump of documents or disclosure", then: "Sort, summarize and date everything, so you can see the story instead of drowning in it." },
  { when: "You meet your lawyer", then: "Hand over a chronology, a document index and your questions, each linked to the source page." },
  { when: "You notice something odd: a date, an amount, a signature", then: "Record it with the source pages, so you can raise it properly and it does not get lost." },
  { when: "You wonder about hiring an expert", then: "Know what to ask and what they need, before you pay for their time." },
  { when: "You are waiting on your lawyer", then: "See what is done and what is next, and stay in control without chasing." },
];

export default function WithALawyerPage() {
  return (
    <>
      <MarketingHeader
        title="Give your lawyer a file they can use on day one."
        lede="A timeline, a document index and your questions, each linked to the source. Your lawyer gives the advice; you make sure the facts are in order."
      >
        <ButtonLink href="/sign-up">Start your case file, free</ButtonLink>
      </MarketingHeader>
      <Prose>
        <h2 className="font-display text-[2rem]">Where it helps</h2>
        <dl className="mt-4 max-w-4xl divide-y divide-line border-y border-line">
          {ROWS.map((r) => (
            <div key={r.when} className="grid gap-2 py-5 md:grid-cols-2 md:gap-8">
              <dt className="font-semibold text-ink">{r.when}</dt>
              <dd className="text-ink-2">{r.then}</dd>
            </div>
          ))}
        </dl>
        <section className="mt-14 max-w-3xl">
          <h2 className="font-display text-[2rem]">Respect for your lawyer&apos;s role</h2>
          <p className="mt-3 text-ink-2">
            The brief is your organized file, not a legal argument. It never tells your lawyer what to do. It uses a standard layout, so it is quick to read, and every
            AI-assisted part is marked.
          </p>
          <Callout tone="caution" className="mt-6" title="Before you upload letters or emails from your lawyer">
            Sharing privileged communications with any outside service may affect that protection. Ask your lawyer first. Documents marked &quot;From my lawyer&quot;
            get a privilege warning before any export.
          </Callout>
        </section>
      </Prose>
    </>
  );
}
