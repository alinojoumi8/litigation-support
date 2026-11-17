import type { Metadata } from "next";
import { MarketingHeader, Prose } from "@/components/site/content";
import { ButtonLink } from "@/components/ui";
import { MONEY_DISCLAIMER, READINESS_CAPTION, SIGNATURE_DISCLAIMER } from "@/lib/domain/wording";

export const metadata: Metadata = { title: "Features" };

const FEATURES: { group: string; items: { name: string; what: string; guardrail: string }[] }[] = [
  {
    group: "Organize",
    items: [
      { name: "Document intake with origin labels", what: "PDFs, saved emails, photos, text and CSV. Each document gets a source number and page numbers, and a label for where it came from.", guardrail: "Documents from the other side or your lawyer get handling reminders before any export." },
      { name: "Summaries with page links", what: "A short, plain-language summary of each document, with key facts linked to the page.", guardrail: "Labelled \"AI draft. Check against the source.\" No legal characterization." },
      { name: "Master timeline", what: "Every dated event from every document in one chronology. Filter by person, document or status. Export to CSV.", guardrail: "Unconfirmed events look different and stay marked in every export." },
    ],
  },
  {
    group: "Check",
    items: [
      { name: "Discrepancy finder", what: "Possible conflicts in dates and amounts, name spelling differences, missing attachments and different versions of the same document, each shown with both sources.", guardrail: "Statuses: New, Matters, Not an issue, Ask lawyer. Wording: \"possible inconsistency\". No severity scores." },
      { name: "Signature and handwriting compare", what: "Side by side or overlaid, with zoom, pan, rotate and a grid. Pin notes on what looks different and save a note for a document examiner.", guardrail: SIGNATURE_DISCLAIMER },
      { name: "Money pattern flags", what: "Import a statement to see round amounts, repeated entries, gaps in dates, large transfers, balances that do not carry forward, and amounts near key dates.", guardrail: MONEY_DISCLAIMER },
    ],
  },
  {
    group: "Prepare",
    items: [
      { name: "Lawyer-ready brief", what: "Cover sheet, your one-page summary, chronology, document index, key people, flags you marked, open questions and an AI-use statement. Print or save as PDF.", guardrail: "Disclaimer on every page. You confirm you have reviewed it before export." },
      { name: "Expert prep package", what: "Neutral background, the documents to examine, the questions to answer, a timeline extract and chain-of-custody notes, for a document examiner or forensic accountant.", guardrail: "Documents from the other side and from your lawyer are left out unless you confirm. Experts owe a duty to the court; if you have a lawyer, the lawyer should hire the expert." },
      { name: "This week and readiness", what: "3 to 5 short tasks each week, built from what is missing in your file, and a transparent readiness checklist.", guardrail: READINESS_CAPTION },
      { name: "Deadlines", what: "Enter dates from orders, notices and letters. See warnings at 14, 7, 2 and 1 days. Add them to your calendar.", guardrail: "Confirm every deadline with the court office, the order, or your lawyer. We never calculate court deadlines." },
      { name: "Court pathways", what: "Step-by-step checklists for Ontario Small Claims Court and Superior Court civil cases, linked to official sources.", guardrail: "General information only. Human-written, dated, and marked for lawyer review." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <MarketingHeader title="Features" lede="Everything in the workspace, and the guardrail that comes with each one." />
      <Prose>
        {FEATURES.map((g) => (
          <section key={g.group} aria-labelledby={`g-${g.group}`} className="mb-14">
            <h2 id={`g-${g.group}`} className="mb-2 font-display text-[2rem]">
              {g.group}
            </h2>
            <div className="divide-y divide-line border-y border-line">
              {g.items.map((f) => (
                <div key={f.name} className="grid gap-3 py-6 md:grid-cols-[16rem_1fr_1fr] md:gap-8">
                  <h3 className="text-lg font-bold">{f.name}</h3>
                  <p className="text-ink">{f.what}</p>
                  <p className="text-[0.95rem] text-ink-2">
                    <span className="font-semibold text-ink">Guardrail: </span>
                    {f.guardrail}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
        <ButtonLink href="/sign-up">Start your case file, free</ButtonLink>
      </Prose>
    </>
  );
}
