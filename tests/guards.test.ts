import { describe, expect, it } from "vitest";
import {
  buildExaminerNote,
  findMarketingViolations,
  findWordingViolations,
  isNeutral,
  neutralize,
  MONEY_DISCLAIMER,
  READINESS_CAPTION,
  SIGNATURE_DISCLAIMER,
  SIGNATURE_INNOCENT_CAUSES,
  DISCREPANCY_DISCLAIMER,
} from "@/lib/domain/wording";
import { CITATION_REMOVED, findCitations, guardCitations, quoteMatchesSource } from "@/lib/domain/citations";
import { CuratedAuthorityLookup, viewAuthority } from "@/lib/domain/authorities";

describe("flag wording guard", () => {
  it("rejects conclusions about signatures and money", () => {
    for (const bad of [
      "This signature is forged.",
      "The second document is a fake.",
      "This looks like fraud.",
      "The cheque was falsified.",
      "The signature is not genuine.",
      "These signatures are a 92% match.",
      "Similarity score of 0.87 between samples.",
      "This proves the accounts were altered.",
      "He clearly lied about the delivery date.",
      "Definitely the same writer.",
    ]) {
      expect(isNeutral(bad), bad).toBe(false);
    }
  });

  it("allows neutral and negated wording", () => {
    for (const ok of [
      "Possible difference in slant worth showing an examiner.",
      "A pattern is not proof of wrongdoing.",
      "It cannot tell whether a signature is genuine.",
      "The loop on the J looks larger in the questioned sample.",
      "Possible date mismatch: Doc 0142 p.3 vs Doc 0388 p.1",
    ]) {
      expect(findWordingViolations(ok), ok).toEqual([]);
    }
  });

  it("mandatory disclaimers pass their own guard", () => {
    for (const s of [SIGNATURE_DISCLAIMER, SIGNATURE_INNOCENT_CAUSES, MONEY_DISCLAIMER, READINESS_CAPTION, DISCREPANCY_DISCLAIMER]) {
      expect(isNeutral(s), s).toBe(true);
    }
  });

  it("neutralize replaces only the offending sentence", () => {
    const r = neutralize("The dates differ by ten days. The invoice is clearly fake. Check page 2.");
    expect(r.changed).toBe(true);
    expect(r.text).toContain("The dates differ by ten days.");
    expect(r.text).toContain("Check page 2.");
    expect(r.text).not.toMatch(/fake/i);
  });

  it("examiner note always includes the mandatory wording and strips conclusions", () => {
    const note = buildExaminerNote("The signature is forged. The final stroke ends sharply.");
    expect(note).toContain(SIGNATURE_INNOCENT_CAUSES);
    expect(note).toContain("not an opinion about whether any signature or handwriting is genuine");
    expect(note).not.toMatch(/forged/i);
    expect(note).toContain("The final stroke ends sharply.");
  });

  it("marketing check catches banned phrases but allows negations", () => {
    expect(findMarketingViolations("Our robot lawyer helps you win your case, guaranteed.").length).toBe(3);
    expect(findMarketingViolations("Built to inform. Never to replace your lawyer.")).toEqual([]);
    expect(findMarketingViolations("It does not measure your chances of success in court.")).toEqual([]);
  });
});

describe("citation guard", () => {
  it("finds neutral, report and case-name citations", () => {
    const text =
      "See Smith v. Jones, 2026 ONSC 698 and [2004] 3 S.C.R. 123. Also (2001), 55 O.R. (3d) 123 and R v Doe. Under s. 12 and Rule 30.1.01 and O. Reg. 258/98.";
    const kinds = findCitations(text).map((c) => c.pattern);
    expect(kinds).toEqual(expect.arrayContaining(["neutral", "report-bracket", "report-paren", "case-name", "section", "rule", "regulation"]));
  });

  it("removes citations that are not on the allow list", () => {
    const r = guardCitations("The court in Smith v. Jones, 2026 ONSC 698 said so.", []);
    expect(r.text).not.toContain("ONSC");
    expect(r.text).not.toContain("Smith v. Jones");
    expect(r.text).toContain(CITATION_REMOVED);
    expect(r.removed.length).toBeGreaterThanOrEqual(1);
  });

  it("keeps curated authorities", () => {
    const allow = new CuratedAuthorityLookup().allowList();
    const r = guardCitations("Small Claims Court process is set out in O. Reg. 258/98.", allow);
    expect(r.removed).toEqual([]);
    expect(r.text).toContain("O. Reg. 258/98");
  });

  it("leaves ordinary text alone", () => {
    const t = "Invoice 1042 for $12,400.00 was sent on March 3, 2025. Page 3 of the agreement has the signature.";
    expect(guardCitations(t).text).toBe(t);
  });

  it("quotes must match the source exactly (whitespace tolerant)", () => {
    const page = "The deposit of $5,000.00 was paid\non March 10, 2025.";
    expect(quoteMatchesSource("The deposit of $5,000.00 was paid on March 10, 2025.", page)).toBe(true);
    expect(quoteMatchesSource("The deposit of $6,000.00 was paid on March 10, 2025.", page)).toBe(false);
  });

  it("unknown authorities show verify-before-filing, never a citation", () => {
    const v = viewAuthority("Some Case v. Other Case");
    expect(v.kind).toBe("verify-before-filing");
    expect(v.url).toMatch(/^https:\/\/www\.canlii\.org\//);
    expect(viewAuthority("scc-rules").kind).toBe("verified-link");
  });
});
