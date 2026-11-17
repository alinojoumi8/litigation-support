import "server-only";
import type { DataAdapters } from "../data";
import { parseTransactions } from "../domain/accounting";
import type { CaseFile, Origin } from "../domain/types";
import { newId, nowIso, todayInToronto } from "../ids";
import { parseEmail } from "../ocr/email";
import { paginate } from "../ocr";
import { ingestFile, refreshFlags } from "../services/documents";

/**
 * The fictional sample case. Every name, address, company, amount and court
 * file in here is invented and labelled as a sample. No real case data.
 */

const enc = new TextEncoder();

function addDays(iso: string, n: number): string {
  const d = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) + n));
  return d.toISOString().slice(0, 10);
}

/** A hand-drawn-looking signature, drawn as SVG strokes. Fictional. */
function signatureSvg(label: string, variant: "known1" | "known2" | "questioned"): string {
  const transforms = {
    known1: "translate(0,0)",
    known2: "translate(6,4) rotate(-1.5 300 130) scale(0.98)",
    questioned: "translate(24,8) skewX(-9) scale(1.06 0.93)",
  } as const;
  const stroke = variant === "questioned" ? 3.4 : 2.6;
  const tail =
    variant === "questioned"
      ? "M 455 128 C 470 120, 488 122, 500 130"
      : "M 455 128 C 478 150, 520 150, 545 118";
  const aLoop = variant === "questioned" ? "M60 150 C 78 82, 100 70, 114 150" : "M60 150 C 80 60, 112 58, 120 150";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 220" width="600" height="220" role="img" aria-label="${label}">
<rect width="600" height="220" fill="#fbfaf5"/>
<line x1="40" y1="172" x2="560" y2="172" stroke="#a9b0b8" stroke-width="1.2"/>
<text x="40" y="202" font-family="Arial, sans-serif" font-size="13" fill="#5b6570">${label}</text>
<g fill="none" stroke="#1f2a44" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" transform="${transforms[variant]}">
<path d="${aLoop} M 84 112 L 118 108"/>
<path d="M 132 104 C 138 140, 148 152, 160 102"/>
<path d="M 170 122 C 186 96, 204 112, 192 136 C 184 150, 206 146, 214 120"/>
<path d="M 222 142 C 226 112, 236 100, 248 106"/>
<path d="M 256 102 C 258 140, 264 158, 276 120 C 286 96, 292 150, 284 182 C 278 202, 262 192, 270 170"/>
<path d="M 318 112 C 300 96, 290 120, 312 128 C 334 136, 322 160, 298 150"/>
<path d="M 344 120 C 332 112, 326 146, 344 142 C 356 138, 356 116, 352 142 C 352 150, 362 148, 366 132"/>
<path d="M 372 146 C 376 120, 380 116, 386 126 C 390 118, 398 116, 400 128 C 404 118, 410 118, 412 146"/>
<path d="M 420 150 C 424 124, 446 116, 440 136 C 436 150, 420 146, 424 132 M 424 140 L 426 176"/>
<path d="M 448 150 C 452 116, 458 92, 452 150"/>
<path d="${tail}"/>
</g>
</svg>`;
}

interface SampleDoc {
  title: string;
  filename: string;
  origin: Origin;
  providedBy: string;
  howObtained: string;
  originalAvailable: boolean;
  tags: string[];
  kind: "text" | "email" | "csv" | "image";
  pages?: string[];
  raw?: string;
}

const DOCS: SampleDoc[] = [
  {
    title: "Renovation agreement (sample)",
    filename: "renovation-agreement-sample.txt",
    origin: "mine",
    providedBy: "Signed by me and the contractor",
    howObtained: "My signed copy, kept at home",
    originalAvailable: true,
    tags: ["agreement"],
    kind: "text",
    pages: [
      "RENOVATION AGREEMENT (FICTIONAL SAMPLE)\nThis Renovation Agreement is made on March 3, 2025 between Avery Sample (the Owner) of 12 Example Lane, Sampletown, Ontario and Northwind Example Renovations Inc. (the Contractor).\nThe Contractor will renovate the kitchen at the Owner's home as described in Schedule A.",
      "PRICE AND PAYMENT\nThe total contract price is $24,000.00 plus HST.\nThe Owner will pay a deposit of $5,000.00 when this agreement is signed. The deposit was paid on March 10, 2025 by e-transfer.\nThe balance is payable in instalments as invoiced. The final payment is due when the work is completed and inspected.\nSCHEDULE\nWork will begin on April 7, 2025 and is expected to finish by July 31, 2025.",
      "SIGNATURES\nSigned: Avery Sample, Owner. Date: March 3, 2025\nSigned: Jordan Whitfield, Project Manager, for Northwind Example Renovations Inc. Date: March 3, 2025",
    ],
  },
  {
    title: "Email: Re: Deposit (sample)",
    filename: "email-re-deposit-sample.eml",
    origin: "mine",
    providedBy: "Jordan Whitfield (contractor)",
    howObtained: "Saved from my email inbox",
    originalAvailable: true,
    tags: ["email", "deposit"],
    kind: "email",
    raw: "From: Jordan Whitfield <jordan@northwind-example.invalid>\r\nTo: Avery Sample <avery@example.invalid>\r\nDate: Tue, 18 Mar 2025 09:12:00 -0400\r\nSubject: Re: Deposit\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nHi Avery,\r\n\r\nThanks for sending the deposit. Our records show the deposit was paid on March 17, 2025 and it has been applied to your account.\r\n\r\nWe will see you on site on April 7, 2025.\r\n\r\nJordan Whitfield\r\nProject Manager\r\n",
  },
  {
    title: "Invoice 1042 (sample)",
    filename: "invoice-1042-sample.txt",
    origin: "mine",
    providedBy: "Northwind Example Renovations Inc.",
    howObtained: "Emailed to me by the contractor",
    originalAvailable: false,
    tags: ["invoice"],
    kind: "text",
    pages: [
      "NORTHWIND EXAMPLE RENOVATIONS INC. (FICTIONAL)\nInvoice #1042\nInvoice 1042 dated May 30, 2025.\nBill to: Avery Sample\nCabinet supply and installation, progress billing.\nInvoice #1042 total due: $12,400.00.\nPayment terms: 15 days.",
    ],
  },
  {
    title: "Email: Invoice 1042 (sample)",
    filename: "email-invoice-1042-sample.eml",
    origin: "mine",
    providedBy: "Jordan Whitfield (contractor)",
    howObtained: "Saved from my email inbox",
    originalAvailable: true,
    tags: ["email", "invoice"],
    kind: "email",
    raw: "From: Northwind Example Renovations <office@northwind-example.invalid>\r\nTo: Avery Sample <avery@example.invalid>\r\nDate: Mon, 2 Jun 2025 16:40:00 -0400\r\nSubject: Invoice 1042\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nAvery,\r\n\r\nAs discussed, Invoice 1042 is for $14,200.00. Please see the attached revised quote for the pantry. Payment is due within 15 days.\r\n\r\nRegards,\r\nJordan Whitfeld\r\n",
  },
  {
    title: "Change order 3, contractor's copy (sample)",
    filename: "change-order-3-contractor-copy-sample.txt",
    origin: "other_side",
    providedBy: "Northwind Example Renovations Inc.",
    howObtained: "Given to me with the contractor's documents for the case",
    originalAvailable: false,
    tags: ["change order", "signature"],
    kind: "text",
    pages: ["CHANGE ORDER 3 (FICTIONAL SAMPLE)\nChange Order 3 dated June 12, 2025 adds a pantry unit for $3,150.00 plus HST.\nApproved by the Owner.\nSigned: Avery Sample\nDate: June 12, 2025"],
  },
  {
    title: "Signature on change order 3 (questioned, sample)",
    filename: "signature-change-order-3-sample.svg",
    origin: "other_side",
    providedBy: "Northwind Example Renovations Inc.",
    howObtained: "Scan of the contractor's copy",
    originalAvailable: false,
    tags: ["signature", "questioned"],
    kind: "image",
    raw: signatureSvg("Questioned sample (fictional) · Change order 3 · June 12, 2025", "questioned"),
  },
  {
    title: "My signature on the agreement (known, sample)",
    filename: "signature-agreement-known-sample.svg",
    origin: "mine",
    providedBy: "Me",
    howObtained: "Scan of page 3 of my signed agreement",
    originalAvailable: true,
    tags: ["signature", "known"],
    kind: "image",
    raw: signatureSvg("Known sample 1 (fictional) · Agreement p.3 · March 3, 2025", "known1"),
  },
  {
    title: "My signature on a 2024 lease (known, sample)",
    filename: "signature-lease-2024-known-sample.svg",
    origin: "mine",
    providedBy: "Me",
    howObtained: "Scan of my 2024 lease, original at home",
    originalAvailable: true,
    tags: ["signature", "known"],
    kind: "image",
    raw: signatureSvg("Known sample 2 (fictional) · Lease · September 1, 2024", "known2"),
  },
  {
    title: "My notes from the site visit (sample)",
    filename: "site-visit-notes-sample.txt",
    origin: "mine",
    providedBy: "Me",
    howObtained: "Written by me after the visit",
    originalAvailable: true,
    tags: ["notes"],
    kind: "text",
    pages: [
      "MY NOTES FROM THE SITE VISIT (FICTIONAL SAMPLE)\nOn July 2, 2025 the delivery of the cabinets was completed, three weeks late.\nJordan Whitfield said the final payment would be due when the work was completed.\nI asked for a quote for a pantry. I do not remember signing a change order for it.",
    ],
  },
  {
    title: "Plaintiff's claim (sample, not a real court file)",
    filename: "plaintiffs-claim-sample.txt",
    origin: "filed_court",
    providedBy: "Served on me by the contractor",
    howObtained: "Served at my home",
    originalAvailable: true,
    tags: ["court"],
    kind: "text",
    pages: [
      "PLAINTIFF'S CLAIM (FICTIONAL SAMPLE, NOT A REAL COURT FILE)\nSmall Claims Court, Sampletown (fictional). Court file no. SC-00-0000-SAMPLE\nPlaintiff: Northwind Example Renovations Inc.\nDefendant: Avery Sample\nThe Plaintiff claims $9,850.00 for unpaid work.",
      "REASONS FOR CLAIM\nThe delivery of the cabinets was completed on June 24, 2025.\nThe work was completed on August 15, 2025.\nInvoice 1042 dated May 30, 2025 remains unpaid in part.\nChange Order 3 for $3,150.00 was approved by the Defendant.",
    ],
  },
  {
    title: "Chequing statement export (sample)",
    filename: "chequing-statement-sample.csv",
    origin: "mine",
    providedBy: "My bank (fictional)",
    howObtained: "Downloaded from online banking",
    originalAvailable: true,
    tags: ["bank"],
    kind: "csv",
    raw: [
      "date,description,amount,balance,account",
      "2025-03-01,Balance carried forward,0.00,8200.00,Chequing",
      "2025-03-10,E-transfer to Northwind Example Renovations,-5000.00,3200.00,Chequing",
      "2025-03-14,Payroll deposit,4100.00,7300.00,Chequing",
      "2025-03-28,Hydro bill,-142.18,7157.82,Chequing",
      "2025-04-14,Payroll deposit,4100.00,11257.82,Chequing",
      "2025-04-20,Grocery store,-212.40,11045.42,Chequing",
      "2025-04-20,Grocery store,-212.40,10833.02,Chequing",
      "2025-06-13,E-transfer to Northwind Example Renovations,-6000.00,4833.02,Chequing",
      "2025-06-14,Payroll deposit,4100.00,8933.02,Chequing",
      "2025-06-30,Transfer to savings,-2500.00,6433.02,Chequing",
      "2025-07-02,Cheque 118,-1850.00,4500.00,Chequing",
    ].join("\n"),
  },
];

export async function seedSampleCase(data: DataAdapters, userId: string): Promise<string> {
  const now = nowIso();
  const today = todayInToronto();
  const caseId = newId("case");
  const c: CaseFile = {
    id: caseId,
    ownerId: userId,
    nickname: "SAMPLE: kitchen renovation dispute (fictional)",
    kind: "civil_small_claims",
    audience: "self_rep",
    court: "Small Claims Court (fictional Sampletown courthouse)",
    stage: "Claim received, preparing a response",
    role: "defendant",
    courtFileNumber: "SC-00-0000-SAMPLE",
    summary:
      "SAMPLE (fictional). In March 2025 I hired Northwind Example Renovations Inc. to renovate my kitchen for $24,000 plus HST and paid a $5,000 deposit. The cabinets arrived about three weeks late. The contractor now claims $9,850 in Small Claims Court, including a pantry under Change Order 3. I do not remember signing that change order. I want to understand my options and pay what I actually owe.",
    isSample: true,
    createdAt: now,
    updatedAt: now,
    criminalAckAt: null,
    planPaused: false,
    noDeadlinesYet: false,
    pathwayStep: "sc-papers",
    briefExportedAt: null,
    moneyFlagStatus: {},
  };
  await data.repo.createCase(c, { id: newId("mem"), caseId, userId, role: "owner", createdAt: now });

  const docIds: string[] = [];
  for (const d of DOCS) {
    const meta = { title: d.title, origin: d.origin, providedBy: d.providedBy, howObtained: d.howObtained, originalAvailable: d.originalAvailable, tags: d.tags, isSample: true };
    if (d.kind === "image") {
      const bytes = enc.encode(d.raw!);
      const doc = await ingestFile(data, caseId, userId, { filename: d.filename, bytes, kind: "png", mimeType: "image/svg+xml" }, meta, { pages: [""], method: "image-no-ocr", emailMeta: null }, { localOnly: true });
      docIds.push(doc.id);
    } else if (d.kind === "email") {
      const { meta: em, text } = parseEmail(d.raw!);
      const doc = await ingestFile(data, caseId, userId, { filename: d.filename, bytes: enc.encode(d.raw!), kind: "email", mimeType: "message/rfc822" }, meta, { pages: [text], method: "email", emailMeta: em }, { localOnly: true });
      docIds.push(doc.id);
    } else {
      const text = d.pages ? d.pages.join("\f") : d.raw!;
      const pages = d.pages ?? paginate(d.raw!);
      const doc = await ingestFile(
        data,
        caseId,
        userId,
        { filename: d.filename, bytes: enc.encode(text), kind: d.kind === "csv" ? "csv" : "text", mimeType: d.kind === "csv" ? "text/csv; charset=utf-8" : "text/plain; charset=utf-8" },
        meta,
        { pages, method: "plain-text", emailMeta: null },
        { localOnly: true },
      );
      docIds.push(doc.id);
    }
  }
  const [agreement, , , , , questioned, known1, known2, , , statement] = docIds;

  // Confirm the agreement's events, as a user would after checking the source.
  const events = await data.repo.list("events", caseId);
  for (const e of events.filter((x) => x.sourceDocId === agreement)) await data.repo.update("events", caseId, e.id, { status: "confirmed", updatedAt: now });

  await refreshFlags(data, caseId, { localOnly: true });
  const flags = await data.repo.list("flags", caseId);
  const deposit = flags.find((f) => f.kind === "date_conflict" && f.title.includes("Doc 0001"));
  if (deposit) await data.repo.update("flags", caseId, deposit.id, { status: "matters", userNote: "My bank statement shows March 10.", updatedAt: now });
  const amount = flags.find((f) => f.kind === "amount_mismatch");
  if (amount) await data.repo.update("flags", caseId, amount.id, { status: "ask_lawyer", updatedAt: now });

  // Money: import the statement rows.
  const csv = DOCS[10].raw!;
  const importId = newId("imp");
  const { rows } = parseTransactions(csv);
  await data.repo.insertMany(
    "transactions",
    rows.map((r) => ({ id: newId("txn"), caseId, importId, importName: `Doc ${String(docIds.indexOf(statement) + 1).padStart(4, "0")}: ${DOCS[10].title}`, ...r })),
  );

  await data.repo.insert("signatures", {
    id: newId("sig"),
    caseId,
    title: "Change order 3 signature",
    questionedDocId: questioned,
    knownDocIds: [known1, known2],
    observations: [
      { id: newId("obs"), side: "questioned", x: 0.16, y: 0.5, note: "The loop of the first letter looks narrower and lower than in both known samples." },
      { id: newId("obs"), side: "questioned", x: 0.82, y: 0.58, note: "The final stroke is short and flat. In both known samples it curves down and back up." },
    ],
    examinerNote: "",
    flaggedForExaminer: false,
    createdAt: now,
    updatedAt: now,
  });

  await data.repo.insertMany("deadlines", [
    { id: newId("ddl"), caseId, title: "Reply to the claim (date from the claim papers, sample)", date: addDays(today, 9), sourceDocId: docIds[9], notes: "Confirm this date with the court office.", done: false, createdAt: now },
    { id: newId("ddl"), caseId, title: "Settlement conference (sample date)", date: addDays(today, 41), sourceDocId: null, notes: "", done: false, createdAt: now },
    { id: newId("ddl"), caseId, title: "Find the originals of my signed documents", date: addDays(today, 2), sourceDocId: null, notes: "Personal reminder.", done: false, createdAt: now },
  ]);

  await data.repo.insertMany("questions", [
    { id: newId("qst"), caseId, text: "Which of my documents matter most for my reply to the claim?", audience: "lawyer", status: "open", answer: "", createdAt: now },
    { id: newId("qst"), caseId, text: "What does a document examiner need from me to look at the change order signature?", audience: "expert", status: "open", answer: "", createdAt: now },
  ]);

  await data.repo.upsert("pathwayProgress", { id: "small-claims", caseId, pathwayId: "small-claims", checked: ["sc-1", "sc-3", "sc-4"], currentStep: "sc-papers", updatedAt: now });
  return caseId;
}
