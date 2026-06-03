import Image from "next/image";
import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { getLatestArticlesQuery, getSiteSettingsQuery, type ArticleSummary, type SiteSettings } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE").replace(/-/g, "/");
}

function FeaturedArticle({ article }: { article: ArticleSummary }) {
  const imageUrl = article.mainImage
    ? urlFor(article.mainImage).width(1200).height(800).fit("crop").url()
    : null;

  return (
    <article className="py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <time dateTime={article.date} className="block font-medium text-[13px] leading-none">
            {formatDate(article.date)}
          </time>
          <Link href={`/articles/${article.slug.current}`}>
            <h3 className="text-[32px] md:text-[40px] font-normal leading-[105%] tracking-[-0.8px] m-0 pr-4 hover:opacity-70 transition-opacity duration-300">
              {article.title}
            </h3>
          </Link>
        </div>
        {article.description && (
          <p className="text-[15px] md:text-[17px] leading-[130%] tracking-[-0.2px] max-w-[90%] opacity-90">
            {article.description}
          </p>
        )}
        <div>
          <Link href={`/articles/${article.slug.current}`} className="action-link text-bg text-[14px]">
            Read More <ArrowIcon />
          </Link>
        </div>
      </div>

      {imageUrl && (
        <div className="relative w-full shrink-0 aspect-3/2">
          <Image
            src={imageUrl}
            alt={article.mainImage?.alt ?? article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </div>
      )}
    </article>
  );
}

function SecondaryArticle({ article }: { article: ArticleSummary }) {
  const imageUrl = article.mainImage
    ? urlFor(article.mainImage).width(800).height(450).fit("crop").url()
    : null;

  return (
    <article className="py-10 grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8 items-start">
      <div className="flex flex-col items-start gap-4">
        <time dateTime={article.date} className="block font-medium text-[13px] leading-none">
          {formatDate(article.date)}
        </time>
        <Link href={`/articles/${article.slug.current}`}>
          <h3 className="text-[28px] md:text-[34px] font-normal leading-[105%] tracking-[-0.5px] m-0 hover:opacity-70 transition-opacity duration-300">
            {article.title}
          </h3>
        </Link>
        <Link href={`/articles/${article.slug.current}`} className="action-link text-bg text-[14px]">
          Read More <ArrowIcon />
        </Link>
      </div>

      {imageUrl && (
        <Link
          href={`/articles/${article.slug.current}`}
          className="block relative w-full aspect-video shrink-0 overflow-clip"
        >
          <Image
            src={imageUrl}
            alt={article.mainImage?.alt ?? article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 240px"
          />
        </Link>
      )}
    </article>
  );
}

export async function NewsSection() {
  let settings: SiteSettings | null = null;
  let fallbackArticles: ArticleSummary[] = [];

  try {
    [settings, fallbackArticles] = await Promise.all([
      client.fetch<SiteSettings>(getSiteSettingsQuery),
      client.fetch<ArticleSummary[]>(getLatestArticlesQuery, { limit: 2 }),
    ]);
  } catch {
    // Sanity not yet configured — section is hidden
  }

  const featured = settings?.featuredArticles ?? [];
  const primary = featured[0] ?? fallbackArticles[0];
  const secondary = featured[1] ?? fallbackArticles.find((a) => a._id !== primary?._id);

  if (!primary) return null;

  return (
    <section className="bg-bg-news text-bg py-16">
      <div className="container-content max-w-280 mx-auto">
        {/* Section header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <h2 className="text-[42px] md:text-[50px] font-normal leading-[100%] tracking-[-1px]">
            News & Insights
          </h2>
          <div className="flex justify-start">
            <Link href="/articles" className="action-link text-bg shrink-0 text-sm md:text-base mt-2">
              All Articles <ArrowIcon />
            </Link>
          </div>
        </div>

        <div className="h-px bg-bg mt-6" />

        <FeaturedArticle article={primary} />

        {secondary && (
          <>
            <div className="h-px bg-bg" />
            <SecondaryArticle article={secondary} />
          </>
        )}

        <div className="h-px bg-bg" />
      </div>
    </section>
  );
}
