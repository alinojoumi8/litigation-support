/**
 * Upload validation: allowlisted types, checked by extension AND content
 * (magic bytes), with size limits. SVG and HTML are refused because they can
 * carry scripts.
 */
export type FileKind = "pdf" | "png" | "jpeg" | "webp" | "text" | "email" | "csv";

export interface FileCheck {
  ok: boolean;
  kind?: FileKind;
  mimeType?: string;
  error?: string;
}

const EXT: Record<string, FileKind> = {
  pdf: "pdf",
  png: "png",
  jpg: "jpeg",
  jpeg: "jpeg",
  webp: "webp",
  txt: "text",
  md: "text",
  eml: "email",
  csv: "csv",
};

const MIME: Record<FileKind, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  text: "text/plain; charset=utf-8",
  email: "message/rfc822",
  csv: "text/csv; charset=utf-8",
};

export const ACCEPT_ATTR = ".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.eml,.csv";
export const ACCEPTED_LABEL = "PDF, PNG, JPG, WEBP, TXT, EML (saved email) or CSV";

function startsWith(b: Uint8Array, sig: number[], offset = 0) {
  return sig.every((x, i) => b[offset + i] === x);
}

function looksLikeText(b: Uint8Array): boolean {
  const n = Math.min(b.length, 8192);
  for (let i = 0; i < n; i++) if (b[i] === 0) return false;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(b.subarray(0, n));
    return true;
  } catch {
    // A multi-byte character may be cut at the boundary; retry slightly shorter.
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(b.subarray(0, Math.max(0, n - 3)));
      return true;
    } catch {
      return false;
    }
  }
}

export function checkFile(filename: string, bytes: Uint8Array, maxBytes: number): FileCheck {
  if (bytes.length === 0) return { ok: false, error: "The file is empty." };
  if (bytes.length > maxBytes) return { ok: false, error: `The file is larger than ${Math.round(maxBytes / 1_048_576)} MB.` };
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  const kind = EXT[ext];
  if (!kind) return { ok: false, error: `This file type is not supported yet. Use ${ACCEPTED_LABEL}.` };
  const valid =
    (kind === "pdf" && startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) ||
    (kind === "png" && startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    (kind === "jpeg" && startsWith(bytes, [0xff, 0xd8, 0xff])) ||
    (kind === "webp" && startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) ||
    ((kind === "text" || kind === "email" || kind === "csv") && looksLikeText(bytes));
  if (!valid) return { ok: false, error: "The file's contents do not match its type." };
  return { ok: true, kind, mimeType: MIME[kind] };
}

export function safeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  return base.replace(/[^\w.\- ()]+/g, "_").slice(0, 120) || "file";
}
