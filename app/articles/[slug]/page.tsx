import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import {
  getArticleBySlugQuery,
  getAllArticleSlugsQuery,
  type Article,
  type ArticleCategory,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { MediaGallery } from "@/components/common/media-gallery";
import { RelatedList } from "@/components/common/related-list";

export const revalidate = 3600;

const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  news: "News",
  insight: "Insight",
  press: "Press",
  "case-study": "Case Study",
  technical: "Technical",
  announcement: "Announcement",
};

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(getAllArticleSlugsQuery);
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
    const article = await client.fetch<Article>(getArticleBySlugQuery, { slug });
    if (!article) return {};
    return {
      title: `${article.title} | Thunderclap Labs`,
      description: article.description,
    };
  } catch {
    return {};
  }
}

// ─── Portable Text (light theme) ─────────────────────────────────────────────

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px] mt-12 mb-4 text-bg">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-[21px] font-bold leading-[115%] tracking-[-0.21px] mt-8 mb-3 text-bg">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-[16px] font-bold leading-[120%] tracking-[-0.16px] mt-6 mb-2 text-bg">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="text-[14.7px] leading-[170%] tracking-[-0.126px] mb-5 text-bg/80">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-bg/30 pl-6 my-6">
        <p className="text-[14.7px] leading-[170%] tracking-[-0.126px] m-0 text-bg/60 italic">
          {children}
        </p>
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-6 mb-5 space-y-1 text-[14.7px] leading-[170%] tracking-[-0.126px] text-bg/80">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 mb-5 space-y-1 text-[14.7px] leading-[170%] tracking-[-0.126px] text-bg/80">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-bg">{children}</strong>,
    em: ({ children }) => <em className="text-bg/70">{children}</em>,
    code: ({ children }) => (
      <code className="bg-bg/10 px-1.5 py-0.5 text-[13px] font-mono text-bg">
        {children}
      </code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
        className="underline underline-offset-2 text-bg/70 hover:text-bg transition-colors duration-300"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const imageUrl = urlFor(value).width(1440).fit("max").url();
      return (
        <figure className="my-10">
          <div className="relative w-full aspect-video">
            <Image
              src={imageUrl}
              alt={value.alt ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 1120px) 100vw, 1120px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-[12px] text-bg/50 mt-2 tracking-[-0.126px]">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let article: Article | null = null;
  try {
    article = await client.fetch<Article>(getArticleBySlugQuery, { slug });
  } catch {
    // Sanity unreachable
  }

  if (!article) notFound();

  const heroSource = article.heroImage ?? article.mainImage;
  const heroImageUrl = heroSource
    ? urlFor(heroSource).width(2000).height(1000).fit("crop").url()
    : null;

  const formattedDate = new Date(article.date).toLocaleDateString("sv-SE").replace(/-/g, "/");

  const categoryLabel = article.category ? CATEGORY_LABELS[article.category] : null;

  return (
    <main className="bg-bg-news text-bg min-h-screen">
      {/* Hero — text stays white since it overlays the image */}
      <div className="pt-21 relative">
        {heroImageUrl && (
          <div className="relative w-full h-[70vh] min-h-120">
            <Image
              src={heroImageUrl}
              alt={heroSource?.alt ?? article.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(1,1,1,0.92) 0%, rgba(1,1,1,0.30) 60%, rgba(1,1,1,0.10) 100%)",
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
                      border: `1px solid ${article.featured ? "var(--color-accent)" : "rgba(255,255,255,0.45)"}`,
                      background: article.featured ? "rgba(223,241,64,0.18)" : "transparent",
                      color: "#ffffff",
                    }}
                  >
                    {categoryLabel ?? "Article"}
                  </span>
                  {article.tags?.slice(0, 4).map((tag) => (
                    <span
                      key={tag._id}
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
                      {tag.name}
                    </span>
                  ))}
                </div>

                <h1
                  className="m-0 max-w-3xl text-white"
                  style={{
                    fontSize: "70px",
                    fontWeight: 700,
                    lineHeight: "105%",
                    letterSpacing: "-1.4px",
                  }}
                >
                  {article.title}
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
                  {article.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back link */}
      <div className="container-content max-w-280 mx-auto pt-10">
        <Link href="/articles" className="action-link text-bg">
          ← All Articles
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
                color: "rgba(1,1,1,0.65)",
              }}
            >
              {article.description}
            </p>

            <div className="h-px bg-bg/15 mb-10" />

            <div className="max-w-2xl">
              {article.body && (
                <PortableText value={article.body} components={portableTextComponents} />
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8 lg:border-l lg:border-bg/10 lg:pl-8">
            <SidebarBlock label="Published">
              <time dateTime={article.date}>{formattedDate}</time>
            </SidebarBlock>

            {article.author && (
              <SidebarBlock label="Author">
                <div className="text-bg">{article.author.name}</div>
                {article.author.role && (
                  <div className="text-bg/50 text-[12px] tracking-[-0.05px] mt-1">
                    {article.author.role}
                  </div>
                )}
              </SidebarBlock>
            )}

            {article.readingTime && (
              <SidebarBlock label="Reading Time">{article.readingTime} min read</SidebarBlock>
            )}

            {categoryLabel && <SidebarBlock label="Category">{categoryLabel}</SidebarBlock>}

            {article.tags && article.tags.length > 0 && (
              <SidebarBlock label="Tags">
                <ul className="flex flex-wrap gap-1.5 list-none m-0 p-0">
                  {article.tags.map((tag) => (
                    <li key={tag._id}>
                      <span
                        className="inline-block"
                        style={{
                          fontSize: "12px",
                          letterSpacing: "-0.05px",
                          padding: "4px 8px",
                          color: "rgba(1,1,1,0.75)",
                          border: "1px solid rgba(1,1,1,0.2)",
                        }}
                      >
                        {tag.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </SidebarBlock>
            )}

            {article.keyTakeaways && article.keyTakeaways.length > 0 && (
              <SidebarBlock label="Key Takeaways">
                <ul className="list-disc list-outside pl-5 m-0 flex flex-col gap-1.5">
                  {article.keyTakeaways.map((t, i) => (
                    <li
                      key={i}
                      className="text-[13.5px] tracking-[-0.05px] text-bg/80 leading-[145%]"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </SidebarBlock>
            )}

            {article.links && article.links.length > 0 && (
              <SidebarBlock label="References">
                <ul className="list-none m-0 p-0 flex flex-col gap-2">
                  {article.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-link text-bg"
                      >
                        {link.label} <ArrowIcon />
                      </a>
                    </li>
                  ))}
                </ul>
              </SidebarBlock>
            )}

            {article.relatedProjects && article.relatedProjects.length > 0 && (
              <SidebarBlock label="Related Projects">
                <RelatedListLight
                  items={article.relatedProjects.map((p) => ({
                    href: `/projects/${p.slug.current}`,
                    title: p.title,
                    subtitle: p.tagline,
                    image: p.mainImage,
                  }))}
                />
              </SidebarBlock>
            )}

            {(() => {
              const seen = new Set<string>();
              const deduped = (article.relatedArticles ?? []).filter((a) => {
                if (seen.has(a._id)) return false;
                seen.add(a._id);
                return true;
              });
              return deduped.length > 0 ? (
                <SidebarBlock label="Related Articles">
                  <RelatedListLight
                    items={deduped.map((a) => ({
                      href: `/articles/${a.slug.current}`,
                      title: a.title,
                      subtitle: a.description,
                      image: a.mainImage,
                    }))}
                  />
                </SidebarBlock>
              ) : null;
            })()}
          </aside>
        </div>
      </div>

      {/* Gallery */}
      {article.gallery && article.gallery.length > 0 && (
        <section className="container-content max-w-280 mx-auto pb-20">
          <div className="h-px bg-bg/15 mb-10" />
          <span className="eyebrow block mb-6 text-bg">Gallery</span>
          <MediaGallery images={article.gallery} title={article.title} />
        </section>
      )}
    </main>
  );
}

// ─── Sidebar block helper ─────────────────────────────────────────────────────

function SidebarBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="eyebrow block mb-3 text-bg">{label}</span>
      <div className="text-[14.7px] tracking-[-0.126px] leading-[140%] text-bg/75">
        {children}
      </div>
    </div>
  );
}

// ─── Light-theme related list ─────────────────────────────────────────────────

import type { SanityImage } from "@/lib/sanity/queries";

interface RelatedItem {
  href: string;
  title: string;
  subtitle?: string;
  image?: SanityImage;
}

function RelatedListLight({ items }: { items: RelatedItem[] }) {
  return (
    <ul className="list-none m-0 p-0 flex flex-col gap-3">
      {items.map((item) => {
        const thumb = item.image
          ? urlFor(item.image).width(160).height(160).fit("crop").auto("format").url()
          : null;
        return (
          <li key={item.href}>
            <Link href={item.href} className="group flex items-center gap-3 no-underline">
              {thumb ? (
                <div className="relative shrink-0 w-12 h-12 overflow-hidden bg-bg/5">
                  <Image
                    src={thumb}
                    alt={item.image?.alt ?? item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="shrink-0 w-12 h-12 bg-bg/5 border border-bg/10" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium leading-[125%] tracking-[-0.135px] text-bg group-hover:opacity-60 transition-opacity duration-300 truncate">
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="text-[11.5px] tracking-[-0.05px] text-bg/45 mt-0.5 truncate">
                    {item.subtitle}
                  </div>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
