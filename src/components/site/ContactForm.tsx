"use client";

import { useActionState } from "react";
import { sendContact, type ContactState } from "@/app/actions/contact";
import { Button, Callout, Field, Input, Select, Textarea } from "@/components/ui";

const initial: ContactState = { ok: false, message: "" };

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, initial);
  const err = state.errors ?? {};
  if (state.ok) {
    return (
      <Callout tone="success" role="status" title="Message sent">
        {state.message}
      </Callout>
    );
  }
  return (
    <form action={action} noValidate className="max-w-xl">
      {state.message && (
        <Callout tone="danger" role="alert" className="mb-5">
          {state.message}
        </Callout>
      )}
      <Field label="Your name" htmlFor="name" error={err.name}>
        <Input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(err.name)} aria-describedby={err.name ? "name-error" : undefined} />
      </Field>
      <Field label="Email" htmlFor="email" error={err.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(err.email)} aria-describedby={err.email ? "email-error" : undefined} />
      </Field>
      <Field label="Topic" htmlFor="topic" error={err.topic}>
        <Select id="topic" name="topic" defaultValue="support" aria-invalid={Boolean(err.topic)}>
          <option value="support">Help using the product</option>
          <option value="feedback">Feedback</option>
          <option value="lawyer">I am a lawyer or expert</option>
          <option value="accessibility">Accessibility</option>
          <option value="privacy">Privacy</option>
          <option value="press">Press</option>
        </Select>
      </Field>
      <Field label="Message" htmlFor="message" hint="Please do not include case details, names or documents." error={err.message}>
        <Textarea id="message" name="message" maxLength={2000} required aria-invalid={Boolean(err.message)} aria-describedby={err.message ? "message-hint message-error" : "message-hint"} />
      </Field>
      <div aria-hidden className="hidden">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
