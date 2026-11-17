import type { Metadata } from "next";
import { MarketingHeader, Prose } from "@/components/site/content";
import { ButtonLink, Callout } from "@/components/ui";

export const metadata: Metadata = { title: "How it works" };

const STEPS = [
  {
    title: "Upload",
    does: [
      "Add PDFs, saved emails (.eml), photos, text files and bank statements (CSV).",
      "Tell us where each document came from: you, the other side, your lawyer, the court, or a public source. This label controls how the document can be shared later.",
      "Each document gets a stable source number, like Doc 0007, and every page is numbered.",
    ],
    doesnt: "We never share your documents with anyone you have not invited.",
  },
  {
    title: "Organize",
    does: [
      "Get a plain-language summary of each document with key facts: who, what, when and how much.",
      "Dated events go into one master timeline. Each entry links to the page it came from.",
      "Entries start as unconfirmed drafts. You open the source, check it, and confirm.",
    ],
    doesnt: "Summaries describe what a document says. They never say what it proves.",
  },
  {
    title: "Check",
    does: [
      "Flags show possible inconsistencies across documents: different dates for the same payment, different amounts for the same invoice, names spelled two ways, missing attachments, two versions of the same document.",
      "Put two signatures side by side, zoom, overlay and note visible differences for an examiner.",
      "Import a bank statement to see patterns worth asking an accountant about.",
    ],
    doesnt: "A flag is a question, not a finding. Only a qualified expert can give an opinion on a signature or the accounts.",
  },
  {
    title: "Prepare",
    does: [
      "Export a lawyer-ready brief: index, chronology, key documents, open questions, flags you marked as mattering, and an AI-use statement.",
      "Build an expert prep package with neutral background and questions.",
      "Follow 3 to 5 short tasks each week, keep every deadline in view, and work through a court checklist.",
    ],
    doesnt: "We don't tell you what to file, say or decide.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <MarketingHeader title="How it works" lede="Four steps that turn a pile of documents into a file your lawyer, an expert or the court can follow." />
      <Prose>
        <ol className="space-y-6">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid gap-6 border-t border-line pt-8 lg:grid-cols-[14rem_1fr]">
              <div>
                <p className="tabular text-sm font-bold text-ink-3">Step {i + 1}</p>
                <h2 className="font-display text-[2rem]">{s.title}</h2>
              </div>
              <div className="max-w-2xl">
                <ul className="space-y-2.5 text-[1.05rem] text-ink">
                  {s.does.map((d) => (
                    <li key={d} className="flex gap-3">
                      <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-spruce" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-l-2 border-line-strong pl-4 text-ink-2">{s.doesnt}</p>
              </div>
            </li>
          ))}
        </ol>
        <Callout tone="info" className="mt-12 max-w-3xl" title="Try it with a fictional sample case">
          The workspace comes with a clearly labelled sample case, so you can see every feature before you upload anything of your own.
        </Callout>
        <div className="mt-8">
          <ButtonLink href="/sign-up">Start your case file, free</ButtonLink>
        </div>
      </Prose>
    </>
  );
}
