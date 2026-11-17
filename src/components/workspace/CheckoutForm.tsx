"use client";

import { useActionState } from "react";
import { checkoutAction, type CheckoutState } from "@/app/actions/billing";
import { Button, Callout, Checkbox, Field, Select } from "@/components/ui";

export function CheckoutForm({ plans, selected }: { plans: { id: string; label: string }[]; selected: string }) {
  const [state, action, pending] = useActionState(checkoutAction, { message: "" } as CheckoutState);
  return (
    <form action={action} className="rounded-lg border border-line bg-surface p-5">
      <Field label="Plan" htmlFor="plan">
        <Select id="plan" name="plan" defaultValue={selected}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="mb-4">
        <Checkbox id="hardship" name="hardship" label="I need the hardship price (50% off)" hint="No proof needed." />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Starting checkout..." : "Continue to payment"}
      </Button>
      {state.message && (
        <Callout tone="info" role="status" className="mt-4">
          {state.message}
        </Callout>
      )}
    </form>
  );
}
