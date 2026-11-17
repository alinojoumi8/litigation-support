import { describe, expect, it } from "vitest";
import { buildTimeline, extractEventsFromPages, timelineToCsv } from "@/lib/domain/timeline";
import { computeReadiness, type ReadinessInput } from "@/lib/domain/readiness";
import { canPerform, isSafeId } from "@/lib/auth/authz";
import { daysBetween, deadlineWarnings, deadlinesToIcs, reminderStep, urgency } from "@/lib/domain/deadlines";
import { buildWeeklyTasks, weekKey } from "@/lib/domain/tasks";
import { findAmounts, findDates, findReferences } from "@/lib/domain/extract";
import { detectUrgent } from "@/lib/domain/urgent";
import { crc32, createZip } from "@/lib/domain/zip";
import type { Deadline, Membership, TimelineEvent } from "@/lib/domain/types";

function ev(p: Partial<TimelineEvent> & Pick<TimelineEvent, "id" | "date">): TimelineEvent {
  return {
    caseId: "case_1",
    datePrecision: "day",
    description: "Something happened",
    sourceDocId: null,
    sourcePage: null,
    quote: null,
    people: [],
    tags: [],
    status: "unconfirmed",
    createdBy: "ai",
    provider: null,
    model: null,
    promptVersion: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...p,
  };
}

describe("timeline", () => {
  const docs = [
    { id: "doc_a", seq: 1, title: "Agreement" },
    { id: "doc_b", seq: 2, title: "Email" },
  ];

  it("sorts by date, then full dates before month-only, then by source", () => {
    const rows = buildTimeline(
      [
        ev({ id: "e3", date: "2025-03-01", datePrecision: "month" }),
        ev({ id: "e2", date: "2025-03-01", sourceDocId: "doc_b", sourcePage: 1 }),
        ev({ id: "e1", date: "2025-03-01", sourceDocId: "doc_a", sourcePage: 4 }),
        ev({ id: "e0", date: "2024-12-31" }),
      ],
      docs,
    );
    expect(rows.map((r) => r.id)).toEqual(["e0", "e1", "e2", "e3"]);
    expect(rows[1].sourceSeq).toBe(1);
    expect(rows[1].sourceTitle).toBe("Agreement");
  });

  it("filters by person, status, document, range and text", () => {
    const all = [
      ev({ id: "a", date: "2025-01-05", people: ["Avery Sample"], status: "confirmed", sourceDocId: "doc_a" }),
      ev({ id: "b", date: "2025-02-05", people: ["Riley Example"], description: "Deposit paid" }),
      ev({ id: "c", date: "2025-03-05", people: ["Avery Sample"] }),
    ];
    expect(buildTimeline(all, docs, { person: "avery sample" }).map((r) => r.id)).toEqual(["a", "c"]);
    expect(buildTimeline(all, docs, { status: "confirmed" }).map((r) => r.id)).toEqual(["a"]);
    expect(buildTimeline(all, docs, { docId: "doc_a" }).map((r) => r.id)).toEqual(["a"]);
    expect(buildTimeline(all, docs, { from: "2025-02-01", to: "2025-02-28" }).map((r) => r.id)).toEqual(["b"]);
    expect(buildTimeline(all, docs, { q: "deposit" }).map((r) => r.id)).toEqual(["b"]);
  });

  it("extracts dated events with exact quotes and page numbers", () => {
    const events = extractEventsFromPages(
      [
        { page: 1, text: "Date: March 1, 2025\nThe agreement was signed on March 3, 2025 by Avery Sample." },
        { page: 2, text: "Work started in April 2025. No date here." },
      ],
      ["Avery Sample"],
    );
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({ date: "2025-03-03", page: 1, people: ["Avery Sample"] });
    expect(events[0].quote).toBe("The agreement was signed on March 3, 2025 by Avery Sample.");
    expect(events[1]).toMatchObject({ date: "2025-04-01", datePrecision: "month", page: 2 });
  });

  it("CSV export keeps confirmed status and blocks formula injection", () => {
    const rows = buildTimeline([ev({ id: "x", date: "2025-01-01", description: "=HYPERLINK(\"x\")", status: "confirmed" })], docs);
    const csv = timelineToCsv(rows);
    expect(csv).toContain("Confirmed by user");
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  });
});

