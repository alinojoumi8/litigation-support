import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DraftBanner, MarketingHeader, Prose, Sections } from "@/components/site/content";
import { LEGAL_DOCS, getLegalDoc } from "@/lib/content/legal";

// Every valid path is prerendered by generateStaticParams; unknown ones return a real 404.
// Params are awaited at the top so notFound() can set the status, so the segment opts out of
// instant-navigation validation instead of streaming behind a Suspense boundary.
export const instant = false;

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ doc: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[doc]">): Promise<Metadata> {
  const { doc } = await params;
  return { title: getLegalDoc(doc)?.title ?? "Legal" };
}

export default async function LegalPage({ params }: PageProps<"/legal/[doc]">) {
  const { doc } = await params;
  const d = getLegalDoc(doc);
  if (!d) notFound();
  return (
    <>
      <MarketingHeader title={d.title} lede={d.intro} />
      <Prose>
        <DraftBanner />
        <Sections sections={d.sections} />
      </Prose>
    </>
  );
}
