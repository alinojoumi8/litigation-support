"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current";
import { getPayments } from "@/lib/payments";
import { PLANS } from "@/lib/payments/plans";

export interface CheckoutState {
  message: string;
}

export async function checkoutAction(_prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const user = await requireUser();
  const plan = PLANS.find((p) => p.id === form.get("plan") && p.priceCad > 0);
  if (!plan) return { message: "Choose a paid plan." };
  const result = await (await getPayments()).createCheckout({ plan, userId: user.id, email: user.email, hardship: form.get("hardship") === "on" });
  if (result.kind === "redirect" && result.url?.startsWith("https://checkout.stripe.com/")) redirect(result.url);
  return { message: result.message };
}
