import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Opaque random id such as `doc_4k9Q...`. Never encodes case content. */
export function newId(prefix: string): string {
  const bytes = randomBytes(18);
  let s = "";
  for (const b of bytes) s += ALPHABET[b % 62];
  return `${prefix}_${s}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Today's date in Ontario (America/Toronto) as yyyy-mm-dd. */
export function todayInToronto(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
