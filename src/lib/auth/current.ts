import "server-only";
import { notFound, redirect } from "next/navigation";
import { getData, type DataAdapters } from "../data";
import type { CaseFile, Membership, User } from "../domain/types";
import { newId, nowIso } from "../ids";
import { canPerform, isSafeId, type CaseAction } from "./authz";
import { getAuth } from "./provider";

export async function getCurrentUser(): Promise<User | null> {
  const id = await getAuth().currentUserId();
  if (!id) return null;
  const { repo } = await getData();
  return repo.getUser(id);
}

/** Use in every workspace page, Server Action and Route Handler. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

export interface CaseContext extends DataAdapters {
  user: User;
  caseFile: CaseFile;
  membership: Membership;
}

/**
 * Per-user, per-case authorization. Unknown cases and cases the user cannot
 * access both return 404, so case ids cannot be probed.
 */
export async function requireCaseAccess(caseId: unknown, action: CaseAction = "read"): Promise<CaseContext> {
  const user = await requireUser();
  if (!isSafeId(caseId)) notFound();
  const data = await getData();
  const [caseFile, membership] = await Promise.all([data.repo.getCase(caseId), data.repo.getMembership(caseId, user.id)]);
  if (!caseFile || !canPerform(membership, user.id, caseId, action)) notFound();
  return { ...data, user, caseFile, membership: membership! };
}

/** Same check for Route Handlers, which return status codes instead of rendering 404 pages. */
export async function checkCaseAccess(caseId: unknown, action: CaseAction): Promise<CaseContext | null> {
  const id = await getAuth().currentUserId();
  if (!id || !isSafeId(caseId)) return null;
  const data = await getData();
  const [user, caseFile, membership] = await Promise.all([data.repo.getUser(id), data.repo.getCase(caseId), data.repo.getMembership(caseId, id)]);
  if (!user || !caseFile || !canPerform(membership, id, caseId, action)) return null;
  return { ...data, user, caseFile, membership: membership! };
}

/** Audit log: who did what to which record. Never content. */
export async function audit(ctx: Pick<CaseContext, "repo"> & { user: Pick<User, "id"> }, action: string, caseId: string | null, targetType?: string, targetId?: string) {
  await ctx.repo.appendAudit({
    id: newId("aud"),
    at: nowIso(),
    userId: ctx.user.id,
    caseId,
    action,
    targetType: targetType ?? null,
    targetId: targetId ?? null,
  });
}
