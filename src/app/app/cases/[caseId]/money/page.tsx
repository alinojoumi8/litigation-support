import Link from "next/link";
import { importStatementAction, setMoneyFlagStatusAction } from "@/app/actions/workspace";
import { Button, Callout, EmptyState, Field, PageTitle, Pill, Section, Select, cx } from "@/components/ui";
import { FlagStatusPill } from "@/components/workspace/bits";
import { requireCaseAccess } from "@/lib/auth/current";
import { MONEY_KIND_LABELS, findMoneyPatterns } from "@/lib/domain/accounting";
import { FLAG_STATUS_LABELS } from "@/lib/domain/discrepancies";
import { formatCents, formatIsoDate } from "@/lib/domain/extract";
import { formatSourceId } from "@/lib/domain/origin";
import type { FlagStatus } from "@/lib/domain/types";
import { MONEY_DISCLAIMER } from "@/lib/domain/wording";

const ORDER: FlagStatus[] = ["new", "matters", "ask_lawyer", "not_an_issue"];

export default async function MoneyPage({ params, searchParams }: PageProps<"/app/cases/[caseId]/money">) {
  const { caseId } = await params;
  const sp = await searchParams;
  const ctx = await requireCaseAccess(caseId);
  const [txns, docs, events] = await Promise.all([ctx.repo.list("transactions", ctx.caseFile.id), ctx.repo.list("documents", ctx.caseFile.id), ctx.repo.list("events", ctx.caseFile.id)]);
  const csvDocs = docs.filter((d) => /csv/.test(d.mimeType)).sort((a, b) => a.seq - b.seq);
  const keyDates = events.filter((e) => e.status === "confirmed" && e.datePrecision === "day").map((e) => ({ date: e.date, label: e.description.slice(0, 80) }));
  const flags = findMoneyPatterns(txns, { keyDates });
  const statusOf = (fp: string): FlagStatus => ctx.caseFile.moneyFlagStatus[fp] ?? "new";
  const sortedTxns = [...txns].sort((a, b) => a.row - b.row);
  const flaggedRows = new Set(flags.flatMap((f) => f.rows));
  const canWrite = ctx.membership.role !== "viewer";
  const questions = flags.filter((f) => statusOf(f.fingerprint) !== "not_an_issue");

  return (
    <>
      <PageTitle title="Money patterns" lede="Import a bank or card statement to see patterns worth asking an accountant about." />
      <Callout tone="flag" className="mb-6">
        {MONEY_DISCLAIMER} Round amounts, repeats and gaps are common and often ordinary.
      </Callout>
      {sp.imported && (
        <Callout tone="success" role="status" className="mb-6">
          Imported {sp.imported} rows{sp.skipped && sp.skipped !== "0" ? `. ${sp.skipped} rows could not be read (dates must look like 2025-03-31)` : ""}.
        </Callout>
      )}
      {sp.error && (
        <Callout tone="danger" role="alert" className="mb-6">
          {sp.error === "not-csv" ? "Choose a CSV document." : "No rows could be read. The file needs date, description and amount columns, with dates like 2025-03-31."}
        </Callout>
      )}

      {canWrite && (
        <Section title="Import a statement" id="import-h">
          {csvDocs.length === 0 ? (
            <p className="text-ink-2">
              Upload a CSV export from your bank in{" "}
              <Link href={`/app/cases/${ctx.caseFile.id}/documents`} className="text-spruce underline">
                Documents
              </Link>{" "}
              first. It needs date, description and amount (or debit and credit) columns.
            </p>
          ) : (
            <form action={importStatementAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface p-4">
              <input type="hidden" name="caseId" value={ctx.caseFile.id} />
              <div className="min-w-64 flex-1">
                <Field label="Statement (CSV document)" htmlFor="docId">
                  <Select id="docId" name="docId">
                    {csvDocs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {formatSourceId(d.seq)}: {d.title}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="pb-4">
                <Button type="submit" variant="secondary">
                  Import and check
                </Button>
              </div>
            </form>
          )}
          {txns.length > 0 && <p className="mt-2 text-sm text-ink-3">Importing replaces the current table. Imported from {txns[0].importName}.</p>}
        </Section>
      )}

      <Section title={`Patterns (${flags.length})`} id="patterns-h">
        {flags.length === 0 ? (
          <EmptyState title={txns.length === 0 ? "No statement imported" : "No patterns found"}>{txns.length === 0 ? "Import a statement to check it." : "Nothing stood out in this statement."}</EmptyState>
        ) : (
          <ul className="space-y-3">
            {flags.map((f) => {
              const st = statusOf(f.fingerprint);
              return (
                <li key={f.fingerprint} className={cx("rounded-lg border bg-surface p-4", st === "new" ? "border-ochre-line" : "border-line")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <FlagStatusPill status={st} />
                    <Pill>{MONEY_KIND_LABELS[f.kind]}</Pill>
                    <span className="text-sm text-ink-3">Rows {f.rows.join(", ")}</span>
                  </div>
                  <p className="mt-1.5 font-semibold">{f.title}</p>
                  <p className="mt-0.5 text-[0.95rem] text-ink-2">{f.detail}</p>
                  <p className="mt-1.5 text-[0.95rem]">
                    <span className="font-semibold">Question to ask: </span>
                    {f.question}
                  </p>
                  {canWrite && (
                    <form action={setMoneyFlagStatusAction} className="mt-3 flex flex-wrap gap-2">
                      <input type="hidden" name="caseId" value={ctx.caseFile.id} />
                      <input type="hidden" name="fingerprint" value={f.fingerprint} />
                      {ORDER.map((s) => (
                        <Button key={s} type="submit" name="status" value={s} size="sm" variant={st === s ? "primary" : "secondary"} aria-pressed={st === s}>
                          {FLAG_STATUS_LABELS[s]}
                        </Button>
                      ))}
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {questions.length > 0 && (
        <Section title="Questions for a forensic accountant" id="q-h">
          <ol className="list-decimal space-y-1.5 rounded-lg border border-line bg-surface py-4 pl-10 pr-5">
            {questions.map((f) => (
              <li key={f.fingerprint}>{f.question}</li>
            ))}
          </ol>
          <p className="mt-2 text-sm text-ink-3">These go into the accountant prep package. Edit them there before you share.</p>
        </Section>
      )}

      {sortedTxns.length > 0 && (
        <Section title={`Transactions (${sortedTxns.length})`} id="txn-h">
          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full min-w-[40rem] text-left text-[0.93rem]">
              <caption className="sr-only">Imported transactions. Rows marked with a flag icon appear in a pattern above.</caption>
              <thead className="border-b border-line bg-paper text-sm text-ink-2">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">Row</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Date</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Description</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Amount</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Balance</th>
                  <th scope="col" className="px-3 py-2 font-semibold">In a pattern</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sortedTxns.map((t) => (
                  <tr key={t.id} className={flaggedRows.has(t.row) ? "bg-ochre-tint/40" : undefined}>
                    <td className="tabular px-3 py-2 text-ink-3">{t.row}</td>
                    <td className="tabular px-3 py-2">{formatIsoDate(t.date)}</td>
                    <td className="px-3 py-2">{t.description}</td>
                    <td className={cx("tabular px-3 py-2 text-right", t.amountCents < 0 ? "text-ink" : "text-moss-ink")}>{formatCents(t.amountCents)}</td>
                    <td className="tabular px-3 py-2 text-right text-ink-2">{t.balanceCents === null ? "" : formatCents(t.balanceCents)}</td>
                    <td className="px-3 py-2 text-sm">{flaggedRows.has(t.row) ? "Yes" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
