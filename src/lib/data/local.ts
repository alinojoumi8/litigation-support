import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile, chmod } from "node:fs/promises";
import path from "node:path";
import type { AuditEntry, CaseFile, ContactMessage, Membership, Session, User } from "../domain/types";
import { CASE_COLLECTIONS, type BlobStore, type CaseCollections, type CollectionName, type Repository, type RowOf } from "./repository";

/**
 * Local adapter: one encrypted JSON file plus encrypted blobs under
 * LOCAL_DATA_DIR (default .data/, git-ignored). No Docker, no cloud.
 *
 * Encryption: AES-256-GCM. The key comes from LOCAL_DATA_KEY (64 hex chars)
 * or is generated once into .data/.key (mode 0600). Keeping the key next to
 * the data protects against casual copying, not a determined attacker with
 * disk access. This adapter is for demos and development only.
 */

type StoreData = {
  version: 1;
  users: User[];
  sessions: Session[];
  cases: CaseFile[];
  memberships: Membership[];
  audit: AuditEntry[];
  contact: ContactMessage[];
} & { [K in CollectionName]: RowOf<K>[] };

function emptyStore(): StoreData {
  const base = { version: 1 as const, users: [], sessions: [], cases: [], memberships: [], audit: [], contact: [] };
  const cols = Object.fromEntries(CASE_COLLECTIONS.map((k) => [k, []])) as unknown as { [K in CollectionName]: RowOf<K>[] };
  return { ...base, ...cols };
}

const MAGIC = Buffer.from("RFS1");

function encrypt(key: Buffer, plain: Buffer): Buffer {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([c.update(plain), c.final()]);
  return Buffer.concat([MAGIC, iv, c.getAuthTag(), body]);
}

function decrypt(key: Buffer, data: Buffer): Buffer {
  if (!data.subarray(0, 4).equals(MAGIC)) throw new Error("Unrecognised local data file");
  const iv = data.subarray(4, 16);
  const tag = data.subarray(16, 32);
  const d = createDecipheriv("aes-256-gcm", key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data.subarray(32)), d.final()]);
}

