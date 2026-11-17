"use server";

import { z } from "zod";
import { getData } from "@/lib/data";
import { newId, nowIso } from "@/lib/ids";
import { logEvent } from "@/lib/logger";

export interface ContactState {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"name" | "email" | "topic" | "message", string>>;
}

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  topic: z.enum(["support", "feedback", "lawyer", "press", "accessibility", "privacy"], { message: "Choose a topic." }),
  message: z.string().trim().min(5, "Write a short message.").max(2000, "Keep it under 2,000 characters."),
  website: z.string().max(0).optional(), // honeypot: real people leave it empty
});

export async function sendContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    topic: form.get("topic"),
    message: form.get("message"),
    website: form.get("website") ?? "",
  });
  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const i of parsed.error.issues) {
      const k = i.path[0] as keyof NonNullable<ContactState["errors"]>;
      if (k && !errors[k]) errors[k] = i.message;
    }
    return { ok: false, message: "Please fix the fields marked below.", errors };
  }
  const { repo } = await getData();
  await repo.saveContactMessage({ id: newId("msg"), at: nowIso(), name: parsed.data.name, email: parsed.data.email, topic: parsed.data.topic, message: parsed.data.message });
  logEvent("contact.received", { kind: parsed.data.topic });
  return { ok: true, message: "Thanks. Your message has been saved. We aim to reply within 3 business days." };
}