describe("readiness score", () => {
  const empty: ReadinessInput = {
    caseDetailsComplete: false,
    documentCount: 0,
    documentsWithSummary: 0,
    eventCount: 0,
    confirmedEventCount: 0,
    flagCount: 0,
    reviewedFlagCount: 0,
    deadlineCount: 0,
    noDeadlinesYet: false,
    questionCount: 0,
    summaryWritten: false,
    briefExported: false,
  };

  it("is 0 for an empty file and 100 when every item is done", () => {
    expect(computeReadiness(empty).score).toBe(0);
    const full = computeReadiness({
      caseDetailsComplete: true,
      documentCount: 10,
      documentsWithSummary: 10,
      eventCount: 20,
      confirmedEventCount: 20,
      flagCount: 4,
      reviewedFlagCount: 4,
      deadlineCount: 1,
      noDeadlinesYet: false,
      questionCount: 3,
      summaryWritten: true,
      briefExported: true,
    });
    expect(full.score).toBe(100);
    expect(full.doneCount).toBe(full.items.length);
  });

  it("gives partial credit and is transparent", () => {
    const r = computeReadiness({ ...empty, caseDetailsComplete: true, documentCount: 4, documentsWithSummary: 2, eventCount: 10, confirmedEventCount: 5 });
    expect(r.score).toBeGreaterThan(0);
    expect(r.score).toBeLessThan(100);
    const timeline = r.items.find((i) => i.key === "timeline")!;
    expect(timeline.progress).toBe(0.5);
    expect(timeline.done).toBe(false);
    expect(r.items.every((i) => i.label.length > 0 && i.detail.length > 0)).toBe(true);
  });

  it("weights add up to 100 and never reference case merits", () => {
    const r = computeReadiness(empty);
    expect(r.items.reduce((s, i) => s + i.weight, 0)).toBe(100);
    const text = r.items.map((i) => `${i.label} ${i.detail}`).join(" ").toLowerCase();
    expect(text).not.toMatch(/win|strength|chance|merit|likely/);
  });

  it("'no deadlines yet' counts as done for the deadlines item", () => {
    const r = computeReadiness({ ...empty, noDeadlinesYet: true });
    expect(r.items.find((i) => i.key === "deadlines")!.done).toBe(true);
  });
});

describe("authorization", () => {
  const m = (role: Membership["role"]): Membership => ({ id: "m1", caseId: "case_1", userId: "user_1", role, createdAt: "" });

  it("denies when there is no membership", () => {
    expect(canPerform(null, "user_1", "case_1", "read")).toBe(false);
  });

  it("denies a membership for another user or another case", () => {
    expect(canPerform(m("owner"), "user_2", "case_1", "read")).toBe(false);
    expect(canPerform(m("owner"), "user_1", "case_2", "read")).toBe(false);
  });

  it("applies role permissions", () => {
    expect(canPerform(m("owner"), "user_1", "case_1", "delete")).toBe(true);
    expect(canPerform(m("editor"), "user_1", "case_1", "upload")).toBe(true);
    expect(canPerform(m("editor"), "user_1", "case_1", "delete")).toBe(false);
    expect(canPerform(m("viewer"), "user_1", "case_1", "read")).toBe(true);
    expect(canPerform(m("viewer"), "user_1", "case_1", "write")).toBe(false);
    expect(canPerform(m("viewer"), "user_1", "case_1", "export")).toBe(false);
  });

  it("only accepts opaque ids", () => {
    expect(isSafeId("case_AbC123xyz")).toBe(true);
    expect(isSafeId("../etc/passwd")).toBe(false);
    expect(isSafeId("short")).toBe(false);
    expect(isSafeId(42)).toBe(false);
  });
});

