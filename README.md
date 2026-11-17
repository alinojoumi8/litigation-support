# ReadyFile (working name)

A case preparation workspace for people in Ontario facing a court case, whether they have a lawyer or represent themselves. People upload their documents and emails and get plain-language summaries with page links, one master timeline, flags where things don't line up, tools to prepare for experts, a lawyer-ready brief, deadlines, court checklists and a short weekly plan.

**Legal information, not legal advice.** The product organizes, summarizes and flags. It never advises, predicts outcomes, generates case citations, or says a signature is forged.

> The name "ReadyFile" is a placeholder (site plan open question 8). Change it with `NEXT_PUBLIC_PRODUCT_NAME`.

## Run it

Requires Node.js 20.9 or later (developed on Node 24).

```bash
npm install
npm run dev          # http://localhost:3000
```

No accounts, keys, Docker or network services are needed. With no environment variables set, the app runs fully offline:

| Part | Default (offline) | Real adapter (opt-in) |
|---|---|---|
| Data and files | Local encrypted store in `.data/` (AES-256-GCM, git-ignored) | Supabase Postgres + Storage with RLS (`DATA_BACKEND=supabase`) |
| Sign-in | Local email and password (scrypt), hashed session tokens | Supabase Auth |
| Summaries, timeline, AI flags | Local demo extractor: deterministic rules, no AI, nothing leaves the server | Anthropic Claude (`AI_PROVIDER=anthropic`) |
| Reading scans (OCR) | Local text extraction only (text, email, digital PDF); scans and photos are not read | AWS Textract in `ca-central-1` (`OCR_PROVIDER=textract`) |
| Payments | Stub: nothing is charged | Stripe Checkout (`PAYMENTS_PROVIDER=stripe`) |

Try it: open `/sign-in` and choose **Explore the sample case**. This creates a throwaway local account with a clearly labelled, fictional sample case (documents, timeline, flags, signatures, a bank statement, deadlines).

### Other commands

```bash
npm run build        # production build (Next.js 16, Turbopack, Cache Components)
npm run start        # serve the build
npm run lint         # ESLint
npm test             # Vitest unit and integration tests
npm run typecheck    # tsc --noEmit
```

## Environment variables

All are optional and documented in [`.env.example`](.env.example). Copy it to `.env.local`. Key ones:

- `DATA_BACKEND` `local` (default) or `supabase`; `LOCAL_DATA_DIR`, `LOCAL_DATA_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_STORAGE_BUCKET`
- `AI_PROVIDER` `mock` (default) or `anthropic`; `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (default `claude-opus-5-5`)
- `OCR_PROVIDER` `local` (default) or `textract`; `AWS_REGION` (default `ca-central-1`) and the standard AWS credential variables
- `PAYMENTS_PROVIDER` `mock` (default) or `stripe`; `STRIPE_SECRET_KEY`, `STRIPE_PRICE_CASE_PASS`, `STRIPE_PRICE_CASE_PASS_PLUS`
- `FEATURE_CRIMINAL_CASES` default `false`. Criminal cases stay gated until a lawyer's written opinion on Crown disclosure (decision 0001).
- `DEMO_MODE`, `APP_BASE_URL`, `SESSION_TTL_DAYS`, `MAX_UPLOAD_MB`, `COOKIE_SECURE`

Real adapters only switch on when you choose them **and** supply credentials. A stray `ANTHROPIC_API_KEY` in your shell will not send documents anywhere unless `AI_PROVIDER=anthropic` is also set.

## Architecture in brief

- `src/app/(site)/` public marketing site, guides and DRAFT legal pages (static).
- `src/app/app/` the logged-in workspace (per-request, authorized on every page).
- `src/app/actions/` Server Actions; `src/app/api/cases/[caseId]/...` Route Handlers for upload, file serving and exports.
- `src/lib/domain/` pure, tested logic: timeline, readiness, tasks, deadlines, discrepancy finder, accounting patterns, wording guard, citation guard, authority lookup, origin rules.
- `src/lib/data/` repository interface with a local adapter and a Supabase adapter; `supabase/migrations/` SQL with row-level security.
- `src/lib/ai/`, `src/lib/ocr/`, `src/lib/payments/` provider interfaces with offline defaults and real adapters.

Full detail: [docs/architecture.md](docs/architecture.md). What is done, mocked and untested: [docs/build-status.md](docs/build-status.md). What a lawyer must review before launch: [docs/lawyer-review-register.md](docs/lawyer-review-register.md).

## Repository layout

- `docs/research/` research notes (law, users, competitors)
- `docs/planning/` the site plan (positioning, site map, features, safety rules and copy)
- `docs/decisions/` founder decisions and the stack decision
- `src/` the Next.js app
- `supabase/migrations/` database schema, RLS policies and storage policies (untested)
- `tests/` Vitest tests

## Important

- This repository is public. Never commit real case data, names or documents. Local data lives in `.data/` and `private/`, both git-ignored. The sample case is fictional and labelled as such.
- Next.js in this repo is version 16 with Cache Components. Read `AGENTS.md` and `node_modules/next/dist/docs/` before changing Next.js code.
- Fonts (Newsreader, Atkinson Hyperlegible Next) are self-hosted from `src/app/fonts/` under the SIL Open Font License.
