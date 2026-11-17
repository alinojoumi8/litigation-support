import "server-only";
import { DetectDocumentTextCommand, TextractClient } from "@aws-sdk/client-textract";
import type { FileKind } from "../files";
import { logError, logEvent } from "../logger";
import type { Extraction, TextExtractor } from "./index";

/**
 * AWS Textract adapter (ca-central-1 by default). UNTESTED: no AWS
 * credentials in this repo. Credentials come from the standard AWS chain
 * (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY, or an instance role).
 *
 * Uses the synchronous DetectDocumentText API, which accepts single-page
 * images and single-page PDFs. Multi-page scanned PDFs need the asynchronous
 * StartDocumentTextDetection API with an S3 bucket in the same region; that
 * is not built yet (see docs/build-status.md). Text is never logged.
 */
export class TextractExtractor implements TextExtractor {
  readonly label: string;
  private readonly client: TextractClient;

  constructor(region: string, private readonly fallback: TextExtractor) {
    this.client = new TextractClient({ region });
    this.label = `AWS Textract (${region})`;
  }

  async extract(bytes: Uint8Array, kind: FileKind): Promise<Extraction> {
    const base = await this.fallback.extract(bytes, kind);
    // Textract does not accept WEBP, so WEBP images keep the local (empty) result.
    const needsOcr = kind === "png" || kind === "jpeg" || (kind === "pdf" && base.pages.every((p) => p.trim() === "") && base.pages.length === 1);
    if (!needsOcr) return base;
    try {
      const started = performance.now();
      const res = await this.client.send(new DetectDocumentTextCommand({ Document: { Bytes: bytes } }));
      const lines = (res.Blocks ?? []).filter((b) => b.BlockType === "LINE");
      const byPage = new Map<number, string[]>();
      for (const l of lines) {
        const p = l.Page ?? 1;
        byPage.set(p, [...(byPage.get(p) ?? []), l.Text ?? ""]);
      }
      const pages = [...byPage.entries()].sort((a, b) => a[0] - b[0]).map(([, ls]) => ls.join("\n"));
      logEvent("ocr.textract", { pages: pages.length, ms: Math.round(performance.now() - started) });
      return { pages: pages.length ? pages : [""], method: "textract", emailMeta: null };
    } catch (err) {
      logError("ocr.textract_failed", err);
      return base;
    }
  }
}
