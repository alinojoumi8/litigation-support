import { Flag } from "lucide-react";

/**
 * Product glimpse for the home page. Static, fictional data only (site plan
 * 4.2): a timeline with one flag card, every line tied to a source page.
 */
const ROWS = [
  { date: "Mar 3, 2025", text: "Renovation agreement signed", src: "Doc 0101 p.1", confirmed: true },
  { date: "Mar 10, 2025", text: "Deposit of $5,000.00 paid by e-transfer", src: "Doc 0142 p.3", confirmed: true },
  { date: "Mar 17, 2025", text: "Email: \"we confirm the deposit was paid\"", src: "Doc 0388 p.1", confirmed: false },
  { date: "Apr 7, 2025", text: "Work started on site", src: "Doc 0101 p.2", confirmed: false },
];

export function HeroTimeline() {
  return (
    <figure className="relative" aria-labelledby="hero-figure-caption">
      <div className="rounded-xl border border-line bg-surface p-5 shadow-lift sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-line pb-3">
          <p className="font-display text-lg text-ink">Master timeline</p>
          <span className="rounded-full border border-dashed border-line-strong px-2 py-0.5 text-xs font-semibold text-ink-3">Sample case · fictional</span>
        </div>
        <ol className="space-y-0">
          {ROWS.map((r) => (
            <li key={r.src} className="grid grid-cols-[6.4rem_1fr] gap-3 border-b border-line/70 py-2.5 last:border-0 sm:grid-cols-[7rem_1fr_auto]">
              <span className="tabular text-sm font-semibold text-ink-2">{r.date}</span>
              <span className="text-[0.95rem] text-ink">
                {r.text}
                {!r.confirmed && <span className="ml-2 text-xs font-semibold text-ink-3">unconfirmed</span>}
              </span>
              <span className="col-start-2 font-mono text-[0.75rem] text-spruce sm:col-start-auto">{r.src}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="settle-in relative -mt-4 ml-6 mr-2 rounded-lg border border-ochre-line bg-ochre-tint p-4 text-ochre-ink shadow-lift sm:ml-16 sm:mr-0">
        <p className="flex items-center gap-2 font-semibold">
          <Flag aria-hidden className="size-4" /> Possible date mismatch: Doc 0142 p.3 vs Doc 0388 p.1
        </p>
        <p className="mt-1 text-sm">Possible inconsistency for you to review. It may have an innocent explanation.</p>
      </div>
      <figcaption id="hero-figure-caption" className="sr-only">
        Example timeline from a fictional sample case. A flag points out that two documents give different dates for the same deposit.
      </figcaption>
    </figure>
  );
}
