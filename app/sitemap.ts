import type { MetadataRoute } from "next";
import { client } from "@/lib/sanity/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thunderclaplabs.com";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  let articleEntries: MetadataRoute.Sitemap = [];
  let projectEntries: MetadataRoute.Sitemap = [];

  try {
    const [articles, projects] = await Promise.all([
      client.fetch<{ slug: string; _updatedAt: string }[]>(
        `*[_type == "article"]{ "slug": slug.current, _updatedAt }`
      ),
      client.fetch<{ slug: string; _updatedAt: string }[]>(
        `*[_type == "project"]{ "slug": slug.current, _updatedAt }`
      ),
    ]);

    articleEntries = articles.map((a) => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: new Date(a._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    projectEntries = projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: new Date(p._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    // Sanity not configured — sitemap contains only static routes
  }

  return [...staticRoutes, ...articleEntries, ...projectEntries];
}
