import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import type { GuideSection } from "@/lib/content/guides";
import { authorityById } from "@/lib/domain/authorities";
import { OFFICIAL_LINK_NOTE } from "@/lib/brand";
import { ExternalLink } from "@/components/ui";

export function MarketingHeader({ title, lede, children }: { title: ReactNode; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mx-auto max-w-6xl px-5 pb-10 pt-14">
      <h1 className="max-w-4xl font-display text-[2.6rem] font-[560] leading-[1.08] tracking-[-0.02em] text-ink sm:text-[3.3rem]">{title}</h1>
      {lede && <div className="mt-5 max-w-2xl text-[1.15rem] leading-relaxed text-ink-2">{lede}</div>}
      {children && <div className="mt-7">{children}</div>}
    </header>
  );
}

export function Sections({ sections }: { sections: GuideSection[] }) {
  return (
    <div className="prose-read">
      {sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
          {s.list &&
            (s.ordered ? (
              <ol>
                {s.list.map((li, i) => (
                  <li key={i}>{li}</li>
                ))}
              </ol>
            ) : (
              <ul>
                {s.list.map((li, i) => (
                  <li key={i}>{li}</li>
                ))}
              </ul>
            ))}
        </section>
      ))}
    </div>
  );
}

export function DraftBanner({ children }: { children?: ReactNode }) {
  return (
    <div role="note" className="mb-8 flex gap-3 rounded-md border-2 border-ochre-line bg-ochre-tint px-4 py-3 text-ochre-ink">
      <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-bold">DRAFT: needs Ontario lawyer review</p>
        <p className="text-[0.95rem]">{children ?? "This text is a working draft by the product team. It has not been reviewed by a lawyer and is not in force."}</p>
      </div>
    </div>
  );
}

export function OfficialSources({ ids, extra }: { ids?: string[]; extra?: { label: string; url: string }[] }) {
  const items = [...(ids ?? []).map((id) => authorityById(id)).map((a) => ({ label: `${a.title} (${a.publisher})`, url: a.url })), ...(extra ?? [])];
  if (items.length === 0) return null;
  return (
    <aside aria-label="Official sources" className="mt-10 max-w-[68ch] rounded-lg border border-line bg-surface p-5">
      <h2 className="font-bold">Official sources</h2>
      <p className="mt-1 text-sm text-ink-3">{OFFICIAL_LINK_NOTE}</p>
      <ul className="mt-3 space-y-1.5">
        {items.map((s) => (
          <li key={s.url + s.label}>
            <ExternalLink href={s.url}>{s.label}</ExternalLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-6xl px-5">{children}</div>;
}
