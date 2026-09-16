import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { demos, getDemo, previewUrl, visibleDemos } from "@/constants/demos";

import { DemoDetail } from "./demo-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return demos.map((demo) => ({ slug: demo.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const demo = getDemo(slug);

  if (!demo) return { title: "Demo not found" };

  const preview = previewUrl(demo);

  return {
    title: `${demo.name}, ${demo.tagline} | Thunderclap Labs`,
    description: demo.summary,
    alternates: { canonical: `/demos/${demo.slug}` },
    openGraph: {
      type: "article",
      title: `${demo.name} | Thunderclap Labs`,
      description: demo.summary,
      images: [{ url: preview, width: 1600, height: 1000, alt: demo.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${demo.name} | Thunderclap Labs`,
      description: demo.summary,
      images: [preview],
    },
  };
}

export default async function DemoPage({ params }: PageProps) {
  const { slug } = await params;
  // Looked up against the full set, so a hidden demo still answers on its own
  // URL while it is being worked on.
  const demo = getDemo(slug);

  if (!demo) notFound();

  /* Previous and next walk the listed demos only, so neither ever points at a
     hidden page. On a hidden page there is no position in that list, so the
     links wrap to the ends of it. */
  const at = visibleDemos.findIndex((d) => d.slug === slug);
  const n = visibleDemos.length;
  const previous =
    at === -1 ? visibleDemos[n - 1] : visibleDemos[(at - 1 + n) % n];
  const next = at === -1 ? visibleDemos[0] : visibleDemos[(at + 1) % n];

  return <DemoDetail demo={demo} next={next} previous={previous} />;
}
