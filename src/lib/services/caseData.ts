import "server-only";
import type { CaseContext } from "../auth/current";
import { pathwaysForCase } from "../content/pathways";
import { deadlineWarnings } from "../domain/deadlines";
import { computeReadiness } from "../domain/readiness";
import { buildWeeklyTasks, weekKey } from "../domain/tasks";
import { todayInToronto } from "../ids";

/** Everything the dashboard and the packages need, without page text. */
export async function loadCaseOverview(ctx: CaseContext) {
  const id = ctx.caseFile.id;
  const [documents, summaries, events, flags, deadlines, questions, signatures, taskCompletions, pathwayProgress, exports] = await Promise.all([
    ctx.repo.list("documents", id),
    ctx.repo.list("summaries", id),
    ctx.repo.list("events", id),
    ctx.repo.list("flags", id),
    ctx.repo.list("deadlines", id),
    ctx.repo.list("questions", id),
    ctx.repo.list("signatures", id),
    ctx.repo.list("taskCompletions", id),
    ctx.repo.list("pathwayProgress", id),
    ctx.repo.list("exports", id),
  ]);
  const today = todayInToronto();
  const c = ctx.caseFile;
  const summarized = new Set(summaries.map((s) => s.docId));
  const textDocs = documents.filter((d) => d.pageCount > 0 && d.extraction !== "image-no-ocr" && !(d.isSample && d.mimeType.startsWith("image/")));
  const readiness = computeReadiness({
    caseDetailsComplete: Boolean(c.court && c.stage && c.role !== "other"),
    documentCount: documents.length,
    documentsWithSummary: textDocs.filter((d) => summarized.has(d.id)).length,
    eventCount: events.length,
    confirmedEventCount: events.filter((e) => e.status === "confirmed").length,
    flagCount: flags.length,
    reviewedFlagCount: flags.filter((f) => f.status !== "new").length,
    deadlineCount: deadlines.length,
    noDeadlinesYet: c.noDeadlinesYet,
    questionCount: questions.length,
    summaryWritten: c.summary.trim().length >= 80,
    briefExported: Boolean(c.briefExportedAt),
  });
  // Readiness counts summaries only for documents with readable text.
  readiness.items = readiness.items.map((it) =>
    it.key === "summaries" ? { ...it, detail: `${textDocs.filter((d) => summarized.has(d.id)).length} of ${textDocs.length} documents with readable text have a summary.` } : it,
  );
  const pathways = pathwaysForCase(c.kind);
  const progress = pathwayProgress.find((p) => p.pathwayId === pathways[0]?.id);
  const totalItems = pathways[0]?.steps.reduce((n, s) => n + s.checklist.length, 0) ?? 0;
  const warnings = deadlineWarnings(deadlines, today);
  const wk = weekKey(today);
  const tasks = buildWeeklyTasks({
    caseId: id,
    readiness,
    newFlagCount: flags.filter((f) => f.status === "new").length,
    unconfirmedEventCount: events.filter((e) => e.status === "unconfirmed").length,
    documentsWithoutSummary: textDocs.filter((d) => !summarized.has(d.id)).length,
    documentCount: documents.length,
    warnings,
    questionCount: questions.length,
    audience: c.audience,
    hasPathway: pathways.length > 0,
    pathwayRemaining: Math.max(0, totalItems - (progress?.checked.length ?? 0)),
  });
  const doneKeys = new Set(taskCompletions.filter((t) => t.weekKey === wk).map((t) => t.taskKey));
  return { documents, summaries, events, flags, deadlines, questions, signatures, exports, readiness, tasks, doneKeys, warnings, today, weekKey: wk, pathways, pathwayProgress };
}
