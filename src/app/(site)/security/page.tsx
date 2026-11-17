import type { Metadata } from "next";
import { MarketingHeader, Prose } from "@/components/site/content";
import { Callout } from "@/components/ui";

export const metadata: Metadata = { title: "Security" };

const ROWS: { area: string; now: string; launch: string }[] = [
  { area: "Database and files", now: "Local encrypted store (AES-256-GCM) on the server running the demo.", launch: "Supabase Postgres and Storage in Canada (Central). To be confirmed in the project settings." },
  { area: "Access control", now: "Every page, action and download checks that you belong to the case. Unknown or other people's cases return \"not found\".", launch: "The same checks, plus row-level security in the database as a second layer." },
  { area: "AI processing", now: "A local rule-based extractor. Nothing leaves the server.", launch: "Anthropic Claude through the API, outside Canada. No training on your data. Zero data retention requested; if not granted, the retention period will be stated here." },
  { area: "Reading scans (OCR)", now: "Not available: scanned pages and photos are stored but not read.", launch: "AWS Textract in Canada (ca-central-1)." },
  { area: "Logs and analytics", now: "Logs record event names and ids only. No document content, names or notes.", launch: "Same rule. Privacy-friendly analytics on the public site only, none in the workspace." },
  { area: "Audit log", now: "Views, exports, uploads, edits and deletions are recorded by record id.", launch: "Same, stored in the database with read access limited to the case." },
  { area: "Deletion", now: "Deleting a case removes its documents, extracted text, summaries, timeline, flags, notes and files immediately.", launch: "Same, plus backup purge on a stated schedule." },
  { area: "Sign-in", now: "Email and password (scrypt hashing), secure http-only session cookie.", launch: "Supabase Auth with two-step sign-in (MFA) offered at sign-up." },
];

export default function SecurityPage() {
  return (
    <>
      <MarketingHeader title="Security" lede="Where your data lives, who can see it, and what happens when you delete it. We say plainly what is in place now and what is planned." />
      <Prose>
        <Callout tone="caution" className="mb-8 max-w-3xl" title="This is an early build">
          Hosting, AI and OCR vendors are chosen but not yet switched on. Do not upload real case documents to a demo installation.
        </Callout>
        <div className="max-w-5xl overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Security measures now and at launch</caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="py-3 pr-6 font-bold">Area</th>
                <th scope="col" className="py-3 pr-6 font-bold">In this build</th>
                <th scope="col" className="py-3 font-bold">Planned for beta</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.area} className="border-b border-line align-top">
                  <th scope="row" className="py-4 pr-6 font-semibold">{r.area}</th>
                  <td className="py-4 pr-6 text-ink-2">{r.now}</td>
                  <td className="py-4 text-ink-2">{r.launch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="prose-read mt-10">
          <h2>Breach process</h2>
          <p>
            If a breach creates a real risk of significant harm, we will report it to the Office of the Privacy Commissioner of Canada, tell the people affected, and
            keep a record of every breach for at least 24 months, as PIPEDA requires. A written breach response plan will be in place before the beta.
          </p>
          <h2>Staff access</h2>
          <p>Staff cannot open case content unless you turn on a time-limited support access switch, and every such access is logged. (Planned for beta.)</p>
        </div>
      </Prose>
    </>
  );
}
