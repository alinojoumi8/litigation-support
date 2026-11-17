# Architecture

Date: 2026-11-17. Applies to the first end-to-end build. Stack per decision 0002 (Option A): Next.js, Supabase (Canada), Claude API, AWS Textract (ca-central-1), Stripe. Every external service sits behind an interface with an offline default.

## 1. Surfaces

| Surface | Path | Rendering |
|---|---|---|
| Public site | `src/app/(site)/` | Static (prerendered). No case data, no session reads, no trackers. |
| Auth pages | `src/app/(site)/sign-in`, `sign-up` | Static shells with Server Action forms. |
| Workspace | `src/app/app/` | Per request. Every page calls `requireUser()` or `requireCaseAccess()`. `instant = false` on each segment. |
| Route Handlers | `src/app/api/cases/[caseId]/...` | Upload (POST), original file, ZIP export, timeline CSV, calendar (ICS). |
| Proxy | `src/proxy.ts` | Optimistic redirect to `/sign-in` when no session cookie. Not an authorization layer. |

Next.js 16 notes (see `AGENTS.md`): Cache Components is on. Data access calls `requestTime()` (`src/lib/request.ts`, which awaits `connection()`) so no case data or clock value is ever prerendered or prefetched. Session-dependent UI in shared layouts sits inside `<Suspense>`. `params` and `searchParams` are promises.

## 2. Layers

```
src/lib/domain/      pure logic, no I/O (unit-tested)
src/lib/auth/        authz rules (pure), password hashing, auth providers, request guards
src/lib/data/        Repository + BlobStore interfaces; local and Supabase adapters
src/lib/ai/          AIProvider interface; mock (local rules) and Anthropic adapters; output guards
src/lib/ocr/         TextExtractor interface; local extraction (text, EML, digital PDF) and Textract
src/lib/payments/    PaymentProvider interface; stub and Stripe Checkout
src/lib/services/    orchestration: ingest, summarize, refresh flags, case overview
src/lib/content/     human-written guides, pathways, legal drafts (static)
src/lib/sample/      the fictional sample case
```

Adapter selection is in `getData()`, `getAuth()`, `getAI()`, `getExtractor()` and `getPayments()`. Real adapters are used only when the matching `*_PROVIDER` / `DATA_BACKEND` variable is set and credentials exist.

## 3. Data model

Defined once in `src/lib/domain/types.ts` and mirrored in `supabase/migrations/20261117000001_schema.sql`.

- `cases` and `case_members` (roles: owner, editor, viewer).
- Case-scoped collections, all keyed by `(case_id, id)`: `documents`, `document_pages`, `document_summaries`, `timeline_events`, `flags`, `signature_comparisons`, `transactions`, `deadlines`, `questions`, `task_completions`, `pathway_progress`, `exports`.
- `audit_log` (ids and action names only, append-only), `profiles`, `contact_messages`.

Source anchoring (site plan 5.3): every document has a stable per-case sequence number (`Doc 0007`) and numbered pages. Every summary fact, timeline event and flag stores the document id and page. Quotes are stored only when they appear verbatim on that page.

## 4. Document pipeline

1. **Upload** (`POST /api/cases/[caseId]/documents`): same-origin check, `checkCaseAccess(caseId, "upload")`, zod-validated origin label (required), up to 10 files, size limit, extension **and** magic-byte check (`src/lib/files.ts`). SVG and HTML are refused.
2. **Extract** (`TextExtractor`): text and CSV paginated; EML parsed (headers, multipart, quoted-printable, attachment names); digital PDFs via `unpdf`; images get no text unless Textract is on.
3. **Store**: original bytes in the BlobStore, document row, page rows.
4. **Summarize** (`AIProvider.summarize`): output passes `guardSummary` (citation guard, wording guard, verbatim-quote check, page check). Stored with provider, model and prompt version.
5. **Timeline**: dated events become unconfirmed AI-draft events. Re-summarizing keeps anything the user confirmed or wrote.
6. **Flags** (`refreshFlags`): the rule-based finder always runs; with an external AI it also adds guarded AI candidates. Fingerprints keep review status and notes across re-runs.

The sample case always uses the local extractor, so it is deterministic and never sent to an external AI.

## 5. Safety guards (code, not just copy)

