import type { DatePrecision, DiscrepancyKind, EmailMeta } from "../domain/types";

/** Stored with every AI output (site plan 5.3: model and prompt version). */
export const SUMMARY_PROMPT_VERSION = "summary-2026-11-17.1";
export const DISCREPANCY_PROMPT_VERSION = "discrepancy-2026-11-17.1";

export interface PageInput {
  page: number;
  text: string;
}

export interface SummaryInput {
  title: string;
  docType: string;
  pages: PageInput[];
  emailMeta: EmailMeta | null;
}

export interface SummaryOutput {
  summary: string;
  keyFacts: { text: string; page: number; quote: string | null }[];
  people: string[];
  events: { date: string; datePrecision: DatePrecision; description: string; page: number; quote: string | null; people: string[] }[];
}

export interface DiscrepancyDocInput {
  docId: string;
  seq: number;
  title: string;
  /** Short factual sentences with page numbers (dated, money or reference sentences). */
  facts: { page: number; sentence: string }[];
}

export interface DiscrepancyCandidate {
  kind: DiscrepancyKind;
  title: string;
  detail: string;
  sources: { docId: string; page: number; excerpt: string }[];
}

export interface AIProvider {
  readonly id: "mock" | "anthropic";
  readonly label: string;
  readonly model: string;
  /** True when document text leaves this server. Shown to the user before processing. */
  readonly external: boolean;
  summarize(input: SummaryInput): Promise<SummaryOutput>;
  findDiscrepancies(docs: DiscrepancyDocInput[]): Promise<DiscrepancyCandidate[]>;
}

export class AIRefusalError extends Error {
  constructor() {
    super("The AI provider declined this request.");
    this.name = "AIRefusalError";
  }
}
