import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { OfficialSources, Sections } from "@/components/site/content";
import { ButtonLink } from "@/components/ui";
import { GUIDE_BOX } from "@/lib/brand";
import { GUIDES, getGuide } from "@/lib/content/guides";
import { formatIsoDate } from "@/lib/domain/extract";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  return { title: g?.title ?? "Guide" };
}

export default async function GuidePage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return (
    <article className="mx-auto max-w-6xl px-5 pt-12">
      <p className="mb-6 text-sm">
        <Link href="/learn" className="text-spruce underline">
          Guides
        </Link>
      </p>
      <h1 className="max-w-4xl font-display text-[2.4rem] font-[560] leading-[1.1] tracking-[-0.015em] sm:text-[2.9rem]">{guide.title}</h1>
      <div role="note" className="mt-6 flex max-w-[68ch] gap-3 rounded-md border border-[#c9d4e6] bg-slate-tint px-4 py-3 text-slate-ink">
        <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
        <p>
          {GUIDE_BOX}{" "}
          {guide.lastChecked && (
            <>
              Last checked by the product team: {formatIsoDate(guide.lastChecked)}. Not yet reviewed by a lawyer.
            </>
          )}
        </p>
      </div>

      {guide.status === "coming_soon" || !guide.sections ? (
        <div className="mt-10 max-w-[68ch]">
          <p className="text-lg text-ink-2">{guide.summary}</p>
          <p className="mt-4 text-ink">
            This guide is coming soon. It explains legal process, so we will publish it only after an Ontario lawyer has reviewed it.
          </p>
          <p className="mt-6">
            <Link href="/learn" className="font-semibold text-spruce underline">
              See the guides you can read now
            </Link>
          </p>
        </div>
      ) : (
        <>
          <p className="mt-8 max-w-[68ch] text-lg text-ink-2">{guide.summary}</p>
          <Sections sections={guide.sections} />
          <OfficialSources extra={guide.sources} />
          <div className="mt-12 max-w-[68ch] rounded-xl border border-line bg-surface p-6">
            <p className="font-display text-xl">Do this in the workspace</p>
            <p className="mt-1 text-ink-2">Upload your documents and the timeline, checklist and weekly plan fill in as you go.</p>
            <ButtonLink href="/sign-up" className="mt-4">
              Start your case file, free
            </ButtonLink>
          </div>
        </>
      )}
    </article>
  );
}
