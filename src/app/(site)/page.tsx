import Link from "next/link";
import { ArrowRight, CircleCheck, Circle } from "lucide-react";
import { HeroTimeline } from "@/components/site/HeroTimeline";
import { ButtonLink } from "@/components/ui";
import { PRODUCT_NAME } from "@/lib/brand";
import { READINESS_CAPTION } from "@/lib/domain/wording";

const PAINS = [
  {
    title: "Your case is buried in your inbox.",
    body: "Thousands of emails, statements, contracts and scans. The facts are in there, and it's usually you who has to dig them out.",
  },
  {
    title: "Explaining your case takes paid time.",
    body: "Lawyers are busy and bill for their time. Hours spent catching up on a messy file are hours not spent on your case. A clear file helps everyone get to the point.",
  },
  {
    title: "Experts are expensive. Go in knowing what to ask.",
    body: "Forensic accountants and document examiners charge for their time. Know what you want them to look at, and why, before you hire one.",
  },
];

const STEPS = [
  { title: "Upload.", body: "Add emails, PDFs, photos and statements. Scans work too." },
  { title: "Organize.", body: "Get a plain-language summary of each document and one master timeline. Every line links to the page it came from." },
  { title: "Check.", body: "See flags where dates, amounts, names or signatures don't line up. You review each one and decide what matters." },
  { title: "Prepare.", body: "Export a brief for your lawyer or a prep package for an expert. Follow a short plan each week." },
];

const TRUST = [
  { title: "Information, not advice.", body: "We organize and explain. We don't tell you what to file or predict how your case will go." },
  { title: "Every line has a source.", body: "Summaries link to the exact page. Legal information links to the official text." },
  { title: "No invented case law.", body: "We don't generate case citations. Anything legal we show links to an official source." },
  { title: "Flags, not findings.", body: "We point out things worth a closer look. Only a qualified expert can give an opinion on a signature or the accounts." },
  { title: "Your file is yours.", body: "Encrypted, never sold, never shown to anyone you don't invite, and deleted when you ask. Where AI processing and storage happen is stated plainly on our security page." },
];

const FAQ = [
  { q: "Is this legal advice?", a: "No. It's an organization tool with general legal information. For advice about your situation, speak to a lawyer or licensed paralegal." },
  { q: "Will it replace my lawyer?", a: "No. It helps you and your lawyer work faster with a clearer file." },
  { q: "Can it tell if a signature is forged?", a: "No. It can help you put the documents side by side and note visible differences to show a qualified document examiner. Only an examiner can give an opinion." },
  { q: "Is my data safe?", a: "Your files are encrypted, access is limited to you and the people you invite, and you can delete everything at any time. The details, including where data is stored and processed, are on our security page." },
  { q: "What does it cover?", a: "Ontario civil matters at launch: Small Claims Court and Superior Court civil cases. Criminal cases need extra safeguards, so they stay closed until a lawyer has reviewed how disclosure is handled." },
];

