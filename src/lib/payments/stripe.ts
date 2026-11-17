import "server-only";
import Stripe from "stripe";
import { logError } from "../logger";
import type { CheckoutResult, PaymentProvider } from "./index";
import type { Plan } from "./plans";

/**
 * Stripe Checkout adapter. UNTESTED: no Stripe account exists yet.
 * One-time payment mode (no subscription), so there is no surprise renewal.
 * A webhook to record the paid pass is NOT built yet (docs/build-status.md).
 */
export class StripePaymentProvider implements PaymentProvider {
  readonly label = "Stripe Checkout";
  private readonly stripe: Stripe;

  constructor(secretKey: string, private readonly prices: Partial<Record<Plan["id"], string | undefined>>, private readonly baseUrl: string) {
    this.stripe = new Stripe(secretKey);
  }

  async createCheckout({ plan, userId, email, hardship }: { plan: Plan; userId: string; email: string; hardship: boolean }): Promise<CheckoutResult> {
    const price = this.prices[plan.id];
    if (!price) return { kind: "unavailable", message: "This plan is not set up for payment yet." };
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price, quantity: 1 }],
        customer_email: email,
        client_reference_id: userId,
        metadata: { plan: plan.id, hardship: hardship ? "yes" : "no" },
        // A hardship coupon must be created in Stripe and wired here before launch.
        allow_promotion_codes: true,
        success_url: `${this.baseUrl}/app/billing?status=paid`,
        cancel_url: `${this.baseUrl}/app/billing?status=cancelled`,
      });
      return session.url ? { kind: "redirect", url: session.url, message: "Redirecting to Stripe" } : { kind: "unavailable", message: "Checkout could not start." };
    } catch (err) {
      logError("payments.checkout_failed", err);
      return { kind: "unavailable", message: "Checkout could not start. Please try again later." };
    }
  }
}
