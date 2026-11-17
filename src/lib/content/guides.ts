/**
 * Starter guides (site plan 6.2). Four are written: they are about organizing
 * and preparing, not about the law, so they carry the least legal risk. The
 * six that explain legal process stay "coming soon" until an Ontario lawyer
 * reviews them (lawyer review register item 8).
 *
 * Reading level target: grade 8 or lower.
 */

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  status: "published" | "coming_soon";
  minutes?: number;
  lastChecked?: string;
  sections?: GuideSection[];
  sources?: { label: string; url: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: "case-readiness-checklist",
    title: "The Case Readiness Checklist: 25 things to have in order before you meet your lawyer",
    summary: "A plain checklist of what to gather and write down before a meeting with a lawyer, an expert or the court.",
    status: "published",
    minutes: 8,
    lastChecked: "2026-11-17",
    sections: [
      {
        heading: "How to use this checklist",
        paragraphs: [
          "You do not need every item before your first meeting. Tick what you have, and bring a note of what is missing. A lawyer can tell you which gaps matter for your case.",
          "Keep originals safe. Bring copies unless you are asked for originals.",
        ],
      },
      {
        heading: "About your case (1 to 5)",
        ordered: true,
        list: [
          "The court and the court file number, if a case has started.",
          "Your role: are you suing, being sued, or something else?",
          "The names of everyone involved, and how each one is connected to the case.",
          "Every court paper you have received or filed, in date order.",
          "Any order, notice or letter that sets a date. Write each date in one place.",
        ],
      },
      {
        heading: "Documents (6 to 12)",
        ordered: true,
        list: [
          "The main agreement or contract, with every page and any changes.",
          "Invoices, receipts and quotes, in date order.",
          "Key emails and texts, saved with their dates and the sender's address.",
          "Photos, with the date each one was taken.",
          "Bank or card statements for the months that matter.",
          "A note of where each document came from: you, the other side, your lawyer, the court, or a public source.",
          "A list of documents you know exist but do not have.",
        ],
      },
      {
        heading: "Your timeline (13 to 16)",
        ordered: true,
        list: [
          "One list of events in date order, one event per line.",
          "For each event, the document and page that shows it.",
          "A mark next to anything you are not sure about.",
          "Notes on any dates or amounts that do not match between documents.",
        ],
      },
      {
        heading: "People and money (17 to 20)",
        ordered: true,
        list: [
          "Contact details for possible witnesses, and what each one saw or knows.",
          "A short list of amounts in question, with the document behind each one.",
          "What you have paid so far, and what you have been asked to pay.",
          "Any offers to settle, made or received, with dates. Ask your lawyer how these can be used.",
        ],
      },
      {
        heading: "Your summary and questions (21 to 25)",
        ordered: true,
        list: [
          "A one-page summary of what happened, in your own words.",
          "What you want to happen. Be honest, even if you are unsure it is possible.",
          "Your questions, written down, most important first.",
          "Your budget and any time limits you know of.",
          "Anything you are worried about, including your safety. If you are in danger, call 911.",
        ],
      },
    ],
    sources: [
      { label: "Steps to Justice (CLEO): plain-language legal information for Ontario", url: "https://stepstojustice.ca/" },
      { label: "Law Society Referral Service: free consultation of up to 30 minutes", url: "https://lso.ca/public-resources/finding-a-lawyer-or-paralegal/law-society-referral-service" },
    ],
  },
  {
    slug: "timeline-from-your-inbox",
    title: "How to build a timeline of your case from your inbox, step by step",
    summary: "Turn a pile of emails into one list of dated events, each linked to the message it came from.",
    status: "published",
    minutes: 10,
    lastChecked: "2026-11-17",
    sections: [
      {
        heading: "Why a timeline helps",
        paragraphs: [
          "A timeline puts events in order, so you, your lawyer or the court can follow what happened. It also shows gaps, and places where two documents tell a different story.",
          "Keep it factual. Write what happened and when, not what you think it means.",
        ],
      },
      {
        heading: "Step 1: find the emails that matter",
        list: [
          "Search your inbox for the other person's name and email address.",
          "Search for key words: the project name, the address, invoice numbers.",
          "Search the dates around big moments: when you signed, paid, or had a problem.",
          "Save each email as a file (most email apps can save as .eml). Keep the attachments too.",
        ],
      },
      {
        heading: "Step 2: one event per line",
        paragraphs: ["For each email, write one line for each thing that happened. Use the same format every time:"],
        list: [
          "Date: use the full date, such as March 3, 2025. Avoid 03/04/2025, which can be read two ways.",
          "What happened: one short sentence. \"Contractor confirmed the deposit was received.\"",
          "Source: which email or document shows it, and which page.",
        ],
      },
      {
        heading: "Step 3: use the date of the event, not only the date of the email",
        paragraphs: [
          "An email sent on March 17 may describe something that happened on March 10. Put the event on March 10, and note that the email came later.",
          "If an email gives no exact date, write the month and mark it as approximate.",
        ],
      },
      {
        heading: "Step 4: mark what you are unsure about",
        paragraphs: [
          "Put a question mark next to any line you have not checked against the source. Go back and check it later. An honest \"not sure\" is better than a confident mistake.",
        ],
      },
      {
        heading: "Step 5: look for things that do not line up",
        list: [
          "The same payment with two different dates.",
          "The same invoice with two different amounts.",
          "A name spelled two ways.",
          "An email that says \"see attached\" but has no attachment.",
        ],
        paragraphs: [
          "Write these down as questions, not conclusions. There is often an innocent explanation, such as a typo or a revised invoice.",
        ],
      },
      {
        heading: "Step 6: keep it up to date",
        paragraphs: ["Add new events as they happen. A few minutes each week keeps the timeline useful."],
      },
    ],
    sources: [{ label: "Steps to Justice (CLEO): plain-language legal information for Ontario", url: "https://stepstojustice.ca/" }],
  },
  {
    slug: "one-page-case-summary",
    title: "How to write a one-page case summary your lawyer can use",
    summary: "A simple structure for explaining your case on one page, so paid time goes to your questions.",
    status: "published",
    minutes: 7,
    lastChecked: "2026-11-17",
    sections: [
      {
        heading: "Why one page",
        paragraphs: [
          "A short summary lets a lawyer, paralegal or court staff member understand your situation quickly. You can always add detail later. Most people find that writing it also helps them think clearly.",
        ],
      },
      {
        heading: "Use these six headings",
        ordered: true,
        list: [
          "Who is involved: you, the other side, and anyone else important. One line each.",
          "What happened: five to eight sentences, in date order. Facts only.",
          "Where things stand: has a case started? Which court? What is the next date?",
          "What you want: the result you are hoping for, in plain words.",
          "Key documents: the five or six documents that matter most, with their names or numbers.",
          "Your questions: the three things you most need to know.",
        ],
      },
      {
        heading: "Tips",
        list: [
          "Write in short sentences. Use names, not \"he\" and \"she\".",
          "Use full dates.",
          "Leave out arguments and feelings for now. You can share those in the meeting.",
          "Say what you do not know. That helps the reader as much as what you do know.",
          "Check every date and amount against its document before you share it.",
        ],
      },
      {
        heading: "A short example (fictional)",
        paragraphs: [
          "Who: Avery Sample (me, homeowner). Northwind Example Renovations Inc. (contractor). Jordan Whitfield (their project manager).",
          "What happened: On March 3, 2025 we signed a renovation agreement for $24,000 plus HST. I paid a $5,000 deposit on March 10. Work started on April 7. The cabinets arrived late. In August the contractor sent an invoice I do not agree with.",
          "Where things stand: I received a Small Claims Court claim. I have a date to respond in my papers.",
          "What I want: to understand my options and pay only what I owe.",
          "My questions: Which documents matter most? What are my options for responding?",
        ],
      },
    ],
    sources: [{ label: "Steps to Justice (CLEO): plain-language legal information for Ontario", url: "https://stepstojustice.ca/" }],
  },
  {
    slug: "forensic-accountant-prep",
    title: "Before you hire a forensic accountant: what to gather and what to ask",
    summary: "How to prepare records and neutral questions so an accountant's time is well spent.",
    status: "coming_soon",
  },
  {
    slug: "signature-looks-off",
    title: "A signature looks \"off\": what a document examiner needs from you",
    summary: "Originals, known samples and dates: what to collect before you contact an examiner.",
    status: "coming_soon",
  },
  {
    slug: "small-claims-roadmap",
    title: "Representing yourself in Ontario Small Claims Court: a plain-language roadmap",
    summary: "The main steps of a Small Claims case, with links to the official guides and forms.",
    status: "coming_soon",
  },
  {
    slug: "ai-and-ontario-courts",
    title: "Using AI for your court case in Ontario: what the courts now expect",
    summary: "What Ontario courts have said about AI, checking authorities, and telling the court when AI was used.",
    status: "coming_soon",
  },
  {
    slug: "limited-scope-lawyers",
    title: "Limited-scope lawyers: how to get help with just part of your case",
    summary: "How paying a lawyer for one task, such as reviewing documents or preparing for one hearing, can work.",
    status: "coming_soon",
  },
  {
    slug: "deemed-undertaking",
    title: "Documents from the other side: what the \"deemed undertaking\" means for you",
    summary: "Why documents you get through a court case usually can only be used for that case.",
    status: "coming_soon",
  },
  {
    slug: "weekly-prep-habit",
    title: "The 30-minute weekly prep habit that keeps your case on track",
    summary: "A short weekly routine that keeps your file organized without taking over your life.",
    status: "published",
    minutes: 5,
    lastChecked: "2026-11-17",
    sections: [
      {
        heading: "Why weekly",
        paragraphs: [
          "Court cases move slowly, then suddenly fast. A small, regular habit means you are never starting from zero when a date comes up. It also helps with stress: you know what is done, and what is next.",
        ],
      },
      {
        heading: "The 30 minutes",
        ordered: true,
        list: [
          "5 minutes: check your dates. Is anything coming up in the next two weeks? Confirm each date with the court office, the order, or your lawyer.",
          "10 minutes: add what is new. Save new emails, letters and documents into your file, and note where each one came from.",
          "10 minutes: check and confirm. Open a few timeline entries or flags, look at the source page, and mark each one.",
          "5 minutes: questions. Add anything you want to ask your lawyer or the court office. Cross off what has been answered.",
        ],
      },
      {
        heading: "Make it easy to keep",
        list: [
          "Pick the same time each week, such as Sunday evening.",
          "Stop at 30 minutes, even if you are not finished. Next week is fine.",
          "If you miss a week, just pick up where you left off. There is no catching up to do.",
          "Pause the plan when you need a break. Your file will be there when you come back.",
        ],
      },
      {
        heading: "When to do more",
        paragraphs: [
          "Before a hearing, a meeting with a lawyer, or a deadline, you may need longer sessions. If something urgent is happening, see our Get help now page for people who can help today.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
