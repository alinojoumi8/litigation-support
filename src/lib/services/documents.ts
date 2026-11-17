import "server-only";
import { createHash } from "node:crypto";
import { getAI } from "../ai";
import { MockAIProvider } from "../ai/mock";
import { guardDiscrepancies, guardSummary } from "../ai/guard";
import { DISCREPANCY_PROMPT_VERSION, SUMMARY_PROMPT_VERSION, type DiscrepancyDocInput } from "../ai/provider";
import type { DataAdapters } from "../data";
import { findDiscrepancies, type DocFacts } from "../domain/discrepancies";
import { findAmounts, findDates, findReferences, guessDocType, splitSentences } from "../domain/extract";
import { eventKey } from "../domain/timeline";
import type { DocumentRecord, Flag, Origin, PageText, TimelineEvent } from "../domain/types";
import type { FileKind } from "../files";
import { newId, nowIso } from "../ids";
import { logEvent } from "../logger";
import { getExtractor, type Extraction } from "../ocr";

export interface IngestMeta {
  title: string;
  origin: Origin;
  providedBy: string;
  howObtained: string;
  originalAvailable: boolean;
  tags: string[];
  isSample?: boolean;
}

export async function ingestFile(
  data: DataAdapters,
  caseId: string,
  userId: string,
  file: { filename: string; bytes: Uint8Array; kind: FileKind; mimeType: string },
  meta: IngestMeta,
  preExtracted?: Extraction,
  opts: { localOnly?: boolean } = {},
): Promise<DocumentRecord> {
  const extraction = preExtracted ?? (await (await getExtractor()).extract(file.bytes, file.kind));
  const docId = newId("doc");
  const seq = await data.repo.nextDocumentSeq(caseId);
  const firstText = extraction.pages[0] ?? "";
  const docDate = extraction.emailMeta?.date ? findDates(extraction.emailMeta.date)[0]?.iso ?? null : findDates(firstText)[0]?.iso ?? null;
  const doc: DocumentRecord = {
    id: docId,
    caseId,
    seq,
    title: meta.title.trim() || file.filename,
    filename: file.filename,
    mimeType: file.mimeType,
    size: file.bytes.length,
    sha256: createHash("sha256").update(file.bytes).digest("hex"),
    origin: meta.origin,
    providedBy: meta.providedBy.trim(),
    howObtained: meta.howObtained.trim(),
    originalAvailable: meta.originalAvailable,
    docDate,
    docType: file.kind === "png" || file.kind === "jpeg" || file.kind === "webp" ? "Image" : guessDocType(meta.title || file.filename, firstText),
    tags: meta.tags,
    pageCount: extraction.pages.length,
    extraction: meta.isSample ? "sample" : extraction.method,
    emailMeta: extraction.emailMeta,
    uploadedAt: nowIso(),
    uploadedBy: userId,
    isSample: Boolean(meta.isSample),
  };
  await data.blobs.put(caseId, docId, file.bytes, file.mimeType);
  await data.repo.insert("documents", doc);
  const pages: PageText[] = extraction.pages.map((text, i) => ({ id: `${docId}:${i + 1}`, caseId, docId, page: i + 1, text }));
  await data.repo.insertMany("pages", pages);
  logEvent("document.ingested", { caseId, docId, pages: pages.length, bytes: file.bytes.length, kind: file.kind });
  if (pages.some((p) => p.text.trim().length > 0)) await summarizeDocument(data, caseId, doc, pages, opts);
  return doc;
}

/** Summarize one document and add its dated events to the timeline (as unconfirmed AI drafts). */
export async function summarizeDocument(data: DataAdapters, caseId: string, doc: DocumentRecord, pages?: PageText[], opts: { localOnly?: boolean } = {}) {
  const pageRows = (pages ?? (await data.repo.list("pages", caseId)).filter((p) => p.docId === doc.id)).sort((a, b) => a.page - b.page);
  // Sample data always uses the local extractor: deterministic, and never sent to an external AI.
  const ai = opts.localOnly ? new MockAIProvider() : await getAI();
  const input = { title: doc.title, docType: doc.docType, pages: pageRows.map((p) => ({ page: p.page, text: p.text })), emailMeta: doc.emailMeta };
  const raw = await ai.summarize(input);
  const { output, notes } = guardSummary(raw, input.pages);

  await data.repo.clear("summaries", caseId, { docId: doc.id });
  await data.repo.insert("summaries", {
    id: newId("sum"),
    caseId,
    docId: doc.id,
    summary: output.summary,
    keyFacts: output.keyFacts,
    people: output.people,
    provider: ai.id,
    model: ai.model,
    promptVersion: SUMMARY_PROMPT_VERSION,
    guardNotes: notes,
    createdAt: nowIso(),
  });

  // Replace this document's unconfirmed AI events; keep anything the user confirmed or wrote.
  const existing = (await data.repo.list("events", caseId)).filter((e) => e.sourceDocId === doc.id);
  const keep = existing.filter((e) => e.status === "confirmed" || e.createdBy === "user");
  for (const e of existing) if (!keep.includes(e)) await data.repo.remove("events", caseId, e.id);
  const keepKeys = new Set(keep.map(eventKey));
  const now = nowIso();
  const fresh: TimelineEvent[] = [];
  for (const e of output.events) {
    const ev: TimelineEvent = {
      id: newId("evt"),
      caseId,
      date: e.date,
      datePrecision: e.datePrecision,
      description: e.description,
      sourceDocId: doc.id,
      sourcePage: e.page,
      quote: e.quote,
      people: e.people,
      tags: doc.tags,
      status: "unconfirmed",
      createdBy: "ai",
      provider: ai.id,
      model: ai.model,
      promptVersion: SUMMARY_PROMPT_VERSION,
      createdAt: now,
      updatedAt: now,
    };
    const k = eventKey(ev);
    if (keepKeys.has(k)) continue;
    keepKeys.add(k);
    fresh.push(ev);
  }
  await data.repo.insertMany("events", fresh);
  logEvent("document.summarized", { caseId, docId: doc.id, provider: ai.id, count: fresh.length });
}

