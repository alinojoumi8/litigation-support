# Legal and risk research

Date: 2026-11-16. This is research, not legal advice. Get an Ontario lawyer to review before launch.

## 1. Legal information vs legal advice (biggest risk)

- Ontario's Law Society Act bars unlicensed people from practising law or providing legal services. Fines are heavy.
- Sharing legal information (statutes, guides) is generally fine.
- Applying law to a person's facts and telling them what to do is the risky line. For AI the line is unsettled.
- The LSO white paper on generative AI names "giving legal advice" as a risk.
- LSO "Access to Innovation" sandbox lets approved tech firms offer legal services under conditions. Participants found are from 2022 to 2024 (wills, real estate, shareholder agreements). Current status unknown. Check [LSO A2I page](https://lso.ca).

Design rule: the product organizes, summarizes, flags and explains process. It does not say "you will win" or "file this motion."

Sources:
- [Canadian Lawyer: line between legal advice and information](https://www.canadianlawyermag.com/resources/professional-regulation/genai-tools-are-making-it-trickier-to-navigate-the-line-between-legal-advice-and-legal-information/393320)
- [Osler: LSO guidance on generative AI](https://www.osler.com/en/insights/updates/law-society-of-ontario-publishes-guidance-for-licensees-with-respect-to-the-use-of-generative-ai/)
- [Law Times: A2I pilot](https://www.lawtimesnews.com/resources/professional-regulation/law-society-of-ontario-accepting-applications-for-access-to-innovation-pilot-project/366850)

## 2. Fake citations (AI hallucination)

- Ontario Rule 4.06.1(2.1): a factum must carry a signed statement that cited authorities are authentic.
- Cases found: Ko v. Li (contempt show-cause), RSR Road Surface Recycling v. Bonnechere Excavating, 2026 ONSC 698 (factum not relied on, costs risk). Verify in the primary judgments.
- CTV/CP24 (June 2026): more than 30 legal professionals in Canada criticized or sanctioned.
- Many AI-related decisions involve SRLs (one tally says 81%, unverified).

Design rule: never output a case citation we did not pull from a real source. Every authority links to CanLII or the official text. Show "verify before filing."

Sources:
- [McCarthy: Ontario courts and AI hallucinations](https://www.mccarthy.ca/en/insights/blogs/all-mt3-blogs/deterring-ai-hallucinations-ontario-courts-weigh)
- [Osler: AI in litigation](https://www.osler.com/en/insights/reports/2025-legal-outlook/increasing-ai-in-litigation-advantages-perils-and-increasing-regulation/)
- [CTV: fabricated citations](https://www.ctvnews.ca/sci-tech/article/ai-fabricated-legal-citations-in-canadian-courts-tip-of-the-iceberg-expert-warns/)

## 3. Overclaiming

DoNotPay paid the FTC and was barred from saying it replaces a lawyer. Do not use: "robot lawyer," "guaranteed win," "replace your lawyer."

## 4. Handwriting and signature flags

AI can flag visual differences. It cannot prove forgery. Only a qualified forensic document examiner gives evidence a court accepts.

Design rule: wording is "possible difference worth showing an examiner." Never "this is forged."

## 5. Privacy, privilege, sensitive data (needs expert review)

- Users upload emails, bank records, court disclosure. This is highly sensitive.
- Solicitor-client privilege: uploading privileged material to a third-party tool may risk waiver. Unverified. Ask a lawyer.
- Criminal disclosure: Crown disclosure often carries restrictions on sharing. Unverified. Ask a lawyer.
- Privacy law: PIPEDA applies to commercial use. Ontario private-sector rules may differ by case type.
- Choices to make: Canadian data hosting, encryption, no training on user data, delete-on-request, no public sharing.

## 6. Other items to check

- Terms of use and disclaimers (lawyer-written).
- Professional liability insurance for the business.
- Marketing claims review.
- Accessibility (AODA, WCAG 2.2 AA). Many users are stressed and not tech savvy.

## Not found yet

- LSO paralegal scope rules in detail.
- Current LSO A2I status in 2026.
- Primary text of 2026 practice directions on AI.
