import { redirect } from "next/navigation";
import { PkgSection, PrintFrame } from "@/components/workspace/PrintFrame";
import { audit, requireCaseAccess } from "@/lib/auth/current";
import { isSafeId } from "@/lib/auth/authz";
import { PRODUCT_NAME } from "@/lib/brand";
import { findMoneyPatterns } from "@/lib/domain/accounting";
import { authorityById } from "@/lib/domain/authorities";
import { formatCents, formatIsoDate } from "@/lib/domain/extract";
import { ORIGIN_LABELS, formatSourceId, formatSourceRef, shareWarnings } from "@/lib/domain/origin";
import { buildTimeline } from "@/lib/domain/timeline";
import { MONEY_DISCLAIMER, SIGNATURE_DISCLAIMER, SIGNATURE_INNOCENT_CAUSES } from "@/lib/domain/wording";
import { loadCaseOverview } from "@/lib/services/caseData";
import { recentlyExported } from "@/lib/services/exports";

export default async function ExpertPackagePage({ params, searchParams }: PageProps<"/app/cases/[caseId]/packages/expert">) {
  const { caseId } = await params;
  const sp = await searchParams;
  const ctx = await requireCaseAccess(caseId, "export");
  const type = sp.type === "accountant" ? "accountant" : "examiner";
  const o = await loadCaseOverview(ctx);
  if (!recentlyExported(o.exports, [type === "accountant" ? "expert_accountant" : "expert_examiner"])) redirect(`/app/cases/${ctx.caseFile.id}/packages?error=review`);
  await audit(ctx, `export.expert_${type}_viewed`, ctx.caseFile.id);

  const ids = new Set((Array.isArray(sp.doc) ? sp.doc : sp.doc ? [sp.doc] : []).filter(isSafeId));
  const docs = o.documents.filter((d) => ids.has(d.id)).sort((a, b) => a.seq - b.seq);
  const draft = ctx.caseFile.expertDrafts?.[type] ?? { background: "", questions: "" };
  const included = new Set(docs.map((d) => d.id));
  const extract = buildTimeline(o.events, o.documents, { status: "confirmed" }).filter((e) => !e.sourceDocId || included.has(e.sourceDocId));
  const warn = shareWarnings(docs);
  const rule = authorityById("rcp-4-1");
  const comparisons = o.signatures.filter((s) => included.has(s.questionedDocId));
  const byId = new Map(o.documents.map((d) => [d.id, d]));
  const txns = type === "accountant" ? await ctx.repo.list("transactions", ctx.caseFile.id) : [];
  const moneyFlags = type === "accountant" ? findMoneyPatterns(txns).filter((f) => (ctx.caseFile.moneyFlagStatus[f.fingerprint] ?? "new") !== "not_an_issue") : [];
  const title = type === "examiner" ? "Prep package for a forensic document examiner" : "Prep package for a forensic accountant";

  return (
    <PrintFrame backHref={`/app/cases/${ctx.caseFile.id}/packages`} title={title} watermark>
      <header>
        <p className="text-sm text-ink-3">Prepared by the user with {PRODUCT_NAME} · {formatIsoDate(o.today)}</p>
        <h1 className="mt-1 font-display text-[2rem] leading-tight">{title}</h1>
        <p className="mt-3 text-[0.95rem]">
          This package gives background, documents and questions. It does not state conclusions. The expert&apos;s opinion is theirs alone. In Ontario civil cases, an
          expert owes a duty to the court to be fair, objective and non-partisan ({rule.citation}, Rules of Civil Procedure; check the current text at {rule.url}). If the
          person has a lawyer, the lawyer should usually retain the expert.
        </p>
        {warn.messages.length > 0 && (
          <div className="mt-4 rounded border border-ochre-line bg-ochre-tint p-3 text-sm text-ochre-ink">
            {warn.messages.map((m) => (
              <p key={m}>{m}</p>
            ))}
          </div>
        )}
      </header>

      <PkgSection title="Background (written by the user)">
        <div className="whitespace-pre-wrap text-[0.98rem]">{draft.background || "Not provided."}</div>
      </PkgSection>

      <PkgSection title="Questions">
        <div className="whitespace-pre-wrap text-[0.98rem]">{draft.questions || "Not provided."}</div>
        {moneyFlags.length > 0 && (
          <>
            <p className="mt-4 font-semibold">Patterns the user would like asked about</p>
            <ol className="list-decimal space-y-1 pl-5 text-[0.95rem]">
              {moneyFlags.map((f) => (
                <li key={f.fingerprint}>{f.question}</li>
              ))}
            </ol>
            <p className="mt-2 text-sm text-ink-3">{MONEY_DISCLAIMER}</p>
          </>
        )}
      </PkgSection>

      <PkgSection title="Documents and chain of custody" breakBefore>
        {docs.length === 0 ? (
          <p className="text-ink-3">No documents selected.</p>
        ) : (
          <table className="w-full border-collapse text-left text-[0.88rem]">
            <thead>
              <tr className="border-b border-ink">
                <th scope="col" className="py-1.5 pr-2">Source</th>
                <th scope="col" className="py-1.5 pr-2">Document</th>
                <th scope="col" className="py-1.5 pr-2">Origin</th>
                <th scope="col" className="py-1.5 pr-2">Who gave it / how obtained</th>
                <th scope="col" className="py-1.5 pr-2">Original?</th>
                <th scope="col" className="py-1.5">SHA-256 (first 16)</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="avoid-break border-b border-line align-top">
                  <td className="py-1.5 pr-2 font-mono text-xs">{formatSourceId(d.seq)}</td>
                  <td className="py-1.5 pr-2">{d.title}</td>
                  <td className="py-1.5 pr-2 text-xs">{ORIGIN_LABELS[d.origin]}</td>
                  <td className="py-1.5 pr-2 text-xs">
                    {d.providedBy || "Not recorded"} / {d.howObtained || "Not recorded"}
                  </td>
                  <td className="py-1.5 pr-2 text-xs">{d.originalAvailable ? "Original available" : "Copy only"}</td>
                  <td className="py-1.5 font-mono text-[0.7rem]">{d.sha256.slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PkgSection>

      {type === "examiner" && comparisons.length > 0 && (
        <PkgSection title="The user's visual notes">
          <p className="mb-3 text-sm">{SIGNATURE_DISCLAIMER}</p>
          {comparisons.map((cmp) => {
            const q = byId.get(cmp.questionedDocId);
            return (
              <div key={cmp.id} className="avoid-break mb-5">
                <p className="font-semibold">
                  {cmp.title}: questioned {q ? formatSourceId(q.seq) : ""}, known{" "}
                  {cmp.knownDocIds.map((k) => byId.get(k)).filter(Boolean).map((k) => formatSourceId(k!.seq)).join(", ")}
                </p>
                <ol className="list-decimal pl-5 text-[0.95rem]">
                  {cmp.observations.filter((x) => x.note.trim()).map((x) => (
                    <li key={x.id}>
                      ({x.side === "questioned" ? "questioned sample" : "known sample"}) {x.note}
                    </li>
                  ))}
                </ol>
                {cmp.examinerNote && <p className="mt-2 whitespace-pre-wrap rounded border border-line p-2 text-sm">{cmp.examinerNote}</p>}
              </div>
            );
          })}
          <p className="text-sm">{SIGNATURE_INNOCENT_CAUSES}</p>
        </PkgSection>
      )}

      {type === "accountant" && txns.length > 0 && (
        <PkgSection title="Imported statement summary">
          <p className="text-[0.95rem]">
            {txns.length} rows from {txns[0].importName}, {formatIsoDate([...txns].sort((a, b) => (a.date < b.date ? -1 : 1))[0].date)} to{" "}
            {formatIsoDate([...txns].sort((a, b) => (a.date > b.date ? -1 : 1))[0].date)}. Net movement {formatCents(txns.reduce((s, t) => s + t.amountCents, 0))}.
          </p>
        </PkgSection>
      )}

      <PkgSection title="Timeline extract (confirmed events from these documents)" breakBefore>
        {extract.length === 0 ? (
          <p className="text-ink-3">No confirmed events from the selected documents.</p>
        ) : (
          <ul className="space-y-1 text-[0.92rem]">
            {extract.map((e) => (
              <li key={e.id} className="avoid-break">
                <span className="tabular font-semibold">{formatIsoDate(e.date, e.datePrecision)}</span>: {e.description}{" "}
                {e.sourceSeq && <span className="font-mono text-xs">({formatSourceRef(e.sourceSeq, e.sourcePage)})</span>}
              </li>
            ))}
          </ul>
        )}
      </PkgSection>
    </PrintFrame>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
