import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getConfig } from "../config";
import { getData, getLocalRepository } from "../data";
import type { User } from "../domain/types";
import { newId, nowIso } from "../ids";
import { hashPassword, verifyPassword } from "./password";
import { requestTime } from "../request";

/**
 * Auth provider interface. Local auth (default) keeps scrypt password hashes
 * and hashed session tokens in the local store. The Supabase provider
 * delegates to Supabase Auth (UNTESTED, see docs/build-status.md).
 */
export interface AuthProvider {
  signUp(input: { email: string; password: string; displayName: string }): Promise<{ ok: true; userId: string } | { ok: false; error: "EMAIL_TAKEN" | "FAILED" }>;
  signIn(input: { email: string; password: string }): Promise<{ ok: true; userId: string } | { ok: false }>;
  signOut(): Promise<void>;
  currentUserId(): Promise<string | null>;
  /** Demo mode only: a fresh, password-less demo account. */
  createDemoSession(): Promise<string>;
}

export const SESSION_COOKIE = "rf_session";

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

class LocalAuthProvider implements AuthProvider {
  private async startSession(userId: string) {
    const c = getConfig();
    const token = randomBytes(32).toString("base64url");
    const now = new Date();
    const expires = new Date(now.getTime() + c.SESSION_TTL_DAYS * 86_400_000);
    await getLocalRepository().createSession({ id: tokenHash(token), userId, createdAt: now.toISOString(), expiresAt: expires.toISOString() });
    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: c.cookieSecure,
      path: "/",
      expires,
    });
  }

  async signUp({ email, password, displayName }: { email: string; password: string; displayName: string }) {
    const { repo } = await getData();
    const normalized = email.trim().toLowerCase();
    if (await repo.getUserByEmail(normalized)) return { ok: false as const, error: "EMAIL_TAKEN" as const };
    const user: User = {
      id: newId("usr"),
      email: normalized,
      displayName: displayName.trim(),
      passwordHash: await hashPassword(password),
      createdAt: nowIso(),
      isDemo: false,
      acceptedTermsAt: nowIso(),
    };
    try {
      await repo.createUser(user);
    } catch {
      return { ok: false as const, error: "EMAIL_TAKEN" as const };
    }
    await this.startSession(user.id);
    return { ok: true as const, userId: user.id };
  }

  async signIn({ email, password }: { email: string; password: string }) {
    const { repo } = await getData();
    const user = await repo.getUserByEmail(email.trim().toLowerCase());
    // Always run a hash comparison to keep timing similar for unknown emails.
    const ok = await verifyPassword(password, user?.passwordHash ?? "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA");
    if (!user || !ok) return { ok: false as const };
    await this.startSession(user.id);
    return { ok: true as const, userId: user.id };
  }

  async signOut() {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (token) await getLocalRepository().deleteSession(tokenHash(token));
    store.delete(SESSION_COOKIE);
  }

  async currentUserId() {
    await requestTime();
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token || token.length > 100) return null;
    const s = await getLocalRepository().getSession(tokenHash(token));
    if (!s || s.expiresAt <= new Date().toISOString()) return null;
    return s.userId;
  }

  async createDemoSession() {
    const { repo } = await getData();
    const user: User = {
      id: newId("usr"),
      email: `demo-${newId("x").slice(2, 12).toLowerCase()}@demo.invalid`,
      displayName: "Demo visitor",
      passwordHash: null,
      createdAt: nowIso(),
      isDemo: true,
      acceptedTermsAt: nowIso(),
    };
    await repo.createUser(user);
    await this.startSession(user.id);
    return user.id;
  }
}

class SupabaseAuthProvider implements AuthProvider {
  private async client() {
    const c = getConfig();
    const { createSupabaseServerClient } = await import("../data/supabase");
    return createSupabaseServerClient(c.NEXT_PUBLIC_SUPABASE_URL!, c.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }
  async signUp({ email, password, displayName }: { email: string; password: string; displayName: string }) {
    const db = await this.client();
    const { data, error } = await db.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
    if (error || !data.user) return { ok: false as const, error: error?.code === "user_already_exists" ? ("EMAIL_TAKEN" as const) : ("FAILED" as const) };
    return { ok: true as const, userId: data.user.id };
  }
  async signIn({ email, password }: { email: string; password: string }) {
    const db = await this.client();
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { ok: false as const };
    return { ok: true as const, userId: data.user.id };
  }
  async signOut() {
    const db = await this.client();
    await db.auth.signOut();
  }
  async currentUserId() {
    await requestTime();
    const db = await this.client();
    // getUser() validates the JWT with Supabase Auth; getSession() alone would trust the cookie.
    const { data } = await db.auth.getUser();
    return data.user?.id ?? null;
  }
  async createDemoSession(): Promise<string> {
    throw new Error("Demo sessions are only available with the local data backend.");
  }
}

export function getAuth(): AuthProvider {
  return getConfig().DATA_BACKEND === "supabase" ? new SupabaseAuthProvider() : new LocalAuthProvider();
}
