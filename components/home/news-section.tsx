import Image from "next/image";
import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { getLatestArticlesQuery, type ArticleSummary } from "@/lib/sanity/queries";
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

export async function NewsSection() {
  let articles: ArticleSummary[] = [];
  try {
    articles = await client.fetch<ArticleSummary[]>(getLatestArticlesQuery, { limit: 3 });
  } catch {
    // Sanity not yet configured — section is hidden
  }

  if (articles.length === 0) return null;

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

        <ul className="list-none m-0 p-0">
          {articles.map((article, index) => {
            const isFeatured = index === 0 && !!article.mainImage;
            const imageUrl = article.mainImage
              ? urlFor(article.mainImage).width(1200).height(800).fit("crop").url()
              : null;

            return (
              <li key={article._id}>
                <article
                  className={`py-10 grid gap-8 ${isFeatured ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
                >
                  {/* Text */}
                  <div className={`flex flex-col ${isFeatured ? "gap-12" : "gap-6"}`}>
                    <div className="flex flex-col gap-4">
                      <time
                        dateTime={article.date}
                        className="block font-medium text-[13px] leading-none"
                      >
                        {formatDate(article.date)}
                      </time>

                      <h3
                        className={
                          isFeatured
                            ? "text-[32px] md:text-[40px] font-normal leading-[105%] tracking-[-0.8px] m-0 pr-4"
                            : "text-[28px] md:text-[34px] font-normal leading-[105%] tracking-[-0.5px] m-0"
                        }
                      >
                        {article.title}
                      </h3>
                    </div>

                    {isFeatured && (
                      <p className="text-[15px] md:text-[17px] leading-[130%] tracking-[-0.2px] max-w-[90%] opacity-90">
                        {article.description}
                      </p>
                    )}

                    <div>
                      <Link
                        href={`/articles/${article.slug.current}`}
                        className="action-link text-bg text-[14px]"
                      >
                        Read More <ArrowIcon />
                      </Link>
                    </div>
                  </div>

                  {/* Featured image (first article only) */}
                  {isFeatured && imageUrl && (
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

                <div className="h-px bg-bg" />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
