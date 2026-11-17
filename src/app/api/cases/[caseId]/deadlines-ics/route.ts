import { audit, checkCaseAccess } from "@/lib/auth/current";
import { PRODUCT_NAME } from "@/lib/brand";
import { deadlinesToIcs } from "@/lib/domain/deadlines";
import { contentDisposition, PRIVATE_HEADERS } from "@/lib/http";

export async function GET(_req: Request, ctx: RouteContext<"/api/cases/[caseId]/deadlines-ics">) {
  const { caseId } = await ctx.params;
  const access = await checkCaseAccess(caseId, "export");
  if (!access) return new Response("Not found", { status: 404 });
  const deadlines = await access.repo.list("deadlines", access.caseFile.id);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  await audit(access, "export.ics", access.caseFile.id);
  return new Response(deadlinesToIcs(deadlines, stamp, PRODUCT_NAME), {
    headers: { ...PRIVATE_HEADERS, "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": contentDisposition("attachment", "deadlines.ics") },
  });
}
