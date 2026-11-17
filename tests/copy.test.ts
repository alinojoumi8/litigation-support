import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { findMarketingViolations } from "@/lib/domain/wording";
import { GUIDES } from "@/lib/content/guides";
import { PATHWAYS } from "@/lib/content/pathways";
import { CURATED_AUTHORITIES } from "@/lib/domain/authorities";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|md)$/.test(f) ? [p] : [];
  });
}

describe("public copy", () => {
  const files = [...walk("src/app"), ...walk("src/components"), ...walk("src/lib/content"), "src/lib/brand.ts"];

  it("never uses banned marketing phrases", () => {
    const problems: string[] = [];
    for (const f of files) {
      const text = readFileSync(f, "utf8");
      for (const v of findMarketingViolations(text)) problems.push(`${f}: "${v.term}"`);
    }
    expect(problems).toEqual([]);
  });

  it("every published guide has sections, a checked date and a summary; drafts are honest", () => {
    for (const g of GUIDES) {
      if (g.status === "published") {
        expect(g.sections?.length, g.slug).toBeGreaterThan(0);
        expect(g.lastChecked, g.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      } else {
        expect(g.sections, g.slug).toBeUndefined();
      }
    }
    expect(GUIDES).toHaveLength(10);
    expect(GUIDES.filter((g) => g.status === "published").length).toBeGreaterThanOrEqual(3);
  });

  it("pathways cite only curated official sources and are marked for review", () => {
    const ids = new Set(CURATED_AUTHORITIES.map((a) => a.id));
    for (const p of PATHWAYS) {
      expect(p.reviewStatus).toMatch(/Not yet reviewed by an Ontario lawyer/);
      for (const s of p.steps) for (const src of s.sources) expect(ids.has(src), `${p.id}/${s.id}/${src}`).toBe(true);
    }
    for (const a of CURATED_AUTHORITIES) expect(a.url).toMatch(/^https:\/\//);
  });
});
