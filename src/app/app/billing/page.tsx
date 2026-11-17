import { PageTitle } from "@/components/ui";
import { CheckoutForm } from "@/components/workspace/CheckoutForm";
import { requireUser } from "@/lib/auth/current";
import { providerStatus } from "@/lib/config";
import { HARDSHIP_NOTE, PLANS, PRICING_DISCLAIMER } from "@/lib/payments/plans";

export default async function BillingPage({ searchParams }: PageProps<"/app/billing">) {
  await requireUser();
  const sp = await searchParams;
  const paid = PLANS.filter((p) => p.priceCad > 0);
  const selected = typeof sp.plan === "string" && paid.some((p) => p.id === sp.plan) ? sp.plan : paid[0].id;
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <PageTitle title="Billing" lede="Early-access prices in Canadian dollars. A Case Pass is a one-time payment for 3 months. It never renews on its own." />
      <p className="mb-5 text-sm text-ink-3">Payment provider: {providerStatus().payments}.</p>
      <CheckoutForm plans={paid.map((p) => ({ id: p.id, label: `${p.name}: $${p.priceCad} CAD for ${p.term}` }))} selected={selected} />
      <p className="mt-6 text-ink-2">{HARDSHIP_NOTE}</p>
      <p className="mt-2 font-semibold">{PRICING_DISCLAIMER}</p>
    </div>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
