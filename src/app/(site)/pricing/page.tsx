import type { Metadata } from "next";
import { Check } from "lucide-react";
import { MarketingHeader, Prose } from "@/components/site/content";
import { ButtonLink, Callout, cx } from "@/components/ui";
import { HARDSHIP_NOTE, PLANS, PRICING_DISCLAIMER } from "@/lib/payments/plans";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <MarketingHeader
        title="One price for three months. No surprise renewals."
        lede="Cases have a time span, so the Case Pass does too. It does not renew on its own."
      />
      <Prose>
        <Callout tone="info" className="mb-8 max-w-3xl" title="Early-access prices">
          These are early-access prices in Canadian dollars. They may change as we learn what people need. During early access, payments are not switched on and
          nobody is charged.
        </Callout>
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => {
            const featured = p.id === "case_pass";
            return (
              <section
                key={p.id}
                aria-labelledby={`plan-${p.id}`}
                className={cx("flex flex-col rounded-xl border bg-surface p-7", featured ? "border-spruce shadow-lift" : "border-line shadow-card")}
              >
                <h2 id={`plan-${p.id}`} className="font-display text-[1.7rem]">
                  {p.name}
                </h2>
                <p className="mt-3">
                  <span className="tabular font-display text-[2.6rem] leading-none">${p.priceCad}</span>
                  <span className="ml-2 text-ink-2">{p.priceCad === 0 ? "" : `CAD for ${p.term}`}</span>
                </p>
                {p.extension && <p className="mt-2 text-sm text-ink-3">{p.extension}</p>}
                <ul className="mt-6 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check aria-hidden className="mt-1 size-4 shrink-0 text-spruce" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <ButtonLink href={p.id === "free" ? "/sign-up" : `/app/billing?plan=${p.id}`} variant={featured ? "primary" : "secondary"} className="mt-7">
                  {p.id === "free" ? "Start free" : `Choose ${p.name}`}
                </ButtonLink>
              </section>
            );
          })}
        </div>
        <div className="mt-10 max-w-3xl space-y-3 text-ink-2">
          <p>{HARDSHIP_NOTE}</p>
          <p className="font-semibold text-ink">{PRICING_DISCLAIMER}</p>
        </div>
      </Prose>
    </>
  );
}
