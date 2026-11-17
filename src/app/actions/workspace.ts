"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit, requireCaseAccess } from "@/lib/auth/current";
import { isSafeId } from "@/lib/auth/authz";
import { parseTransactions } from "@/lib/domain/accounting";
import { findDates } from "@/lib/domain/extract";
import type { FlagStatus, SignatureObservation } from "@/lib/domain/types";
import { buildExaminerNote, neutralize } from "@/lib/domain/wording";
import { getPathway } from "@/lib/content/pathways";
import { newId, nowIso } from "@/lib/ids";
import { refreshFlags, summarizeDocument } from "@/lib/services/documents";

const str = (form: FormData, k: string) => String(form.get(k) ?? "");
const id = (form: FormData, k: string) => {
  const v = form.get(k);
  if (!isSafeId(v)) throw new Error("Invalid id");
  return v;
};
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a full date.").refine((d) => findDates(d).length > 0, "Enter a real date.");

// Timeline -----------------------------------------------------------------

export async function confirmEventAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const eventId = id(form, "eventId");
  const status = str(form, "status") === "unconfirmed" ? "unconfirmed" : "confirmed";
  await ctx.repo.update("events", ctx.caseFile.id, eventId, { status, updatedAt: nowIso() });
  await audit(ctx, `event.${status}`, ctx.caseFile.id, "event", eventId);
  refresh();
}

export async function confirmAllFromDocAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const docId = id(form, "docId");
  const events = (await ctx.repo.list("events", ctx.caseFile.id)).filter((e) => e.sourceDocId === docId && e.status === "unconfirmed");
  for (const e of events) await ctx.repo.update("events", ctx.caseFile.id, e.id, { status: "confirmed", updatedAt: nowIso() });
  await audit(ctx, "event.confirmed_bulk", ctx.caseFile.id, "document", docId);
  refresh();
}

const eventSchema = z.object({
  date: isoDate,
  description: z.string().trim().min(2, "Describe the event.").max(400),
  people: z.string().max(300),
  tags: z.string().max(200),
  sourceDocId: z.string().optional(),
  sourcePage: z.coerce.number().int().min(1).max(100000).optional(),
});

export async function saveEventAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const v = eventSchema.parse({
    date: str(form, "date"),
    description: str(form, "description"),
    people: str(form, "people"),
    tags: str(form, "tags"),
    sourceDocId: str(form, "sourceDocId") || undefined,
    sourcePage: str(form, "sourcePage") || undefined,
  });
  const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 12);
  let sourceDocId: string | null = null;
  if (v.sourceDocId) {
    const doc = isSafeId(v.sourceDocId) ? await ctx.repo.get("documents", ctx.caseFile.id, v.sourceDocId) : null;
    sourceDocId = doc?.id ?? null;
  }
  const existingId = form.get("eventId");
  const now = nowIso();
  if (isSafeId(existingId)) {
    await ctx.repo.update("events", ctx.caseFile.id, existingId, {
      date: v.date,
      datePrecision: "day",
      description: v.description,
      people: list(v.people),
      tags: list(v.tags),
      status: "confirmed",
      updatedAt: now,
      // Editing the wording means it is no longer the verbatim source quote.
      quote: null,
    });
    await audit(ctx, "event.edited", ctx.caseFile.id, "event", existingId);
  } else {
    const eventId = newId("evt");
    await ctx.repo.insert("events", {
      id: eventId,
      caseId: ctx.caseFile.id,
      date: v.date,
      datePrecision: "day",
      description: v.description,
      sourceDocId,
      sourcePage: sourceDocId ? v.sourcePage ?? 1 : null,
      quote: null,
      people: list(v.people),
      tags: list(v.tags),
      status: "confirmed",
      createdBy: "user",
      provider: null,
      model: null,
      promptVersion: null,
      createdAt: now,
      updatedAt: now,
    });
    await audit(ctx, "event.created", ctx.caseFile.id, "event", eventId);
  }
  refresh();
}

export async function deleteEventAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const eventId = id(form, "eventId");
  await ctx.repo.remove("events", ctx.caseFile.id, eventId);
  await audit(ctx, "event.deleted", ctx.caseFile.id, "event", eventId);
  refresh();
}