function factsFor(doc: DocumentRecord, pages: PageText[]): DiscrepancyDocInput {
  const facts: { page: number; sentence: string }[] = [];
  for (const p of pages) {
    for (const s of splitSentences(p.text)) {
      if (findDates(s.text).length || findAmounts(s.text).length || findReferences(s.text).length) facts.push({ page: p.page, sentence: s.text.slice(0, 300) });
    }
  }
  return { docId: doc.id, seq: doc.seq, title: doc.title, facts: facts.slice(0, 80) };
}

/**
 * Re-run the discrepancy finder. Rule-based flags always run; the AI adds
 * candidates when an external model is configured. Review status and notes
 * survive re-runs (matched by fingerprint). Unreviewed flags that no longer
 * apply are removed.
 */
export async function refreshFlags(data: DataAdapters, caseId: string, opts: { localOnly?: boolean } = {}): Promise<{ total: number; added: number }> {
  const [docs, pages, existing] = await Promise.all([data.repo.list("documents", caseId), data.repo.list("pages", caseId), data.repo.list("flags", caseId)]);
  const pagesByDoc = new Map<string, PageText[]>();
  for (const p of pages) pagesByDoc.set(p.docId, [...(pagesByDoc.get(p.docId) ?? []), p]);

  const facts: DocFacts[] = docs.map((d) => ({
    docId: d.id,
    seq: d.seq,
    title: d.title,
    filename: d.filename,
    sha256: d.sha256,
    emailMeta: d.emailMeta,
    pages: (pagesByDoc.get(d.id) ?? []).sort((a, b) => a.page - b.page).map((p) => ({ page: p.page, text: p.text })),
  }));
  const drafts: (ReturnType<typeof findDiscrepancies>[number] & { createdBy: Flag["createdBy"]; provider: string | null; model: string | null })[] =
    findDiscrepancies(facts).map((d) => ({ ...d, createdBy: "rules" as const, provider: null, model: null }));

  const ai = opts.localOnly ? new MockAIProvider() : await getAI();
  if (ai.external) {
    const inputs = docs.map((d) => factsFor(d, pagesByDoc.get(d.id) ?? []));
    const cands = guardDiscrepancies(await ai.findDiscrepancies(inputs), inputs);
    for (const c of cands) {
      const fp = `ai|${c.kind}|${c.sources.map((s) => `${s.docId}:${s.page}`).sort().join("|")}`;
      if (drafts.some((d) => d.sources.map((s) => s.docId).sort().join() === c.sources.map((s) => s.docId).sort().join() && d.kind === c.kind)) continue;
      drafts.push({ ...c, fingerprint: fp, createdBy: "ai", provider: ai.id, model: `${ai.model} / ${DISCREPANCY_PROMPT_VERSION}` });
    }
  }

  const byFp = new Map(existing.map((f) => [f.fingerprint, f]));
  const seen = new Set<string>();
  let added = 0;
  const now = nowIso();
  for (const d of drafts) {
    seen.add(d.fingerprint);
    const prev = byFp.get(d.fingerprint);
    if (prev) {
      await data.repo.update("flags", caseId, prev.id, { title: d.title, detail: d.detail, sources: d.sources, updatedAt: now });
    } else {
      added++;
      await data.repo.insert("flags", {
        id: newId("flg"),
        caseId,
        fingerprint: d.fingerprint,
        kind: d.kind,
        title: d.title,
        detail: d.detail,
        sources: d.sources,
        status: "new",
        createdBy: d.createdBy,
        provider: d.provider,
        model: d.model,
        userNote: "",
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  for (const f of existing) {
    if (!seen.has(f.fingerprint) && f.status === "new" && !f.userNote) await data.repo.remove("flags", caseId, f.id);
  }
  logEvent("flags.refreshed", { caseId, count: drafts.length });
  return { total: drafts.length, added };
}
