/**
 * Guided pathways for self-represented people (site plan 5.1 item 9).
 * Human-written, static, general information only. DRAFT: every pathway
 * needs Ontario lawyer review before public launch (register item 8).
 *
 * Facts marked "checked" were compared with the official ontario.ca guides
 * on 2026-11-17. Everything else points the reader to the official source.
 */
import type { CaseKind } from "../domain/types";

export interface PathwayItem {
  id: string;
  text: string;
}

export interface PathwayStep {
  id: string;
  title: string;
  body: string[];
  checklist: PathwayItem[];
  sources: string[]; // authority ids
}

export interface Pathway {
  id: string;
  title: string;
  court: string;
  forKinds: CaseKind[];
  lastChecked: string;
  reviewStatus: string;
  steps: PathwayStep[];
  gated?: boolean;
}

const REVIEW = "Draft. Not yet reviewed by an Ontario lawyer.";

export const PATHWAYS: Pathway[] = [
  {
    id: "small-claims",
    title: "Ontario Small Claims Court",
    court: "Small Claims Court (part of the Superior Court of Justice)",
    forKinds: ["civil_small_claims", "civil_other"],
    lastChecked: "2026-11-17",
    reviewStatus: REVIEW,
    steps: [
      {
        id: "sc-right-court",
        title: "Check that Small Claims Court fits",
        body: [
          "Small Claims Court hears claims for money or personal property worth $50,000 or less. The limit rose from $35,000 to $50,000 on October 1, 2025 (checked on ontario.ca, November 2026).",
          "There are time limits for starting a claim. In most cases a claim cannot be filed more than two years after the incident. Ask a lawyer or paralegal how the time limits apply to you.",
        ],
        checklist: [
          { id: "sc-1", text: "Write down the amount in question and how you worked it out." },
          { id: "sc-2", text: "Write down the date the problem happened, and the date you first knew about it." },
          { id: "sc-3", text: "Read the official guide for your side: suing someone, or being sued." },
        ],
        sources: ["smallclaims-guide", "smallclaims-sued", "limitations"],
      },
      {
        id: "sc-papers",
        title: "Start or respond to the claim",
        body: [
          "A case starts when the plaintiff files a Plaintiff's Claim and serves it on the defendant.",
          "If you are served with a claim, the official guide says you must reply within 20 days. You can file a Defence (Form 9A), and you may also be able to make your own claim. Check the dates on your papers and confirm them with the court office.",
        ],
        checklist: [
          { id: "sc-4", text: "Add the claim papers to Documents with the origin \"Filed with the court\"." },
          { id: "sc-5", text: "Write down the date you were served, and add your reply date to Deadlines." },
          { id: "sc-6", text: "List, in your own words, what you agree with and what you dispute." },
          { id: "sc-7", text: "Find the official forms on the Ontario court forms site, linked from the guide." },
        ],
        sources: ["smallclaims-sued", "scc-rules"],
      },
      {
        id: "sc-evidence",
        title: "Organize your documents and witnesses",
        body: [
          "Courts decide cases on evidence. Keep every document in one place, in date order, and note where each one came from.",
          "Think about who saw what happened. Write down what each person knows.",
        ],
        checklist: [
          { id: "sc-8", text: "Upload the key documents and confirm the timeline." },
          { id: "sc-9", text: "Review every flag and mark what matters." },
          { id: "sc-10", text: "List possible witnesses and what each one saw." },
        ],
        sources: ["steps-to-justice"],
      },
      {
        id: "sc-settlement",
        title: "Prepare for the settlement conference",
        body: [
          "If the defendant disputes the claim, the parties are asked to meet with a judge at a settlement conference. It is a chance to narrow the issues and try to settle.",
          "The rules set what you must share before the conference and by when. Check the Rules of the Small Claims Court and any notice from the court.",
        ],
        checklist: [
          { id: "sc-11", text: "Add the settlement conference date to Deadlines." },
          { id: "sc-12", text: "Export a draft brief and read it start to finish." },
          { id: "sc-13", text: "Write down what result you could accept, and why. This is for you, not for the court." },
        ],
        sources: ["smallclaims-guide", "scc-rules"],
      },
      {
        id: "sc-trial",
        title: "If the case goes to trial",
        body: [
          "If the case does not settle, it may go to trial. The judge hears the evidence and decides.",
          "Many people get limited help from a lawyer or licensed paralegal for the trial, even if they did the rest themselves.",
        ],
        checklist: [
          { id: "sc-14", text: "Make a list of the documents you will rely on, with their source numbers." },
          { id: "sc-15", text: "Ask a lawyer or paralegal about help with just the trial, if that would help." },
        ],
        sources: ["smallclaims-guide", "lso-referral"],
      },
    ],
  },
  {
    id: "superior-civil",
    title: "Ontario Superior Court of Justice: civil action",
    court: "Superior Court of Justice",
    forKinds: ["civil_superior"],
    lastChecked: "2026-11-17",
    reviewStatus: REVIEW,
    steps: [
      {
        id: "su-pleadings",
        title: "Pleadings: the claim and the defence",
        body: [
          "A civil action usually starts with a statement of claim. The defendant has a set time to deliver a statement of defence. The Rules of Civil Procedure set the time, and it depends on where the defendant was served. Check the rules and your papers, and confirm the date.",
          "Superior Court procedure is more complex than Small Claims Court. Ontario has also been reviewing its civil rules, so steps may change. Check the court's current notices.",
        ],
        checklist: [
          { id: "su-1", text: "Add the claim and any other court papers to Documents (origin: \"Filed with the court\")." },
          { id: "su-2", text: "Add every date from the papers to Deadlines, and confirm each one." },
          { id: "su-3", text: "Write your one-page summary." },
        ],
        sources: ["rcp", "ontariocourts-scj"],
      },
      {
        id: "su-discovery",
        title: "Documents and discovery",
        body: [
          "Each side usually has to share relevant documents, and may be questioned under oath. Documents you receive from the other side through this process can usually only be used for this case (the deemed undertaking rule).",
        ],
        checklist: [
          { id: "su-4", text: "Label documents from the other side as \"From the other side\" when you upload them." },
          { id: "su-5", text: "Keep a list of documents you have, and ones you know exist but do not have." },
          { id: "su-6", text: "Review flags across both sides' documents." },
        ],
        sources: ["rcp-30-1", "rcp"],
      },
      {
        id: "su-resolution",
        title: "Mediation and pre-trial steps",
        body: [
          "Many cases go through mediation or a pre-trial conference before any trial. Some regions have mandatory mediation. Check the rules and the court's practice directions for your region.",
        ],
        checklist: [
          { id: "su-7", text: "Export a draft brief and your question list." },
          { id: "su-8", text: "Note any offers made or received, with dates, and ask a lawyer how they can be used." },
        ],
        sources: ["ontariocourts-scj", "rcp"],
      },
      {
        id: "su-help",
        title: "Get help for the parts that need it",
        body: [
          "Lawyers can help with just part of a case, such as reviewing documents or preparing for one hearing. The Law Society Referral Service can connect you with a lawyer or licensed paralegal for a free first consultation of up to 30 minutes.",
        ],
        checklist: [
          { id: "su-9", text: "Write your three most important questions." },
          { id: "su-10", text: "Book a consultation and bring your brief." },
        ],
        sources: ["lso-referral", "steps-to-justice"],
      },
    ],
  },
  {
    id: "criminal-info",
    title: "Criminal case: general information",
    court: "Ontario Court of Justice or Superior Court of Justice",
    forKinds: ["criminal"],
    lastChecked: "2026-11-17",
    reviewStatus: "Draft. Not yet reviewed by an Ontario lawyer. Criminal mode is gated until a lawyer's opinion on disclosure handling.",
    gated: true,
    steps: [
      {
        id: "cr-help",
        title: "Get legal help first",
        body: [
          "A criminal charge can have serious consequences. Talk to a criminal defence lawyer as early as you can. Duty counsel at the courthouse can give some free help on the day, and Legal Aid Ontario may be able to help if you cannot afford a lawyer.",
        ],
        checklist: [
          { id: "cr-1", text: "Contact Legal Aid Ontario or a criminal defence lawyer." },
          { id: "cr-2", text: "Add your next court date to Deadlines." },
        ],
        sources: ["lao", "lao-duty-counsel", "lso-referral"],
      },
      {
        id: "cr-disclosure",
        title: "Disclosure has strict limits",
        body: [
          "The Crown's evidence (disclosure) is given to you for your defence only. Do not share it, post it, or show it to anyone except your lawyer. Ontario's digital disclosure system sets its own conditions for self-represented people.",
          "Crown disclosure can only be uploaded here once criminal mode is open and you have accepted the conditions on the gate screen.",
        ],
        checklist: [
          { id: "cr-3", text: "Read the conditions that came with your disclosure." },
          { id: "cr-4", text: "Ask your lawyer before using any tool with your disclosure." },
        ],
        sources: ["criminal-hub", "ocj", "scj-criminal"],
      },
    ],
  },
];

export function pathwaysForCase(kind: CaseKind): Pathway[] {
  return PATHWAYS.filter((p) => p.forKinds.includes(kind));
}

export function getPathway(id: string): Pathway | undefined {
  return PATHWAYS.find((p) => p.id === id);
}