// Flags ----------------------------------------------------------------------

const FLAG_STATUSES: FlagStatus[] = ["new", "matters", "not_an_issue", "ask_lawyer"];

export async function setFlagStatusAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const flagId = id(form, "flagId");
  const status = z.enum(FLAG_STATUSES as [FlagStatus, ...FlagStatus[]]).parse(str(form, "status"));
  const note = form.has("userNote") ? neutralize(z.string().max(1000).parse(str(form, "userNote")).trim()).text : undefined;
  await ctx.repo.update("flags", ctx.caseFile.id, flagId, { status, ...(note !== undefined ? { userNote: note } : {}), updatedAt: nowIso() });
  await audit(ctx, `flag.${status}`, ctx.caseFile.id, "flag", flagId);
  if (status === "ask_lawyer" && form.get("addQuestion") === "on") {
    const flag = await ctx.repo.get("flags", ctx.caseFile.id, flagId);
    if (flag) {
      await ctx.repo.insert("questions", { id: newId("qst"), caseId: ctx.caseFile.id, text: `About "${flag.title}": what should I know about this?`, audience: "lawyer", status: "open", answer: "", createdAt: nowIso() });
    }
  }
  refresh();
}

export async function rerunFlagsAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  await refreshFlags(ctx, ctx.caseFile.id, { localOnly: ctx.caseFile.isSample });
  await audit(ctx, "flags.refreshed", ctx.caseFile.id);
  refresh();
}

export async function setMoneyFlagStatusAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const fp = z.string().min(3).max(200).parse(str(form, "fingerprint"));
  const status = z.enum(FLAG_STATUSES as [FlagStatus, ...FlagStatus[]]).parse(str(form, "status"));
  await ctx.repo.updateCase(ctx.caseFile.id, { moneyFlagStatus: { ...ctx.caseFile.moneyFlagStatus, [fp]: status }, updatedAt: nowIso() });
  await audit(ctx, `moneyflag.${status}`, ctx.caseFile.id);
  refresh();
}

export async function importStatementAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "upload");
  const docId = id(form, "docId");
  const doc = await ctx.repo.get("documents", ctx.caseFile.id, docId);
  if (!doc || !/csv/.test(doc.mimeType)) redirect(`/app/cases/${ctx.caseFile.id}/money?error=not-csv`);
  const pages = (await ctx.repo.list("pages", ctx.caseFile.id)).filter((p) => p.docId === docId).sort((a, b) => a.page - b.page);
  const { rows, errors } = parseTransactions(pages.map((p) => p.text).join("\n\n").replace(/\n\n/g, "\n"));
  if (rows.length === 0) redirect(`/app/cases/${ctx.caseFile.id}/money?error=no-rows&n=${errors.length}`);
  await ctx.repo.clear("transactions", ctx.caseFile.id);
  const importId = newId("imp");
  await ctx.repo.insertMany(
    "transactions",
    rows.map((r) => ({ id: newId("txn"), caseId: ctx.caseFile.id, importId, importName: `Doc ${String(doc.seq).padStart(4, "0")}: ${doc.title}`, ...r })),
  );
  await audit(ctx, "money.imported", ctx.caseFile.id, "document", docId);
  redirect(`/app/cases/${ctx.caseFile.id}/money?imported=${rows.length}&skipped=${errors.length}`);
}

// Deadlines -----------------------------------------------------------------

export async function addDeadlineAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const v = z
    .object({ title: z.string().trim().min(2).max(160), date: isoDate, notes: z.string().max(600), sourceDocId: z.string() })
    .parse({ title: str(form, "title"), date: str(form, "date"), notes: str(form, "notes"), sourceDocId: str(form, "sourceDocId") });
  const doc = isSafeId(v.sourceDocId) ? await ctx.repo.get("documents", ctx.caseFile.id, v.sourceDocId) : null;
  const deadlineId = newId("ddl");
  await ctx.repo.insert("deadlines", { id: deadlineId, caseId: ctx.caseFile.id, title: v.title, date: v.date, notes: v.notes.trim(), sourceDocId: doc?.id ?? null, done: false, createdAt: nowIso() });
  if (ctx.caseFile.noDeadlinesYet) await ctx.repo.updateCase(ctx.caseFile.id, { noDeadlinesYet: false });
  await audit(ctx, "deadline.created", ctx.caseFile.id, "deadline", deadlineId);
  refresh();
}

