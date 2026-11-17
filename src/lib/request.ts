import "server-only";
import { connection } from "next/server";

/**
 * Marks the caller as request-time only. Case data, sessions and clocks must
 * never be part of a prerendered or prefetched shell. Unit tests run outside
 * a Next.js request scope, so the call is skipped there.
 */
export async function requestTime(): Promise<void> {
  if (process.env.VITEST) return;
  await connection();
}
