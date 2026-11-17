"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAuth } from "@/lib/auth/provider";
import { getConfig } from "@/lib/config";
import { getData } from "@/lib/data";
import { newId, nowIso } from "@/lib/ids";
import { logEvent } from "@/lib/logger";
import { seedSampleCase } from "@/lib/sample/seed";

export interface AuthState {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"name" | "email" | "password" | "ack", string>>;
}

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  password: z.string().min(10, "Use at least 10 characters.").max(200),
  ack: z.literal("on", { message: "Please confirm you understand this before continuing." }),
});

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): AuthState["errors"] {
  const errors: AuthState["errors"] = {};
  for (const i of issues) {
    const k = i.path[0] as keyof NonNullable<AuthState["errors"]>;
    if (k && !errors[k]) errors[k] = i.message;
  }
  return errors;
}

export async function signUpAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({ name: form.get("name"), email: form.get("email"), password: form.get("password"), ack: form.get("ack") });
  if (!parsed.success) return { ok: false, message: "Please fix the fields marked below.", errors: fieldErrors(parsed.error.issues) };
  const res = await getAuth().signUp({ email: parsed.data.email, password: parsed.data.password, displayName: parsed.data.name });
  if (!res.ok) {
    return res.error === "EMAIL_TAKEN"
      ? { ok: false, message: "An account with this email already exists. Try signing in.", errors: { email: "This email is already registered." } }
      : { ok: false, message: "We could not create your account. Please try again." };
  }
  logEvent("auth.signup", { userId: res.userId });
  redirect("/app/onboarding");
}

// Simple in-memory throttle: 5 failed attempts per email per 15 minutes.
const attempts = new Map<string, { count: number; first: number }>();
function throttleKey(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function signInAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = signInSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { ok: false, message: "Please fix the fields marked below.", errors: fieldErrors(parsed.error.issues) };
  const key = throttleKey(parsed.data.email);
  const now = Date.now();
  const a = attempts.get(key);
  if (a && now - a.first < 15 * 60_000 && a.count >= 5) {
    return { ok: false, message: "Too many attempts. Please wait 15 minutes and try again." };
  }
  const res = await getAuth().signIn(parsed.data);
  if (!res.ok) {
    attempts.set(key, a && now - a.first < 15 * 60_000 ? { count: a.count + 1, first: a.first } : { count: 1, first: now });
    return { ok: false, message: "That email and password do not match an account." };
  }
  attempts.delete(key);
  logEvent("auth.signin", { userId: res.userId });
  redirect("/app");
}

export async function signOutAction(): Promise<void> {
  await getAuth().signOut();
  redirect("/");
}

/** Demo mode: a fresh account with the fictional sample case. No password, no email. */
export async function startDemoAction(): Promise<void> {
  if (!getConfig().demoMode) redirect("/sign-up");
  const userId = await getAuth().createDemoSession();
  const data = await getData();
  const caseId = await seedSampleCase(data, userId);
  await data.repo.appendAudit({ id: newId("aud"), at: nowIso(), userId, caseId, action: "demo.started", targetType: null, targetId: null });
  redirect(`/app/cases/${caseId}`);
}
