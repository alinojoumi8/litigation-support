import "server-only";
import { getConfig } from "../config";
import type { Plan } from "./plans";

export interface CheckoutResult {
  kind: "redirect" | "unavailable";
  url?: string;
  message: string;
}

/** Payment interface. A fixed, one-time Case Pass payment: no automatic renewal. */
export interface PaymentProvider {
  readonly label: string;
  createCheckout(input: { plan: Plan; userId: string; email: string; hardship: boolean }): Promise<CheckoutResult>;
}

/** Default: no payment is taken. Paid features stay open in the demo. */
export class MockPaymentProvider implements PaymentProvider {
  readonly label = "Payment stub (no charges)";
  async createCheckout(): Promise<CheckoutResult> {
    return {
      kind: "unavailable",
      message: "Payments are not switched on yet. During early access every feature is open, and nobody is charged.",
    };
  }
}

export async function getPayments(): Promise<PaymentProvider> {
  const c = getConfig();
  if (c.PAYMENTS_PROVIDER === "stripe" && c.STRIPE_SECRET_KEY) {
    const { StripePaymentProvider } = await import("./stripe");
    return new StripePaymentProvider(c.STRIPE_SECRET_KEY, {
      case_pass: c.STRIPE_PRICE_CASE_PASS,
      case_pass_plus: c.STRIPE_PRICE_CASE_PASS_PLUS,
    }, c.APP_BASE_URL);
  }
  return new MockPaymentProvider();
}
