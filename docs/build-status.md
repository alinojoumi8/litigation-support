# Build status

Date: 2026-11-17. First end-to-end build. This page says plainly what works, what is mocked, what is untested, what is not built, and what needs the founder.

## Verification run for this build

| Check | Command | Result |
|---|---|---|
| Production build | `npm run build` | Passes (Next.js 16.4.6, Turbopack, Cache Components): 40 pages and 5 route handlers. |
| Lint | `npm run lint` | Passes, 0 problems. |
| Type check | `npm run typecheck` | Passes (TypeScript strict). |
| Unit and integration tests | `npm test` | 63 tests in 6 files pass. |
| Dev server smoke test | `npm run dev`, then `curl` | 23 public pages return 200 and contain their expected text; `/app` without a session redirects to `/sign-in`; case APIs return 404 without access and 403 for cross-origin uploads; security headers present. |
| Browser check | Claude browser pane, 1024px and 375px wide | Home, sign-in, demo sample case, every workspace page, compare tool (side by side, overlay, zoom, notes, flag for examiner), brief export, real upload (text and PDF accepted, disguised file rejected), onboarding with criminal gate and urgent panel, real case deletion. Issues found and fixed: header nav wrapping, mobile header overflow, button label overflow, SVG images not painting under a CSP `sandbox`, overlay tint hiding the grid, `new Date()` during prefetch renders. |
| Design detector | `impeccable detect` | One advisory: the grid background, which is the toggleable measurement grid on the compare canvas. Kept on purpose. |

Playwright end-to-end tests were **not** added. No browser binaries are installed in this environment, and downloading them is a network step outside the offline requirement, so they could not be run reliably. The flows above were checked by hand in a real browser instead.

## Done (works offline with the default configuration)

Public site: home (plan copy and section order), how it works, features, with a lawyer, representing yourself, for lawyers, pricing (early-access hypothesis), guides index, 4 written guides and 6 honest "coming soon" guides, safety, security (states what is in place now versus planned), get help now, about (general founder story), FAQ, contact form (validated, stored, no case details), accessibility statement, terms, privacy, disclaimer and AI use policy (all marked "DRAFT: needs Ontario lawyer review"). Footer disclaimer on every page.

Workspace:
- Sign-up with the required "information, not advice" acknowledgment; sign-in with throttling; sign-out; demo mode with a fictional sample case.
- Onboarding: audience (with a lawyer / self-represented), case type, details, criminal gate (closed by default), urgent-situation panel.
- This week: 3 to 5 tasks from file gaps and deadlines, tick off per week, pause plan; readiness checklist with the mandatory caption.
- Documents: multi-file upload with required origin label, provenance (who gave it, how obtained, original available), source numbers, page viewer with page links, PDF and image preview, edit, delete with everything derived.
- Summaries: per document, labelled "AI draft. Check against the source.", with page-linked key facts, guard notes, provider, model and prompt version.
- Timeline: events from all documents, confirmed/unconfirmed styling, filters (person, document, status, dates, tag, text), edit, delete, manual events, CSV export.
- People: names found, with documents and events.
- Flags: dates, amounts, names, missing attachments, versions; both sources side by side; New / Matters / Not an issue / Ask lawyer; notes; add to questions; re-run.
- Signature compare: side by side and overlay, zoom, pan (pointer and keyboard), rotate, fine rotate and nudge, grid, numbered notes, live neutral-wording hint, save, flag for examiner with the mandatory wording.
- Money patterns: CSV statement import; round amounts, repeated entries, date gaps, large transfers, balance breaks, amounts near confirmed timeline dates; neutral wording; review statuses; questions for an accountant.
- Deadlines: manual entry with source document, warnings at 14/7/2/1 days, done/undone, calendar (.ics) export with alarms.
- Packages: lawyer brief (cover, AI-use statement, summary, chronology with status, index, people, flags, questions, dates; disclaimer header and footer on every printed page; optional watermark; review checkbox required); expert prep package for an examiner or accountant (neutral background and questions, chain of custody, restricted origins excluded by default, r. 4.1.01 note).
- Notes and questions; guides and checklists (Small Claims and Superior Court pathways with "you are here" and progress; criminal information pathway behind the gate).
- Settings: provider status, export everything (ZIP with JSON, CSV and originals), activity log, delete case (type DELETE). Account: export per case, delete account. Billing: payment stub.

Security basics: per-user and per-case checks on every page, action and route; zod validation; file type, content and size checks; content-free logging; audit log of reads and exports; encrypted local store; hard delete; security headers; CSRF origin check on uploads.

