import Image from "next/image";
import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { getAllArticlesQuery, type ArticleSummary } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

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

  return (
    <main className="bg-bg-news text-bg min-h-screen pt-21 pb-16">
      <div className="container-content max-w-280 mx-auto">
        {/* Page header */}
        <div className="flex items-baseline justify-between gap-4 pt-10.5">
          <h1 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px]">
            News & Insights
          </h1>
        </div>

        <div className="h-px bg-bg mt-4" />

        {articles.length === 0 ? (
          <p className="text-[14.7px] tracking-[-0.126px] leading-[120%] py-16 opacity-50">
            No articles published yet.
          </p>
        ) : (
          <ul className="list-none m-0 p-0">
            {articles.map((article, index) => {
              const isFeatured = index === 0 && !!article.mainImage;
              const imageUrl = article.mainImage
                ? urlFor(article.mainImage).width(720).height(405).fit("crop").url()
                : null;

              return (
                <li key={article._id}>
                  <article
                    className={`py-10 grid gap-8 ${isFeatured ? "grid-cols-1 md:grid-cols-[1fr_auto]" : "grid-cols-1"}`}
                  >
                    {/* Text */}
                    <div className="flex flex-col gap-3">
                      <time
                        dateTime={article.date}
                        className="block font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 leading-[105%]"
                      >
                        {formatDate(article.date)}
                      </time>

                      <h2
                        className={
                          isFeatured
                            ? "text-[35px] font-normal leading-[125%] tracking-[-0.7px] m-0"
                            : "text-[21px] font-bold leading-[115%] tracking-[-0.21px] m-0"
                        }
                      >
                        {article.title}
                      </h2>

                      {isFeatured && (
                        <p className="text-[14.7px] tracking-[-0.126px] leading-[120%] max-w-lg opacity-70">
                          {article.description}
                        </p>
                      )}

                      <Link
                        href={`/articles/${article.slug.current}`}
                        className="action-link mt-1 text-bg"
                      >
                        Read More <ArrowIcon />
                      </Link>
                    </div>

                    {/* Featured image (first article only) */}
                    {isFeatured && imageUrl && (
                      <div className="relative w-full md:w-120 shrink-0 aspect-video">
                        <Image
                          src={imageUrl}
                          alt={article.mainImage?.alt ?? article.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 480px"
                          priority
                        />
                      </div>
                    )}
                  </article>

                  <div className="h-px bg-bg" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
