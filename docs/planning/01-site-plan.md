# 01 Site plan

Date: 2026-11-16. Status: draft v1 for founder review.
Jurisdiction assumption: Ontario, Canada. Civil first, criminal later (see Decisions).
This is a product plan, not legal advice. Legal points come from secondary sources unless marked otherwise.

Builds on `docs/research/01-market-and-competitors.md` and `docs/research/02-legal-and-risk.md`.

## Labels used in this plan

| Label | Meaning |
|---|---|
| **[LR]** | Needs review by an Ontario lawyer before launch |
| **[H]** | Hypothesis. Test it before relying on it |
| **[UV]** | Unverified. Check the primary source |
| **[S#]** | Source number in the Sources list at the end |

`[Product]` stands in for the brand name, which is not chosen yet.

## Summary

- **What it is:** a case preparation workspace. It turns a pile of emails and documents into an organized, checked, source-linked case file.
- **Who it serves:** (1) people with a lawyer who end up doing the legwork, and (2) people representing themselves. Lawyers are a secondary audience and a later channel.
- **Core promise:** preparation, not prediction. We organize, summarize, flag and explain process. We never advise, predict outcomes, or claim forgery or fraud.
- **Smallest first launch:** upload, summaries, master timeline, discrepancy flags, lawyer-ready brief export, and a "This week" plan, for Ontario civil matters, as a private beta.
- **Biggest risks:** crossing from legal information into legal advice, invented citations, mishandling privileged or undertaking-bound documents, and overclaiming in marketing.

---

## 1. Positioning

### 1.1 Category

Call it a **case preparation workspace**. Avoid "legal AI", "AI lawyer" and "legal assistant", which suggest legal services.

| We are | We are not |
|---|---|
| A place to organize and understand your own case file | A law firm or a lawyer |
| A first-pass checker that flags things worth a closer look | A forensic expert or a source of findings |
| A prep tool that makes lawyer and expert time count | A replacement for a lawyer or an expert |
| Plain-language process information with official sources | Advice on what to file, say or decide |

### 1.2 Positioning statement

For people in Ontario facing a civil court case, whether they have a lawyer or are representing themselves, `[Product]` is a case preparation workspace. It turns emails and documents into an organized file with summaries, a master timeline and flags for things that do not line up. Every line links back to the source page. Legal chatbots give answers. `[Product]` does not give advice or predict outcomes. It helps you do the prep work properly, so your lawyer, an expert or the court can understand your facts faster.

### 1.3 One-line promise

| Audience | One-line promise |
|---|---|
| Master (all) | Turn your pile of emails and documents into an organized, checked case file, and walk into every meeting prepared. |
| Clients with a lawyer | Give your lawyer a file they can use on day one: a timeline, a document index and your questions, each linked to the source. |
| Self-represented people | Representing yourself in Ontario? Get organized, keep every deadline in view, and follow a clear weekly plan, in plain language with links to official sources. |
| Lawyers (secondary) | Clients who arrive organized: a standard chronology and document index, with every entry linked to the source page. |

### 1.4 Messaging pillars

1. **Preparation is a habit.** Small weekly steps beat last-minute panic.
2. **Your facts, in order.** One timeline, one index, every claim sourced.
3. **Spend on experts when it counts.** Know what to ask before you pay.
4. **Plain words, real sources.** Nothing invented. Everything checkable.

### 1.5 Five headline and tagline options

All five avoid outcome promises, "robot lawyer" and "replace your lawyer". DoNotPay agreed to an FTC order that bars it from claiming its service performs like a lawyer without evidence [S1].

| # | Line | Best use | Risk check |
|---|---|---|---|
| 1 | **Walk in prepared.** | Hero headline, brand line | Low. Promises preparation, not results. |
| 2 | **Your case, in order.** | Product description, app store, ads | Low. Describes organization. |
| 3 | **Preparation is your advantage.** | Discipline theme, "This week" feature | Low. "Advantage" is general, not a win claim. Do not pair it with outcome stats. |
| 4 | **Know your case inside out.** | Self-represented audience, content | Low. About the user's knowledge, not the product's power. |
| 5 | **Find what doesn't add up, before you pay an expert.** | Discrepancy and expert-prep features | Medium-low. Implies cost sense, not a savings guarantee. Never add "and save $X" without evidence. [LR] |

**Rejected lines (do not use):** "Win your case", "Your AI lawyer", "Fire your lawyer", "Court-ready in minutes", "Catch the forger", "Stop paying lawyers to read". Each one either promises an outcome, implies legal services, alleges wrongdoing, or attacks the lawyers we need as allies.

### 1.6 Words we use and avoid

| Use | Avoid |
|---|---|
| prepare, organize, check, flag, review | win, beat, guarantee, destroy |
| "worth a closer look", "possible difference" | forged, fake, fraud, proof, evidence of guilt |
| information, process, options to ask a lawyer about | advice, "you should", "your best move" |
| "show this to an examiner or accountant" | "our analysis shows", "expert-grade" |
| readiness, organized, complete | "case strength", "chance of success" |
| "linked to the source page" | "100% accurate", "court-approved" |

---

## 2. Personas and jobs to be done

These are composites for planning. They are not real people or real cases.

### P1. The Legwork Client (primary paying audience)

- Has a lawyer in a document-heavy civil matter: a business dispute, money claims, or an asset-freeze (Mareva) motion on either side.
- Holds thousands of emails, bank statements, contracts and scans. Pays hourly or has paid a large retainer.
- Feels the lawyer does not have time to read everything. Ends up sorting, reading and explaining the file, and wonders whether to pay for a forensic accountant or a document examiner.

| When I... | I want to... | So I can... |
|---|---|---|
| get a dump of documents or disclosure | sort, summarize and date everything fast | stop drowning and see the story |
| meet my lawyer | hand over a clear chronology, index and my questions | use paid time on strategy, not catch-up |
| notice something odd (dates, amounts, a signature) | record it with the source pages | raise it properly and not lose it |
| think about hiring an expert | know what to ask and what they need | spend only where it matters |
| wait for my lawyer | see what is done and what is next | stay in control without nagging |

### P2. The Self-Rep (largest need, price-sensitive)

- Representing themselves in an Ontario civil matter. Could not afford, or ran out of money for, a lawyer. Cost is the most common reason people self-represent [S11].
- Overwhelmed by process, forms and deadlines. Afraid of missing something. May book a limited-scope lawyer for parts of the case [S8].

| When I... | I want to... | So I can... |
|---|---|---|
| start or receive a claim | see the steps ahead in plain language | know where I am and what comes next |
| face a deadline | have it in one place with reminders | never miss one |
| prepare evidence | organize documents into a timeline and index | present my facts clearly |
| book a limited-scope consult | bring a tight brief and questions | get the most from one paid hour |
| feel stuck | get a short, doable plan for this week | keep moving without burning out |

### P3. The Busy Litigator (secondary audience, later channel)

- Sole or small-firm Ontario civil litigator. May offer limited-scope retainers, which Ontario's conduct rules allow if confirmed in writing [S8, UV].
- Wants client material in a standard format. Distrusts AI legal conclusions. Cares about confidentiality, privilege and accuracy. The LSO's generative AI guidance focuses on confidentiality and privilege [S5b].

| When I... | I want to... | So I can... |
|---|---|---|
| take a new client | receive a consistent chronology and index with source links | assess the file faster |
| prepare for a motion or discovery | check facts against source pages quickly | trust what I'm relying on |
| work with a self-rep on limited scope | see their file before the meeting | scope the job and quote fairly |

---

## 3. Site map and menu structure

Two separate surfaces:
- **Public marketing site:** explains, educates, builds trust, captures sign-ups. No user case data ever.
- **Logged-in case workspace:** private, per case. Separate subdomain or path, no third-party ad trackers, no case data in URLs.

### 3.1 Public site: top navigation

`How it works` · `With a lawyer` · `Representing yourself` · `For lawyers` · `Learn` · `Pricing` · `Safety` · `Sign in` · **[Start free]**

On mobile, keep `Start free` and `Sign in` visible and put everything else in the menu.

### 3.2 Public site: pages

| Page | URL (suggested) | Purpose |
|---|---|---|
| Home | `/` | Hook, pain, how it works, trust, sign-up |
| How it works | `/how-it-works` | 4-step walkthrough with screenshots and a 2-minute video |
| Features | `/features` + one sub-page each: organize, timeline, flags, expert prep, lawyer brief, weekly plan | Detail for comparison shoppers and search engines |
| With a lawyer | `/with-a-lawyer` | Persona P1 landing page: get value from billed hours |
| Representing yourself | `/representing-yourself` | Persona P2 landing page: pathways, deadlines, weekly plan |
| For lawyers | `/for-lawyers` | P3: what clients can bring you, security and confidentiality, sample brief |
| Learn hub | `/learn`, `/learn/[guide]` | Guides, checklists, glossary, process maps (content strategy, section 6) |
| Checklists and templates | `/checklists` | Lead magnets, gated by email (optional) |
| Pricing | `/pricing` | Plans, limits, FAQ, hardship option |
| Safety and trust | `/safety` | What we do and don't do, how AI output is checked, data handling, citation policy |
| Get help now | `/get-help` | Legal aid, duty counsel, LSO Referral Service, court help links. Urgent situations. |
| About | `/about` | Mission, founder story (general terms only), advisors (when real) |
| FAQ | `/faq` | Legal advice question, privacy, lawyers, signatures, coverage |
| Contact | `/contact` | Support and press. No case details through this form. |
| Waitlist / early access | `/early-access` | Phase 0 and 1 capture |
| Legal pages | `/legal/terms`, `/legal/privacy`, `/legal/disclaimer`, `/legal/ai-use`, `/legal/cookies` | Lawyer-written [LR] |
| Accessibility statement | `/accessibility` | Standard, known issues, contact for help |
| Security | `/security` | Encryption, hosting location, access controls, breach process |

### 3.3 Public site: footer

| Column | Links |
|---|---|
| Product | How it works, Features, Pricing, Safety and trust, Security |
| Who it's for | With a lawyer, Representing yourself, For lawyers |
| Learn | Guides, Checklists, Glossary, Get help now |
| Company | About, Contact, FAQ |
| Legal | Terms, Privacy, Disclaimer, AI use policy, Accessibility, Cookie settings |

Footer line on every page: *"`[Product]` provides legal information and organization tools. It is not a law firm and does not provide legal advice. For advice about your situation, speak to a lawyer or licensed paralegal."* [LR]

### 3.4 Logged-in workspace: navigation

Top bar: case switcher · search (full text) · **Upload** · help · account.

Left navigation, per case:

| Item | Purpose |
|---|---|
| **This week** (home) | 3 to 5 tasks, readiness score, upcoming deadlines, new flags to review |
| Case overview | Court, stage, parties, key dates, the user's own one-page summary |
| Documents | All files with source IDs, summaries, tags, origin labels (see 7.4) |
| Timeline | Master chronology. Every event links to its source page. Confirm or edit. |
| People and entities | Names, roles, accounts, aliases. Feeds the timeline and flags. |
| Flags | Tabs: Discrepancies · Signatures (Phase 2) · Money (Phase 2). Review status on each. |
| Deadlines | Dates, reminders, the source document for each date |
| Packages | Lawyer brief · Expert prep package · later: Hearing binder |
| Notes and questions | Running list of questions for the lawyer or expert |
| Guides | Pathway and checklists for this case type, in context |
| Settings | Case details, sharing, privacy, export everything, delete case |

Account menu: profile, security (MFA), billing, notification settings, data and deletion, sign out.

---

## 4. Home page

### 4.1 Section order

| # | Section | Job |
|---|---|---|
| 1 | Hero | Say what it is and for whom in 5 seconds; one primary action |
| 2 | Three pain points | "This is me" recognition |
| 3 | How it works (4 steps) | Show it is simple and concrete |
| 4 | Product glimpse | Timeline with a flag, every line linked to its source |
| 5 | Discipline band | Weekly plan and readiness score; preparation as a habit |
| 6 | Two audiences | Split: "Have a lawyer?" and "Representing yourself?" plus a small lawyer link |
| 7 | Trust and safety | What we do and won't do; data handling |
| 8 | Lead magnet | Free Case Readiness Checklist |
| 9 | FAQ (5 questions) | Handle objections |
| 10 | Final call to action | Start free |
| 11 | Footer with disclaimer | Legal information line, help links |

### 4.2 Draft copy

**Hero**

- Eyebrow: *For people facing a civil court case in Ontario*
- Headline: **Walk in prepared.**
- Subhead: *`[Product]` turns your emails and documents into an organized case file: plain-language summaries, one master timeline, and flags where things don't line up. Every line links to the page it came from. Bring it to your lawyer or your expert, or use it to represent yourself.*
- Primary button: **Start your case file, free**
- Secondary link: *See how it works (2 min)*
- Under the buttons: *Organization tools and legal information. Not a law firm. Not legal advice.*
- Trust row, only once each item is true: *Stored in Canada · Encrypted · Never used to train AI · Delete anytime*
- Visual: timeline screenshot with a flag card reading "Possible date mismatch: Doc 0142 p.3 vs Doc 0388 p.1". Fictional data only.

**Three pain points**

1. **Your case is buried in your inbox.**
   *Thousands of emails, statements, contracts and scans. The facts are in there, and it's usually you who has to dig them out.*
2. **Explaining your case takes paid time.**
   *Lawyers are busy and bill for their time. Hours spent catching up on a messy file are hours not spent on your case. A clear file helps everyone get to the point.*
3. **Experts are expensive. Go in knowing what to ask.**
   *Forensic accountants and document examiners charge for their time. Know what you want them to look at, and why, before you hire one.*

**How it works**

1. **Upload.** *Add emails, PDFs, photos and statements. Scans work too.*
2. **Organize.** *Get a plain-language summary of each document and one master timeline. Every line links to the page it came from.*
3. **Check.** *See flags where dates, amounts, names or signatures don't line up. You review each one and decide what matters.*
4. **Prepare.** *Export a brief for your lawyer or a prep package for an expert. Follow a short plan each week.*

**Discipline band**

- Heading: **Preparation is a habit.**
- Body: *Thirty minutes a week. A short list of what to do next. A clear view of what's done. People who prepare steadily walk into meetings and hearings calm and ready.*
- Readiness meter visual, with this caption always visible: *Readiness shows how organized your file is. It does not measure your chances in court.*

**Two audiences**

- **Have a lawyer?** *Make every billed hour count. Hand over a chronology, a document index and your questions in one package.* → `With a lawyer`
- **Representing yourself?** *Step-by-step checklists for Ontario courts, linked to official sources. Every deadline in one place. A plan for this week.* → `Representing yourself`
- Small link: *Are you a lawyer? See what your clients can bring you.* → `For lawyers`

**Trust and safety**

- Heading: **Built to inform. Never to replace your lawyer.**
- **Information, not advice.** *We organize and explain. We don't tell you what to file or predict how your case will go.*
- **Every line has a source.** *Summaries link to the exact page. Legal information links to the official text.*
- **No invented case law.** *We don't generate case citations. Anything legal we show links to an official source.*
- **Flags, not findings.** *We point out things worth a closer look. Only a qualified expert can give an opinion on a signature or the accounts.*
- **Your file is yours.** *Encrypted, stored in Canada, never used to train AI, deleted when you ask.* (Each claim conditional on Decision 4 and the security build.)
- Link: *Read our safety and trust commitments →*

**Lead magnet**

- **Free: the Case Readiness Checklist.** *25 things to have in order before your next meeting with a lawyer, an expert or the court.* [Get the checklist]

**FAQ (home page short list)**

1. Is this legal advice? *No. It's an organization tool with general legal information. For advice about your situation, speak to a lawyer or licensed paralegal.*
2. Will it replace my lawyer? *No. It helps you and your lawyer work faster with a clearer file.*
3. Can it tell if a signature is forged? *No. It can help you put the documents side by side and note visible differences to show a qualified document examiner. Only an examiner can give an opinion.*
4. Is my data safe? *Short answer plus a link to `/security`.*
5. What does it cover? *Ontario civil matters at launch. Other areas later.*

**Final call to action**

- Heading: **Your case deserves your best preparation.**
- Button: **Start your case file, free** · Secondary: *Get the free checklist*

---

## 5. Product features

### 5.1 MVP (Phase 1), in build order

| # | Feature | What it does | Guardrails |
|---|---|---|---|
| 1 | **Case setup and intake questions** | Court, case type, stage, the user's role, represented or not, key dates. Drives pathways, the weekly plan and disclaimers. | No eligibility or merit questions. Criminal cases are blocked at launch with a "coming later / get help now" screen. |
| 2 | **Document and email intake** | PDF, images (OCR), DOCX, XLSX/CSV, EML/MSG/MBOX. Removes duplicates, splits attachments, assigns a stable source ID per document and page, auto-tags type and date. | Ask for the document's origin at upload (see 7.4). Size and page caps per plan. Virus scan. |
| 3 | **AI summaries with source links** | Short plain-language summary per document plus key facts (who, what, when, amounts). Each fact links to the page. | Labelled "AI draft, check against the source". No legal characterization ("this proves", "this is a breach"). |
| 4 | **Master timeline** | Pulls dated events from all documents into one chronology. Filter by person, issue or tag. User confirms, edits or merges events. | Unconfirmed events look different. Exports show the confirmed/unconfirmed status. |
| 5 | **Discrepancy finder v1** | Flags date conflicts, amount mismatches, name or role inconsistencies, contradictions between statements, missing attachments, gaps in email threads, and differences between two versions of the "same" document. | Each flag shows both sources side by side. Status: New · Matters · Not an issue · Ask lawyer. Wording: "possible inconsistency". No severity or "suspicious" labels. |
| 6 | **Lawyer-ready brief package** | Cover sheet, the user's one-page summary, chronology, document index, key people, flags marked "Matters", questions for the lawyer, AI-use statement. PDF + DOCX + CSV + zip of sources with IDs. | Header and footer disclaimer on every page. AI-generated parts are marked. User must review before export (checkbox). |
| 7 | **Discipline layer v1** | **This week:** 3 to 5 tasks of 10 to 30 minutes each, built from gaps, stage and deadlines. **Readiness score:** transparent checklist (documents labelled, timeline confirmed, flags reviewed, deadlines entered, questions written, brief exported). **Weekly check-in** email with a no-guilt restart. | Score measures file organization only. Caption always visible. No streak shaming. Tasks never tell the user to file or argue anything. |
| 8 | **Deadlines tracker v1** | User-entered dates (from orders, notices, the lawyer). Reminders at 14, 7, 2 and 1 days. Each date links to its source document. Calendar export. | No automatic deadline calculation in the MVP. Copy: "Confirm every deadline with the court office or your lawyer." |
| 9 | **Self-rep guided pathway v1** | One pathway for the most common civil route found in interviews (default: Small Claims Court [H]). Step map, "you are here", checklists, official links (ontario.ca, ontariocourts.ca, CLEO Steps to Justice). | Human-written and lawyer-reviewed [LR]. "Last reviewed" date on every page. No form-filling advice. |
| 10 | **Signature and handwriting "flag for examiner" v1 (manual)** | Side-by-side viewer for questioned and known samples: zoom, overlay with an opacity slider, rotate, grid. User notes what looks different. Builds an examiner intake sheet listing which originals exist and the dates and sources of known samples. | No AI verdict, no "match %" score. Copy: "Differences can have innocent causes, such as age, health, pen, surface or scan quality. Only a qualified examiner can give an opinion." |
| 11 | **Expert-referral prep package v1** | Templates for a document examiner and a forensic accountant: neutral background, the documents to examine, the questions to answer, the timeline extract, chain-of-custody notes. | Neutral wording, no conclusions written for the expert. In Ontario civil cases experts owe a duty to the court to be fair, objective and non-partisan (Rules of Civil Procedure r. 4.1.01) [S9, UV]. If the user has a lawyer, the lawyer should retain the expert [LR]. |

The smallest first launch is items 1 to 7. Items 8 to 11 complete the MVP. See section 9.

### 5.2 Later (Phase 2 and 3), in order

| # | Feature | Notes and guardrails |
|---|---|---|
| 12 | **Accounting pattern flags** | Parse statements into a transaction table, check opening and closing balances, flag round amounts, repeats, transfers between user-tagged related parties, gaps in statement periods, cash clusters, transactions near key timeline dates, and amounts that differ between documents. Output: "Questions for a forensic accountant" plus clean tables. Copy: "A pattern, not proof." Never "fraud detected". |
| 13 | **AI-assisted signature difference highlights** | Points out visible differences (size, slant, spacing, letter forms) for the user to bring to an examiner. Still no score, no verdict. Validate with a forensic document examiner first. |
| 14 | **Secure share with lawyer or expert** | Read-only link or invited account, comments, document requests, an access log, and revoke at any time. A confirmation dialog on every share, aware of undertakings (7.4). |
| 15 | **More self-rep pathways** | Defending a Superior Court civil action, responding to a motion, an injunction explainer (information only). Pathways must be versioned for Ontario's Civil Rules Review changes [S12, UV]. |
| 16 | **Rule-based deadline helpers** | Calculators backed by lawyer-reviewed rule tables. Show the rule text, holidays and court-ordered overrides, plus "confirm with court" [LR]. |
| 17 | **Hearing prep** | Exhibit list builder, "explain your case in 2 minutes" practice, a question bank for your own testimony. Information only. |
| 18 | **Lawyer and firm workspace** | Multiple clients, a standard intake link, the firm's own template for the brief. Feeds business model B. |
| 19 | **Criminal mode** | Only after a lawyer's opinion on Crown disclosure handling [LR]. Likely "with counsel" use first, with strict sharing locks. |
| 20 | **French, then family law** | Ontario has French-language court services. Family law has very high self-representation (58% in StatCan 2019/2020 data, per research doc 01). |
| 21 | **Lawyer directory (limited-scope)** | Only if it fits LSO rules on referral fees and advertising. Lawyers may not pay referral fees to non-licensees (Rule 3.6-7, secondary sources) [S10, UV, LR]. |

### 5.3 Technical requirements (no stack chosen)

- **Ingestion:** OCR for scans and photos; email parsing (EML, MSG, MBOX) with attachments; large uploads (thousands of pages) with resumable upload and background processing; duplicate detection.
- **Source anchoring:** a stable ID for every document and page; every AI fact stores the document ID, page and text span so it can link back.
- **AI layer:** structured outputs; grounded only in the user's documents and a curated official-source set; refusal rules for advice and outcome questions; citation-pattern blocker (7.2); model and prompt version stored with every output.
- **Evaluation:** test corpus of fictional documents only, kept in the repo; accuracy checks for date extraction, timeline, flags and summaries before each release. No real case data in git, ever.
- **Security:** encryption in transit and at rest; MFA; per-case access control; audit log of every view, share and export; staff access only via a user-granted, time-limited support toggle; no case content in application logs or analytics.
- **Data residency and AI processing:** per Decision 4. Vendors must offer no training on inputs and short or zero retention.
- **Deletion:** delete a case or account including derived data (summaries, indexes, embeddings) and backups on a documented schedule.
- **Exports:** tagged, accessible PDF; DOCX; CSV; zip with source IDs; disclaimer headers and footers.
- **Search:** full text plus meaning-based search across a case.
- **Accessibility and i18n:** WCAG 2.2 AA; text strings externalized for French.
- **Cost control:** page caps per plan, usage metering, rate limits, alerts on AI and OCR spend.
- **Ops:** backups, observability without content, feature flags (for pulling a risky feature fast), status page.

---

## 6. Content strategy

### 6.1 Educational pillars

| Pillar | Goal | Example topics |
|---|---|---|
| Preparation and discipline | Own the "prepared litigant" idea | Weekly habits, meeting prep, staying organized under stress |
| Evidence organization | Search traffic and product fit | Timelines from email, document indexes, labelling disclosure |
| Working with your lawyer | Ally with lawyers, serve P1 | What to bring, limited-scope retainers, asking good questions |
| Representing yourself in Ontario | Serve P2 with official sources | Process maps, glossary, court help links |
| Experts: when and how | Unique to us | What document examiners and forensic accountants need |
| Using AI safely in court | Trust and authority | Court AI practice directions, verifying citations, disclosing AI use |

### 6.2 Ten starter guides

1. The Case Readiness Checklist: 25 things to have in order before you meet your lawyer
2. How to build a timeline of your case from your inbox, step by step
3. How to write a one-page case summary your lawyer can use
4. Before you hire a forensic accountant: what to gather and what to ask
5. A signature looks "off": what a document examiner needs from you
6. Representing yourself in Ontario Small Claims Court: a plain-language roadmap
7. Using AI for your court case in Ontario: what the courts now expect [S3, S4]
8. Limited-scope lawyers: how to get help with just part of your case [S8]
9. Documents from the other side: what the "deemed undertaking" means for you [S6] [LR]
10. The 30-minute weekly prep habit that keeps your case on track

Every legal guide: an Ontario lawyer reviews it before publishing [LR], with a named reviewer and date shown (only when real), a "last reviewed" date, links to primary sources, and a "this is general information" box at the top.

### 6.3 Lead magnets

| Magnet | Format | Leads to |
|---|---|---|
| Case Readiness Checklist | PDF + 7-day email course | Free sign-up |
| Timeline template | Spreadsheet | "Do this automatically" call to action |
| Lawyer meeting prep sheet | 1-page PDF | Lawyer brief feature |
| Expert intake checklist | PDF (examiner and accountant versions) | Expert prep feature |
| Readiness self-check | 10-question quiz giving an organization score and 3 next steps | Sign-up. Must not score case merits. |

### 6.4 Tone of voice

A calm, firm coach. Plain words. Respectful of lawyers, courts and the other side.

| Do | Don't |
|---|---|
| Short sentences, grade 8 reading level or lower on public pages | Legal jargon without a plain explanation |
| "Here's what to do this week" | "You must act now or lose everything" |
| Name the stress, then give a next step | Fear marketing, countdown timers |
| Credit lawyers and experts | Lawyer-bashing |
| "Possible", "worth a closer look" | "Proof", "caught", "exposed" |
| Encourage: "Pick up where you left off" | Shame: "You've missed 3 weeks" |

### 6.5 Trust signals

- Lawyer-reviewed badge on guides, with reviewer name and date (only when real).
- Sources on every legal statement; "last reviewed" dates.
- A `/safety` page with plain commitments and a list of what we don't do.
- A `/security` page: hosting location, encryption, access controls, breach process.
- Founder story in general terms: lived experience as a litigant, no case details.
- Real testimonials only, with written consent, no case details and no outcome claims. Fake or incentivized reviews raise deceptive-marketing risk [LR].
- Partner logos (legal clinics, NSRLP and similar) only with written permission.
- An accessibility statement with a human contact.

---

## 7. Safety and compliance: product rules and UI copy

Every UI string in this section is a draft for lawyer review [LR].

### 7.1 Legal information vs legal advice

Ontario restricts the practice of law and provision of legal services to licensees. Applying the law to a person's facts is the risky line (research doc 02, section 1).

**Product rules**

1. The product organizes, summarizes, flags, and explains general process with official links. It does not recommend actions, strategies, filings or arguments, and does not predict outcomes.
2. The AI refuses and redirects questions like "should I", "will I win", "what motion", "what should I say". It offers what it can do instead.
3. Pathway content is human-written, lawyer-reviewed and static. The AI may point to it but does not create new legal guidance.
4. Every AI output carries a visible "AI draft" label and a source link.
5. Advice-seeking prompts and refusals are logged (without content where possible) to tune the guardrails.
6. If a lawyer opinion says any feature crosses the line, put it behind a feature flag and pull it.

**UI copy**

- Persistent badge in the app header: *Legal information, not legal advice.*
- Refusal: *I can't tell you what to do in your case or predict how it will go. I can show you what your documents say, explain the general process with links to official sources, and help you write questions for a lawyer. [Add to my questions for a lawyer]*
- Help link: *Need advice about your situation? [Find a lawyer or legal help]*

### 7.2 Preventing invented citations

Ontario now requires certification of the authenticity of authorities cited in factums and expert reports (O. Reg. 384/24, from Dec 1, 2024) [S2]. A 2026 amendment reportedly extends this to the accuracy of quotations (O. Reg. 275/26, from Sept 1, 2026) [S3, UV]. The Superior Court issued AI practice directions for civil and family matters (Nov 2025) and for criminal matters (Feb 2026) [S4, UV]. Courts have refused to rely on a factum with AI problems (RSR Road Surface Recycling v. Bonnechere Excavating, 2026 ONSC 698) [S4, UV]. The Federal Court requires a declaration when generative AI content is in a filing [S5, UV]. That is federal, not Ontario.

**Product rules**

1. **No legal research feature in the MVP.** The AI does not produce case law or statute citations at all.
2. When legal sources appear (pathways, guides), they come from a curated, human-maintained list with links to CanLII, e-Laws or court sites.
3. An output filter blocks any text matching citation patterns (neutral citations, report citations, "v.", section references) that is not in the curated list. Blocked output is regenerated without it.
4. Quotes from any source (including the user's own documents) must match the source text exactly, or they are shown as paraphrase.
5. Exports include an **AI-use statement** listing which parts were AI-generated and which the user confirmed, to help with court AI-disclosure expectations [LR].

**UI copy**

- On any legal link: *Official source. Read it yourself and check it is current before relying on it.*
- On export: *Before you file anything with a court, check every fact against its source page. Courts in Ontario expect you to confirm that what you file is accurate.* [LR]

### 7.3 Mandatory disclaimers: where and what

| Place | Copy (draft) |
|---|---|
| Sign-up (checkbox, required) | *I understand `[Product]` is an organization tool that provides legal information, not legal advice, and is not a law firm. No lawyer-client relationship is created.* |
| Site footer | See 3.3 |
| App header badge | *Legal information, not legal advice.* |
| Every AI summary or timeline entry | *AI draft. Check against the source.* |
| Discrepancy flag | *Possible inconsistency for you to review. It may have an innocent explanation.* |
| Signature compare | *This tool helps you compare documents visually. It cannot tell whether a signature is genuine. Only a qualified forensic document examiner can give an opinion.* |
| Money flags (Phase 2) | *Patterns worth asking an accountant about. A pattern is not proof of wrongdoing.* |
| Readiness score | *Readiness shows how organized your file is. It does not measure your chances in court.* |
| Deadlines | *Confirm every deadline with the court office, the order, or your lawyer.* |
| Pathways and guides | *General information about Ontario court process. It may not fit your situation. Last reviewed: [date].* |
| Export header and footer (every page) | *Prepared by the user with `[Product]` from user-supplied documents. AI-assisted. Not legal advice. Not reviewed by a lawyer unless stated.* |
| Pricing page | *Plans pay for software tools. They do not buy legal services or advice.* |

### 7.4 Privilege and disclosure sensitivity

**What we know so far (all need lawyer review):**
- **Civil discovery:** under the deemed undertaking rule (r. 30.1.01), evidence obtained through discovery may be used only for the proceeding it was obtained in, with exceptions (for example consent, or once filed or used at a hearing) [S6, UV]. Uploading it to a prep tool for use in that same case is probably within purpose. Confirm this [LR].
- **Criminal disclosure:** secondary reports describe Ontario rulings that a deemed undertaking applies to Crown disclosure held by a self-represented accused, and an Ontario Court of Appeal decision upholding limits on access after disclosure was posted online. Ontario's digital disclosure hub also places conditions on self-represented users [S7, UV]. High risk. Criminal is out of the MVP.
- **Privilege:** uploading privileged lawyer communications to a third-party tool may risk privilege arguments [UV, LR]. The LSO's AI guidance stresses confidentiality and reviewing vendor terms [S5b].

**Product rules**

1. **Origin label at upload (required):** Mine · From the other side (disclosure or discovery) · Crown disclosure (blocked in MVP) · From my lawyer · Filed with the court · Public.
2. Origin drives handling:
   - "From the other side" and "From my lawyer" are **excluded from expert packages by default**. Adding them needs an explicit confirmation.
   - "From my lawyer" gets a "Privileged" tag and a warning before any share or export.
   - Any share or export containing "From the other side" material shows the undertaking reminder.
3. No public links. Shares go only to named, invited people, can expire, and are logged.
4. Optional export watermark: *Confidential. May be subject to undertakings or privilege.*
5. No staff access to case content without a user-granted, time-limited, logged support toggle.
6. Contract terms: confidentiality commitments, and no vendor training on user content [LR].

**UI copy**

- Upload, origin "From the other side": *Documents you received from the other side in a court case can usually only be used for that case. Don't share them outside it. [Learn more]*
- Share dialog: *You're about to share 14 documents, including 6 marked "From the other side" and 2 marked "Privileged". Only share with your lawyer or an expert working on this case. [Review list] [Share] [Cancel]*

### 7.5 Privacy and data handling

PIPEDA applies to personal information collected in commercial activity (research doc 02). It requires reporting breaches that pose a real risk of significant harm to the Privacy Commissioner, notifying the people affected, and keeping records of every breach for 24 months [S13].

**Product rules**

1. Collect only what the features need. No sale or sharing of data, no ads in the app, no third-party trackers in the workspace.
2. Encryption in transit and at rest. MFA offered at sign-up and pushed hard.
3. Data residency and AI processing location per Decision 4, stated plainly on `/security`.
4. AI vendors: no training on inputs, minimum retention, a data processing agreement.
5. User controls: export everything, delete a case, delete the account. Deletion covers derived data and has a stated backup purge window.
6. Third-party personal data: documents name other people. Use it only to serve the user's case. Never surface it across cases or accounts.
7. Before beta: a privacy impact assessment, privacy policy and terms (lawyer-written), a breach response plan, and a breach log [LR].
8. Analytics on the public site only, privacy-friendly, with cookie choices that default to declining non-essential cookies.

### 7.6 Accessibility

The AODA requires WCAG 2.0 Level AA for private organizations with 50 or more employees [S14]. `[Product]` will be smaller at first, but it targets **WCAG 2.2 AA** from day one, because the users are often stressed, tired or on a phone.

**Product rules**
- Keyboard navigation, screen reader labels, visible focus, colour contrast, no colour-only signals (flags use icon + text).
- Plain language; a glossary hover for legal terms.
- No time limits on tasks; autosave everywhere.
- Trauma-informed design: calm palette, no alarm-red except for real deadlines, no shame language, easy "pause my plan".
- Mobile-first for reading and tasks; desktop for heavy review.
- Accessible exports (tagged PDF).
- Captions and transcripts on all video.
- An accessibility statement with a human contact.

### 7.7 Marketing claims

- Any time or money saving claim needs evidence from our own data first [LR].
- No outcome stories ("she won after using..."). No "court-ready" or "court-approved".
- Comparisons with competitors must be fair and checked.

### 7.8 Urgent situations

Detect keywords at intake and in the app: in custody, hearing tomorrow, safety, violence, eviction today. Show a calm panel: *If something is happening now or very soon, get help today:* Legal Aid Ontario, duty counsel at the courthouse, the LSO Referral Service, and 911 for safety. Links on `/get-help`.

### 7.9 Lawyer review register

| # | Item | Needed before |
|---|---|---|
| 1 | Does any MVP feature amount to "providing legal services" under the Law Society Act? Especially pathways, the discrepancy finder and the brief export. | Private beta |
| 2 | Terms of use, privacy policy, disclaimer, AI use policy | Private beta |
| 3 | Disclaimer and refusal copy in 7.1 to 7.3 | Private beta |
| 4 | Deemed undertaking and use of discovery documents in the tool | Private beta |
| 5 | Privilege risk of uploading lawyer communications; how to structure the product to reduce it | Private beta |
| 6 | Expert prep package: neutral-instructions wording; lawyer-retained expert guidance | Feature launch |
| 7 | Crown disclosure handling for any criminal mode | Before criminal mode |
| 8 | Self-rep pathway content and each guide | Before publishing |
| 9 | Marketing claims, testimonials, taglines | Public launch |
| 10 | Business model B (lawyer-paid) and any directory; referral fee and advertising rules | Phase 3 |
| 11 | LSO Access to Innovation sandbox: status in 2026 and whether to apply. The pilot launched Oct 2021 for 5 years [S15]; current status unknown [UV]. | Public launch |
| 12 | Professional liability or E&O insurance for the business | Public launch |

---

## 8. Business model

Two recommended options. All prices are in CAD and are **hypotheses [H]** until interviews and the beta test them.

### Option A (recommended first): Case Pass, paid by the person

| Plan | Price [H] | Includes [H] |
|---|---|---|
| Free | $0 | 1 case, up to 100 pages, summaries, timeline, This week plan, 1 watermarked sample brief |
| Case Pass | $129 for 3 months, then $39/month if needed | Up to 2,500 pages, all MVP features, unlimited exports |
| Case Pass Plus | $299 for 3 months, then $79/month | Up to 15,000 pages, Phase 2 expert tools (money flags, signature highlights), priority processing |
| Hardship option | 50% off by self-declaration [H] | Same features |

Why a fixed pass rather than an open subscription: cases have a time span, stressed users fear surprise renewals, and a fixed price is easy to compare with the cost of an hour of a lawyer's time.

Reference points [UV]: Courtroom5 (US, self-rep) lists $15, $99 and $249 per month; EvenSteven (document analysis, timelines) lists from US$19 [S16]. Justice-Bot publishes no prices [S16].

Margin check: measure OCR and AI cost per 1,000 pages in the beta. Set page caps so gross margin stays at or above 70% [H].

### Option B (Phase 3): Lawyer-sponsored client workspaces

- A firm pays per active client workspace (hypothesis: $25 to $40 per client per month [H]), or the client pays and shares with the firm.
- Lawyers get a standard brief, a live timeline and document requests.
- Growth loop: any lawyer a user invites gets a free read-only "lawyer view" with a quiet "use this for all your clients" offer.
- Check with a lawyer: can firms pass the cost to clients as a disbursement, and does any arrangement count as a referral fee [S10, LR]?

### Not recommended

- Referral fees from lawyers: Ontario lawyers may not pay non-licensees for referrals (secondary sources) [S10, UV].
- Ads in the product, or selling data: break trust; never.
- Success or contingency fees: look like legal services.
- Done-for-you human services at launch: hard to scale and raises legal-services questions. Use only as a short concierge test in validation.

---

## 9. Validation plan and roadmap

### 9.1 Interviews (8 core + 2 optional)

| Segment | Count | Where to find (ask permission first) |
|---|---|---|
| Self-represented people, Ontario civil | 3 | Founder network, self-rep communities, court help-centre volunteers, NSRLP community [S11] |
| Clients with a lawyer, document-heavy civil | 2 | Founder network, business owner groups |
| Ontario civil litigators (sole or small firm, ideally one offering limited-scope work) | 3 | OBA sections, LinkedIn, local law associations |
| Optional: forensic accountant | 1 | CPA forensic practitioners |
| Optional: forensic document examiner | 1 | Ontario examiners (directories) |

**Interview rules**
- Written consent. Notes anonymized with IDs (SRL-01, LAW-02). Notes stored in `private/` only, never in git.
- Ask people not to share case details beyond what's needed. Never give legal advice in an interview.
- Ask about past behaviour, not opinions about the future ("tell me about the last time", not "would you use").
- Show a mock brief built from **fictional** data in the second half.

**Questions: self-represented people and clients with a lawyer**
1. Walk me through the last time you worked on your case. What did you do, and for how long?
2. Where do your documents and emails live now? How do you find things?
3. Tell me about a time you almost missed something: a deadline, a document, a detail.
4. What have you paid for help so far (lawyer, paralegal, experts)? What did you get for it?
5. How do you explain your case to your lawyer, or to the court?
6. Have you considered a forensic accountant or document examiner? How did you decide?
7. Would you upload your case documents to an online tool? What would make you trust it, or stop you?
8. (After the mock) What would you do with this? What's missing? What would you pay for it, and when?

**Questions: lawyers**
1. What do clients bring you that saves you time? What wastes it?
2. How do you build a chronology today? Who does it, and how long does it take?
3. (Show the mock brief) Would you use this? What would make you trust it, or not?
4. What would worry you about a client using an AI tool on their file (privilege, accuracy, undertakings)?
5. Do you offer limited-scope work? Would a brief like this change how you scope or quote?
6. Would you recommend a tool like this to clients? What would stop you?
7. What must never appear in a client-prepared package?

**Questions: experts (optional)**
1. What does a good intake from a client or lawyer look like?
2. What do people send that is useless or harmful (for example copies instead of originals)?
3. How do you scope and price a first look?
4. What wording about "flags" would you object to?

### 9.2 Other tests

- **Fake-door test:** landing page with the hero, pricing hypotheses and an "early access" button. Measure sign-up rate by audience page.
- **Concierge test (3 to 5 volunteers):** build a lawyer brief by hand from a volunteer's own documents, with consent, outside the repo, in a secure workspace. Ask their lawyer for feedback. Organization only, no advice.

### 9.3 Success signals

| Signal | Proceed if [H] |
|---|---|
| Pain is real | At least 6 of 8 core interviewees describe sorting and explaining the file as a top pain, unprompted |
| Lawyers would use it | At least 2 of 3 lawyers say they would use the mock brief; at least 1 says it would save an hour or more |
| Lawyers won't block it | No lawyer says they would tell clients not to use it, given our guardrails |
| Willingness to pay | At least 3 of 5 clients or self-reps name a price at or above $100 for a 3-month pass; at least 2 pre-order or join a paid pilot |
| Trust | At least 4 of 5 would upload documents given the stated safeguards |
| Demand | At least 300 waitlist sign-ups in 8 weeks; at least 5% of visitors who reach pricing join early access |

**Stop or pivot signals:** lawyers say they would ignore client-prepared material; most users refuse cloud uploads (consider a local-first design); or legal review finds the core features are legal services (consider the LSO sandbox or a lawyer-partnered model).

### 9.4 Phased roadmap

Timings are indicative.

| Phase | Goal | Scope | Exit criteria |
|---|---|---|---|
| **0. Validate** (about 6 to 8 weeks) | Prove pain, trust and willingness to pay; legal review | Interviews, mock brief, fake-door landing page, 3 guides + Readiness Checklist, concierge tests, lawyer review items 1 to 5, Decisions 1 to 5 made | Success signals met; lawyer sign-off on beta scope |
| **1. Smallest first launch: private beta** (20 to 50 users) | Show the core loop works with real files | Public site: Home, How it works, Safety, Security, Pricing (waitlist), Get help, Legal, 3 guides. Workspace: MVP items 1 to 7 (setup, intake, summaries, timeline, discrepancy flags, lawyer brief export, This week + readiness). Ontario civil only. Page cap of 2,000 per case. | At least 60% of beta users export a brief; at least 3 lawyers confirm they used one; extraction accuracy targets met; zero security incidents |
| **1b. MVP complete** | Round out both audiences | MVP items 8 to 11: deadlines, first self-rep pathway, manual signature compare, expert prep package. Payments on. | Paid conversion at or above 5% of active free users [H]; weekly plan used by at least 40% of active users |
| **2. Public launch** | Differentiators and growth | Accounting pattern flags, AI signature highlights, secure sharing, more pathways, rule-based deadline helpers, content engine (10+ guides), SEO | Retention through a case's active period; lawyer referrals appear organically |
| **3. Expand** | Lawyers as a channel; new areas | Lawyer and firm workspace (Option B), hearing prep, French, criminal mode (after lawyer opinion), family law, directory only if compliant | Option B revenue; partnerships with clinics or law associations |

**Phase 1 metrics:** time from first upload to first timeline view; share of timeline events confirmed; flags reviewed; briefs exported; weekly active preparers (finished at least 1 task a week); support tickets about advice-seeking.

---

## 10. Open questions for the founder (max 8)

| # | Question | Recommended default |
|---|---|---|
| 1 | Which courts and case types at launch? | Ontario civil only: Superior Court civil and Small Claims. Criminal later, after a lawyer's opinion on disclosure rules. |
| 2 | Which audience do we build and sell to first? | Build one workspace for both. Sell first to clients with lawyers (they already pay for help, and the lawyer keeps advice in the loop). Serve self-reps with free content and the same workspace. |
| 3 | How much of your own story goes public? | General terms only ("I've been through it, and I did the legwork myself"). No case names, amounts, people or court files, on the site or in git. |
| 4 | Where must data live and be processed? | Canada for storage and, if a suitable AI model is available there, for AI processing. Otherwise disclose clearly. |
| 5 | Budget and timing for lawyer review before beta? | Get a fixed-fee quote for review items 1 to 5 in Phase 0; do not open the beta without it. |
| 6 | Will we offer any human help (paralegal, lawyer, "done for you")? | No at launch. Point to legal aid and the LSO Referral Service. Revisit partnerships in Phase 3, after review of referral fee rules. |
| 7 | How generous is the free tier? | Small but real: 1 case, 100 pages, timeline and summaries, 1 watermarked sample brief. |
| 8 | Brand name? | Pick a name about preparation, not lawyering; plain and easy to spell; check Canadian trademarks and domains before use. Working ideas (unchecked): ReadyFile, CasePrep, Prepped. |

---

## Decisions needed (max 5)

| # | Decision | Option A | Option B | Pick |
|---|---|---|---|---|
| 1 | Launch scope | Ontario civil only | Civil + criminal | **A.** Criminal disclosure rules add serious risk [S7]. |
| 2 | First paying audience | Clients with lawyers | Self-represented people | **A**, with self-reps served by the same workspace and free content. Lower advice risk; proven spending on help. |
| 3 | Pricing model | Fixed 3-month Case Pass | Open monthly subscription | **A.** Matches case life; no surprise renewals. |
| 4 | Data residency | Canada-only storage and AI processing (narrower vendor choice) | Best available AI anywhere, with no-training and zero-retention terms | **A**, if a capable model can run in Canada; confirm in the stack decision. |
| 5 | Expert tools (signature AI, accounting flags) | In the first launch | Phase 2, after testing with a real examiner and accountant | **B.** The MVP keeps manual side-by-side compare and expert prep templates only. |

---

## Sources

Most are secondary. Check the primary text before public use. Items already in the research docs are not repeated here unless used.

| # | Source | Status |
|---|---|---|
| S1 | FTC, DoNotPay: [complaint/order page](https://www.ftc.gov/node/86371), [final order announcement](https://www.ftc.gov/node/87474). Final order approved Jan 2025 (secondary reports say $193,000 relief, limits on "performs like a lawyer" claims without evidence). | Primary page not opened in this pass |
| S2 | [O. Reg. 384/24 (e-Laws)](https://www.ontario.ca/laws/regulation/r24384); [OBA summary](https://oba.org/Our-Impact/Sector-Updates/Amendments-to-the-Rules-of-Civil-Procedure-O-Reg-384-24). Rule 4.06.1(2.1) factum certification; r. 53.03(2.1) expert reports. | Secondary summary; verify wording |
| S3 | [O. Reg. 275/26 (e-Laws)](https://www.ontario.ca/laws/regulation/R26275); [OBA summary](https://oba.org/our-impact/sector-updates/amendments-to-rules-of-civil-procedure-o-reg-275-26/). Reportedly adds quotation accuracy, from Sept 1, 2026. | [UV] verify text |
| S4 | [Ontario SCJ: AI practice directions news](https://www.ontariocourts.ca/scj/news/new-practice-directions-on-the-responsible-use-of-artificial-intelligence-in-court-proceedings/); [Hull & Hull commentary (2026)](https://hullandhull.com/2026/03/artificial-intelligence-and-the-consolidated-civil-practice-directions/); [OBA update](https://oba.org/our-impact/sector-updates/ontario-superior-court-of-justice-ai-practice-directions) | [UV] read directions in full |
| S5 | Federal Court AI notice, via [Law360 Canada](https://www.law360.ca/ca/articles/1818892) | Secondary; federal, not Ontario |
| S5b | LSO generative AI guidance, via [Osler](https://www.osler.com/en/insights/updates/law-society-of-ontario-publishes-guidance-for-licensees-with-respect-to-the-use-of-generative-ai/) (also in research doc 02) | Secondary |
| S6 | Deemed undertaking, r. 30.1.01: [Devry Smith Frank commentary](https://devrylaw.ca/the-deemed-undertaking-rule-in-ontario-litigation/); [Rules of Civil Procedure (e-Laws)](https://www.ontario.ca/laws/regulation/900194) | [UV] check current rule text |
| S7 | Crown disclosure: [Law Times on deemed undertaking for disclosure](https://lawtimesnews.com/news/general/counsel-cant-share-disclosure-with-media/262749); [Mondaq on ONCA limits after online posting](https://www.mondaq.com/canada/privacy-protection/411616/for-your-eyes-only-court-of-appeal-upholds-limits-on-access-to-disclosure-when-self-represented-litigant-posts-them-on-the-internet); [Ontario Criminal Digital Disclosure Hub, self-rep form](https://www.criminaljusticehub.jus.gov.on.ca/doc/en/SelfRepApplicationForm.pdf) | [UV] case names and citations not confirmed |
| S8 | Limited-scope retainers (LSO Rules of Professional Conduct 3.2-1A): [practicePRO resources](https://www.practicepro.ca/practice-aids/limited-scope-representation-resources/) | Secondary; check current LSO rule text |
| S9 | Expert's duty, r. 4.1.01, [Rules of Civil Procedure (e-Laws)](https://www.ontario.ca/laws/regulation/900194) | [UV] from general knowledge; not opened in this pass |
| S10 | Referral fees: [Canadian Lawyer guide](https://canadianlawyermag.com/practice-areas/personal-injury/navigating-ontarios-referral-fee-landscape-a-guide-for-personal-injury-lawyers/391778); [LSO 2017 referral fee release](https://newswire.ca/news-releases/law-society-limits-referral-fees-and-strengthens-advertising-rules-in-the-public-interest-614638304.html) | [UV] confirm Ontario r. 3.6-6 / 3.6-7 text |
| S11 | National Self-Represented Litigants Project: [site](https://representingyourselfcanada.com/), [2013 study executive summary](https://representingyourselfcanada.com/wp-content/uploads/2014/06/executive-summary.pdf). Cost is the most cited reason for self-representing. | Secondary snippet; read the report |
| S12 | Ontario Civil Rules Review: [terms of reference](https://www.ontariocourts.ca/scj/areas-of-law/civil-court/civil-rules-review/civil-rules-review-terms-of-reference/); [Mondaq on the final report](https://www.mondaq.com/canada/civil-law/1736004/a-new-era-for-civil-litigation-in-ontario-highlights-from-the-civil-rules-review-final-report). Final report Dec 2025; rollout timing not confirmed. | [UV] watch for official dates |
| S13 | PIPEDA breach reporting: [Office of the Privacy Commissioner guidance](https://www.priv.gc.ca/en/privacy-topics/privacy-breaches/respond-to-a-privacy-breach-at-your-business/gd_pb_201810/) | Primary regulator page (from search); check for updates |
| S14 | AODA web rule: [Ontario: How to make websites accessible](https://www.ontario.ca/page/how-make-websites-accessible) | Primary government page (from search) |
| S15 | LSO Access to Innovation: [Law Times launch report](https://lawtimesnews.com/news/general/law-society-of-ontario-launches-access-to-innovation-project/361514). Launched Oct 2021 as a 5-year pilot. | [UV] 2026 status unknown |
| S16 | Competitor pricing: [Justice-Bot site](https://justicebot-31c.pages.dev/) (no prices shown), [EvenSteven on Capterra](https://www.capterra.ca/software/1086308/EvenSteven), [Courtroom5 on SoftwareFinder](https://softwarefinder.com/legal/courtroom5) | [UV] third-party listings; check by hand |
| S17 | Expert costs (not used for claims): [US handwriting expert price guide](https://www.thepricer.org/how-much-does-a-handwriting-expert-cost/). No Canadian rates found. | [UV] US-only; ask experts in interviews |
