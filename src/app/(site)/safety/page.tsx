import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader, Prose } from "@/components/site/content";
import { REFUSAL_COPY } from "@/lib/brand";
import { DISCREPANCY_DISCLAIMER, MONEY_DISCLAIMER, READINESS_CAPTION, SIGNATURE_DISCLAIMER } from "@/lib/domain/wording";

export const metadata: Metadata = { title: "Safety and trust" };

const DO = [
  "Organize your documents, summarize them and put events in order.",
  "Point out possible inconsistencies, with both sources side by side.",
  "Explain general court process, with links to official sources.",
  "Help you write questions for a lawyer or an expert.",
];
const DONT = [
  "Give legal advice, or tell you what to file, say or decide.",
  "Predict how your case will go or score your chances.",
  "Generate case law or statute citations from AI.",
  "Say a signature is forged or genuine, or that anyone committed fraud.",
  "Give match percentages or confidence scores for signatures.",
  "Sell your data, show ads, or use your documents to train AI.",
];

export default function SafetyPage() {
  return (
    <>
      <MarketingHeader title="Safety and trust" lede="What we do, what we will never do, and how we check AI output." />
      <Prose>
        <div className="grid max-w-5xl gap-10 md:grid-cols-2">
          <section>
            <h2 className="font-display text-[1.8rem]">What we do</h2>
            <ul className="mt-4 space-y-2.5">
              {DO.map((d) => (
                <li key={d} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-spruce" />
                  {d}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-[1.8rem]">What we will never do</h2>
            <ul className="mt-4 space-y-2.5">
              {DONT.map((d) => (
                <li key={d} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-0.5 w-2.5 shrink-0 bg-brick-ink" />
                  {d}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="prose-read mt-6">
          <h2>How AI output is checked</h2>
          <ul>
            <li>Every summary and timeline entry is labelled &quot;AI draft. Check against the source.&quot; and links to its page.</li>
            <li>A citation filter removes anything that looks like case law, a statute or a rule reference unless it is on our checked list of official sources. Removed text is replaced with &quot;verify before filing&quot;.</li>
            <li>A wording filter removes conclusions such as &quot;forged&quot;, &quot;fake&quot;, &quot;fraud&quot; or &quot;proof&quot;, and any match percentage.</li>
            <li>Quotes are kept only if they match the page word for word. Otherwise they are shown as a paraphrase.</li>
            <li>The model name and prompt version are stored with every output, and exports include an AI-use statement.</li>
          </ul>
          <h2>If you ask for advice</h2>
          <p>{REFUSAL_COPY}</p>
          <h2>The wording you will see</h2>
          <ul>
            <li>On flags: {DISCREPANCY_DISCLAIMER}</li>
            <li>On signature compare: {SIGNATURE_DISCLAIMER}</li>
            <li>On money patterns: {MONEY_DISCLAIMER}</li>
            <li>On readiness: {READINESS_CAPTION}</li>
          </ul>
          <h2>Documents with special rules</h2>
          <p>
            You label where each document came from. Documents from the other side usually can only be used for your case, so exports that include them show a
            reminder. Documents from your lawyer may be privileged, so they get a warning, and both are left out of expert packages unless you confirm.
          </p>
          <h2>Criminal cases</h2>
          <p>
            Crown disclosure comes with strict limits on sharing. Criminal cases stay closed in the workspace until an Ontario lawyer has given a written opinion
            on how disclosure should be handled.
          </p>
          <p>
            Data handling is described on the <Link href="/security">security page</Link>.
          </p>
        </div>
      </Prose>
    </>
  );
}
