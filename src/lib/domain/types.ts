/**
 * Core domain types. These are storage-agnostic: the local file adapter and the
 * Supabase adapter both persist these shapes (Supabase maps camelCase <-> snake_case).
 *
 * Content-bearing fields (page text, summaries, quotes, notes) must never be
 * written to logs or analytics. See src/lib/logger.ts.
 */

export type Audience = "with_lawyer" | "self_rep";

export type CaseKind =
  | "civil_small_claims"
  | "civil_superior"
  | "civil_other"
  | "criminal";

export type CaseRole =
  | "plaintiff"
  | "defendant"
  | "applicant"
  | "respondent"
  | "accused"
  | "other";

export type Origin =
  | "mine"
  | "other_side"
  | "crown_disclosure"
  | "my_lawyer"
  | "filed_court"
  | "public";

export type MembershipRole = "owner" | "editor" | "viewer";

export interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string | null;
  createdAt: string;
  isDemo: boolean;
  /** Time the user accepted the "information, not advice" terms at sign-up. */
  acceptedTermsAt: string;
}

export interface Session {
  /** sha256 of the opaque session token. The raw token only lives in the cookie. */
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface CaseFile {
  id: string;
  ownerId: string;
  nickname: string;
  kind: CaseKind;
  audience: Audience;
  court: string;
  stage: string;
  role: CaseRole;
  courtFileNumber: string;
  /** The user's own one-page summary (user-written, not AI). */
  summary: string;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
  /** Criminal gate acknowledgment (only set when the criminal flag is on). */
  criminalAckAt: string | null;
  planPaused: boolean;
  noDeadlinesYet: boolean;
  pathwayStep: string | null;
  briefExportedAt: string | null;
  /** Review statuses for computed money flags, keyed by flag fingerprint. */
  moneyFlagStatus: Record<string, FlagStatus>;
}

export interface Membership {
  id: string;
  caseId: string;
  userId: string;
  role: MembershipRole;
  createdAt: string;
}

export type ExtractionMethod =
  | "plain-text"
  | "email"
  | "pdf-text"
  | "image-no-ocr"
  | "textract"
  | "sample";

export interface DocumentRecord {
  id: string;
  caseId: string;
  /** Stable, human-friendly source number within the case: Doc 0001. */
  seq: number;
  title: string;
  filename: string;
  mimeType: string;
  size: number;
  sha256: string;
  origin: Origin;
  /** Free text: who gave you this document. */
  providedBy: string;
  /** Free text: how you got it (email, disclosure, court file, etc.). */
  howObtained: string;
  originalAvailable: boolean;
  docDate: string | null;
  docType: string;
  tags: string[];
  pageCount: number;
  extraction: ExtractionMethod;
  emailMeta: EmailMeta | null;
  uploadedAt: string;
  uploadedBy: string;
  isSample: boolean;
}

export interface EmailMeta {
  from: string;
  to: string;
  date: string | null;
  subject: string;
  attachments: string[];
}

export interface PageText {
  id: string; // `${docId}:${page}`
  caseId: string;
  docId: string;
  page: number;
  text: string;
}

export interface KeyFact {
  text: string;
  page: number;
  /** Exact text from the page. Only set if it matches the source verbatim. */
  quote: string | null;
}

export interface DocumentSummary {
  id: string;
  caseId: string;
  docId: string;
  summary: string;
  keyFacts: KeyFact[];
  people: string[];
  provider: string;
  model: string;
  promptVersion: string;
  /** Notes from the safety guards (e.g. a citation was removed). No content. */
  guardNotes: string[];
  createdAt: string;
}

export type DatePrecision = "day" | "month" | "year";

export interface TimelineEvent {
  id: string;
  caseId: string;
  date: string; // ISO yyyy-mm-dd (month/year precision use -01)
  datePrecision: DatePrecision;
  description: string;
  sourceDocId: string | null;
  sourcePage: number | null;
  quote: string | null;
  people: string[];
  tags: string[];
  status: "unconfirmed" | "confirmed";
  createdBy: "ai" | "user";
  provider: string | null;
  model: string | null;
  promptVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FlagStatus = "new" | "matters" | "not_an_issue" | "ask_lawyer";

export type DiscrepancyKind =
  | "date_conflict"
  | "amount_mismatch"
  | "name_variation"
  | "missing_attachment"
  | "version_difference"
  | "statement_conflict";

export interface FlagSource {
  docId: string;
  page: number;
  excerpt: string;
}

export interface Flag {
  id: string;
  caseId: string;
  /** Stable key so re-running the finder keeps the user's review status. */
  fingerprint: string;
  kind: DiscrepancyKind;
  title: string;
  detail: string;
  sources: FlagSource[];
  status: FlagStatus;
  createdBy: "rules" | "ai";
  provider: string | null;
  model: string | null;
  userNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignatureObservation {
  id: string;
  side: "questioned" | "known";
  /** Position as a fraction (0-1) of the image width/height. */
  x: number;
  y: number;
  note: string;
}

export interface SignatureComparison {
  id: string;
  caseId: string;
  title: string;
  questionedDocId: string;
  knownDocIds: string[];
  observations: SignatureObservation[];
  examinerNote: string;
  flaggedForExaminer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  caseId: string;
  importId: string;
  importName: string;
  row: number;
  date: string;
  description: string;
  amountCents: number;
  balanceCents: number | null;
  account: string;
}

export interface Deadline {
  id: string;
  caseId: string;
  title: string;
  date: string;
  sourceDocId: string | null;
  notes: string;
  done: boolean;
  createdAt: string;
}

export interface Question {
  id: string;
  caseId: string;
  text: string;
  audience: "lawyer" | "expert" | "self";
  status: "open" | "answered";
  answer: string;
  createdAt: string;
}

export interface TaskCompletion {
  id: string; // `${weekKey}:${taskKey}`
  caseId: string;
  weekKey: string;
  taskKey: string;
  doneAt: string;
}

export interface PathwayProgress {
  id: string; // pathway id
  caseId: string;
  pathwayId: string;
  checked: string[];
  currentStep: string | null;
  updatedAt: string;
}

export interface ExportRecord {
  id: string;
  caseId: string;
  kind: "brief" | "expert_examiner" | "expert_accountant" | "zip" | "timeline_csv" | "ics";
  createdAt: string;
  createdBy: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  userId: string | null;
  caseId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
}

export interface ContactMessage {
  id: string;
  at: string;
  name: string;
  email: string;
  topic: string;
  message: string;
}