## Mocked (default stand-ins)

| Area | Stand-in | Real adapter written |
|---|---|---|
| AI | Local demo extractor: deterministic rules for summaries, dates, amounts, references and names. It is not AI and is much less capable. | `src/lib/ai/anthropic.ts` |
| OCR | None. Text, saved emails and digital PDFs are read; scans and photos are stored but not read. | `src/lib/ocr/textract.ts` |
| Data and auth | Local encrypted file store and local password auth | `src/lib/data/supabase.ts`, Supabase auth provider in `src/lib/auth/provider.ts`, `supabase/migrations/` |
| Payments | Stub that charges nothing | `src/lib/payments/stripe.ts` |
| Sample data | One fictional, labelled sample case | n/a |

## Written but untested (no credentials or projects exist)

- **Supabase adapter and all three SQL migrations** (schema, RLS and RPCs, storage). Never run against a real database. Expect fixes on first `supabase db push`.
- **Supabase Auth provider.** Untested; MFA is not wired up.
- **Anthropic Claude adapter.** Type-checks against `@anthropic-ai/sdk` 1.9.0; never called. Uses structured outputs, `effort: "medium"`, server-side refusal fallback, no Files API, no content logging.
- **AWS Textract adapter.** Synchronous API only: single-page images and single-page scanned PDFs.
- **Stripe Checkout adapter.** One-time payment mode; untested.

## Not built yet

- File types beyond PDF, PNG, JPG, WEBP, TXT, EML, CSV: DOCX, XLSX, MSG, MBOX; email attachment extraction; duplicate detection.
- Virus scanning, resumable uploads, background jobs for large files, page caps per plan, usage metering.
- Multi-page OCR (Textract async with S3).
- Sharing with a lawyer or expert inside the app (shares to named people, expiry, access log), and the lawyer view.
- MFA, password reset and email verification (would come from Supabase Auth).
- Weekly check-in email and deadline reminder emails (reminders are in-app only).
- Full-text search across a case (a Postgres index exists in the migration; no UI).
- Tagged PDF and DOCX exports (packages are printable HTML: print or save as PDF from the browser).
- Staff support-access toggle, breach log tooling, backup purge schedule.
- Stripe webhook to record a paid pass, hardship coupon, enforcement of plan limits.
- Lead-magnet email capture, early-access page, cookie settings page, feature sub-pages, French.
- AI-assisted signature difference highlights (manual compare only, by design for now).

## Known limitations

- The local store is a single encrypted JSON file kept in memory by one server process. It is for demos and development, not production or multiple instances.
- Demo accounts persist in the local store until deleted from Account settings.
- Sign-in throttling is in memory and resets on restart.
- With Partial Prerendering, unknown guide or legal slugs show the not-found page with HTTP status 200 in production (`next start`); the development server returns 404. This is how Next.js 16 streams unlisted params; the page itself is correct.
- The local encryption key sits next to the data unless `LOCAL_DATA_KEY` is set.
- Rule-based flags only catch patterns they were written for (references like "Invoice 1042", subjects like "the deposit was paid"). Real AI adds candidates but has not been evaluated.
- Guides and pathways were checked by the product team only. Small Claims facts were compared with ontario.ca on 2026-11-17; Superior Court timing is described generally because the e-Laws rule text could not be read in this environment.

## Needs the founder

1. **Supabase**: create a project in Canada (Central), run the migrations, fix anything they report, set `DATA_BACKEND=supabase` and the URL and anon key, turn on MFA.
2. **Anthropic**: an API key, a request to Anthropic sales for zero data retention, and confirmation that the chosen model is eligible (decision 0002). Until then, state the retention period on `/security` and in the AI use policy.
3. **AWS Textract**: credentials in `ca-central-1`, and an S3 bucket if multi-page scans are needed.
4. **Stripe**: account, two one-time prices, a hardship coupon, and a webhook endpoint to build.
5. **Domain and brand name**: "ReadyFile" is a working name; trademark and domain checks are not done.
6. **Lawyer review**: everything in `docs/lawyer-review-register.md`, items 1 to 5 and 13 to 16 before any private beta; the written opinion on Crown disclosure before `FEATURE_CRIMINAL_CASES` is turned on.
7. **Experts**: test the signature compare wording with a forensic document examiner and the money patterns with a forensic accountant (decision 0001 risk 4).
8. **Privacy**: a named privacy contact, a privacy impact assessment, a breach response plan, and a backup purge schedule.
9. **Insurance**: professional liability or E&O cover before public launch.