describe("deadlines", () => {
  const d = (date: string, done = false): Deadline => ({ id: `d_${date}`, caseId: "c", title: `Due ${date}`, date, sourceDocId: null, notes: "", done, createdAt: "" });

  it("counts days without timezone drift", () => {
    expect(daysBetween("2026-11-17", "2026-12-01")).toBe(14);
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2); // across DST change
  });

  it("classifies urgency and reminder steps at 14, 7, 2, 1 days", () => {
    expect(urgency(d("2026-11-16"), "2026-11-17")).toBe("overdue");
    expect(urgency(d("2026-11-17"), "2026-11-17")).toBe("today");
    expect(urgency(d("2026-11-19"), "2026-11-17")).toBe("within_2");
    expect(urgency(d("2026-11-30"), "2026-11-17")).toBe("within_14");
    expect(urgency(d("2026-11-16", true), "2026-11-17")).toBe("done");
    expect(reminderStep(d("2026-12-01"), "2026-11-17")).toBe(14);
    expect(reminderStep(d("2026-11-24"), "2026-11-17")).toBe(7);
    expect(reminderStep(d("2026-11-20"), "2026-11-17")).toBe(null);
  });

  it("warns inside the 14-day window, soonest first", () => {
    const w = deadlineWarnings([d("2026-12-30"), d("2026-11-25"), d("2026-11-18"), d("2026-11-10", true)], "2026-11-17");
    expect(w.map((x) => x.daysLeft)).toEqual([1, 8]);
  });

  it("exports an ICS calendar with alarms", () => {
    const ics = deadlinesToIcs([d("2026-12-01")], "20261117T000000Z", "ReadyFile");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261201");
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(4);
  });
});

describe("weekly tasks", () => {
  it("builds 3 to 5 short tasks, deadlines first, never telling the user to file anything", () => {
    const readiness = computeReadiness({
      caseDetailsComplete: false, documentCount: 3, documentsWithSummary: 1, eventCount: 12, confirmedEventCount: 2,
      flagCount: 3, reviewedFlagCount: 0, deadlineCount: 0, noDeadlinesYet: false, questionCount: 0, summaryWritten: false, briefExported: false,
    });
    const tasks = buildWeeklyTasks({
      caseId: "c1", readiness, newFlagCount: 3, unconfirmedEventCount: 10, documentsWithoutSummary: 2, documentCount: 3,
      warnings: [], questionCount: 0, audience: "self_rep", hasPathway: true, pathwayRemaining: 4,
    });
    expect(tasks.length).toBeGreaterThanOrEqual(3);
    expect(tasks.length).toBeLessThanOrEqual(5);
    expect(tasks.every((t) => t.minutes >= 5 && t.minutes <= 30)).toBe(true);
    expect(tasks.map((t) => t.title).join(" ")).not.toMatch(/\b(file|argue|sue|motion)\b/i);
  });

  it("computes ISO week keys", () => {
    expect(weekKey("2026-11-17")).toBe("2026-W47");
    expect(weekKey("2027-01-01")).toBe("2026-W53");
  });
});

describe("extraction", () => {
  it("finds dates in several formats and skips ambiguous numeric dates", () => {
    const ds = findDates("Signed March 3, 2025; sent 4 Mar 2025; due 2025-04-30; started June 2025; on 03/04/2025.");
    expect(ds.map((d) => d.iso)).toEqual(["2025-03-03", "2025-03-04", "2025-04-30", "2025-06-01"]);
    expect(ds[3].precision).toBe("month");
  });

  it("finds amounts and references", () => {
    expect(findAmounts("Invoice total $12,400.00, deposit $5,000 and CAD 99.50").map((a) => a.cents)).toEqual([1240000, 500000, 9950]);
    expect(findReferences("See Invoice #1042 and PO 2231.").map((r) => r.key)).toEqual(["invoice:1042", "purchase order:2231"]);
  });
});

describe("urgent detection", () => {
  it("spots emergencies without over-triggering", () => {
    expect(detectUrgent("My hearing is tomorrow and I have nothing ready")).toBe(true);
    expect(detectUrgent("He is in custody")).toBe(true);
    expect(detectUrgent("Contractor dispute about a kitchen renovation")).toBe(false);
  });
});

describe("zip", () => {
  it("computes CRC-32 correctly", () => {
    expect(crc32(new TextEncoder().encode("123456789")).toString(16)).toBe("cbf43926");
  });

  it("writes a valid archive header and directory", () => {
    const zip = createZip([{ name: "a.txt", data: new TextEncoder().encode("hello") }, { name: "../b.txt", data: new Uint8Array([1, 2]) }]);
    const v = new DataView(zip.buffer);
    expect(v.getUint32(0, true)).toBe(0x04034b50);
    expect(v.getUint32(zip.length - 22, true)).toBe(0x06054b50);
    expect(v.getUint16(zip.length - 12, true)).toBe(2);
    expect(new TextDecoder().decode(zip)).not.toContain("../");
  });
});
