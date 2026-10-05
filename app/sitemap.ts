import type { MetadataRoute } from "next";
import { client } from "@/lib/sanity/client";
import { visibleDemos } from "@/constants/demos";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thunderclaplabs.com";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/demos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    ...visibleDemos.map((demo) => ({
      url: `${SITE_URL}/demos/${demo.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  let articleEntries: MetadataRoute.Sitemap = [];

  try {
    const articles = await client.fetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "article"]{ "slug": slug.current, _updatedAt }`
    );

    articleEntries = articles.map((a) => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: new Date(a._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // Sanity not configured — sitemap contains only static routes
  }

  return [...staticRoutes, ...articleEntries];
}
