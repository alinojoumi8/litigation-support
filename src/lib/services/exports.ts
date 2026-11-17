import type { ExportRecord } from "../domain/types";

/** Packages open only right after the user confirmed the review step (within 2 hours). */
export function hasRecentExport(exports: ExportRecord[], kinds: ExportRecord["kind"][], nowMs: number): boolean {
  return exports.some((e) => kinds.includes(e.kind) && nowMs - Date.parse(e.createdAt) < 2 * 3_600_000);
}

/** Request-time check used by the package pages. */
export function recentlyExported(exports: ExportRecord[], kinds: ExportRecord["kind"][]): boolean {
  return hasRecentExport(exports, kinds, Date.now());
}
