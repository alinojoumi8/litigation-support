import type { Metadata } from "next";
import { MarketingHeader, Prose } from "@/components/site/content";
import { ExternalLink } from "@/components/ui";
import { authorityById } from "@/lib/domain/authorities";

export const metadata: Metadata = { title: "Get help now" };

const HELP = ["lao", "lao-duty-counsel", "lso-referral", "steps-to-justice", "smallclaims-guide"].map(authorityById);

export default function GetHelpPage() {
  return (
    <>
      <MarketingHeader title="Get help now" lede="If something is happening now or very soon, get help today." />
      <Prose>
        <div className="max-w-3xl rounded-xl border-2 border-brick-ink bg-brick-tint p-6 text-brick-ink">
          <p className="text-xl font-bold">If you or someone else is in danger, call 911.</p>
          <p className="mt-1">If you are in custody, ask for duty counsel or call Legal Aid Ontario.</p>
        </div>
        <ul className="mt-10 max-w-3xl divide-y divide-line border-y border-line">
          {HELP.map((a) => (
            <li key={a.id} className="py-5">
              <p className="text-lg font-semibold">
                <ExternalLink href={a.url}>{a.title}</ExternalLink>
              </p>
              <p className="mt-1 text-ink-2">{a.note}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-3xl text-ink-2">
          Court staff can explain court process and forms, but they cannot give legal advice. Many courthouses also have duty counsel or help centres.
        </p>
      </Prose>
    </>
  );
}
