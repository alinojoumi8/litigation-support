# 0002 Tech stack proposal

Status: ACCEPTED, Option A (founder pick, 2026-11-17).
Items marked (verify) come from memory, not from a checked source.

## What the product needs

- Marketing site (fast, good for search) and a logged-in case workspace.
- Upload and store many PDFs, scans, emails, images. Encrypted. Data stays in Canada (storage and database).
- Read scans (OCR), split pages, keep the source of every fact (page and date).
- AI: summaries, timeline, discrepancy flags. No-training, zero-retention terms. Every case citation must link to a real source (no invented cases).
- Side-by-side image compare for signatures and handwriting. Flags only.
- Background jobs (big files take minutes).
- Audit log, delete-on-request, strong login with two-step sign-in.
- Accessible (WCAG 2.2 AA).

## Option A (recommended): fast path

| Part | Choice | Why |
|---|---|---|
| App | Next.js (TypeScript) | One codebase for public site and workspace. Large community. |
| Database, login, file storage | Supabase in a Canada region (verify) | Postgres, auth, row-level security, storage in one place. Fastest to ship. |
| Search over documents | Postgres full-text plus pgvector | No extra service. |
| Background jobs | Inngest or a small worker | Retries for long OCR and AI jobs. |
| OCR | Cloud OCR in Canada (for example AWS Textract ca-central-1) (verify) | Good on scans and tables. |
| AI | Claude API with zero-retention terms (verify account terms) | Strong on long documents. Do not store prompts. |
| Hosting | Vercel for the app, plus Supabase | Simple deploys. Check app region and logging. |
| Payments | Stripe | Fixed 3-month pass fits one-time payment. |
| Email | Postmark or Resend | Transactional only. |

Trade-off: less control over data flow and more vendors. Quick to start.

## Option B: more control

Same app, but run on AWS in ca-central-1 (Postgres on RDS, S3, SQS workers, Cognito or similar), and call Claude through Amazon Bedrock if the model is offered in Canada (verify).

Trade-off: stronger story on Canadian data and fewer vendors that see data. Roughly 2 to 3 times the setup work. Needs more ops skill.

## Rules that apply to both

1. No document text in logs, error tools or analytics.
2. Encrypt at rest. Per-case access only. Audit every read.
3. AI answers carry source page links. Case law only from CanLII or official text by lookup, never from model memory.
4. Delete means delete (files, text, embeddings, backups on a schedule).
5. Criminal cases stay gated until the lawyer's disclosure opinion arrives (see decision 0001).

## Decision

Option A chosen. Move to B if the lawyer review says data must not touch other vendors.

## Checks done on 2026-11-17 (web search, check again before build)

| Claim | Result | Source |
|---|---|---|
| Supabase has a Canada region | Yes, Canada (Central) ca-central-1. A July 2026 incident hit project creation there (resolved). Confirm in the dashboard New Project form. | [Supabase regions](https://supabase.com/docs/guides/platform/regions) |
| Textract in Canada | Yes, ca-central-1 has an official endpoint. | [AWS endpoints](https://docs.aws.amazon.com/general/latest/gr/textract.html) |
| Claude zero retention | Opt-in per organization through Anthropic sales. Not automatic. Default for API is not training, but retention can be 30 days. Files API uploads stay until deleted. Some newer models need 30-day retention and are not ZDR eligible. | [Anthropic data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) |

Result for the build: pick an AI model that is ZDR eligible, or tell users plainly about the 30-day retention. Do not use the Files API for case documents. Ask Anthropic sales for ZDR before beta.
