/**
 * Authorization rules. Pure and unit-tested. Every server action and route
 * handler calls requireCaseAccess() (src/lib/auth/current.ts), which uses
 * these rules after loading the membership from the data layer.
 *
 * The same rules are enforced again in Postgres by row-level security in
 * supabase/migrations when the Supabase adapter is used.
 */
import type { Membership, MembershipRole } from "../domain/types";

export type CaseAction =
  | "read"
  | "write"
  | "upload"
  | "export"
  | "manage" // edit case details, sharing
  | "delete";

const ALLOWED: Record<MembershipRole, ReadonlySet<CaseAction>> = {
  owner: new Set<CaseAction>(["read", "write", "upload", "export", "manage", "delete"]),
  editor: new Set<CaseAction>(["read", "write", "upload", "export"]),
  viewer: new Set<CaseAction>(["read"]),
};

export function canPerform(membership: Pick<Membership, "role" | "userId" | "caseId"> | null, userId: string, caseId: string, action: CaseAction): boolean {
  if (!membership) return false;
  if (membership.userId !== userId || membership.caseId !== caseId) return false;
  return ALLOWED[membership.role]?.has(action) ?? false;
}

export class AuthorizationError extends Error {
  constructor(message = "You do not have access to this case.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** Ids are opaque random strings. Reject anything else before it reaches storage. */
export function isSafeId(id: unknown): id is string {
  return typeof id === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(id);
}
