import { PRODUCT_NAME } from "../brand";
import type { GuideSection } from "./guides";

/**
 * DRAFT legal pages. Written by the product team as a starting point only.
 * Every page needs review and rewriting by an Ontario lawyer before any
 * public use (lawyer review register item 2).
 */
export interface LegalDoc {
  slug: string;
  title: string;
  intro: string;
  sections: GuideSection[];
}

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "terms",
    title: "Terms of use",
    intro: `These terms explain how you may use ${PRODUCT_NAME}. They are a working draft.`,
    sections: [
      {
        heading: "1. What the service is",
        paragraphs: [
          `${PRODUCT_NAME} is software for organizing your own case documents. It provides general legal information and organization tools.`,
          `${PRODUCT_NAME} is not a law firm. It does not provide legal advice or legal services, and using it does not create a lawyer-client relationship.`,
        ],
      },
      {
        heading: "2. Your responsibilities",
        list: [
          "Only upload documents you are allowed to use and share with a service like this one.",
          "Follow any limits on documents you received from the other side or from the Crown, and any court order.",
          "Check every summary, timeline entry and flag against the source before relying on it or sharing it.",
          "Do not use the service to harass anyone or to break the law.",
        ],
      },
      {
        heading: "3. AI-generated content",
        paragraphs: [
          "Some content is created by software, including AI. It can be wrong or incomplete. It is labelled as a draft. You decide what to keep and what to share.",
        ],
      },
      {
        heading: "4. Expert tools",
        paragraphs: [
          "The signature compare and money pattern tools help you notice and record things to ask a qualified expert about. They do not give opinions, and they cannot say whether a signature is genuine or whether anyone did anything wrong.",
        ],
      },
      {
        heading: "5. Payment",
        paragraphs: ["Paid plans are fixed-term passes for software tools. They do not renew automatically. They do not buy legal services or advice."],
      },
      {
        heading: "6. Ending your use",
        paragraphs: ["You can export your data and delete any case, or your whole account, at any time from Settings."],
      },
      {
        heading: "7. Liability, governing law and changes",
        paragraphs: ["[To be written by an Ontario lawyer: limitation of liability, governing law (Ontario), dispute resolution, and how changes to these terms are communicated.]"],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    intro: "This policy explains what personal information we collect, why, and the choices you have. It is a working draft based on PIPEDA principles.",
    sections: [
      {
        heading: "What we collect",
        list: [
          "Account details: your email address and the name you give us.",
          "Case content: the documents you upload, the text extracted from them, and the notes, timelines and flags you create.",
          "Records of activity: an audit log of who viewed, exported or changed what, by record id. The audit log does not contain document content.",
          "Contact form messages you send us.",
        ],
      },
      {
        heading: "How we use it",
        list: [
          "Only to provide the service to you: organizing, summarizing and flagging your own case file.",
          "We do not sell your data, show ads, or share case content across accounts.",
          "We do not use your documents to train AI models, and our contracts with AI vendors must say the same.",
          "We do not put document content in application logs or analytics.",
        ],
      },
      {
        heading: "Other people's information",
        paragraphs: ["Your documents name other people. We use that information only to serve your case, and never show it to other users."],
      },
      {
        heading: "Service providers and where data is processed",
        paragraphs: [
          "[To be confirmed before launch, per the security page: database and file storage location (planned: Canada), AI processing location and the vendor's retention terms, OCR location (planned: Canada), payment processor.]",
        ],
      },
      {
        heading: "Your choices",
        list: [
          "Export everything from a case at any time.",
          "Delete a case or your account at any time. Deletion removes documents, extracted text, summaries, timelines, flags and notes. Backups are purged on a stated schedule [schedule to be set].",
          "Ask us what we hold about you, and ask us to correct it.",
        ],
      },
      {
        heading: "Breaches",
        paragraphs: [
          "If a breach creates a real risk of significant harm, we will report it to the Office of the Privacy Commissioner of Canada, notify the people affected, and keep a record, as PIPEDA requires.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: ["Privacy questions: use the contact page. [A named privacy contact is required before launch.]"],
      },
    ],
  },
  {
    slug: "disclaimer",
    title: "Disclaimer",
    intro: "Please read this before relying on anything you see in the service.",
    sections: [
      {
        heading: "Information, not advice",
        paragraphs: [
          `${PRODUCT_NAME} provides legal information and organization tools. It is not a law firm and does not provide legal advice. For advice about your situation, speak to a lawyer or licensed paralegal.`,
        ],
      },
      {
        heading: "No predictions",
        paragraphs: ["The service does not predict how a case will go. The readiness score measures how organized your file is. It does not measure your chances in court."],
      },
      {
        heading: "Flags are not findings",
        paragraphs: [
          "Flags point out possible inconsistencies worth a closer look. They may have innocent explanations. Signature and money tools help you prepare questions for a qualified expert; only an expert can give an opinion.",
        ],
      },
      {
        heading: "Check before you file",
        paragraphs: [
          "Before you file anything with a court, check every fact against its source page. Courts in Ontario expect you to confirm that what you file is accurate. Legal sources we link to are official, but you must check they are current.",
        ],
      },
      {
        heading: "Deadlines",
        paragraphs: ["Confirm every deadline with the court office, the order, or your lawyer. The service does not calculate court deadlines."],
      },
    ],
  },
  {
    slug: "ai-use",
    title: "AI use policy",
    intro: "How AI is and is not used in the service.",
    sections: [
      {
        heading: "What AI does here",
        list: [
          "Writes a plain-language summary of each document you upload, with page references.",
          "Pulls dated events into your timeline, marked unconfirmed until you check them.",
          "Suggests possible inconsistencies between documents, alongside rule-based checks.",
        ],
      },
      {
        heading: "What AI never does here",
        list: [
          "Give legal advice, recommend what to file or say, or predict outcomes.",
          "Produce case law or statute citations. Any text that looks like a citation and is not on our checked list is removed and marked \"verify before filing\".",
          "Say that a signature is forged or genuine, or that anyone committed fraud. It gives no match percentages or scores.",
        ],
      },
      {
        heading: "How outputs are checked",
        list: [
          "Every AI output is labelled \"AI draft. Check against the source.\"",
          "Quotes are kept only if they match the page word for word.",
          "Model name and prompt version are stored with every output.",
          "Exports include an AI-use statement listing which parts were AI-generated and which you confirmed.",
        ],
      },
      {
        heading: "Where AI runs",
        paragraphs: [
          "In this early build, a local rule-based extractor runs by default and nothing leaves the server. When a cloud AI model is switched on, the product says so plainly before you process documents, and the security page names the vendor, where processing happens and how long the vendor keeps data. [Vendor terms, including zero data retention, to be confirmed before beta.]",
        ],
      },
    ],
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}
