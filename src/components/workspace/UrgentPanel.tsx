import { TriangleAlert } from "lucide-react";
import { ExternalLink } from "@/components/ui";

/** Calm panel for urgent situations (site plan 7.8). */
export function UrgentPanel() {
  return (
    <div role="alert" className="flex gap-3 rounded-lg border-2 border-ochre-line bg-ochre-tint p-5 text-ochre-ink">
      <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-bold">If something is happening now or very soon, get help today:</p>
        <ul className="mt-2 space-y-1">
          <li>
            <ExternalLink href="https://www.legalaid.on.ca/" className="text-ochre-ink">
              Legal Aid Ontario
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.legalaid.on.ca/duty-counsel/" className="text-ochre-ink">
              Duty counsel at the courthouse
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://lso.ca/public-resources/finding-a-lawyer-or-paralegal/law-society-referral-service" className="text-ochre-ink">
              Law Society Referral Service
            </ExternalLink>
          </li>
          <li className="font-semibold">If anyone is in danger, call 911.</li>
        </ul>
      </div>
    </div>
  );
}
