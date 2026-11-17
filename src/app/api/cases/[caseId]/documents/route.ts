import { z } from "zod";
import { audit, checkCaseAccess } from "@/lib/auth/current";
import { criminalEnabled, getConfig } from "@/lib/config";
import { allowedOrigins } from "@/lib/domain/origin";
import { checkFile, safeFilename } from "@/lib/files";
import { isSameOrigin, redirect303 } from "@/lib/http";
import { logError, logEvent } from "@/lib/logger";
import { ingestFile, refreshFlags } from "@/lib/services/documents";

const MAX_FILES = 10;

const metaSchema = z.object({
  origin: z.enum(["mine", "other_side", "crown_disclosure", "my_lawyer", "filed_court", "public"]),
  providedBy: z.string().trim().max(200),
  howObtained: z.string().trim().max(200),
  tags: z.string().max(200),
});

/** Upload documents (multipart form). Works without JavaScript: responds with a 303 redirect. */
export async function POST(req: Request, ctx: RouteContext<"/api/cases/[caseId]/documents">) {
  const { caseId } = await ctx.params;
  const back = `/app/cases/${encodeURIComponent(caseId)}/documents`;
  if (!isSameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const access = await checkCaseAccess(caseId, "upload");
  if (!access) return new Response("Not found", { status: 404 });

  const cfg = getConfig();
  const maxBytes = cfg.MAX_UPLOAD_MB * 1_048_576;
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > maxBytes * MAX_FILES + 1_000_000) return redirect303(`${back}?error=too-large`, req);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return redirect303(`${back}?error=bad-form`, req);
  }
  const meta = metaSchema.safeParse({ origin: form.get("origin"), providedBy: form.get("providedBy") ?? "", howObtained: form.get("howObtained") ?? "", tags: form.get("tags") ?? "" });
  if (!meta.success) return redirect303(`${back}?error=origin`, req);
  const kindAllowed = allowedOrigins(access.caseFile.kind, criminalEnabled() && Boolean(access.caseFile.criminalAckAt));
  if (!kindAllowed.includes(meta.data.origin)) return redirect303(`${back}?error=origin-blocked`, req);

  const files = form.getAll("files").filter((f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f && (f as File).size > 0);
  if (files.length === 0) return redirect303(`${back}?error=no-files`, req);
  if (files.length > MAX_FILES) return redirect303(`${back}?error=too-many`, req);

  let ok = 0;
  const rejected: string[] = [];
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const name = safeFilename(file.name);
    const check = checkFile(name, bytes, maxBytes);
    if (!check.ok || !check.kind || !check.mimeType) {
      rejected.push(check.error ?? "rejected");
      continue;
    }
    try {
      const doc = await ingestFile(access, access.caseFile.id, access.user.id, { filename: name, bytes, kind: check.kind, mimeType: check.mimeType }, {
        title: name.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " "),
        origin: meta.data.origin,
        providedBy: meta.data.providedBy,
        howObtained: meta.data.howObtained,
        originalAvailable: false,
        tags: meta.data.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8),
      });
      await audit(access, "document.uploaded", access.caseFile.id, "document", doc.id);
      ok++;
    } catch (err) {
      logError("upload.ingest_failed", err, { caseId: access.caseFile.id });
      rejected.push("processing failed");
    }
  }
  if (ok > 0) {
    try {
      await refreshFlags(access, access.caseFile.id);
    } catch (err) {
      logError("upload.flags_failed", err, { caseId: access.caseFile.id });
    }
  }
  logEvent("upload.done", { caseId: access.caseFile.id, count: ok, removed: rejected.length });
  const q = new URLSearchParams({ uploaded: String(ok) });
  if (rejected.length) q.set("rejected", String(rejected.length));
  if (rejected.length && ok === 0) q.set("reason", rejected[0].slice(0, 120));
  return redirect303(`${back}?${q.toString()}`, req);
}
