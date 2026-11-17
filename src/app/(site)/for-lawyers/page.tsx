import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader, Prose } from "@/components/site/content";

export const metadata: Metadata = { title: "For lawyers" };

const POINTS = [
  { t: "A standard chronology and index", b: "Every entry carries a source number and page. Unconfirmed entries are marked as such in every export." },
  { t: "Clients who arrive organized", b: "Your client's one-page summary, their questions, and the flags they marked as mattering, in one package." },
  { t: "No legal conclusions", b: "The product does not characterize facts, predict outcomes, or produce case law citations. Any citation-like text from AI output is removed." },
  { t: "Origin and undertakings", b: "Clients label every document's origin. Material from the other side triggers a deemed-undertaking reminder; material from counsel triggers a privilege warning." },
  { t: "Expert work stays yours", b: "Expert prep packages use neutral wording and note that, where a client is represented, counsel should retain the expert." },
  { t: "Confidentiality by design", b: "Per-case access control, an audit log of reads and exports, no document content in logs, and real deletion on request." },
];

export default function ForLawyersPage() {
  return (
    <>
      <MarketingHeader
        title="Clients who arrive organized."
        lede="A standard chronology and document index, with every entry linked to the source page. Built to support your work, never to compete with it."
      />
      <Prose>
        <dl className="grid max-w-5xl gap-x-12 gap-y-8 md:grid-cols-2">
          {POINTS.map((p) => (
            <div key={p.t}>
              <dt className="text-lg font-bold">{p.t}</dt>
              <dd className="mt-1.5 text-ink-2">{p.b}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-12 max-w-3xl text-ink-2">
          We are looking for Ontario civil litigators to give feedback on the brief format and our guardrails.{" "}
          <Link href="/contact" className="font-semibold text-spruce underline">
            Contact us
          </Link>
          . Please do not send client information.
        </p>
      </Prose>
    </>
  );
}