| Guard | File | What it enforces |
|---|---|---|
| Wording guard | `src/lib/domain/wording.ts` | No "forged", "fake", "fraud", "proof", verdicts or match percentages in generated text, flags, notes or examiner notes. Negation-aware. Mandatory disclaimer strings live here. |
| Citation guard | `src/lib/domain/citations.ts` | Removes neutral citations, report citations, case names ("X v. Y"), section, rule and regulation references not on the curated list. Inserts "verify before filing". |
| Authority lookup | `src/lib/domain/authorities.ts` | The only source of legal links: a curated list of official URLs (checked to resolve on 2026-11-17). Anything else becomes a CanLII search link marked "verify before filing". |
| Marketing copy check | `tests/copy.test.ts` | Fails the build's test run if public copy uses banned phrases ("robot lawyer", "guaranteed", "win your case", "replace your lawyer"...). |
| Origin rules | `src/lib/domain/origin.ts` | Undertaking reminder for "From the other side", privilege warning for "From my lawyer", default exclusion from expert packages, Crown disclosure only for gated criminal cases. |
| Criminal gate | `FEATURE_CRIMINAL_CASES` | Off by default: criminal case creation shows the disclosure gate and help links only. When on, three acknowledgments are required and recorded. |

## 6. Security

- **Authorization**: `canPerform()` (pure, tested) behind `requireCaseAccess()` / `checkCaseAccess()` in every page, Server Action and Route Handler. Unknown or foreign case ids return 404. Ids must match `^[A-Za-z0-9_-]{8,64}$`. With Supabase, RLS (`is_case_member()`) is a second layer.
- **Input validation**: zod on every action and route; file type and size checks; CSV formula-injection neutralised in exports.
- **Sessions (local)**: 32-byte random token in an http-only, SameSite=Lax cookie; only its SHA-256 is stored; 14-day expiry. Passwords use scrypt. Sign-in attempts are throttled in memory (5 per 15 minutes per email).
- **CSRF**: Server Actions use Next.js origin checks; the upload route checks `Origin` against `Host`.
- **Headers** (`next.config.ts`): `nosniff`, `Referrer-Policy: no-referrer` (case URLs never leak to linked sites), `X-Frame-Options: SAMEORIGIN`, a CSP restricting framing, objects, base URI and form targets, `Cache-Control: private, no-store` on the workspace. Original files are served with `default-src 'none'` and `Cache-Control: no-store`.
- **No content in logs**: `src/lib/logger.ts` only writes allowlisted keys with id-like values. Errors are logged by class and status only. The Claude adapter logs model, duration and stop reason, never text.
- **Audit log**: document views, file views and downloads, exports, uploads, edits, flag reviews and deletions, by record id.
- **Encryption at rest (local)**: AES-256-GCM for the store and every blob. The key sits next to the data unless `LOCAL_DATA_KEY` is provided, so this protects against casual copying only.
- **Deletion**: deleting a document removes its file, pages, summary, events, flags and comparisons. Deleting a case removes every row in every case table and the case's file directory. Deleting an account removes every owned case. Covered by `tests/integration.test.ts`.

## 7. AI provider details

- `AnthropicProvider` (`src/lib/ai/anthropic.ts`) uses `client.beta.messages.parse` with Zod structured output, `output_config.effort: "medium"`, model from `ANTHROPIC_MODEL` (default `claude-opus-5-5`), and server-side refusal fallback (`fallbacks: "default"`). Document text is sent in the request body only; the Files API is never used. Long documents are split into chunks rather than truncated.
- The system prompt forbids advice, predictions, citations and conclusions, requires page numbers and verbatim quotes, and treats document text as data. The guards above still run on every output.
- Retention: per decision 0002, zero data retention must be requested from Anthropic and the chosen model must be eligible before real documents are processed. Until then, `/security` must state the retention period.

## 8. Accessibility and design

WCAG 2.2 AA target: semantic landmarks and headings, skip link, visible focus outlines, labels and error text tied to inputs, 24px+ targets, icon plus text for every status (never colour alone), reduced-motion support, keyboard operation of the signature compare tool (arrow keys pan, plus and minus zoom, buttons for every pointer action). Palette: warm paper, deep ink, spruce for actions, ochre for flags, brick red only for passed deadlines and destructive actions. Type: Newsreader (display) and Atkinson Hyperlegible Next (text), self-hosted. Printable packages repeat the disclaimer in a running header and footer on every printed page.

## 9. Testing

`npm test` runs Vitest: domain logic, guards, authorization, deadlines, tasks, extraction, ZIP, accounting, discrepancy finder, upload validation, email parsing, password hashing, public-copy checks, and an integration test that seeds the sample case through the full local pipeline and verifies that deleting really deletes. Browser end-to-end tests (Playwright) are not included; see `docs/build-status.md`.
