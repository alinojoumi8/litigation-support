import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { AuditEntry, CaseFile, ContactMessage, Membership, User } from "../domain/types";
import type { BlobStore, CollectionName, Repository, RowOf } from "./repository";

/**
 * Supabase adapter (Postgres + Storage). UNTESTED: written against
 * supabase/migrations/*.sql but not run against a live project, because no
 * Supabase project exists yet (see docs/build-status.md).
 *
 * Requests run as the signed-in user with the anon key, so row-level security
 * enforces per-case access in the database as a second layer behind the
 * application checks. No service-role key is used for user data.
 */

const TABLES: Record<CollectionName, string> = {
  documents: "documents",
  pages: "document_pages",
  summaries: "document_summaries",
  events: "timeline_events",
  flags: "flags",
  signatures: "signature_comparisons",
  transactions: "transactions",
  deadlines: "deadlines",
  questions: "questions",
  taskCompletions: "task_completions",
  pathwayProgress: "pathway_progress",
  exports: "exports",
};

const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/** Top-level keys only: jsonb columns (sources, keyFacts, emailMeta...) keep their inner shape. */
function rowToDb(row: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [toSnake(k), v]));
}
function rowFromDb<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v])) as T;
}

export async function createSupabaseServerClient(url: string, anonKey: string): Promise<SupabaseClient> {
  const store = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there. The
          // session refresh is then written by the next Server Action or route.
        }
      },
    },
  });
}

function check<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) {
    const err = new Error(`SUPABASE_${res.error.code ?? "ERROR"}`);
    throw err;
  }
  return res.data;
}

export class SupabaseRepository implements Repository {
  readonly kind = "supabase" as const;
  constructor(private readonly db: SupabaseClient) {}

  async getUser(id: string) {
    const data = check(await this.db.from("profiles").select("*").eq("id", id).maybeSingle());
    return data ? rowFromDb<User>({ ...data, password_hash: null }) : null;
  }
  async getUserByEmail(email: string) {
    const data = check(await this.db.from("profiles").select("*").eq("email", email.toLowerCase()).maybeSingle());
    return data ? rowFromDb<User>({ ...data, password_hash: null }) : null;
  }
  async createUser(user: User) {
    // Profiles are created by the on-signup trigger; this fills in display fields.
    const { passwordHash, ...rest } = user;
    void passwordHash;
    check(await this.db.from("profiles").upsert(rowToDb(rest)));
    return user;
  }
  async updateUser(id: string, patch: Partial<Omit<User, "id">>) {
    const { passwordHash, ...rest } = patch;
    void passwordHash;
    const data = check(await this.db.from("profiles").update(rowToDb(rest)).eq("id", id).select("*").maybeSingle());
    return data ? rowFromDb<User>(data) : null;
  }
  async deleteUser(id: string) {
    const owned = check(await this.db.from("cases").select("id").eq("owner_id", id)) as { id: string }[];
    // delete_my_account() is SECURITY DEFINER: removes owned cases (cascade),
    // memberships, the profile and the auth user, and writes an audit row.
    check(await this.db.rpc("delete_my_account"));
    return { deletedCaseIds: owned.map((o) => o.id) };
  }

  async listCasesForUser(userId: string) {
    const rows = check(
      await this.db.from("cases").select("*, case_members!inner(user_id)").eq("case_members.user_id", userId).order("updated_at", { ascending: false }),
    ) as Record<string, unknown>[];
    return rows.map((r) => {
      const { case_members, ...rest } = r;
      void case_members;
      return rowFromDb<CaseFile>(rest);
    });
  }
  async getCase(id: string) {
    const data = check(await this.db.from("cases").select("*").eq("id", id).maybeSingle());
    return data ? rowFromDb<CaseFile>(data) : null;
  }
  async createCase(c: CaseFile, owner: Membership) {
    // create_case() inserts the case and the owner membership in one transaction.
    check(await this.db.rpc("create_case", { p_case: rowToDb(c), p_member_id: owner.id }));
    return c;
  }
  async updateCase(id: string, patch: Partial<Omit<CaseFile, "id" | "ownerId">>) {
    const data = check(await this.db.from("cases").update(rowToDb(patch)).eq("id", id).select("*").maybeSingle());
    return data ? rowFromDb<CaseFile>(data) : null;
  }
  async deleteCase(id: string) {
    // Foreign keys cascade to every case table (see migrations).
    check(await this.db.from("cases").delete().eq("id", id));
  }
  async getMembership(caseId: string, userId: string) {
    const data = check(await this.db.from("case_members").select("*").eq("case_id", caseId).eq("user_id", userId).maybeSingle());
    return data ? rowFromDb<Membership>(data) : null;
  }

