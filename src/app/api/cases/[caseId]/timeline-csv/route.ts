import { audit, checkCaseAccess } from "@/lib/auth/current";
import { buildTimeline, timelineToCsv } from "@/lib/domain/timeline";
import { contentDisposition, PRIVATE_HEADERS } from "@/lib/http";
import { newId, nowIso } from "@/lib/ids";

export async function GET(_req: Request, ctx: RouteContext<"/api/cases/[caseId]/timeline-csv">) {
  const { caseId } = await ctx.params;
  const access = await checkCaseAccess(caseId, "export");
  if (!access) return new Response("Not found", { status: 404 });
  const [events, docs] = await Promise.all([access.repo.list("events", access.caseFile.id), access.repo.list("documents", access.caseFile.id)]);
  const csv = timelineToCsv(buildTimeline(events, docs));
  await access.repo.insert("exports", { id: newId("exp"), caseId: access.caseFile.id, kind: "timeline_csv", createdAt: nowIso(), createdBy: access.user.id });
  await audit(access, "export.timeline_csv", access.caseFile.id);
  return new Response(`﻿${csv}`, {
    headers: { ...PRIVATE_HEADERS, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": contentDisposition("attachment", "timeline.csv") },
  });
}
