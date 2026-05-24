import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import {
  getProjectBySlugQuery,
  getAllProjectSlugsQuery,
  type Project,
  type ProjectStatus,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { MediaGallery } from "@/components/common/media-gallery";
import { darkPortableTextComponents } from "@/components/common/portable-text-dark";
import { RelatedList } from "@/components/common/related-list";

export const revalidate = 3600;

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  "in-development": "In Development",
  concept: "Concept",
  archived: "Archived",
};

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(getAllProjectSlugsQuery);
    return slugs.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await client.fetch<Project>(getProjectBySlugQuery, { slug });
    if (!project) return {};
    return {
      title: `${project.title} | Thunderclap Labs`,
      description: project.summary,
    };
  } catch {
    return {};
  }
}

// ─── Portable Text (shared dark theme) ───────────────────────────────────────

const portableTextComponents = darkPortableTextComponents;

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M1 9L9 1M9 1H3M9 1V7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRange(start?: string, end?: string) {
  if (!start) return null;
  const startYear = new Date(start).getFullYear();
  const endYear = end ? new Date(end).getFullYear() : null;
  if (!endYear || endYear === startYear) return `${startYear}`;
  return `${startYear} – ${endYear}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let project: Project | null = null;
  try {
    project = await client.fetch<Project>(getProjectBySlugQuery, { slug });
  } catch {
    // Sanity unreachable
  }

  if (!project) notFound();

  const heroSource = project.heroImage ?? project.mainImage;
  const heroImageUrl = heroSource
    ? urlFor(heroSource).width(2000).height(1000).fit("crop").url()
    : null;
  const statusLabel = STATUS_LABELS[project.status] ?? project.status;
  const dateRange = formatRange(project.startDate, project.endDate);

  return (
    <main className="bg-bg text-white min-h-screen">
      {/* Hero */}
      <div className="pt-21 relative">
        {heroImageUrl && (
          <div className="relative w-full h-[70vh] min-h-120">
            <Image
              src={heroImageUrl}
              alt={heroSource?.alt ?? project.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(1,1,1,0.95) 0%, rgba(1,1,1,0.35) 60%, rgba(1,1,1,0.15) 100%)",
              }}
            />

            {/* Hero overlay content */}
            <div className="absolute inset-x-0 bottom-0">
              <div className="container-content max-w-280 mx-auto pb-12">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className="font-medium uppercase leading-none"
                    style={{
                      fontSize: "10.5px",
                      letterSpacing: "0.42px",
                      padding: "5px 8px",
                      border: `1px solid ${project.status === "active" ? "var(--color-accent)" : "rgba(255,255,255,0.45)"}`,
                      background: project.status === "active" ? "rgba(223,241,64,0.18)" : "transparent",
                      color: "#ffffff",
                    }}
                  >
                    {statusLabel}
                  </span>
                  {project.categories.map((cat) => (
                    <span
                      key={cat}
                      className="font-medium uppercase leading-none"
                      style={{
                        fontSize: "10.5px",
                        letterSpacing: "0.42px",
                        padding: "5px 8px",
                        color: "rgba(255,255,255,0.85)",
                        background: "rgba(1,1,1,0.35)",
                        border: "1px solid rgba(255,255,255,0.18)",
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                <h1
                  className="m-0 max-w-3xl"
                  style={{
                    fontSize: "70px",
                    fontWeight: 700,
                    lineHeight: "105%",
                    letterSpacing: "-1.4px",
                  }}
                >
                  {project.title}
                </h1>

                <p
                  className="mt-4 max-w-2xl"
                  style={{
                    fontSize: "21px",
                    fontWeight: 400,
                    lineHeight: "125%",
                    letterSpacing: "-0.21px",
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  {project.tagline}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back link */}
      <div className="container-content max-w-280 mx-auto pt-10">
        <Link href="/projects" className="action-link text-white">
          ← All Projects
        </Link>
      </div>

      {/* Body + sidebar */}
      <div className="container-content max-w-280 mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          {/* Body column */}
          <article className="min-w-0">
            <p
              className="m-0 mb-10 max-w-2xl"
              style={{
                fontSize: "21px",
                fontWeight: 400,
                lineHeight: "140%",
                letterSpacing: "-0.21px",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {project.summary}
            </p>

            <div className="h-px bg-white/15 mb-10" />

            <div className="max-w-2xl">
              {project.body && (
                <PortableText value={project.body} components={portableTextComponents} />
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8 lg:border-l lg:border-white/10 lg:pl-8">
            <SidebarBlock label="Status">{statusLabel}</SidebarBlock>

            {dateRange && <SidebarBlock label="Timeline">{dateRange}</SidebarBlock>}

            {project.keyTech && project.keyTech.length > 0 && (
              <SidebarBlock label="Key Technologies">
                <ul className="flex flex-wrap gap-1.5 list-none m-0 p-0">
                  {project.keyTech.map((tech) => (
                    <li key={tech}>
                      <span
                        className="inline-block"
                        style={{
                          fontSize: "12px",
                          letterSpacing: "-0.05px",
                          padding: "4px 8px",
                          color: "rgba(255,255,255,0.85)",
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        {tech}
                      </span>
                    </li>
                  ))}
                </ul>
              </SidebarBlock>
            )}

            {project.collaborators && project.collaborators.length > 0 && (
              <SidebarBlock label="Collaborators">
                <ul className="list-none m-0 p-0 flex flex-col gap-1">
                  {project.collaborators.map((c) => (
                    <li
                      key={c}
                      className="text-[14.7px] tracking-[-0.126px] text-white/80 leading-[140%]"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </SidebarBlock>
            )}

            {project.externalLinks && project.externalLinks.length > 0 && (
              <SidebarBlock label="Links">
                <ul className="list-none m-0 p-0 flex flex-col gap-2">
                  {project.externalLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-link text-white"
                      >
                        {link.label} <ArrowIcon />
                      </a>
                    </li>
                  ))}
                </ul>
              </SidebarBlock>
            )}

            {project.relatedArticles && project.relatedArticles.length > 0 && (
              <SidebarBlock label="Related Articles">
                <RelatedList
                  items={project.relatedArticles.map((a) => ({
                    href: `/articles/${a.slug.current}`,
                    title: a.title,
                    subtitle: a.date
                      ? new Date(a.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : undefined,
                    image: a.mainImage,
                  }))}
                />
              </SidebarBlock>
            )}
          </aside>
        </div>
      </div>

      {/* Gallery */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="container-content max-w-280 mx-auto pb-20">
          <div className="h-px bg-white/15 mb-10" />
          <span className="eyebrow block mb-6 text-white">Gallery</span>
          <MediaGallery images={project.gallery} title={project.title} />
        </section>
      )}
    </main>
  );
}

// ─── Sidebar block helper ─────────────────────────────────────────────────────

function SidebarBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="eyebrow block mb-3 text-white">{label}</span>
      <div className="text-[14.7px] tracking-[-0.126px] leading-[140%] text-white/85">
        {children}
      </div>
    </div>
  );
}
