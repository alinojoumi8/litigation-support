import type {
  AuditEntry,
  CaseFile,
  ContactMessage,
  Deadline,
  DocumentRecord,
  DocumentSummary,
  ExportRecord,
  Flag,
  Membership,
  PageText,
  PathwayProgress,
  Question,
  SignatureComparison,
  TaskCompletion,
  TimelineEvent,
  Transaction,
  User,
} from "../domain/types";

/** Case-scoped collections. Every row carries `caseId` and `id`. */
export interface CaseCollections {
  documents: DocumentRecord;
  pages: PageText;
  summaries: DocumentSummary;
  events: TimelineEvent;
  flags: Flag;
  signatures: SignatureComparison;
  transactions: Transaction;
  deadlines: Deadline;
  questions: Question;
  taskCompletions: TaskCompletion;
  pathwayProgress: PathwayProgress;
  exports: ExportRecord;
}

export type CollectionName = keyof CaseCollections;
export type RowOf<K extends CollectionName> = CaseCollections[K];

export const CASE_COLLECTIONS: CollectionName[] = [
  "documents", "pages", "summaries", "events", "flags", "signatures", "transactions",
  "deadlines", "questions", "taskCompletions", "pathwayProgress", "exports",
];

/**
 * Storage interface. The local adapter (src/lib/data/local.ts) and the
 * Supabase adapter (src/lib/data/supabase.ts) implement it.
 *
 * Callers must authorize first (requireCaseAccess). The Supabase adapter adds
 * row-level security as a second layer; the local adapter relies on the
 * application checks alone.
 */
export interface Repository {
  readonly kind: "local" | "supabase";

  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: User): Promise<User>;
  updateUser(id: string, patch: Partial<Omit<User, "id">>): Promise<User | null>;
  /** Deletes the user, their memberships and every case they own (with all derived data). */
  deleteUser(id: string): Promise<{ deletedCaseIds: string[] }>;

  listCasesForUser(userId: string): Promise<CaseFile[]>;
  getCase(id: string): Promise<CaseFile | null>;
  createCase(c: CaseFile, owner: Membership): Promise<CaseFile>;
  updateCase(id: string, patch: Partial<Omit<CaseFile, "id" | "ownerId">>): Promise<CaseFile | null>;
  /** Hard delete: the case and every row in every case collection. */
  deleteCase(id: string): Promise<void>;
  getMembership(caseId: string, userId: string): Promise<Membership | null>;

  list<K extends CollectionName>(k: K, caseId: string): Promise<RowOf<K>[]>;
  get<K extends CollectionName>(k: K, caseId: string, id: string): Promise<RowOf<K> | null>;
  insert<K extends CollectionName>(k: K, row: RowOf<K>): Promise<RowOf<K>>;
  insertMany<K extends CollectionName>(k: K, rows: RowOf<K>[]): Promise<void>;
  /** Insert or replace by id. */
  upsert<K extends CollectionName>(k: K, row: RowOf<K>): Promise<RowOf<K>>;
  update<K extends CollectionName>(k: K, caseId: string, id: string, patch: Partial<RowOf<K>>): Promise<RowOf<K> | null>;
  remove<K extends CollectionName>(k: K, caseId: string, id: string): Promise<void>;
  /** Delete a document and everything derived from it (pages, summary, events, flags). */
  removeDocumentCascade(caseId: string, docId: string): Promise<void>;
  /** Remove all rows of one collection for a case (e.g. re-import transactions). */
  clear<K extends CollectionName>(k: K, caseId: string, where?: Partial<RowOf<K>>): Promise<void>;
  nextDocumentSeq(caseId: string): Promise<number>;

  appendAudit(entry: AuditEntry): Promise<void>;
  listAudit(filter: { caseId?: string; userId?: string; limit?: number }): Promise<AuditEntry[]>;

  saveContactMessage(m: ContactMessage): Promise<void>;
}

/** Binary storage for original files. */
export interface BlobStore {
  put(caseId: string, docId: string, bytes: Uint8Array, mimeType: string): Promise<void>;
  get(caseId: string, docId: string): Promise<Uint8Array | null>;
  delete(caseId: string, docId: string): Promise<void>;
  deleteCase(caseId: string): Promise<void>;
}
