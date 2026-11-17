import { redirect } from "next/navigation";
import { PkgSection, PrintFrame } from "@/components/workspace/PrintFrame";
import { audit, requireCaseAccess } from "@/lib/auth/current";
import { EXPORT_CHECK_NOTICE, PRODUCT_NAME } from "@/lib/brand";
import { FLAG_STATUS_LABELS } from "@/lib/domain/discrepancies";
import { formatIsoDate } from "@/lib/domain/extract";
import { CASE_KIND_LABELS, ORIGIN_SHORT, formatSourceId, formatSourceRef, isPrivileged } from "@/lib/domain/origin";
import { buildTimeline, summaryPeople } from "@/lib/domain/timeline";
import { READINESS_CAPTION } from "@/lib/domain/wording";
import { loadCaseOverview } from "@/lib/services/caseData";
import { recentlyExported } from "@/lib/services/exports";

export default async function BriefPage({ params, searchParams }: PageProps<"/app/cases/[caseId]/packages/brief">) {
  const { caseId } = await params;
  const sp = await searchParams;
  const ctx = await requireCaseAccess(caseId, "export");
  const o = await loadCaseOverview(ctx);
  if (!recentlyExported(o.exports, ["brief"])) redirect(`/app/cases/${ctx.caseFile.id}/packages?error=review`);
  await audit(ctx, "export.brief_viewed", ctx.caseFile.id);
  const c = ctx.caseFile;
  const docs = [...o.documents].sort((a, b) => a.seq - b.seq);
  const bySeq = new Map(docs.map((d) => [d.id, d]));
  const rows = buildTimeline(o.events, docs);
  const flags = o.flags.filter((f) => f.status === "matters" || f.status === "ask_lawyer");
  const people = summaryPeople(o.summaries);
  const aiEvents = o.events.filter((e) => e.createdBy === "ai");
  const aiConfirmed = aiEvents.filter((e) => e.status === "confirmed").length;
  const providers = [...new Set(o.summaries.map((s) => (s.provider === "mock" ? "local demo extractor (rule-based, no AI)" : `${s.model} (prompt ${s.promptVersion})`)))];

  return (
    <PrintFrame backHref={`/app/cases/${c.id}/packages`} title="Case brief" watermark={sp.watermark === "1"}>
      {/* Cover sheet */}
      <header>
        <p className="text-sm text-ink-3">Case brief prepared by the user with {PRODUCT_NAME}</p>
        <h1 className="mt-1 font-display text-[2.2rem] leading-tight">{c.nickname}</h1>
        <dl className="mt-5 grid grid-cols-[11rem_1fr] gap-y-1.5 text-[0.95rem]">
          <dt className="text-ink-3">Court</dt>
          <dd>{c.court || CASE_KIND_LABELS[c.kind]}</dd>
          <dt className="text-ink-3">Court file number</dt>
          <dd>{c.courtFileNumber || "Not entered"}</dd>
          <dt className="text-ink-3">Role</dt>
          <dd className="capitalize">{c.role}</dd>
          <dt className="text-ink-3">Where things stand</dt>
          <dd>{c.stage || "Not entered"}</dd>
          <dt className="text-ink-3">Prepared</dt>
          <dd>{formatIsoDate(o.today)}</dd>
          <dt className="text-ink-3">File readiness</dt>
          <dd>
            {o.readiness.score}% <span className="text-sm text-ink-3">({READINESS_CAPTION})</span>
          </dd>
        </dl>
        <p className="mt-5 rounded border border-line bg-paper p-3 text-sm">{EXPORT_CHECK_NOTICE}</p>
      </header>

      <PkgSection title="AI-use statement">
        <ul className="list-disc space-y-1 pl-5 text-[0.95rem]">
          <li>Document summaries and {aiEvents.length} timeline events were drafted by software: {providers.join("; ") || "none"}.</li>
          <li>
            The user confirmed {aiConfirmed} of {aiEvents.length} drafted events against the source page. Unconfirmed events are marked below.
          </li>
          <li>{o.events.filter((e) => e.createdBy === "user").length} events were written by the user.</li>
          <li>The one-page summary and the questions were written by the user, not by AI.</li>
          <li>No case law or statute citations were generated. Any citation-like text in AI output was removed.</li>
          <li>Flags are possible inconsistencies for review. They are not findings.</li>
        </ul>
      </PkgSection>

      <PkgSection title="One-page summary (written by the user)">
        <div className="whitespace-pre-wrap text-[0.98rem] leading-relaxed">{c.summary || "Not written yet."}</div>
      </PkgSection>

      <PkgSection title="Chronology" breakBefore>
        <table className="w-full border-collapse text-left text-[0.9rem]">
          <thead>
            <tr className="border-b border-ink">
              <th scope="col" className="py-1.5 pr-3">Date</th>
              <th scope="col" className="py-1.5 pr-3">Event</th>
              <th scope="col" className="py-1.5 pr-3">Source</th>
              <th scope="col" className="py-1.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="avoid-break border-b border-line align-top">
                <td className="tabular whitespace-nowrap py-1.5 pr-3">{formatIsoDate(r.date, r.datePrecision)}</td>
                <td className="py-1.5 pr-3">{r.description}</td>
                <td className="whitespace-nowrap py-1.5 pr-3 font-mono text-xs">{r.sourceSeq ? formatSourceRef(r.sourceSeq, r.sourcePage) : "None"}</td>
                <td className="py-1.5 text-xs">{r.status === "confirmed" ? "Confirmed" : "Unconfirmed draft"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PkgSection>

      <PkgSection title="Document index" breakBefore>
        <table className="w-full border-collapse text-left text-[0.9rem]">
          <thead>
            <tr className="border-b border-ink">
              <th scope="col" className="py-1.5 pr-3">Source</th>
              <th scope="col" className="py-1.5 pr-3">Title</th>
              <th scope="col" className="py-1.5 pr-3">Date</th>
              <th scope="col" className="py-1.5 pr-3">Pages</th>
              <th scope="col" className="py-1.5">Origin</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="avoid-break border-b border-line align-top">
                <td className="whitespace-nowrap py-1.5 pr-3 font-mono text-xs">{formatSourceId(d.seq)}</td>
                <td className="py-1.5 pr-3">{d.title}</td>
                <td className="tabular whitespace-nowrap py-1.5 pr-3">{d.docDate ? formatIsoDate(d.docDate) : ""}</td>
                <td className="tabular py-1.5 pr-3">{d.pageCount}</td>
                <td className="py-1.5 text-xs">
                  {ORIGIN_SHORT[d.origin]}
                  {isPrivileged(d) ? " (privileged)" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PkgSection>

      <PkgSection title="Key people">
        {people.length ? <p className="text-[0.95rem]">{people.join(" · ")}</p> : <p className="text-ink-3">None identified.</p>}
      </PkgSection>

      <PkgSection title="Flags marked for attention">
        {flags.length === 0 ? (
          <p className="text-ink-3">None marked.</p>
        ) : (
          <ol className="list-decimal space-y-3 pl-5 text-[0.95rem]">
            {flags.map((f) => (
              <li key={f.id} className="avoid-break">
                <p className="font-semibold">
                  {f.title} <span className="font-normal text-ink-3">({FLAG_STATUS_LABELS[f.status]})</span>
                </p>
                <p>{f.detail}</p>
                {f.sources.map((s, i) => {
                  const d = bySeq.get(s.docId);
                  return (
                    <p key={i} className="text-sm">
                      <span className="font-mono">{d ? formatSourceRef(d.seq, s.page) : "Deleted"}</span>: &ldquo;{s.excerpt}&rdquo;
                    </p>
                  );
                })}
                {f.userNote && <p className="text-sm italic">User note: {f.userNote}</p>}
              </li>
            ))}
          </ol>
        )}
        <p className="mt-2 text-sm text-ink-3">Possible inconsistencies for review. Each may have an innocent explanation.</p>
      </PkgSection>

      <PkgSection title="Open questions">
        <ol className="list-decimal space-y-1 pl-5 text-[0.95rem]">
          {o.questions.filter((q) => q.status === "open").map((q) => (
            <li key={q.id}>{q.text}</li>
          ))}
        </ol>
      </PkgSection>

      <PkgSection title="Dates entered by the user">
        <ul className="space-y-1 text-[0.95rem]">
          {[...o.deadlines].filter((d) => !d.done).sort((a, b) => (a.date < b.date ? -1 : 1)).map((d) => (
            <li key={d.id}>
              <span className="tabular font-semibold">{formatIsoDate(d.date)}</span>: {d.title}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-ink-3">Dates were entered by the user and must be confirmed with the court office, the order, or a lawyer.</p>
      </PkgSection>
    </PrintFrame>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
