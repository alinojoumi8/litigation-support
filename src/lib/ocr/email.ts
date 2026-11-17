import type { EmailMeta } from "../domain/types";

/**
 * Small RFC 822 / MIME reader for saved emails (.eml). Handles folded
 * headers, encoded words, multipart bodies, quoted-printable and base64 text
 * parts, and lists attachment file names. Attachments are not extracted.
 */

function unfold(headerBlock: string): string[] {
  return headerBlock.replace(/\r\n/g, "\n").replace(/\n[ \t]+/g, " ").split("\n");
}

function decodeWords(s: string): string {
  return s.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, charset: string, enc: string, data: string) => {
    try {
      const bytes =
        enc.toUpperCase() === "B"
          ? Buffer.from(data, "base64")
          : Buffer.from(data.replace(/_/g, " ").replace(/=([0-9A-Fa-f]{2})/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16))), "latin1");
      return new TextDecoder(charset.toLowerCase() === "utf-8" ? "utf-8" : "latin1").decode(bytes);
    } catch {
      return data;
    }
  });
}

function parseHeaders(block: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of unfold(block)) {
    const i = line.indexOf(":");
    if (i <= 0) continue;
    const k = line.slice(0, i).trim().toLowerCase();
    if (!map.has(k)) map.set(k, decodeWords(line.slice(i + 1).trim()));
  }
  return map;
}

function decodeBody(body: string, encoding: string | undefined): string {
  const enc = (encoding ?? "").toLowerCase();
  if (enc === "base64") return Buffer.from(body.replace(/\s+/g, ""), "base64").toString("utf8");
  if (enc === "quoted-printable") {
    const bytes = Buffer.from(body.replace(/=\r?\n/g, "").replace(/=([0-9A-Fa-f]{2})/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16))), "latin1");
    return bytes.toString("utf8");
  }
  return body;
}

function split(raw: string): { headers: Map<string, string>; body: string } {
  const norm = raw.replace(/\r\n/g, "\n");
  const i = norm.indexOf("\n\n");
  if (i < 0) return { headers: parseHeaders(norm), body: "" };
  return { headers: parseHeaders(norm.slice(0, i)), body: norm.slice(i + 2) };
}

function param(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  const m = header.match(new RegExp(`${name}\\*?=\\s*"?([^";]+)"?`, "i"));
  return m?.[1];
}

interface Part {
  text: string | null;
  attachments: string[];
}

function walk(raw: string, depth = 0): Part {
  const { headers, body } = split(raw);
  const type = (headers.get("content-type") ?? "text/plain").toLowerCase();
  const disposition = headers.get("content-disposition");
  const filename = param(disposition, "filename") ?? param(headers.get("content-type"), "name");
  if (filename && (disposition?.toLowerCase().startsWith("attachment") || !type.startsWith("text/"))) {
    return { text: null, attachments: [decodeWords(filename)] };
  }
  if (type.startsWith("multipart/") && depth < 5) {
    const boundary = param(headers.get("content-type"), "boundary");
    if (!boundary) return { text: body, attachments: [] };
    const sections = body.split(`--${boundary}`).slice(1).filter((s) => !s.startsWith("--"));
    const parts = sections.map((s) => walk(s.replace(/^\n/, ""), depth + 1));
    const plain = parts.find((p) => p.text !== null)?.text ?? null;
    return { text: plain, attachments: parts.flatMap((p) => p.attachments) };
  }
  const decoded = decodeBody(body, headers.get("content-transfer-encoding"));
  if (type.startsWith("text/html")) {
    return { text: decoded.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/[ \t]+/g, " "), attachments: [] };
  }
  return { text: decoded, attachments: [] };
}

export function parseEmail(raw: string): { meta: EmailMeta; text: string } {
  const { headers } = split(raw);
  const part = walk(raw);
  const meta: EmailMeta = {
    from: headers.get("from") ?? "",
    to: headers.get("to") ?? "",
    date: headers.get("date") ?? null,
    subject: headers.get("subject") ?? "",
    attachments: part.attachments,
  };
  const head = [`From: ${meta.from}`, `To: ${meta.to}`, meta.date ? `Date: ${meta.date}` : "", `Subject: ${meta.subject}`].filter(Boolean).join("\n");
  const attach = meta.attachments.length ? `\n\nAttachments listed: ${meta.attachments.join(", ")}` : "";
  return { meta, text: `${head}\n\n${(part.text ?? "").trim()}${attach}` };
}
