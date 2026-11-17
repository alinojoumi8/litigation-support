import { audit, checkCaseAccess } from "@/lib/auth/current";
import { EXPORT_DISCLAIMER, PRODUCT_NAME } from "@/lib/brand";
import { CASE_COLLECTIONS } from "@/lib/data/repository";
import { formatSourceId } from "@/lib/domain/origin";
import { buildTimeline, timelineToCsv } from "@/lib/domain/timeline";
import { createZip, type ZipEntry } from "@/lib/domain/zip";
import { contentDisposition, PRIVATE_HEADERS } from "@/lib/http";
import { newId, nowIso } from "@/lib/ids";

/** "Export everything": every record as JSON, the original files with source ids, and the timeline CSV. */
export async function GET(_req: Request, ctx: RouteContext<"/api/cases/[caseId]/export">) {
  const { caseId } = await ctx.params;
  const access = await checkCaseAccess(caseId, "export");
  if (!access) return new Response("Not found", { status: 404 });
  const id = access.caseFile.id;
  const enc = new TextEncoder();

  const collections = Object.fromEntries(await Promise.all(CASE_COLLECTIONS.map(async (k) => [k, await access.repo.list(k, id)] as const)));
  const docs = collections.documents as Awaited<ReturnType<typeof access.repo.list<"documents">>>;
  const entries: ZipEntry[] = [
    {
      name: "README.txt",
      data: enc.encode(
        [
          `${PRODUCT_NAME} case export`,
          `Exported: ${nowIso()}`,
          "",
          EXPORT_DISCLAIMER,
          "",
          "case.json        every record in this case (documents, extracted text, summaries, timeline, flags, notes, deadlines)",
          "timeline.csv     the master timeline, with confirmed and unconfirmed status",
          "documents/       original files, named by source id",
          "",
          "This archive may contain documents subject to undertakings or privilege. Store it securely.",
        ].join("\r\n"),
      ),
    },
    { name: "case.json", data: enc.encode(JSON.stringify({ case: access.caseFile, ...collections }, null, 2)) },
    { name: "timeline.csv", data: enc.encode(timelineToCsv(buildTimeline(collections.events as never, docs))) },
  ];
  for (const d of docs.sort((a, b) => a.seq - b.seq)) {
    const bytes = await access.blobs.get(id, d.id);
    if (bytes) entries.push({ name: `documents/${formatSourceId(d.seq)} - ${d.filename}`, data: bytes });
  }
  const zip = createZip(entries);
  await access.repo.insert("exports", { id: newId("exp"), caseId: id, kind: "zip", createdAt: nowIso(), createdBy: access.user.id });
  await audit(access, "export.zip", id);
  return new Response(new Uint8Array(zip), {
    headers: { ...PRIVATE_HEADERS, "Content-Type": "application/zip", "Content-Disposition": contentDisposition("attachment", "case-export.zip") },
  });
}
