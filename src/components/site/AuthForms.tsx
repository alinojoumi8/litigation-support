"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction, type AuthState } from "@/app/actions/auth";
import { Button, Callout, Checkbox, Field, Input } from "@/components/ui";

const initial: AuthState = { ok: false, message: "" };

export function SignUpForm({ ack }: { ack: string }) {
  const [state, action, pending] = useActionState(signUpAction, initial);
  const e = state.errors ?? {};
  return (
    <form action={action} noValidate>
      {state.message && (
        <Callout tone="danger" role="alert" className="mb-5">
          {state.message}
        </Callout>
      )}
      <Field label="Your name" htmlFor="name" error={e.name}>
        <Input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(e.name)} aria-describedby={e.name ? "name-error" : undefined} />
      </Field>
      <Field label="Email" htmlFor="email" error={e.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(e.email)} aria-describedby={e.email ? "email-error" : undefined} />
      </Field>
      <Field label="Password" htmlFor="password" hint="At least 10 characters. A short sentence works well." error={e.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          aria-invalid={Boolean(e.password)}
          aria-describedby={e.password ? "password-hint password-error" : "password-hint"}
        />
      </Field>
      <div className="mb-5 rounded-md border border-line bg-paper p-4">
        <Checkbox id="ack" name="ack" required label={ack} aria-invalid={Boolean(e.ack)} aria-describedby={e.ack ? "ack-error" : undefined} />
        {e.ack && (
          <p id="ack-error" className="mt-2 text-sm font-semibold text-brick-ink">
            {e.ack}
          </p>
        )}
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating your account..." : "Create account"}
      </Button>
      <p className="mt-4 text-sm text-ink-3">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-spruce underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, initial);
  const e = state.errors ?? {};
  return (
    <form action={action} noValidate>
      {state.message && (
        <Callout tone="danger" role="alert" className="mb-5">
          {state.message}
        </Callout>
      )}
      <Field label="Email" htmlFor="email" error={e.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(e.email)} />
      </Field>
      <Field label="Password" htmlFor="password" error={e.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={Boolean(e.password)} />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
      <p className="mt-4 text-sm text-ink-3">
        New here?{" "}
        <Link href="/sign-up" className="text-spruce underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