export async function toggleDeadlineAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const deadlineId = id(form, "deadlineId");
  await ctx.repo.update("deadlines", ctx.caseFile.id, deadlineId, { done: str(form, "done") === "true" });
  await audit(ctx, "deadline.toggled", ctx.caseFile.id, "deadline", deadlineId);
  refresh();
}

export async function deleteDeadlineAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const deadlineId = id(form, "deadlineId");
  await ctx.repo.remove("deadlines", ctx.caseFile.id, deadlineId);
  await audit(ctx, "deadline.deleted", ctx.caseFile.id, "deadline", deadlineId);
  refresh();
}

// Questions -----------------------------------------------------------------

export async function addQuestionAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const text = z.string().trim().min(3).max(800).parse(str(form, "text"));
  const audience = z.enum(["lawyer", "expert", "self"]).parse(str(form, "audience") || "lawyer");
  const qid = newId("qst");
  await ctx.repo.insert("questions", { id: qid, caseId: ctx.caseFile.id, text, audience, status: "open", answer: "", createdAt: nowIso() });
  await audit(ctx, "question.created", ctx.caseFile.id, "question", qid);
  refresh();
}

export async function updateQuestionAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const qid = id(form, "questionId");
  const answer = z.string().max(2000).parse(str(form, "answer")).trim();
  await ctx.repo.update("questions", ctx.caseFile.id, qid, { answer, status: answer ? "answered" : "open" });
  await audit(ctx, "question.updated", ctx.caseFile.id, "question", qid);
  refresh();
}

export async function deleteQuestionAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const qid = id(form, "questionId");
  await ctx.repo.remove("questions", ctx.caseFile.id, qid);
  await audit(ctx, "question.deleted", ctx.caseFile.id, "question", qid);
  refresh();
}

// This week and pathway -------------------------------------------------------

export async function toggleTaskAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const weekKey = z.string().regex(/^\d{4}-W\d{2}$/).parse(str(form, "weekKey"));
  const taskKey = z.string().regex(/^[A-Za-z0-9_-]{1,80}$/).parse(str(form, "taskKey"));
  const rowId = `${weekKey}:${taskKey}`;
  if (str(form, "done") === "true") {
    await ctx.repo.upsert("taskCompletions", { id: rowId, caseId: ctx.caseFile.id, weekKey, taskKey, doneAt: nowIso() });
  } else {
    await ctx.repo.remove("taskCompletions", ctx.caseFile.id, rowId);
  }
  refresh();
}

export async function togglePathwayItemAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const pathway = getPathway(str(form, "pathwayId"));
  if (!pathway) throw new Error("Unknown pathway");
  if (pathway.gated && ctx.caseFile.kind !== "criminal") throw new Error("Pathway not available");
  const itemId = str(form, "itemId");
  const valid = pathway.steps.some((s) => s.checklist.some((i) => i.id === itemId));
  if (!valid) throw new Error("Unknown item");
  const existing = await ctx.repo.get("pathwayProgress", ctx.caseFile.id, pathway.id);
  const checked = new Set(existing?.checked ?? []);
  if (str(form, "done") === "true") checked.add(itemId);
  else checked.delete(itemId);
  await ctx.repo.upsert("pathwayProgress", { id: pathway.id, caseId: ctx.caseFile.id, pathwayId: pathway.id, checked: [...checked], currentStep: existing?.currentStep ?? null, updatedAt: nowIso() });
  refresh();
}

export async function setPathwayStepAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const pathway = getPathway(str(form, "pathwayId"));
  const stepId = str(form, "stepId");
  if (!pathway || !pathway.steps.some((s) => s.id === stepId)) throw new Error("Unknown step");
  const existing = await ctx.repo.get("pathwayProgress", ctx.caseFile.id, pathway.id);
  await ctx.repo.upsert("pathwayProgress", { id: pathway.id, caseId: ctx.caseFile.id, pathwayId: pathway.id, checked: existing?.checked ?? [], currentStep: stepId, updatedAt: nowIso() });
  refresh();
}

