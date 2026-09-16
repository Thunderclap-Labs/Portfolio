import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { demos, getDemo, previewUrl } from "@/constants/demos";

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
  const index = demos.findIndex((d) => d.slug === slug);

  if (index === -1) notFound();

  return (
    <DemoDetail
      demo={demos[index]}
      next={demos[(index + 1) % demos.length]}
      previous={demos[(index - 1 + demos.length) % demos.length]}
    />
  );
}
