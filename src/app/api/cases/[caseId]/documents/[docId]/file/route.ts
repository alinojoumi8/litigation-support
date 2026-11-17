import { audit, checkCaseAccess } from "@/lib/auth/current";
import { isSafeId } from "@/lib/auth/authz";
import { contentDisposition, PRIVATE_HEADERS } from "@/lib/http";

/** Serve an original file to someone with read access. Every read is audit-logged. */
export async function GET(req: Request, ctx: RouteContext<"/api/cases/[caseId]/documents/[docId]/file">) {
  const { caseId, docId } = await ctx.params;
  const access = await checkCaseAccess(caseId, "read");
  if (!access || !isSafeId(docId)) return new Response("Not found", { status: 404 });
  const doc = await access.repo.get("documents", access.caseFile.id, docId);
  if (!doc) return new Response("Not found", { status: 404 });
  const bytes = await access.blobs.get(access.caseFile.id, doc.id);
  if (!bytes) return new Response("Not found", { status: 404 });
  const download = new URL(req.url).searchParams.get("download") === "1";
  await audit(access, download ? "document.downloaded" : "document.file_viewed", access.caseFile.id, "document", doc.id);
  return new Response(new Uint8Array(bytes), {
    headers: {
      ...PRIVATE_HEADERS,
      "Content-Type": doc.mimeType,
      "Content-Disposition": contentDisposition(download ? "attachment" : "inline", doc.filename),
      // Files are shown as data, never run as a page: `default-src 'none'` blocks
      // scripts, plugins and network access. PDFs need the browser's built-in
      // viewer, so they get framing limits only. (A `sandbox` directive would
      // also stop browsers painting SVG images, so it is not used.)
      "Content-Security-Policy":
        doc.mimeType === "application/pdf" ? "frame-ancestors 'self'" : "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; frame-ancestors 'self'",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
