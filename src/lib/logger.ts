import "server-only";

/**
 * Content-free logger. Rule (decision 0002 rule 1): no document text, names,
 * notes, emails or other case content in logs, error tools or analytics.
 *
 * Only allowlisted keys with primitive values are written. Strings are capped
 * and must look like ids, codes or short enums.
 */
const ALLOWED_KEYS = new Set([
  "userId", "caseId", "docId", "flagId", "eventId", "count", "pages", "bytes", "ms",
  "provider", "model", "status", "kind", "code", "route", "action", "removed", "attempt",
]);

type Meta = Record<string, string | number | boolean | null | undefined>;

function clean(meta: Meta): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (!ALLOWED_KEYS.has(k) || v === undefined || v === null) continue;
    if (typeof v === "string") {
      if (!/^[A-Za-z0-9_.:/-]{1,80}$/.test(v)) continue; // drop anything that could be free text
      out[k] = v;
    } else out[k] = v;
  }
  return out;
}

export function logEvent(event: string, meta: Meta = {}): void {
  if (process.env.NODE_ENV === "test") return;
  console.info(JSON.stringify({ event, ...clean(meta) }));
}

/** Log an error by class and code only. The message may contain content, so it is not logged. */
export function logError(event: string, err: unknown, meta: Meta = {}): void {
  const name = err instanceof Error ? err.name : "UnknownError";
  const code = typeof err === "object" && err && "status" in err ? String((err as { status: unknown }).status) : undefined;
  console.error(JSON.stringify({ event, error: name, ...clean({ ...meta, code }) }));
}