// Documents -------------------------------------------------------------------

const docMetaSchema = z.object({
  title: z.string().trim().min(1).max(160),
  origin: z.enum(["mine", "other_side", "my_lawyer", "filed_court", "public", "crown_disclosure"]),
  providedBy: z.string().trim().max(200),
  howObtained: z.string().trim().max(200),
  originalAvailable: z.boolean(),
});

export async function updateDocumentAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const docId = id(form, "docId");
  const v = docMetaSchema.parse({
    title: str(form, "title"),
    origin: str(form, "origin"),
    providedBy: str(form, "providedBy"),
    howObtained: str(form, "howObtained"),
    originalAvailable: form.get("originalAvailable") === "on",
  });
  if (v.origin === "crown_disclosure" && !(ctx.caseFile.kind === "criminal" && ctx.caseFile.criminalAckAt)) throw new Error("Crown disclosure is not available for this case.");
  await ctx.repo.update("documents", ctx.caseFile.id, docId, v);
  await audit(ctx, "document.updated", ctx.caseFile.id, "document", docId);
  refresh();
}

export async function deleteDocumentAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const docId = id(form, "docId");
  if (form.get("confirmDelete") !== "on") redirect(`/app/cases/${ctx.caseFile.id}/documents/${docId}`);
  await ctx.repo.removeDocumentCascade(ctx.caseFile.id, docId);
  await audit(ctx, "document.deleted", ctx.caseFile.id, "document", docId);
  redirect(`/app/cases/${ctx.caseFile.id}/documents?deleted=1`);
}

export async function resummarizeAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const docId = id(form, "docId");
  const doc = await ctx.repo.get("documents", ctx.caseFile.id, docId);
  if (!doc) throw new Error("Not found");
  await summarizeDocument(ctx, ctx.caseFile.id, doc, undefined, { localOnly: ctx.caseFile.isSample });
  await audit(ctx, "document.summarized", ctx.caseFile.id, "document", docId);
  refresh();
}

// Signature compare -------------------------------------------------------------

export async function createComparisonAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const questionedDocId = id(form, "questionedDocId");
  const knownDocIds = form.getAll("knownDocIds").filter(isSafeId).filter((x) => x !== questionedDocId).slice(0, 6);
  if (knownDocIds.length === 0) redirect(`/app/cases/${ctx.caseFile.id}/signatures?error=known`);
  const docs = await ctx.repo.list("documents", ctx.caseFile.id);
  const ids = new Set(docs.filter((d) => d.mimeType.startsWith("image/")).map((d) => d.id));
  if (!ids.has(questionedDocId) || !knownDocIds.every((k) => ids.has(k))) throw new Error("Images not found in this case");
  const sigId = newId("sig");
  const now = nowIso();
  await ctx.repo.insert("signatures", {
    id: sigId,
    caseId: ctx.caseFile.id,
    title: z.string().trim().max(120).parse(str(form, "title")) || "Signature comparison",
    questionedDocId,
    knownDocIds,
    observations: [],
    examinerNote: "",
    flaggedForExaminer: false,
    createdAt: now,
    updatedAt: now,
  });
  await audit(ctx, "signature.created", ctx.caseFile.id, "signature", sigId);
  redirect(`/app/cases/${ctx.caseFile.id}/signatures/${sigId}`);
}

const obsSchema = z
  .array(
    z.object({
      id: z.string().regex(/^[A-Za-z0-9_-]{4,64}$/),
      side: z.enum(["questioned", "known"]),
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      note: z.string().max(500),
    }),
  )
  .max(60);

export interface SaveComparisonResult {
  ok: boolean;
  message: string;
  examinerNote?: string;
  removedWording?: boolean;
}

