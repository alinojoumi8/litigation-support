"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit, requireCaseAccess, requireUser } from "@/lib/auth/current";
import { getAuth } from "@/lib/auth/provider";
import { criminalEnabled } from "@/lib/config";
import { getData } from "@/lib/data";
import type { CaseFile } from "@/lib/domain/types";
import { detectUrgent } from "@/lib/domain/urgent";
import { newId, nowIso } from "@/lib/ids";
import { logEvent } from "@/lib/logger";
import { seedSampleCase } from "@/lib/sample/seed";

export interface CreateCaseState {
  ok: boolean;
  message: string;
  urgent?: boolean;
  errors?: Record<string, string>;
}

const createSchema = z.object({
  audience: z.enum(["with_lawyer", "self_rep"], { message: "Choose who is working on the case." }),
  kind: z.enum(["civil_small_claims", "civil_superior", "civil_other", "criminal"], { message: "Choose the type of case." }),
  nickname: z.string().trim().min(2, "Give your case a short name you will recognise.").max(80),
  role: z.enum(["plaintiff", "defendant", "applicant", "respondent", "accused", "other"]).default("other"),
  court: z.string().trim().max(120).default(""),
  stage: z.string().trim().max(120).default(""),
  courtFileNumber: z.string().trim().max(60).default(""),
  situation: z.string().trim().max(600).default(""),
});

export async function createCaseAction(_prev: CreateCaseState, form: FormData): Promise<CreateCaseState> {
  const user = await requireUser();
  const parsed = createSchema.safeParse(Object.fromEntries(["audience", "kind", "nickname", "role", "court", "stage", "courtFileNumber", "situation"].map((k) => [k, form.get(k) ?? undefined])));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0]);
      if (!errors[k]) errors[k] = i.message;
    }
    return { ok: false, message: "Please fix the fields marked below.", errors };
  }
  const v = parsed.data;
  const urgent = detectUrgent(`${v.nickname} ${v.situation}`);

  let criminalAckAt: string | null = null;
  if (v.kind === "criminal") {
    if (!criminalEnabled()) {
      return { ok: false, message: "Criminal cases are not open yet. See the information below.", urgent };
    }
    const acks = ["ack_use", "ack_share", "ack_lawyer"].every((k) => form.get(k) === "on");
    if (!acks) return { ok: false, message: "Please read and confirm each statement about disclosure before continuing.", urgent, errors: { acks: "All three statements must be confirmed." } };
    criminalAckAt = nowIso();
  }

  const now = nowIso();
  const c: CaseFile = {
    id: newId("case"),
    ownerId: user.id,
    nickname: v.nickname,
    kind: v.kind,
    audience: v.audience,
    court: v.court,
    stage: v.stage,
    role: v.role,
    courtFileNumber: v.courtFileNumber,
    summary: "",
    isSample: false,
    createdAt: now,
    updatedAt: now,
    criminalAckAt,
    planPaused: false,
    noDeadlinesYet: false,
    pathwayStep: null,
    briefExportedAt: null,
    moneyFlagStatus: {},
  };
  const { repo } = await getData();
  await repo.createCase(c, { id: newId("mem"), caseId: c.id, userId: user.id, role: "owner", createdAt: now });
  await audit({ repo, user }, "case.created", c.id, "case", c.id);
  logEvent("case.created", { caseId: c.id, kind: v.kind });
  redirect(`/app/cases/${c.id}${urgent ? "?urgent=1" : ""}`);
}

export async function addSampleCaseAction(): Promise<void> {
  const user = await requireUser();
  const data = await getData();
  const caseId = await seedSampleCase(data, user.id);
  await audit({ repo: data.repo, user }, "case.sample_added", caseId, "case", caseId);
  redirect(`/app/cases/${caseId}`);
}

const updateSchema = z.object({
  nickname: z.string().trim().min(2).max(80),
  court: z.string().trim().max(120),
  stage: z.string().trim().max(120),
  role: z.enum(["plaintiff", "defendant", "applicant", "respondent", "accused", "other"]),
  courtFileNumber: z.string().trim().max(60),
  audience: z.enum(["with_lawyer", "self_rep"]),
});

export async function updateCaseDetailsAction(form: FormData): Promise<void> {
  const ctx = await requireCaseAccess(form.get("caseId"), "manage");
  const v = updateSchema.parse(Object.fromEntries(["nickname", "court", "stage", "role", "courtFileNumber", "audience"].map((k) => [k, form.get(k) ?? ""])));
  await ctx.repo.updateCase(ctx.caseFile.id, { ...v, updatedAt: nowIso() });
  await audit(ctx, "case.updated", ctx.caseFile.id, "case", ctx.caseFile.id);
  refresh();
}

export async function updateSummaryAction(form: FormData): Promise<void> {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  const summary = z.string().max(6000).parse(String(form.get("summary") ?? "")).trim();
  await ctx.repo.updateCase(ctx.caseFile.id, { summary, updatedAt: nowIso() });
  await audit(ctx, "case.summary_updated", ctx.caseFile.id, "case", ctx.caseFile.id);
  refresh();
}

export async function setPlanPausedAction(form: FormData): Promise<void> {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  await ctx.repo.updateCase(ctx.caseFile.id, { planPaused: form.get("paused") === "true", updatedAt: nowIso() });
  refresh();
}

export async function setNoDeadlinesYetAction(form: FormData): Promise<void> {
  const ctx = await requireCaseAccess(form.get("caseId"), "write");
  await ctx.repo.updateCase(ctx.caseFile.id, { noDeadlinesYet: form.get("value") === "true", updatedAt: nowIso() });
  refresh();
}

/** Real delete: case, every derived row, and every stored file. */
export async function deleteCaseAction(form: FormData): Promise<void> {
  const ctx = await requireCaseAccess(form.get("caseId"), "delete");
  if (String(form.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") {
    redirect(`/app/cases/${ctx.caseFile.id}/settings?delete=confirm`);
  }
  await ctx.blobs.deleteCase(ctx.caseFile.id);
  await ctx.repo.deleteCase(ctx.caseFile.id);
  await audit(ctx, "case.deleted", ctx.caseFile.id, "case", ctx.caseFile.id);
  logEvent("case.deleted", { caseId: ctx.caseFile.id });
  redirect("/app?deleted=1");
}

export async function deleteAccountAction(form: FormData): Promise<void> {
  const user = await requireUser();
  if (String(form.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") redirect("/app/account?delete=confirm");
  const data = await getData();
  const owned = (await data.repo.listCasesForUser(user.id)).filter((c) => c.ownerId === user.id);
  for (const c of owned) await data.blobs.deleteCase(c.id);
  await data.repo.appendAudit({ id: newId("aud"), at: nowIso(), userId: user.id, caseId: null, action: "account.deleted", targetType: "user", targetId: user.id });
  await data.repo.deleteUser(user.id);
  await getAuth().signOut();
  logEvent("account.deleted", { userId: user.id, count: owned.length });
  redirect("/?account=deleted");
}
