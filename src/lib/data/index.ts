import "server-only";
import { getConfig } from "../config";
import { createLocalAdapters, type LocalRepository } from "./local";
import type { BlobStore, Repository } from "./repository";

export interface DataAdapters {
  repo: Repository;
  blobs: BlobStore;
}

/** Chooses the data adapter from DATA_BACKEND. Local is the default and needs no setup. */
export async function getData(): Promise<DataAdapters> {
  const c = getConfig();
  if (c.DATA_BACKEND === "supabase") {
    if (!c.NEXT_PUBLIC_SUPABASE_URL || !c.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("DATA_BACKEND=supabase needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    const { createSupabaseServerClient, SupabaseRepository, SupabaseBlobStore } = await import("./supabase");
    const db = await createSupabaseServerClient(c.NEXT_PUBLIC_SUPABASE_URL, c.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    return { repo: new SupabaseRepository(db), blobs: new SupabaseBlobStore(db, c.SUPABASE_STORAGE_BUCKET) };
  }
  return createLocalAdapters(c.LOCAL_DATA_DIR, c.LOCAL_DATA_KEY);
}

/** Local adapter only: session table for the local auth provider. */
export function getLocalRepository(): LocalRepository {
  const c = getConfig();
  return createLocalAdapters(c.LOCAL_DATA_DIR, c.LOCAL_DATA_KEY).repo;
}
