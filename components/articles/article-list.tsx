"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE").replace(/-/g, "/");
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

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M9.5 9.5L13 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface ArticleListProps {
  articles: ArticleSummary[];
}

export default function ArticleList({ articles }: ArticleListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) => {
      return (
        a.title.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [articles, query]);

  return (
    <div className="w-full">
      <div className="container-content max-w-280 mx-auto w-full pt-16 pb-8">
        <h2 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px]">
          All Articles
        </h2>
      </div>

      <div className="bg-bg text-white w-full">
        <div className="container-content max-w-280 mx-auto w-full">
          <label className="flex items-center gap-4 py-8 w-full cursor-text border-b border-white/30 max-w-160">
            <span className="opacity-60 shrink-0">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH"
              className="w-full bg-transparent border-0 outline-none text-[0.818rem] tracking-[0.03rem] uppercase placeholder:opacity-60 placeholder:text-white text-white -mb-0.5"
            />
          </label>
        </div>
      </div>

      <div className="container-content max-w-280 mx-auto w-full pt-8 pb-16">
        {filtered.length === 0 ? (
          <p className="text-[0.918rem] opacity-50 py-12">No articles found.</p>
        ) : (
          <ul className="flex flex-col m-0 p-0 list-none">
            {filtered.map((article, index) => {
              const imageUrl = article.mainImage
                ? urlFor(article.mainImage).width(400).height(225).fit("crop").url()
                : null;
              
              return (
                <li key={article._id}>
                  <div className="h-px bg-bg" />
                  <article className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8 items-start py-10 NewsListItem">
                    <div className="flex flex-col items-start">
                      <time
                        dateTime={article.date}
                        className="block font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] not-italic"
                      >
                        {formatDate(article.date)}
                      </time>

                      <Link href={`/articles/${article.slug.current}`}>
                        <h6 className="w-[90%] mt-[0.6rem] text-[2rem] font-normal leading-[115%] tracking-[-0.02rem] not-italic hover:opacity-70 transition-opacity duration-300">
                          {article.title}
                        </h6>
                      </Link>

                      <Link
                        href={`/articles/${article.slug.current}`}
                        className="action-link mt-4 text-bg inline-flex items-center gap-2 font-medium"
                      >
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
                  <div className="h-px bg-bg" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
