import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader, Prose } from "@/components/site/content";

export const metadata: Metadata = { title: "FAQ" };

const GROUPS: { title: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    title: "Legal advice",
    items: [
      { q: "Is this legal advice?", a: "No. It's an organization tool with general legal information. For advice about your situation, speak to a lawyer or licensed paralegal." },
      { q: "Will it replace my lawyer?", a: "No. It helps you and your lawyer work faster with a clearer file." },
      { q: "Can it tell me what to file or whether I will win?", a: "No. It never recommends what to file, say or decide, and it never predicts outcomes. The readiness score measures how organized your file is, not your chances in court." },
      { q: "Does it give me case law?", a: "No. The AI does not produce case citations. Legal sources we show come from a checked list of official links, and anything else is marked \"verify before filing\"." },
    ],
  },
  {
    title: "Signatures and money",
    items: [
      { q: "Can it tell if a signature is forged?", a: "No. It helps you put documents side by side and note visible differences to show a qualified document examiner. Only an examiner can give an opinion." },
      { q: "Does it detect fraud?", a: "No. Money flags are patterns worth asking an accountant about, such as round amounts or gaps in dates. A pattern is not proof of wrongdoing." },
    ],
  },
  {
    title: "Privacy and data",
    items: [
      { q: "Is my data safe?", a: <>Files are encrypted, access is limited to you and people you invite, and you can delete everything at any time. Details are on the <Link href="/security" className="text-spruce underline">security page</Link>.</> },
      { q: "Is my data used to train AI?", a: "No. We do not use your documents to train AI, and our AI vendor contracts must say the same." },
      { q: "Can I really delete everything?", a: "Yes. Deleting a case removes its documents, extracted text, summaries, timeline, flags and notes. You can also export everything first." },
      { q: "Should I upload letters from my lawyer?", a: "Ask your lawyer first. Sharing privileged communications with an outside service may affect that protection." },
    ],
  },
  {
    title: "Coverage",
    items: [
      { q: "What does it cover?", a: "Ontario civil matters at launch: Small Claims Court and Superior Court civil cases. Other areas later." },
      { q: "What about criminal cases?", a: "Criminal cases are planned, but Crown disclosure has strict sharing limits. Criminal mode stays closed until an Ontario lawyer has reviewed how disclosure is handled." },
      { q: "Do I need a lawyer to use it?", a: "No. It works for people with a lawyer and for people representing themselves." },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <MarketingHeader title="Frequently asked questions" />
      <Prose>
        <div className="max-w-3xl">
          {GROUPS.map((g) => (
            <section key={g.title} className="mb-12">
              <h2 className="font-display text-[1.8rem]">{g.title}</h2>
              <dl className="mt-3 divide-y divide-line border-y border-line">
                {g.items.map((i) => (
                  <div key={i.q} className="py-4">
                    <dt className="font-semibold text-ink">{i.q}</dt>
                    <dd className="mt-1 text-ink-2">{i.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </Prose>
    </>
  );
}