const READINESS_SAMPLE = [
  { label: "Documents added and labelled", done: true },
  { label: "Every document summarized", done: true },
  { label: "Timeline confirmed", done: false },
  { label: "Flags reviewed", done: false },
  { label: "Deadlines entered", done: true },
  { label: "Questions written", done: false },
];

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div>
          <h1 className="font-display text-[3.1rem] font-[560] leading-[1.02] tracking-[-0.025em] text-ink sm:text-[4.2rem]">Walk in prepared.</h1>
          <p className="mt-4 text-lg font-semibold text-spruce">For people facing a civil court case in Ontario</p>
          <p className="mt-4 max-w-xl text-[1.15rem] leading-relaxed text-ink-2">
            {PRODUCT_NAME} turns your emails and documents into an organized case file: plain-language summaries, one master timeline, and flags where things
            don&apos;t line up. Every line links to the page it came from. Bring it to your lawyer or your expert, or use it to represent yourself.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/sign-up">Start your case file, free</ButtonLink>
            <Link href="/how-it-works" className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 font-semibold text-spruce hover:bg-spruce-tint">
              See how it works <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-3">Organization tools and legal information. Not a law firm. Not legal advice.</p>
        </div>
        <HeroTimeline />
      </section>

      {/* 2. Pain points */}
      <section aria-labelledby="pains" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 id="pains" className="sr-only">
            What people tell us
          </h2>
          <div className="grid gap-x-12 gap-y-10 md:grid-cols-3">
            {PAINS.map((p) => (
              <div key={p.title}>
                <h3 className="font-display text-[1.5rem] leading-snug text-ink">{p.title}</h3>
                <p className="mt-3 text-ink-2">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section aria-labelledby="how" className="mx-auto max-w-6xl px-5 py-20">
        <h2 id="how" className="font-display text-[2.3rem] leading-tight tracking-[-0.015em]">
          Four steps, at your own pace.
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t-2 border-ink pt-4">
              <p className="tabular text-sm font-bold text-ink-3">Step {i + 1}</p>
              <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8">
          <Link href="/how-it-works" className="font-semibold text-spruce underline">
            Read the full walkthrough
          </Link>
        </p>
      </section>

      {/* 5. Discipline band */}
      <section aria-labelledby="habit" className="bg-spruce-deep text-[#eef4f1]">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2">
          <div>
            <h2 id="habit" className="font-display text-[2.4rem] leading-tight tracking-[-0.015em] text-white">
              Preparation is a habit.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed">
              Thirty minutes a week. A short list of what to do next. A clear view of what&apos;s done. People who prepare steadily walk into meetings and hearings calm
              and ready.
            </p>
          </div>
          <div className="rounded-xl bg-[#f6f3ec] p-6 text-ink shadow-lift">
            <div className="flex items-baseline justify-between">
              <p className="font-semibold">File readiness</p>
              <p className="tabular font-display text-3xl">58%</p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-sunken" role="img" aria-label="Readiness 58 percent">
              <div className="h-full w-[58%] rounded-full bg-spruce" />
            </div>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {READINESS_SAMPLE.map((r) => (
                <li key={r.label} className="flex items-center gap-2 text-[0.95rem]">
                  {r.done ? <CircleCheck aria-hidden className="size-4 text-moss-ink" /> : <Circle aria-hidden className="size-4 text-ink-3" />}
                  <span>{r.label}</span>
                  <span className="sr-only">{r.done ? "(done)" : "(not yet)"}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-line pt-3 text-sm font-semibold text-ink-2">{READINESS_CAPTION}</p>
          </div>
        </div>
      </section>

      {/* 6. Two audiences */}
      <section aria-labelledby="audiences" className="mx-auto max-w-6xl px-5 py-20">
        <h2 id="audiences" className="sr-only">
          Who it is for
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/with-a-lawyer" className="group rounded-xl border border-line bg-surface p-8 shadow-card hover:border-spruce">
            <h3 className="font-display text-[1.9rem] text-ink">Have a lawyer?</h3>
            <p className="mt-3 text-ink-2">Make every billed hour count. Hand over a chronology, a document index and your questions in one package.</p>
            <p className="mt-5 inline-flex items-center gap-1.5 font-semibold text-spruce group-hover:underline">
              With a lawyer <ArrowRight aria-hidden className="size-4" />
            </p>
          </Link>
          <Link href="/representing-yourself" className="group rounded-xl border border-line bg-surface p-8 shadow-card hover:border-spruce">
            <h3 className="font-display text-[1.9rem] text-ink">Representing yourself?</h3>
            <p className="mt-3 text-ink-2">Step-by-step checklists for Ontario courts, linked to official sources. Every deadline in one place. A plan for this week.</p>
            <p className="mt-5 inline-flex items-center gap-1.5 font-semibold text-spruce group-hover:underline">
              Representing yourself <ArrowRight aria-hidden className="size-4" />
            </p>
          </Link>
        </div>
        <p className="mt-6 text-ink-2">
          Are you a lawyer?{" "}
          <Link href="/for-lawyers" className="font-semibold text-spruce underline">
            See what your clients can bring you.
          </Link>
        </p>
      </section>

      {/* 7. Trust and safety */}
      <section aria-labelledby="trust" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 id="trust" className="max-w-2xl font-display text-[2.3rem] leading-tight tracking-[-0.015em]">
            Built to inform. Never to replace your lawyer.
          </h2>
          <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {TRUST.map((t) => (
              <div key={t.title}>
                <dt className="font-bold text-ink">{t.title}</dt>
                <dd className="mt-1.5 text-ink-2">{t.body}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10">
            <Link href="/safety" className="font-semibold text-spruce underline">
              Read our safety and trust commitments
            </Link>
          </p>
        </div>
      </section>

      {/* 8. Lead magnet */}
      <section aria-labelledby="checklist" className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-xl border border-line-strong bg-paper p-8">
          <div className="max-w-xl">
            <h2 id="checklist" className="font-display text-[1.9rem]">
              Free: the Case Readiness Checklist.
            </h2>
            <p className="mt-2 text-ink-2">25 things to have in order before your next meeting with a lawyer, an expert or the court.</p>
          </div>
          <ButtonLink href="/learn/case-readiness-checklist" variant="secondary">
            Get the checklist
          </ButtonLink>
        </div>
      </section>

      {/* 9. FAQ */}
      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-5 pb-8">
        <h2 id="faq" className="font-display text-[2.1rem]">
          Questions people ask first
        </h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="text-2xl leading-none text-ink-3 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-ink-2">
                {f.a}
                {f.q === "Is my data safe?" && (
                  <>
                    {" "}
                    <Link href="/security" className="text-spruce underline">
                      Read about security
                    </Link>
                    .
                  </>
                )}
              </p>
            </details>
          ))}
        </div>
        <p className="mt-4">
          <Link href="/faq" className="font-semibold text-spruce underline">
            All questions
          </Link>
        </p>
      </section>

      {/* 10. Final call to action */}
      <section aria-labelledby="cta" className="mx-auto max-w-6xl px-5 pt-16 text-center">
        <h2 id="cta" className="font-display text-[2.6rem] leading-tight tracking-[-0.02em]">
          Your case deserves your best preparation.
        </h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/sign-up">Start your case file, free</ButtonLink>
          <ButtonLink href="/learn/case-readiness-checklist" variant="secondary">
            Get the free checklist
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
