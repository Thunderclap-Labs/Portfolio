import Image from "next/image";
import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { getAllArticlesQuery, type ArticleSummary } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import ArticleList from "@/components/articles/article-list";

export const revalidate = 3600;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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

export default async function ArticlesPage() {
  let articles: ArticleSummary[] = [];
  try {
    articles = await client.fetch<ArticleSummary[]>(getAllArticlesQuery);
  } catch {
    // Sanity not yet configured — show empty state
  }

  const featured = articles[0];
  const rest = articles.slice(1);
  const featuredImageUrl = featured?.mainImage
    ? urlFor(featured.mainImage).width(1600).height(900).fit("crop").url()
    : null;

  return (
    <div className="bg-bg-news text-bg min-h-screen">
      {/* Featured / hero */}
      {featured ? (
        <section className="w-full">
          <div className="container-content max-w-280 mx-auto w-full pt-40 pb-16">
            <p className="font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] mb-4">
              Newsroom
            </p>
            <h1 className="text-[70px] font-normal leading-[105%] tracking-[-1.4px]">
              News &amp; Insights
            </h1>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16 lg:gap-20 items-stretch HighlightedArticle">
              {/* Text: occupies first 5 columns according to grid-column: 1/6 */}
              <div className="md:col-span-5 flex flex-col gap-12 relative z-10 highlightedContent">
                <div className="flex flex-col gap-16">
                  <div>
                    <time
                      dateTime={featured.date}
                      className="block mb-4 font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] not-italic"
                    >
                      {formatDate(featured.date)}
                    </time>

                    <h2 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px] m-0">
                      {featured.title}
                    </h2>
                  </div>

                    {featured.description && (
                      <p className="text-[0.938rem] tracking-[-0.009rem] font-normal leading-[120%] w-[60%] opacity-80 not-italic">
                        {featured.description}
                      </p>
                    )}

                  <Link
                    href={`/articles/${featured.slug.current}`}
                    className="action-link text-bg inline-flex w-fit items-center gap-1"
                  >
                    Read More <ArrowIcon />
                  </Link>
                </div>
              </div>

              {/* Image: occupies remaining 7 columns */}
              {featuredImageUrl && (
                <div className="md:col-span-7">
                  <Link href={`/articles/${featured.slug.current}`} className="block w-full h-full min-h-75">
                    <div className="relative w-full aspect-video overflow-clip h-full">
                      <Image
                        src={featuredImageUrl}
                        alt={featured.mainImage?.alt ?? featured.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 60vw"
                        priority
                      />
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="min-h-screen flex items-start pt-40">
          <div className="container-content max-w-280 mx-auto w-full">
            <p className="font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] mb-4">
              Newsroom
            </p>
            <h1 className="text-[70px] font-normal leading-[105%] tracking-[-1.4px]">
              News &amp; Insights
            </h1>
            <p className="text-[14.7px] tracking-[-0.126px] leading-[120%] py-16 opacity-50">
              No articles published yet.
            </p>
          </div>
        </section>
      )}

      {/* All articles — search + list */}
      {featured && <ArticleList articles={rest} />}
    </div>
  );
}