  async list<K extends CollectionName>(k: K, caseId: string) {
    const rows = check(await this.db.from(TABLES[k]).select("*").eq("case_id", caseId)) as Record<string, unknown>[];
    return rows.map((r) => rowFromDb<RowOf<K>>(r));
  }
  async get<K extends CollectionName>(k: K, caseId: string, id: string) {
    const data = check(await this.db.from(TABLES[k]).select("*").eq("case_id", caseId).eq("id", id).maybeSingle());
    return data ? rowFromDb<RowOf<K>>(data) : null;
  }
  async insert<K extends CollectionName>(k: K, row: RowOf<K>) {
    check(await this.db.from(TABLES[k]).insert(rowToDb(row)));
    return row;
  }
  async insertMany<K extends CollectionName>(k: K, rows: RowOf<K>[]) {
    if (rows.length === 0) return;
    for (let i = 0; i < rows.length; i += 500) {
      check(await this.db.from(TABLES[k]).insert(rows.slice(i, i + 500).map(rowToDb)));
    }
  }
  async upsert<K extends CollectionName>(k: K, row: RowOf<K>) {
    check(await this.db.from(TABLES[k]).upsert(rowToDb(row)));
    return row;
  }
  async update<K extends CollectionName>(k: K, caseId: string, id: string, patch: Partial<RowOf<K>>) {
    const data = check(await this.db.from(TABLES[k]).update(rowToDb(patch)).eq("case_id", caseId).eq("id", id).select("*").maybeSingle());
    return data ? rowFromDb<RowOf<K>>(data) : null;
  }
  async remove<K extends CollectionName>(k: K, caseId: string, id: string) {
    check(await this.db.from(TABLES[k]).delete().eq("case_id", caseId).eq("id", id));
  }
  async removeDocumentCascade(caseId: string, docId: string) {
    // document_pages, document_summaries and timeline_events cascade on the
    // document FK. Flags and signature comparisons reference documents inside
    // jsonb/arrays, so they are removed explicitly.
    check(await this.db.from("flags").delete().eq("case_id", caseId).contains("sources", [{ docId }]));
    check(await this.db.from("signature_comparisons").delete().eq("case_id", caseId).or(`questioned_doc_id.eq.${docId},known_doc_ids.cs.{${docId}}`));
    check(await this.db.from("deadlines").update({ source_doc_id: null }).eq("case_id", caseId).eq("source_doc_id", docId));
    check(await this.db.from("documents").delete().eq("case_id", caseId).eq("id", docId));
  }
  async clear<K extends CollectionName>(k: K, caseId: string, where: Partial<RowOf<K>> = {}) {
    let q = this.db.from(TABLES[k]).delete().eq("case_id", caseId);
    for (const [key, v] of Object.entries(where)) q = q.eq(toSnake(key), v as string);
    check(await q);
  }
  async nextDocumentSeq(caseId: string) {
    const data = check(await this.db.rpc("next_document_seq", { p_case_id: caseId })) as number;
    return data;
  }

  async appendAudit(entry: AuditEntry) {
    check(await this.db.from("audit_log").insert(rowToDb(entry)));
  }
  async listAudit(filter: { caseId?: string; userId?: string; limit?: number }) {
    let q = this.db.from("audit_log").select("*").order("at", { ascending: false }).limit(filter.limit ?? 200);
    if (filter.caseId) q = q.eq("case_id", filter.caseId);
    if (filter.userId) q = q.eq("user_id", filter.userId);
    const rows = check(await q) as Record<string, unknown>[];
    return rows.map((r) => rowFromDb<AuditEntry>(r));
  }
  async saveContactMessage(m: ContactMessage) {
    check(await this.db.from("contact_messages").insert(rowToDb(m)));
  }
}

export class SupabaseBlobStore implements BlobStore {
  constructor(private readonly db: SupabaseClient, private readonly bucket: string) {}
  async put(caseId: string, docId: string, bytes: Uint8Array, mimeType: string) {
    check(await this.db.storage.from(this.bucket).upload(`${caseId}/${docId}`, bytes, { contentType: mimeType, upsert: false }));
  }
  async get(caseId: string, docId: string) {
    const res = await this.db.storage.from(this.bucket).download(`${caseId}/${docId}`);
    if (res.error || !res.data) return null;
    return new Uint8Array(await res.data.arrayBuffer());
  }
  async delete(caseId: string, docId: string) {
    check(await this.db.storage.from(this.bucket).remove([`${caseId}/${docId}`]));
  }
  async deleteCase(caseId: string) {
    const list = check(await this.db.storage.from(this.bucket).list(caseId, { limit: 1000 })) as { name: string }[];
    if (list.length) check(await this.db.storage.from(this.bucket).remove(list.map((f) => `${caseId}/${f.name}`)));
  }
}
