/**
 * "This week": 3 to 5 short prep tasks built from gaps in the file
 * (site plan 5.1 item 7). Tasks organize and prepare. They never tell the
 * user to file, argue or decide anything.
 */
import type { Readiness } from "./readiness";
import type { DeadlineWarning } from "./deadlines";

export interface PrepTask {
  key: string;
  title: string;
  why: string;
  minutes: number;
  href: string;
  priority: number; // lower first
}

export interface TaskInput {
  caseId: string;
  readiness: Readiness;
  newFlagCount: number;
  unconfirmedEventCount: number;
  documentsWithoutSummary: number;
  documentCount: number;
  warnings: DeadlineWarning[];
  questionCount: number;
  audience: "with_lawyer" | "self_rep";
  hasPathway: boolean;
  pathwayRemaining: number;
}

/** ISO week key such as 2026-W47, from a yyyy-mm-dd date. */
export function weekKey(today: string): string {
  const d = new Date(Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10)));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function buildWeeklyTasks(i: TaskInput): PrepTask[] {
  const base = `/app/cases/${i.caseId}`;
  const tasks: PrepTask[] = [];
  const item = (k: string) => i.readiness.items.find((x) => x.key === k);

  for (const w of i.warnings.slice(0, 2)) {
    tasks.push({
      key: `deadline-${w.deadline.id}`,
      title: `Check what you need ready for "${w.deadline.title}"`,
      why: w.message,
      minutes: 15,
      href: `${base}/deadlines`,
      priority: 0,
    });
  }
  if (!item("details")?.done) {
    tasks.push({ key: "details", title: "Fill in your case details", why: "Court, stage and your role shape your checklists and plan.", minutes: 10, href: `${base}/overview`, priority: 1 });
  }
  if (i.documentCount === 0) {
    tasks.push({ key: "upload", title: "Add your first documents", why: "Start with the documents you look at most: the agreement, key emails, invoices.", minutes: 20, href: `${base}/documents`, priority: 1 });
  }
  if (i.newFlagCount > 0) {
    const n = Math.min(i.newFlagCount, 5);
    tasks.push({ key: "flags", title: `Review ${n} new flag${n === 1 ? "" : "s"}`, why: "Each one is a possible inconsistency. Mark what matters, and what is not an issue.", minutes: 5 * n > 30 ? 30 : Math.max(10, 5 * n), href: `${base}/flags`, priority: 2 });
  }
  if (i.unconfirmedEventCount > 0) {
    const n = Math.min(i.unconfirmedEventCount, 10);
    tasks.push({ key: "confirm-events", title: `Confirm ${n} timeline event${n === 1 ? "" : "s"}`, why: "Open the source page for each one and check the date and wording.", minutes: n > 6 ? 30 : 20, href: `${base}/timeline?status=unconfirmed`, priority: 3 });
  }
  if (i.documentsWithoutSummary > 0) {
    tasks.push({ key: "summaries", title: "Summarize the remaining documents", why: `${i.documentsWithoutSummary} document${i.documentsWithoutSummary === 1 ? " has" : "s have"} no summary yet.`, minutes: 10, href: `${base}/documents`, priority: 4 });
  }
  if (!item("summary")?.done) {
    tasks.push({ key: "one-pager", title: "Write your one-page summary", why: "In your own words: what happened, what you want, what you need to know.", minutes: 30, href: `${base}/overview`, priority: 5 });
  }
  if (i.questionCount < 3) {
    tasks.push({
      key: "questions",
      title: i.audience === "with_lawyer" ? "Write 3 questions for your lawyer" : "Write 3 questions to ask a lawyer or court staff",
      why: "Good questions make a paid hour count.",
      minutes: 10,
      href: `${base}/questions`,
      priority: 6,
    });
  }
  if (!item("deadlines")?.done) {
    tasks.push({ key: "deadlines", title: "Add the dates from your court papers", why: "Orders, notices and letters often set dates. Put each one in one place.", minutes: 10, href: `${base}/deadlines`, priority: 6 });
  }
  if (i.hasPathway && i.pathwayRemaining > 0 && i.audience === "self_rep") {
    tasks.push({ key: "pathway", title: "Work through your checklist", why: `${i.pathwayRemaining} checklist item${i.pathwayRemaining === 1 ? "" : "s"} left on your court pathway.`, minutes: 20, href: `${base}/guides`, priority: 7 });
  }
  if (!item("brief")?.done && i.documentCount > 0) {
    tasks.push({ key: "brief", title: "Export a draft brief", why: "See your file the way your lawyer or the court will.", minutes: 15, href: `${base}/packages`, priority: 8 });
  }

  tasks.sort((a, b) => a.priority - b.priority);
  const picked = tasks.slice(0, 5);
  if (picked.length < 3) {
    const fillers: PrepTask[] = [
      { key: "skim-timeline", title: "Read your timeline from start to finish", why: "Note anything that is missing or out of order.", minutes: 15, href: `${base}/timeline`, priority: 9 },
      { key: "check-questions", title: "Tidy your question list", why: "Remove what is answered and sharpen what is left.", minutes: 10, href: `${base}/questions`, priority: 9 },
      { key: "originals", title: "Check where your originals are", why: "Experts and courts may ask for original documents, not copies.", minutes: 10, href: `${base}/documents`, priority: 9 },
    ];
    for (const f of fillers) {
      if (picked.length >= 3) break;
      if (!picked.some((p) => p.key === f.key)) picked.push(f);
    }
  }
  return picked;
}
