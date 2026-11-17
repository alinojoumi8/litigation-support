import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader, OfficialSources, Prose } from "@/components/site/content";
import { ButtonLink, Callout } from "@/components/ui";

export const metadata: Metadata = { title: "Representing yourself" };

const ROWS = [
  { when: "You start or receive a claim", then: "See the steps ahead in plain language, and where you are now." },
  { when: "You face a deadline", then: "Keep every date in one place, with warnings at 14, 7, 2 and 1 days." },
  { when: "You prepare your evidence", then: "Organize documents into a timeline and an index, so you can present your facts clearly." },
  { when: "You book a limited-scope consult", then: "Bring a tight brief and your questions, and get the most from one paid hour." },
  { when: "You feel stuck", then: "Get a short, doable plan for this week, and keep moving without burning out." },
];

export default function RepresentingYourselfPage() {
  return (
    <>
      <MarketingHeader
        title="Representing yourself in Ontario?"
        lede="Get organized, keep every deadline in view, and follow a clear weekly plan, in plain language with links to official sources."
      >
        <ButtonLink href="/sign-up">Start your case file, free</ButtonLink>
      </MarketingHeader>
      <Prose>
        <dl className="max-w-4xl divide-y divide-line border-y border-line">
          {ROWS.map((r) => (
            <div key={r.when} className="grid gap-2 py-5 md:grid-cols-2 md:gap-8">
              <dt className="font-semibold text-ink">{r.when}</dt>
              <dd className="text-ink-2">{r.then}</dd>
            </div>
          ))}
        </dl>
        <section className="mt-14 max-w-3xl">
          <h2 className="font-display text-[2rem]">Court checklists</h2>
          <p className="mt-3 text-ink-2">
            The workspace includes step-by-step checklists for Ontario Small Claims Court and for Superior Court civil cases. Each step says what usually happens and
            links to the official guide. They are general information: they do not tell you what to file or argue.
          </p>
          <Callout tone="info" className="mt-6" title="Help is available">
            Many people get help with just part of their case. See{" "}
            <Link href="/get-help" className="underline">
              Get help now
            </Link>{" "}
            for legal aid, duty counsel and the Law Society Referral Service.
          </Callout>
        </section>
        <OfficialSources ids={["smallclaims-guide", "smallclaims-sued", "steps-to-justice"]} />
      </Prose>
    </>
  );
}