class LocalEngine {
  private data: StoreData | null = null;
  private key: Buffer | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly dir: string, private readonly envKey: string | undefined) {}

  get storeFile() {
    return path.join(this.dir, "store.enc");
  }

  async getKey(): Promise<Buffer> {
    if (this.key) return this.key;
    if (this.envKey) {
      if (!/^[0-9a-fA-F]{64}$/.test(this.envKey)) throw new Error("LOCAL_DATA_KEY must be 64 hex characters");
      this.key = Buffer.from(this.envKey, "hex");
      return this.key;
    }
    const keyFile = path.join(this.dir, ".key");
    await mkdir(this.dir, { recursive: true });
    try {
      this.key = Buffer.from((await readFile(keyFile, "utf8")).trim(), "hex");
    } catch {
      this.key = randomBytes(32);
      await writeFile(keyFile, this.key.toString("hex"), { mode: 0o600 });
      await chmod(keyFile, 0o600).catch(() => undefined);
    }
    return this.key;
  }

  private async load(): Promise<StoreData> {
    if (this.data) return this.data;
    const key = await this.getKey();
    try {
      const raw = await readFile(this.storeFile);
      const parsed = JSON.parse(decrypt(key, raw).toString("utf8")) as Partial<StoreData>;
      this.data = { ...emptyStore(), ...parsed } as StoreData;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
      this.data = emptyStore();
    }
    return this.data;
  }

  private async persist(): Promise<void> {
    if (!this.data) return;
    const key = await this.getKey();
    await mkdir(this.dir, { recursive: true });
    const tmp = `${this.storeFile}.${process.pid}.tmp`;
    await writeFile(tmp, encrypt(key, Buffer.from(JSON.stringify(this.data))), { mode: 0o600 });
    await rename(tmp, this.storeFile);
  }

  /** Serialized read-modify-write. */
  mutate<T>(fn: (d: StoreData) => T): Promise<T> {
    const run = this.queue.then(async () => {
      const d = await this.load();
      const result = fn(d);
      await this.persist();
      return structuredClone(result);
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  read<T>(fn: (d: StoreData) => T): Promise<T> {
    const run = this.queue.then(async () => structuredClone(fn(await this.load())));
    this.queue = run.catch(() => undefined);
    return run;
  }

  // Blobs
  blobPath(caseId: string, docId: string) {
    return path.join(this.dir, "blobs", caseId, `${docId}.bin`);
  }
  async putBlob(caseId: string, docId: string, bytes: Uint8Array) {
    const key = await this.getKey();
    const p = this.blobPath(caseId, docId);
    await mkdir(path.dirname(p), { recursive: true });
    await writeFile(p, encrypt(key, Buffer.from(bytes)), { mode: 0o600 });
  }
  async getBlob(caseId: string, docId: string): Promise<Uint8Array | null> {
    const key = await this.getKey();
    try {
      return new Uint8Array(decrypt(key, await readFile(this.blobPath(caseId, docId))));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw e;
    }
  }
  async deleteBlob(caseId: string, docId: string) {
    await rm(this.blobPath(caseId, docId), { force: true });
  }
  async deleteCaseBlobs(caseId: string) {
    await rm(path.join(this.dir, "blobs", caseId), { recursive: true, force: true });
  }
}

const g = globalThis as unknown as { __rfLocalEngine?: LocalEngine };

function engine(dir: string, envKey: string | undefined): LocalEngine {
  const abs = path.resolve(/* turbopackIgnore: true */ process.cwd(), dir);
  if (!g.__rfLocalEngine) g.__rfLocalEngine = new LocalEngine(abs, envKey);
  return g.__rfLocalEngine;
}

function matches<T>(row: T, where: Partial<T>): boolean {
  return Object.entries(where).every(([k, v]) => (row as Record<string, unknown>)[k] === v);
}

function cascadeCase(d: StoreData, caseId: string) {
  for (const k of CASE_COLLECTIONS) {
    (d[k] as { caseId: string }[]) = (d[k] as { caseId: string }[]).filter((r) => r.caseId !== caseId);
  }
  d.cases = d.cases.filter((c) => c.id !== caseId);
  d.memberships = d.memberships.filter((m) => m.caseId !== caseId);
}

export class LocalRepository implements Repository {
  readonly kind = "local" as const;
  constructor(private readonly e: LocalEngine) {}

  getUser(id: string) {
    return this.e.read((d) => d.users.find((u) => u.id === id) ?? null);
  }
  getUserByEmail(email: string) {
    const e = email.trim().toLowerCase();
    return this.e.read((d) => d.users.find((u) => u.email === e) ?? null);
  }
  createUser(user: User) {
    return this.e.mutate((d) => {
      if (d.users.some((u) => u.email === user.email)) throw new Error("EMAIL_TAKEN");
      d.users.push(user);
      return user;
    });
  }
  updateUser(id: string, patch: Partial<Omit<User, "id">>) {
    return this.e.mutate((d) => {
      const u = d.users.find((x) => x.id === id);
      if (!u) return null;
      Object.assign(u, patch);
      return u;
    });
  }
  deleteUser(id: string) {
    return this.e.mutate((d) => {
      const owned = d.cases.filter((c) => c.ownerId === id).map((c) => c.id);
      owned.forEach((cid) => cascadeCase(d, cid));
      d.memberships = d.memberships.filter((m) => m.userId !== id);
      d.sessions = d.sessions.filter((s) => s.userId !== id);
      d.users = d.users.filter((u) => u.id !== id);
      return { deletedCaseIds: owned };
    });
  }

  listCasesForUser(userId: string) {
    return this.e.read((d) => {
      const ids = new Set(d.memberships.filter((m) => m.userId === userId).map((m) => m.caseId));
      return d.cases.filter((c) => ids.has(c.id)).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    });
  }
  getCase(id: string) {
    return this.e.read((d) => d.cases.find((c) => c.id === id) ?? null);
  }
  createCase(c: CaseFile, owner: Membership) {
    return this.e.mutate((d) => {
      d.cases.push(c);
      d.memberships.push(owner);
      return c;
    });
  }
  updateCase(id: string, patch: Partial<Omit<CaseFile, "id" | "ownerId">>) {
    return this.e.mutate((d) => {
      const c = d.cases.find((x) => x.id === id);
      if (!c) return null;
      Object.assign(c, patch);
      return c;
    });
  }
  async deleteCase(id: string) {
    await this.e.mutate((d) => cascadeCase(d, id));
    await this.e.deleteCaseBlobs(id);
  }
  getMembership(caseId: string, userId: string) {
    return this.e.read((d) => d.memberships.find((m) => m.caseId === caseId && m.userId === userId) ?? null);
  }

  list<K extends CollectionName>(k: K, caseId: string) {
    return this.e.read((d) => (d[k] as RowOf<K>[]).filter((r) => r.caseId === caseId));
  }
  get<K extends CollectionName>(k: K, caseId: string, id: string) {
    return this.e.read((d) => (d[k] as RowOf<K>[]).find((r) => r.caseId === caseId && r.id === id) ?? null);
  }
  insert<K extends CollectionName>(k: K, row: RowOf<K>) {
    return this.e.mutate((d) => {
      (d[k] as RowOf<K>[]).push(row);
      return row;
    });
  }
  async insertMany<K extends CollectionName>(k: K, rows: RowOf<K>[]) {
    await this.e.mutate((d) => {
      (d[k] as RowOf<K>[]).push(...rows);
    });
  }
  upsert<K extends CollectionName>(k: K, row: RowOf<K>) {
    return this.e.mutate((d) => {
      const list = d[k] as RowOf<K>[];
      const i = list.findIndex((r) => r.caseId === row.caseId && r.id === row.id);
      if (i >= 0) list[i] = row;
      else list.push(row);
      return row;
    });
  }
  update<K extends CollectionName>(k: K, caseId: string, id: string, patch: Partial<RowOf<K>>) {
    return this.e.mutate((d) => {
      const r = (d[k] as RowOf<K>[]).find((x) => x.caseId === caseId && x.id === id);
      if (!r) return null;
      Object.assign(r, patch, { id, caseId });
      return r;
    });
  }
  async remove<K extends CollectionName>(k: K, caseId: string, id: string) {
    await this.e.mutate((d) => {
      (d[k] as RowOf<K>[]) = (d[k] as RowOf<K>[]).filter((r) => !(r.caseId === caseId && r.id === id));
    });
  }
  async removeDocumentCascade(caseId: string, docId: string) {
    await this.e.mutate((d) => {
      const keep = <T extends { caseId: string }>(rows: T[], drop: (r: T) => boolean) => rows.filter((r) => r.caseId !== caseId || !drop(r));
      d.documents = keep(d.documents, (r) => r.id === docId);
      d.pages = keep(d.pages, (r) => r.docId === docId);
      d.summaries = keep(d.summaries, (r) => r.docId === docId);
      d.events = keep(d.events, (r) => r.sourceDocId === docId);
      d.flags = keep(d.flags, (r) => r.sources.some((s) => s.docId === docId));
      d.deadlines = d.deadlines.map((x) => (x.caseId === caseId && x.sourceDocId === docId ? { ...x, sourceDocId: null } : x));
      d.signatures = keep(d.signatures, (r) => r.questionedDocId === docId || r.knownDocIds.includes(docId));
    });
    await this.e.deleteBlob(caseId, docId);
  }
  async clear<K extends CollectionName>(k: K, caseId: string, where: Partial<RowOf<K>> = {}) {
    await this.e.mutate((d) => {
      (d[k] as RowOf<K>[]) = (d[k] as RowOf<K>[]).filter((r) => !(r.caseId === caseId && matches(r, where)));
    });
  }
  nextDocumentSeq(caseId: string) {
    return this.e.read((d) => d.documents.filter((x) => x.caseId === caseId).reduce((m, x) => Math.max(m, x.seq), 0) + 1);
  }

  async appendAudit(entry: AuditEntry) {
    await this.e.mutate((d) => {
      d.audit.push(entry);
      // Keep the local audit log bounded for the demo store.
      if (d.audit.length > 20_000) d.audit.splice(0, d.audit.length - 20_000);
    });
  }
  listAudit(filter: { caseId?: string; userId?: string; limit?: number }) {
    return this.e.read((d) =>
      d.audit
        .filter((a) => (!filter.caseId || a.caseId === filter.caseId) && (!filter.userId || a.userId === filter.userId))
        .slice(-(filter.limit ?? 200))
        .reverse(),
    );
  }
  async saveContactMessage(m: ContactMessage) {
    await this.e.mutate((d) => {
      d.contact.push(m);
    });
  }

  // Local-auth session storage (not part of Repository: Supabase Auth owns sessions there).
  async createSession(s: Session) {
    await this.e.mutate((d) => {
      d.sessions = d.sessions.filter((x) => x.expiresAt > s.createdAt); // prune expired
      d.sessions.push(s);
    });
  }
  getSession(id: string) {
    return this.e.read((d) => d.sessions.find((s) => s.id === id) ?? null);
  }
  async deleteSession(id: string) {
    await this.e.mutate((d) => {
      d.sessions = d.sessions.filter((s) => s.id !== id);
    });
  }
}

export class LocalBlobStore implements BlobStore {
  constructor(private readonly e: LocalEngine) {}
  put(caseId: string, docId: string, bytes: Uint8Array) {
    return this.e.putBlob(caseId, docId, bytes);
  }
  get(caseId: string, docId: string) {
    return this.e.getBlob(caseId, docId);
  }
  delete(caseId: string, docId: string) {
    return this.e.deleteBlob(caseId, docId);
  }
  deleteCase(caseId: string) {
    return this.e.deleteCaseBlobs(caseId);
  }
}

export function createLocalAdapters(dir: string, envKey: string | undefined) {
  const e = engine(dir, envKey);
  return { repo: new LocalRepository(e), blobs: new LocalBlobStore(e) };
}

export type { CaseCollections };
