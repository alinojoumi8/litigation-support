import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync, existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "rf-test-"));
process.env.LOCAL_DATA_DIR = dir;
process.env.DATA_BACKEND = "local";
process.env.AI_PROVIDER = "mock";

type Data = Awaited<ReturnType<typeof import("@/lib/data").getData>>;
let data: Data;
let caseId: string;
const userId = "usr_testuser0001";

beforeAll(async () => {
  const { getData } = await import("@/lib/data");
  const { seedSampleCase } = await import("@/lib/sample/seed");
  data = await getData();
  await data.repo.createUser({ id: userId, email: "test@example.invalid", displayName: "Test", passwordHash: null, createdAt: "", isDemo: true, acceptedTermsAt: "" });
  caseId = await seedSampleCase(data, userId);
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("sample case through the full local pipeline", () => {
  it("creates documents with stable source numbers, pages and summaries", async () => {
    const docs = await data.repo.list("documents", caseId);
    expect(docs).toHaveLength(11);
    expect(docs.map((d) => d.seq).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const summaries = await data.repo.list("summaries", caseId);
    expect(summaries.length).toBeGreaterThanOrEqual(8);
    expect(summaries.every((s) => s.promptVersion && s.provider === "mock")).toBe(true);
    const pages = await data.repo.list("pages", caseId);
    expect(pages.filter((p) => p.docId === docs.find((d) => d.seq === 1)!.id)).toHaveLength(3);
  });

  it("builds timeline events linked to source pages with verbatim quotes", async () => {
    const events = await data.repo.list("events", caseId);
    const pages = await data.repo.list("pages", caseId);
    expect(events.length).toBeGreaterThan(8);
    for (const e of events.filter((x) => x.quote)) {
      const page = pages.find((p) => p.docId === e.sourceDocId && p.page === e.sourcePage);
      expect(page?.text.replace(/\s+/g, " ")).toContain(e.quote!.replace(/\s+/g, " "));
    }
    expect(events.some((e) => e.status === "confirmed")).toBe(true);
  });

  it("finds the planted possible inconsistencies", async () => {
    const flags = await data.repo.list("flags", caseId);
    const kinds = flags.map((f) => f.kind);
    expect(kinds).toContain("date_conflict");
    expect(kinds).toContain("amount_mismatch");
    expect(kinds).toContain("name_variation");
    expect(kinds).toContain("missing_attachment");
    expect(flags.find((f) => f.title === "Possible date mismatch: Doc 0001 p.2 vs Doc 0002 p.1")?.status).toBe("matters");
    expect(flags.some((f) => f.title.includes("Doc 0009") && f.title.includes("Doc 0010"))).toBe(true);
  });

  it("stores data encrypted at rest", () => {
    const raw = readFileSync(path.join(dir, "store.enc"));
    expect(raw.subarray(0, 4).toString()).toBe("RFS1");
    expect(raw.toString("utf8")).not.toContain("Northwind");
  });

  it("rejects access from another user's membership", async () => {
    const { canPerform } = await import("@/lib/auth/authz");
    const m = await data.repo.getMembership(caseId, "usr_someoneelse1");
    expect(m).toBeNull();
    expect(canPerform(m, "usr_someoneelse1", caseId, "read")).toBe(false);
  });

  it("deleting the case really deletes every row and every file", async () => {
    const blobDir = path.join(dir, "blobs", caseId);
    expect(existsSync(blobDir)).toBe(true);
    expect(readdirSync(blobDir).length).toBe(11);
    await data.blobs.deleteCase(caseId);
    await data.repo.deleteCase(caseId);
    const { CASE_COLLECTIONS } = await import("@/lib/data/repository");
    for (const k of CASE_COLLECTIONS) expect(await data.repo.list(k, caseId), k).toEqual([]);
    expect(await data.repo.getCase(caseId)).toBeNull();
    expect(await data.repo.getMembership(caseId, userId)).toBeNull();
    expect(existsSync(blobDir)).toBe(false);
  });
});
