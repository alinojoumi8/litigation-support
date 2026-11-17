import { describe, expect, it } from "vitest";
import { findDiscrepancies, type DocFacts } from "@/lib/domain/discrepancies";
import { findMoneyPatterns, parseTransactions } from "@/lib/domain/accounting";
import { isNeutral, MONEY_DISCLAIMER } from "@/lib/domain/wording";
import { excludedFromExpertByDefault, shareWarnings, allowedOrigins } from "@/lib/domain/origin";

function doc(seq: number, pages: string[], extra: Partial<DocFacts> = {}): DocFacts {
  return {
    docId: `doc_${seq}`,
    seq,
    title: `Document ${seq}`,
    filename: `doc${seq}.txt`,
    sha256: `sha${seq}`,
    pages: pages.map((text, i) => ({ page: i + 1, text })),
    emailMeta: null,
    ...extra,
  };
}

describe("discrepancy finder", () => {
  it("flags amount differences for the same invoice across documents", () => {
    const flags = findDiscrepancies([
      doc(1, ["Invoice #1042 total due: $12,400.00."]),
      doc(2, ["As discussed, Invoice 1042 is for $14,200.00."]),
    ]);
    const f = flags.find((x) => x.kind === "amount_mismatch");
    expect(f).toBeDefined();
    expect(f!.sources.map((s) => s.docId)).toEqual(["doc_1", "doc_2"]);
    expect(f!.title).toMatch(/^Possible amount difference/);
  });

  it("does not flag when an amount appears in both", () => {
    const flags = findDiscrepancies([
      doc(1, ["Invoice #1042 total due: $12,400.00."]),
      doc(2, ["We paid $5,000.00 toward Invoice 1042 of $12,400.00."]),
    ]);
    expect(flags.filter((x) => x.kind === "amount_mismatch")).toEqual([]);
  });

  it("flags date mismatches with the plan's wording", () => {
    const flags = findDiscrepancies([
      doc(142, ["Page one.", "Page two.", "The deposit was paid on March 10, 2025 by e-transfer."]),
      doc(388, ["Our records show the deposit was paid on March 17, 2025."]),
    ]);
    const f = flags.find((x) => x.kind === "date_conflict");
    expect(f?.title).toBe("Possible date mismatch: Doc 0142 p.3 vs Doc 0388 p.1");
  });

  it("flags name spelling variations, missing attachments and version differences", () => {
    const flags = findDiscrepancies([
      doc(1, ["Prepared by Jordan Whitfield for the project."]),
      doc(2, ["Call Jordan Whitfeld about the schedule."]),
      doc(3, ["Please see the attached revised quote."], { emailMeta: { from: "a", to: "b", date: null, subject: "Quote", attachments: [] } }),
      doc(4, ["Scope: kitchen\nPrice: $10,000"], { title: "Quote v1", sha256: "x1" }),
      doc(5, ["Scope: kitchen and hall\nPrice: $10,000"], { title: "Quote v2", sha256: "x2" }),
    ]);
    const kinds = flags.map((f) => f.kind);
    expect(kinds).toContain("name_variation");
    expect(kinds).toContain("missing_attachment");
    expect(kinds).toContain("version_difference");
  });

  it("gives stable fingerprints and always uses neutral wording", () => {
    const input = [doc(1, ["Invoice #7 total $100.00."]), doc(2, ["Invoice 7 shows $150.00."])];
    const a = findDiscrepancies(input);
    const b = findDiscrepancies(input);
    expect(a.map((f) => f.fingerprint)).toEqual(b.map((f) => f.fingerprint));
    for (const f of a) {
      expect(isNeutral(f.title)).toBe(true);
      expect(isNeutral(f.detail)).toBe(true);
    }
  });
});

describe("accounting patterns", () => {
  const csv = [
    "date,description,amount,balance,account",
    "2025-01-02,Opening deposit,2000.00,2000.00,Chequing",
    "2025-01-05,Supplier payment,-412.37,1587.63,Chequing",
    "2025-01-05,Supplier payment,-412.37,1175.26,Chequing",
    "2025-01-20,E-transfer to savings,-1000.00,175.26,Chequing",
    "2025-03-15,Deposit,25000.00,25175.26,Chequing",
    "2025-03-16,Wire transfer out,-20000.00,6175.26,Chequing",
  ].join("\n");

  it("parses CSV with quoted cells and reports bad rows", () => {
    const r = parseTransactions('date,description,amount\n2025-01-01,"Rent, January",-1500.00\n01/02/2025,Bad date,10\n2025-01-03,No amount,');
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].description).toBe("Rent, January");
    expect(r.rows[0].amountCents).toBe(-150000);
    expect(r.errors).toHaveLength(2);
  });

  it("supports debit/credit columns", () => {
    const r = parseTransactions("date,description,debit,credit\n2025-01-01,Fee,12.50,\n2025-01-02,Refund,,5.00");
    expect(r.rows.map((x) => x.amountCents)).toEqual([-1250, 500]);
  });

  it("finds round amounts, repeats, gaps, large transfers, balance breaks and near-date items", () => {
    const { rows } = parseTransactions(csv);
    const flags = findMoneyPatterns(rows, { keyDates: [{ date: "2025-03-14", label: "Agreement signed" }] });
    const kinds = new Set(flags.map((f) => f.kind));
    for (const k of ["round_amount", "duplicate", "gap", "large_transfer", "balance_break", "near_key_date"]) {
      expect(kinds.has(k as never), k).toBe(true);
    }
  });

  it("uses neutral wording everywhere", () => {
    const { rows } = parseTransactions(csv);
    for (const f of findMoneyPatterns(rows, { keyDates: [{ date: "2025-03-14", label: "Agreement signed" }] })) {
      expect(isNeutral(`${f.title} ${f.detail} ${f.question}`), f.title).toBe(true);
    }
    expect(isNeutral(MONEY_DISCLAIMER)).toBe(true);
  });
});

describe("origin rules", () => {
  it("excludes other-side and lawyer documents from expert packages by default", () => {
    expect(excludedFromExpertByDefault({ origin: "other_side" })).toBe(true);
    expect(excludedFromExpertByDefault({ origin: "my_lawyer" })).toBe(true);
    expect(excludedFromExpertByDefault({ origin: "mine" })).toBe(false);
  });

  it("summarises share warnings", () => {
    const w = shareWarnings([{ origin: "mine" }, { origin: "other_side" }, { origin: "other_side" }, { origin: "my_lawyer" }]);
    expect(w).toMatchObject({ total: 4, otherSide: 2, privileged: 1 });
    expect(w.messages).toHaveLength(2);
  });

  it("only allows Crown disclosure on criminal cases when the flag is on", () => {
    expect(allowedOrigins("civil_small_claims", true)).not.toContain("crown_disclosure");
    expect(allowedOrigins("criminal", false)).not.toContain("crown_disclosure");
    expect(allowedOrigins("criminal", true)).toContain("crown_disclosure");
  });
});
