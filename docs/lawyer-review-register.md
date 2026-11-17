# Lawyer review register

Date: 2026-11-17. Source: `docs/planning/01-site-plan.md` section 7.9, updated for the founder decisions in `docs/decisions/0001-founder-decisions.md` and for what this build actually contains.

Nothing in the product has been reviewed by a lawyer yet. Every legal page carries a "DRAFT: needs Ontario lawyer review" banner; every guide and pathway says "Not yet reviewed by a lawyer". Do not open a private beta before items 1 to 5 are signed off.

## From the site plan (section 7.9)

| # | Item | Needed before | Where it lives in the build |
|---|---|---|---|
| 1 | Does any feature amount to "providing legal services" under the Law Society Act? Especially pathways, the discrepancy finder, the brief export, and (new in launch scope) signature compare and money pattern flags. | Private beta | Whole workspace; `src/lib/content/pathways.ts`; `src/lib/domain/discrepancies.ts`; `src/components/workspace/CompareTool.tsx`; `src/lib/domain/accounting.ts` |
| 2 | Terms of use, privacy policy, disclaimer, AI use policy | Private beta | `src/lib/content/legal.ts` (all marked DRAFT; liability, governing law and backup purge schedule are placeholders) |
| 3 | Disclaimer and refusal copy (site plan 7.1 to 7.3) | Private beta | `src/lib/brand.ts`, `src/lib/domain/wording.ts` (mandatory strings) |
| 4 | Deemed undertaking and use of discovery documents in the tool | Private beta | Origin labels and reminders: `src/lib/domain/origin.ts`; upload form; packages |
| 5 | Privilege risk of uploading lawyer communications; how to structure the product to reduce it | Private beta | "From my lawyer" origin, privilege warning, default exclusion from expert packages |
| 6 | Expert prep package: neutral-instructions wording; lawyer-retained expert guidance; reference to r. 4.1.01 | Feature launch (now in first launch per decision 0001 #5) | `src/app/app/cases/[caseId]/packages/` |
| 7 | Crown disclosure handling for criminal mode, including the gate screen text and the three acknowledgments | Before `FEATURE_CRIMINAL_CASES` is turned on | `src/components/workspace/OnboardingForm.tsx`; criminal pathway in `src/lib/content/pathways.ts` |
| 8 | Self-rep pathway content and each guide | Before publishing | Small Claims and Superior Court pathways; 4 written guides in `src/lib/content/guides.ts`; 6 "coming soon" guides must not be written without review |
| 9 | Marketing claims, testimonials, taglines (home page, audience pages, pricing) | Public launch | `src/app/(site)/` |
| 10 | Business model B (lawyer-paid) and any directory; referral fee and advertising rules | Phase 3 | Not built |
| 11 | LSO Access to Innovation sandbox: status in 2026 and whether to apply | Public launch | Not applicable to code |
| 12 | Professional liability or E&O insurance for the business | Public launch | Not applicable to code |

## Added by founder decisions and this build

| # | Item | Needed before | Notes |
|---|---|---|---|
| 13 | AI processing outside Canada (decision 0001 #4): disclosure wording, vendor terms (no training, zero retention), effect on privilege and undertakings | Private beta, before `AI_PROVIDER=anthropic` is used with real documents | `/security`, `/legal/ai-use`, upload form notice, settings page |
| 14 | Signature compare wording: the disclaimer, the "innocent causes" text, the acknowledgment checkbox and the examiner note template. Also test with a forensic document examiner (decision 0001 risk 4) | Private beta | `SIGNATURE_DISCLAIMER`, `SIGNATURE_INNOCENT_CAUSES`, `buildExaminerNote()` in `src/lib/domain/wording.ts` |
| 15 | Money pattern wording and the "questions for an accountant" templates. Also test with a forensic accountant | Private beta | `src/lib/domain/accounting.ts` |
| 16 | Readiness score and weekly tasks: confirm they cannot be read as advice or as a measure of case merit | Private beta | `src/lib/domain/readiness.ts`, `src/lib/domain/tasks.ts` |
| 17 | Facts stated in the Small Claims pathway: $50,000 limit (from Oct 1, 2025), 20 days to reply after service, two-year limitation note. Checked against ontario.ca on 2026-11-17, not against the regulation text | Before publishing | `src/lib/content/pathways.ts` |
| 18 | Superior Court pathway: wording about defence timing, discovery, mediation and the Civil Rules Review | Before publishing | `src/lib/content/pathways.ts` |
| 19 | Curated authority list: each entry's description and whether the list is the right set | Private beta | `src/lib/domain/authorities.ts` |
| 20 | Urgent-situation panel: trigger words and the help listed | Private beta | `src/lib/domain/urgent.ts`, `src/components/workspace/UrgentPanel.tsx` |
| 21 | Hardship pricing by self-declaration and the "no automatic renewal" promise | Payments on | `src/lib/payments/plans.ts` |
| 22 | Export AI-use statement: whether it meets Ontario court AI-disclosure expectations (SCJ practice directions) | Private beta | `src/app/app/cases/[caseId]/packages/brief/page.tsx` |