/** Called from the compare tool (client). Notes pass the wording guard; the examiner note always carries the mandatory text. */
export async function saveComparisonAction(input: { caseId: string; comparisonId: string; observations: SignatureObservation[]; userNote: string; flag: boolean }): Promise<SaveComparisonResult> {
  const ctx = await requireCaseAccess(input.caseId, "write");
  if (!isSafeId(input.comparisonId)) return { ok: false, message: "Invalid comparison." };
  const existing = await ctx.repo.get("signatures", ctx.caseFile.id, input.comparisonId);
  if (!existing) return { ok: false, message: "Comparison not found." };
  const parsed = obsSchema.safeParse(input.observations);
  if (!parsed.success) return { ok: false, message: "Some notes could not be saved. Keep each note under 500 characters." };
  let removedWording = false;
  const observations = parsed.data.map((o) => {
    const n = neutralize(o.note.trim());
    if (n.changed) removedWording = true;
    return { ...o, note: n.text };
  });
  const userNote = z.string().max(2000).parse(input.userNote ?? "");
  const examinerNote = input.flag ? buildExaminerNote(userNote) : existing.examinerNote;
  if (input.flag && neutralize(userNote).changed) removedWording = true;
  await ctx.repo.update("signatures", ctx.caseFile.id, input.comparisonId, {
    observations,
    examinerNote,
    flaggedForExaminer: input.flag || existing.flaggedForExaminer,
    updatedAt: nowIso(),
  });
  await audit(ctx, input.flag ? "signature.flagged_for_examiner" : "signature.saved", ctx.caseFile.id, "signature", input.comparisonId);
  return {
    ok: true,
    message: input.flag ? "Saved and flagged for an examiner." : "Notes saved.",
    examinerNote,
    removedWording,
  };
}

export async function deleteComparisonAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const sigId = id(form, "comparisonId");
  await ctx.repo.remove("signatures", ctx.caseFile.id, sigId);
  await audit(ctx, "signature.deleted", ctx.caseFile.id, "signature", sigId);
  redirect(`/app/cases/${ctx.caseFile.id}/signatures`);
}

// Packages ----------------------------------------------------------------------

export async function recordBriefExportAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "export");
  if (form.get("reviewed") !== "on") redirect(`/app/cases/${ctx.caseFile.id}/packages?error=review`);
  const watermark = form.get("watermark") === "on" ? "1" : "0";
  const exportId = newId("exp");
  await ctx.repo.insert("exports", { id: exportId, caseId: ctx.caseFile.id, kind: "brief", createdAt: nowIso(), createdBy: ctx.user.id });
  await ctx.repo.updateCase(ctx.caseFile.id, { briefExportedAt: nowIso() });
  await audit(ctx, "export.brief", ctx.caseFile.id, "export", exportId);
  redirect(`/app/cases/${ctx.caseFile.id}/packages/brief?watermark=${watermark}`);
}

export async function recordExpertExportAction(form: FormData) {
  const ctx = await requireCaseAccess(form.get("caseId"), "export");
  const type = str(form, "type") === "accountant" ? "accountant" : "examiner";
  const include = form.getAll("docIds").filter(isSafeId);
  const docs = await ctx.repo.list("documents", ctx.caseFile.id);
  const restricted = docs.filter((d) => include.includes(d.id) && ["other_side", "my_lawyer", "crown_disclosure"].includes(d.origin));
  if (restricted.length > 0 && form.get("confirmRestricted") !== "on") {
    redirect(`/app/cases/${ctx.caseFile.id}/packages?error=restricted&type=${type}`);
  }
  const exportId = newId("exp");
  await ctx.repo.insert("exports", { id: exportId, caseId: ctx.caseFile.id, kind: type === "accountant" ? "expert_accountant" : "expert_examiner", createdAt: nowIso(), createdBy: ctx.user.id });
  await audit(ctx, `export.expert_${type}`, ctx.caseFile.id, "export", exportId);
  const q = new URLSearchParams({ type });
  include.forEach((d) => q.append("doc", d));
  const background = neutralize(z.string().max(3000).parse(str(form, "background"))).text;
  const questions = neutralize(z.string().max(3000).parse(str(form, "questions"))).text;
  // Background and questions are kept server-side for the print view, never in the URL.
  await ctx.repo.updateCase(ctx.caseFile.id, { expertDrafts: { ...(ctx.caseFile.expertDrafts ?? {}), [type]: { background, questions } }, updatedAt: nowIso() });
  redirect(`/app/cases/${ctx.caseFile.id}/packages/expert?${q.toString()}`);
}
