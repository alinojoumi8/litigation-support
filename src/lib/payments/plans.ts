/**
 * Early-access prices. HYPOTHESES (site plan section 8, decision 0001 #3):
 * fixed 3-month Case Pass, CAD, to be tested in interviews and the beta.
 */
export interface Plan {
  id: "free" | "case_pass" | "case_pass_plus";
  name: string;
  priceCad: number;
  term: string;
  extension: string | null;
  pageCap: number;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceCad: 0,
    term: "No time limit",
    extension: null,
    pageCap: 100,
    features: ["1 case", "Up to 100 pages", "Summaries and master timeline", "This week plan and readiness checklist", "1 watermarked sample brief"],
  },
  {
    id: "case_pass",
    name: "Case Pass",
    priceCad: 129,
    term: "3 months",
    extension: "Need more time? $39 a month, only if you choose it.",
    pageCap: 2500,
    features: [
      "Up to 2,500 pages",
      "Everything in Free",
      "Discrepancy flags",
      "Signature compare for an examiner",
      "Money pattern flags",
      "Expert prep packages",
      "Unlimited lawyer brief exports",
      "Deadlines and court pathways",
    ],
  },
  {
    id: "case_pass_plus",
    name: "Case Pass Plus",
    priceCad: 299,
    term: "3 months",
    extension: "Need more time? $79 a month, only if you choose it.",
    pageCap: 15000,
    features: ["Up to 15,000 pages", "Everything in Case Pass", "Priority processing for large files"],
  },
];

export const HARDSHIP_NOTE = "Hardship option: 50% off any paid plan. You tell us you need it; we do not ask for proof.";

export const PRICING_DISCLAIMER = "Plans pay for software tools. They do not buy legal services or advice.";
