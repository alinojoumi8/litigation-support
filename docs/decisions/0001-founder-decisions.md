# 0001 Founder decisions on the site plan

Date: 2026-11-17. Source: decisions table in `docs/planning/01-site-plan.md`.

| # | Decision | Choice | Plan's pick | Same? |
|---|---|---|---|---|
| 1 | Launch scope | B: civil and criminal | A: civil only | No |
| 2 | First paying audience | Both: clients with lawyers and self-represented people | A: clients with lawyers | Wider |
| 3 | Pricing model | A: fixed 3-month Case Pass | A | Yes |
| 4 | Data residency | B: best available AI anywhere, with no-training and zero-retention terms | A: Canada only | No |
| 5 | Expert tools (signature, accounting) | A: in the first launch | B: Phase 2 | No |

## What these choices cost us (risks to handle)

1. **Criminal in the first launch.** Crown disclosure has sharing limits. Needs an Ontario lawyer's written opinion before any criminal uploads are allowed. Fallback: ship civil first, criminal behind a gate until the opinion is in.
2. **Both audiences at once.** Two sets of copy, two onboarding paths, double the testing. Keep one workspace. Run both interview groups in Phase 0.
3. **AI processing outside Canada.** Must be disclosed in plain words. Need zero-retention and no-training contracts. Need lawyer review of privilege and disclosure risk. Offer a Canada-only option later if a capable model exists.
4. **Expert tools in the first launch.** Rules stay fixed: flags only, never "forged," no match percent. Test with a real forensic document examiner and a forensic accountant before public release.

## Next

Update the plan's roadmap and lawyer-review list to match. Then pick a stack.
