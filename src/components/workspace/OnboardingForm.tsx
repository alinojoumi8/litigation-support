"use client";

import { useActionState, useState } from "react";
import { Lock } from "lucide-react";
import { createCaseAction, type CreateCaseState } from "@/app/actions/cases";
import { Button, Callout, Checkbox, ExternalLink, Field, Input, Select, Textarea, cx } from "@/components/ui";
import { detectUrgent } from "@/lib/domain/urgent";
import { UrgentPanel } from "./UrgentPanel";

const initial: CreateCaseState = { ok: false, message: "" };

type Audience = "with_lawyer" | "self_rep";
type Kind = "civil_small_claims" | "civil_superior" | "civil_other" | "criminal";

function Choice({ name, value, checked, onChange, title, body }: { name: string; value: string; checked: boolean; onChange: () => void; title: string; body: string }) {
  return (
    <label
      className={cx(
        "flex cursor-pointer gap-3 rounded-lg border bg-surface p-4 hover:border-ink-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-spruce",
        checked ? "border-spruce ring-1 ring-spruce" : "border-line",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="mt-1 size-4 accent-spruce" />
      <span>
        <span className="block font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-sm text-ink-2">{body}</span>
      </span>
    </label>
  );
}

export function OnboardingForm({ criminalOpen }: { criminalOpen: boolean }) {
  const [state, action, pending] = useActionState(createCaseAction, initial);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);
  const [situation, setSituation] = useState("");
  const [nickname, setNickname] = useState("");
  const urgent = detectUrgent(`${nickname} ${situation}`) || state.urgent;
  const e = state.errors ?? {};
  const criminal = kind === "criminal";

  return (
    <form action={action} className="mt-8 space-y-10" noValidate>
      {state.message && (
        <Callout tone={criminal && !criminalOpen ? "neutral" : "danger"} role="alert">
          {state.message}
        </Callout>
      )}

      <fieldset>
        <legend className="mb-3 text-lg font-bold">1. Who is working on this case?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Choice name="audience" value="with_lawyer" checked={audience === "with_lawyer"} onChange={() => setAudience("with_lawyer")} title="I have a lawyer" body="I want to organize my file and make our meetings count." />
          <Choice name="audience" value="self_rep" checked={audience === "self_rep"} onChange={() => setAudience("self_rep")} title="I am representing myself" body="I want checklists, deadlines in one place and a weekly plan." />
        </div>
        {e.audience && <p className="mt-2 text-sm font-semibold text-brick-ink">{e.audience}</p>}
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-bold">2. What kind of case is it?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Choice name="kind" value="civil_small_claims" checked={kind === "civil_small_claims"} onChange={() => setKind("civil_small_claims")} title="Small Claims Court" body="Civil claims for money or property of $50,000 or less." />
          <Choice name="kind" value="civil_superior" checked={kind === "civil_superior"} onChange={() => setKind("civil_superior")} title="Superior Court of Justice (civil)" body="Larger civil cases, including business disputes." />
          <Choice name="kind" value="civil_other" checked={kind === "civil_other"} onChange={() => setKind("civil_other")} title="Other civil matter" body="Not sure yet, or another civil court or tribunal." />
          <Choice name="kind" value="criminal" checked={kind === "criminal"} onChange={() => setKind("criminal")} title="Criminal" body="A criminal charge. Extra rules apply to Crown disclosure." />
        </div>
        {e.kind && <p className="mt-2 text-sm font-semibold text-brick-ink">{e.kind}</p>}
      </fieldset>

      {criminal && (
        <section aria-labelledby="gate" className="rounded-xl border-2 border-line-strong bg-surface p-6">
          <h2 id="gate" className="flex items-center gap-2 text-xl font-bold">
            <Lock aria-hidden className="size-5" /> Before a criminal case: disclosure has strict limits
          </h2>
          <div className="mt-3 space-y-3 text-ink-2">
            <p>
              The Crown&apos;s evidence against you (disclosure) is given to you for your defence only. Ontario courts have limited how it can be used and shared,
              including by self-represented people, and the provincial digital disclosure system sets its own conditions.
            </p>
            <p>Uploading disclosure to any outside service may break those conditions. We are waiting on a written opinion from an Ontario lawyer on how to handle it safely.</p>
          </div>
          {!criminalOpen ? (
            <div className="mt-5 space-y-4">
              <Callout tone="neutral" title="Criminal cases are not open yet">
                You can still use the free guides, and these services can help you today.
              </Callout>
              <ul className="space-y-1.5">
                <li>
                  <ExternalLink href="https://www.legalaid.on.ca/">Legal Aid Ontario</ExternalLink>
                </li>
                <li>
                  <ExternalLink href="https://www.legalaid.on.ca/duty-counsel/">Duty counsel at the courthouse</ExternalLink>
                </li>
                <li>
                  <ExternalLink href="https://lso.ca/public-resources/finding-a-lawyer-or-paralegal/law-society-referral-service">Law Society Referral Service</ExternalLink>
                </li>
              </ul>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <p className="font-semibold text-ink">Please confirm each statement:</p>
              <Checkbox id="ack_use" name="ack_use" label="I will use Crown disclosure only for my own defence in this case." />
              <Checkbox id="ack_share" name="ack_share" label="I will not share, post or show disclosure to anyone except my lawyer." />
              <Checkbox id="ack_lawyer" name="ack_lawyer" label="I have read the conditions that came with my disclosure, and I will ask a lawyer if I am unsure whether I may upload it." />
              {e.acks && <p className="text-sm font-semibold text-brick-ink">{e.acks}</p>}
            </div>
          )}
        </section>
      )}

      {(!criminal || criminalOpen) && (
        <fieldset>
          <legend className="mb-3 text-lg font-bold">3. A few details</legend>
          <Field label="A short name for this case" htmlFor="nickname" hint="Only you see this. Avoid full names if you prefer." error={e.nickname}>
            <Input id="nickname" name="nickname" value={nickname} onChange={(ev) => setNickname(ev.target.value)} maxLength={80} required aria-invalid={Boolean(e.nickname)} />
          </Field>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Your role" htmlFor="role">
              <Select id="role" name="role" defaultValue={criminal ? "accused" : "other"}>
                <option value="plaintiff">Plaintiff (I started the case)</option>
                <option value="defendant">Defendant (I am being sued)</option>
                <option value="applicant">Applicant</option>
                <option value="respondent">Respondent</option>
                {criminal && <option value="accused">Accused</option>}
                <option value="other">Not sure yet / other</option>
              </Select>
            </Field>
            <Field label="Court file number" htmlFor="courtFileNumber" optional>
              <Input id="courtFileNumber" name="courtFileNumber" maxLength={60} />
            </Field>
            <Field label="Court or courthouse" htmlFor="court" optional>
              <Input id="court" name="court" maxLength={120} />
            </Field>
            <Field label="Where things stand" htmlFor="stage" optional hint="For example: claim received, waiting for a date.">
              <Input id="stage" name="stage" maxLength={120} />
            </Field>
          </div>
          <Field label="Anything you want to note about where things are now?" htmlFor="situation" optional>
            <Textarea id="situation" name="situation" value={situation} onChange={(ev) => setSituation(ev.target.value)} maxLength={600} />
          </Field>
        </fieldset>
      )}

      {urgent && <UrgentPanel />}

      <input type="hidden" name="audience" value={audience ?? ""} />
      <input type="hidden" name="kind" value={kind ?? ""} />
      {(!criminal || criminalOpen) && (
        <Button type="submit" disabled={pending || !audience || !kind}>
          {pending ? "Creating your case..." : "Create my case file"}
        </Button>
      )}
    </form>
  );
}
