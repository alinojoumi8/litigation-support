import type { CaseKind, DocumentRecord, Origin } from "./types";

/**
 * Origin labels drive handling rules (site plan section 7.4). Every rule here
 * is a draft for Ontario lawyer review.
 */
export const ORIGIN_LABELS: Record<Origin, string> = {
  mine: "Mine",
  other_side: "From the other side (disclosure or discovery)",
  crown_disclosure: "Crown disclosure",
  my_lawyer: "From my lawyer",
  filed_court: "Filed with the court",
  public: "Public",
};

export const ORIGIN_SHORT: Record<Origin, string> = {
  mine: "Mine",
  other_side: "Other side",
  crown_disclosure: "Crown disclosure",
  my_lawyer: "From my lawyer",
  filed_court: "Court filing",
  public: "Public",
};

export const UNDERTAKING_REMINDER =
  "Documents you received from the other side in a court case can usually only be used for that case. Don't share them outside it.";

export const PRIVILEGE_WARNING =
  "Documents from your lawyer may be privileged. Sharing them with anyone else may affect that protection. Ask your lawyer first.";

export const WATERMARK_TEXT = "Confidential. May be subject to undertakings or privilege.";

/** Origins a user may choose at upload for a given case. */
export function allowedOrigins(kind: CaseKind, criminalEnabled: boolean): Origin[] {
  const base: Origin[] = ["mine", "other_side", "my_lawyer", "filed_court", "public"];
  if (kind === "criminal" && criminalEnabled) return [...base, "crown_disclosure"];
  return base;
}

/** "From my lawyer" documents are tagged privileged. */
export function isPrivileged(doc: Pick<DocumentRecord, "origin">): boolean {
  return doc.origin === "my_lawyer";
}

/** Documents that carry a use restriction reminder (deemed undertaking style). */
export function hasUseRestriction(doc: Pick<DocumentRecord, "origin">): boolean {
  return doc.origin === "other_side" || doc.origin === "crown_disclosure";
}

/**
 * Expert packages exclude "From the other side", "Crown disclosure" and
 * "From my lawyer" by default. Adding them needs an explicit confirmation.
 */
export function excludedFromExpertByDefault(doc: Pick<DocumentRecord, "origin">): boolean {
  return doc.origin === "other_side" || doc.origin === "my_lawyer" || doc.origin === "crown_disclosure";
}

export interface ShareWarnings {
  total: number;
  otherSide: number;
  privileged: number;
  crown: number;
  messages: string[];
}

/** Summarise what an export or share contains, for the confirmation step. */
export function shareWarnings(docs: Pick<DocumentRecord, "origin">[]): ShareWarnings {
  const otherSide = docs.filter((d) => d.origin === "other_side").length;
  const privileged = docs.filter((d) => d.origin === "my_lawyer").length;
  const crown = docs.filter((d) => d.origin === "crown_disclosure").length;
  const messages: string[] = [];
  if (otherSide > 0) messages.push(UNDERTAKING_REMINDER);
  if (crown > 0)
    messages.push(
      "Crown disclosure is given to you for your defence only. Don't share it with anyone other than your lawyer.",
    );
  if (privileged > 0) messages.push(PRIVILEGE_WARNING);
  return { total: docs.length, otherSide, privileged, crown, messages };
}

export const CASE_KIND_LABELS: Record<CaseKind, string> = {
  civil_small_claims: "Ontario Small Claims Court (civil)",
  civil_superior: "Ontario Superior Court of Justice (civil)",
  civil_other: "Other Ontario civil matter",
  criminal: "Criminal (Ontario)",
};

export function formatSourceId(seq: number): string {
  return `Doc ${String(seq).padStart(4, "0")}`;
}

export function formatSourceRef(seq: number, page: number | null | undefined): string {
  return page ? `${formatSourceId(seq)} p.${page}` : formatSourceId(seq);
}
