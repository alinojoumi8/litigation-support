import "server-only";
import { getConfig } from "../config";
import type { EmailMeta, ExtractionMethod } from "../domain/types";
import type { FileKind } from "../files";
import { logError } from "../logger";
import { parseEmail } from "./email";

export interface Extraction {
  pages: string[];
  method: ExtractionMethod;
  emailMeta: EmailMeta | null;
}

export interface TextExtractor {
  readonly label: string;
  extract(bytes: Uint8Array, kind: FileKind): Promise<Extraction>;
}

/** Split long plain text into "pages" of about 3,000 characters at paragraph breaks. Form feeds always split. */
export function paginate(text: string, size = 3000): string[] {
  const out: string[] = [];
  for (const block of text.split("\f")) {
    let cur = "";
    for (const para of block.split(/\n{2,}/)) {
      if (cur && cur.length + para.length > size) {
        out.push(cur.trim());
        cur = "";
      }
      cur += (cur ? "\n\n" : "") + para;
    }
    if (cur.trim()) out.push(cur.trim());
  }
  return out.length ? out : [""];
}

/** Local extraction: text, email and digital PDFs. No OCR: scanned pages and photos come back empty. */
export class LocalTextExtractor implements TextExtractor {
  readonly label = "Local text extraction (no OCR)";

  async extract(bytes: Uint8Array, kind: FileKind): Promise<Extraction> {
    const text = () => new TextDecoder("utf-8").decode(bytes);
    if (kind === "text" || kind === "csv") return { pages: paginate(text()), method: "plain-text", emailMeta: null };
    if (kind === "email") {
      const { meta, text: t } = parseEmail(text());
      return { pages: paginate(t), method: "email", emailMeta: meta };
    }
    if (kind === "pdf") {
      try {
        const { extractText, getDocumentProxy } = await import("unpdf");
        const pdf = await getDocumentProxy(new Uint8Array(bytes));
        const { text: pages } = await extractText(pdf, { mergePages: false });
        return { pages: pages.map((p) => p.trim()), method: "pdf-text", emailMeta: null };
      } catch (err) {
        logError("extract.pdf_failed", err);
        return { pages: [""], method: "pdf-text", emailMeta: null };
      }
    }
    return { pages: [""], method: "image-no-ocr", emailMeta: null };
  }
}

export async function getExtractor(): Promise<TextExtractor> {
  const c = getConfig();
  if (c.OCR_PROVIDER === "textract") {
    const { TextractExtractor } = await import("./textract");
    return new TextractExtractor(c.AWS_REGION, new LocalTextExtractor());
  }
  return new LocalTextExtractor();
}
