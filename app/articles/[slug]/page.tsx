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
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export const revalidate = 3600;

// ─── Static params ─────────────────────────────────────────────────────────────

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

// ─── Portable Text components ─────────────────────────────────────────────────

const portableTextComponents: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="text-[50px] font-bold leading-[105%] tracking-[-1px] mt-10 mb-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px] mt-10 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-[21px] font-bold leading-[115%] tracking-[-0.21px] mt-8 mb-3">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-[16px] font-bold leading-[120%] tracking-[-0.16px] mt-6 mb-2">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="text-[14.7px] leading-[170%] tracking-[-0.126px] mb-5">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-bg pl-6 my-6 opacity-70">
        <p className="text-[14.7px] leading-[170%] tracking-[-0.126px] italic m-0">{children}</p>
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-6 mb-5 space-y-1 text-[14.7px] leading-[170%] tracking-[-0.126px]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 mb-5 space-y-1 text-[14.7px] leading-[170%] tracking-[-0.126px]">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="opacity-80">{children}</em>,
    code: ({ children }) => (
      <code className="bg-black/10 px-1.5 py-0.5 text-[13px] font-mono">{children}</code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
        className="underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity duration-300"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const imageUrl = urlFor(value).width(1120).fit("max").url();
      return (
        <figure className="my-8">
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
            <figcaption className="text-[12px] opacity-50 mt-2 tracking-[-0.126px]">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  const heroImageUrl = article.mainImage
    ? urlFor(article.mainImage).width(1440).height(540).fit("crop").url()
    : null;

  const formattedDate = new Date(article.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="bg-bg-news text-bg min-h-screen">
      {/* Hero */}
      <div className="pt-21">
        {heroImageUrl && (
          <div className="relative w-full h-120">
            <Image
              src={heroImageUrl}
              alt={article.mainImage?.alt ?? article.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-bg/30" />
          </div>
        )}
      </div>

      {/* Article header */}
      <div className="container-content max-w-280 mx-auto">
        <div className={`pt-10 pb-8 ${heroImageUrl ? "" : "pt-10.5"}`}>
          {/* Back link */}
          <Link
            href="/articles"
            className="action-link text-bg mb-6 inline-flex"
          >
            ← All Articles
          </Link>

          <div className="h-px bg-bg mb-8" />

          <time
            dateTime={article.date}
            className="block font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 leading-[105%] mb-4"
          >
            {formattedDate}
          </time>

          <h1 className="text-[50px] font-bold leading-[105%] tracking-[-1px] max-w-3xl mb-4">
            {article.title}
          </h1>

          <p className="text-[14.7px] leading-[170%] tracking-[-0.126px] max-w-2xl opacity-70">
            {article.description}
          </p>
        </div>

        <div className="h-px bg-bg mb-10" />

        {/* Body */}
        <div className="max-w-2xl pb-16">
          {article.body && <PortableText value={article.body} components={portableTextComponents} />}

          {/* External links */}
          {article.links && article.links.length > 0 && (
            <div className="mt-12 pt-8 border-t border-bg/20">
              <span className="block font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 leading-[105%] mb-4">
                References & Links
              </span>
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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
