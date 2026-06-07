"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { FilterDropdown } from "@/components/articles/filter-dropdown";

const PAGE_SIZE = 6;

// Canonical category order + display labels (mirrors the Sanity schema).
const CATEGORY_LABELS: Record<string, string> = {
  news: "News",
  announcement: "Announcement",
  technical: "Technical",
  "progress-update": "Progress Update",
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first", short: "Newest" },
  { value: "oldest", label: "Oldest first", short: "Oldest" },
  { value: "az", label: "Title A–Z", short: "A–Z" },
  { value: "za", label: "Title Z–A", short: "Z–A" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function categoryLabel(value: string) {
  return CATEGORY_LABELS[value] ?? value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE").replace(/-/g, "/");
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

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
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M1.5 5L4 7.5L8.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M3 1.5L6.5 5L3 8.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Checkbox row (multi-select option) ──────────────────────────────────────────

function CheckboxRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 px-2 py-2 transition-colors hover:bg-white/5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="peer sr-only"
      />
      <span
        className={`flex h-3.75 w-3.75 shrink-0 items-center justify-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-white/70 ${
          checked ? "border-white bg-white text-bg" : "border-white/40 text-transparent"
        }`}
      >
        <CheckIcon />
      </span>
      <span className="text-[13px] tracking-[-0.126px] text-white/90">{label}</span>
    </label>
  );
}

// ─── Multi-select panel (Category / Tags) ─────────────────────────────────────────

function MultiSelectPanel({
  title,
  options,
  selected,
  onToggle,
  onAll,
  onClear,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  onAll: () => void;
  onClear: () => void;
}) {
  return (
    <div role="group" aria-label={title} className="flex flex-col">
      <div className="mb-1 flex items-center justify-between gap-4 border-b border-white/10 px-2 pb-2 pt-1">
        <span className="text-[10.5px] uppercase tracking-[0.42px] text-white/50">{title}</span>
        <div className="flex items-center gap-3 text-[10.5px] uppercase tracking-[0.42px]">
          <button
            type="button"
            onClick={onAll}
            className="cursor-pointer text-white/60 transition-colors hover:text-white"
          >
            All
          </button>
          <span className="text-white/20">/</span>
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer text-white/60 transition-colors hover:text-white"
          >
            Clear
          </button>
        </div>
      </div>
      <ul className="m-0 flex max-h-65 list-none flex-col overflow-y-auto p-0">
        {options.map((opt) => (
          <li key={opt.value}>
            <CheckboxRow
              label={opt.label}
              checked={selected.has(opt.value)}
              onToggle={() => onToggle(opt.value)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────────

function pageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "ellipsis")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) out.push("ellipsis");
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - 1) out.push("ellipsis");
  out.push(total);
  return out;
}

function CircleArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous page" : "Next page"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-bg transition-colors duration-300 ${
        disabled
          ? "cursor-not-allowed opacity-25"
          : "cursor-pointer text-bg hover:bg-bg hover:text-white"
      }`}
    >
      <span className={direction === "prev" ? "rotate-180" : ""}>
        <ChevronRight />
      </span>
    </button>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 pb-2 pt-14">
      <CircleArrow direction="prev" disabled={page === 1} onClick={() => onChange(page - 1)} />
      <ul className="m-0 flex list-none items-center gap-1 p-0">
        {pageList(page, totalPages).map((p, i) =>
          p === "ellipsis" ? (
            <li key={`ellipsis-${i}`} className="select-none px-1.5 text-[13px] text-bg/40">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`flex h-9 min-w-9 cursor-pointer items-center justify-center px-2 text-[13px] tracking-[-0.126px] transition-colors duration-300 ${
                  p === page ? "bg-bg text-white" : "text-bg hover:bg-bg/10"
                }`}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ul>
      <CircleArrow
        direction="next"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      />
    </nav>
  );
}

// ─── Article row ─────────────────────────────────────────────────────────────────

function ArticleRow({ article }: { article: ArticleSummary }) {
  const imageUrl = article.mainImage
    ? urlFor(article.mainImage).width(400).height(225).fit("crop").url()
    : null;

  return (
    <li>
      <div className="h-px bg-bg" />
      <article className="NewsListItem grid grid-cols-1 items-start gap-8 py-10 md:grid-cols-[1fr_240px]">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 font-medium text-[0.75rem] uppercase leading-[105%] tracking-[0.03rem]">
            <time dateTime={article.date} className="not-italic">
              {formatDate(article.date)}
            </time>
            {article.category && (
              <>
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
                <span className="opacity-60">{categoryLabel(article.category)}</span>
              </>
            )}
          </div>

          <Link href={`/articles/${article.slug.current}`}>
            <h6 className="mt-[0.6rem] w-[90%] text-[2rem] font-normal not-italic leading-[115%] tracking-[-0.02rem] transition-opacity duration-300 hover:opacity-70">
              {article.title}
            </h6>
          </Link>

          {article.tags && article.tags.length > 0 && (
            <ul className="mt-3 flex list-none flex-wrap gap-x-2 gap-y-1 p-0 text-[0.75rem] tracking-[-0.126px] opacity-50">
              {article.tags.map((tag) => (
                <li key={tag._id}>#{tag.name}</li>
              ))}
            </ul>
          )}

          <Link
            href={`/articles/${article.slug.current}`}
            className="action-link mt-4 inline-flex items-center gap-2 font-medium text-bg"
          >
            Read More <ArrowIcon />
          </Link>
        </div>

        {imageUrl && (
          <Link
            href={`/articles/${article.slug.current}`}
            className="relative block aspect-video w-full shrink-0 overflow-clip"
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
    </li>
  );
}

// ─── Main list ───────────────────────────────────────────────────────────────────

interface ArticleListProps {
  articles: ArticleSummary[];
}

export default function ArticleList({ articles }: ArticleListProps) {
  // Available filter options, derived from the articles actually on the page.
  const availableCategories = useMemo(() => {
    const present = new Set(articles.map((a) => a.category).filter(Boolean) as string[]);
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    const extras = [...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
    return [...ordered, ...extras].map((value) => ({ value, label: categoryLabel(value) }));
  }, [articles]);

  const availableTags = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of articles) for (const t of a.tags ?? []) map.set(t._id, t.name);
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [articles]);

  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(availableCategories.map((c) => c.value)),
  );
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    () => new Set(availableTags.map((t) => t.value)),
  );
  const [sort, setSort] = useState<SortValue>("newest");
  const [page, setPage] = useState(1);

  const sectionRef = useRef<HTMLDivElement>(null);

  // Reset to the first page whenever the result set changes. Done during render
  // (React's "adjust state when inputs change" pattern) rather than in an effect.
  const catKey = useMemo(() => [...selectedCategories].sort().join(","), [selectedCategories]);
  const tagKey = useMemo(() => [...selectedTags].sort().join(","), [selectedTags]);
  const filterKey = `${query.trim().toLowerCase()}|${catKey}|${tagKey}|${sort}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  // A filter is only "active" (i.e. narrowing) when not everything is selected.
  const catActive = availableCategories.length > 0 && selectedCategories.size !== availableCategories.length;
  const tagActive = availableTags.length > 0 && selectedTags.size !== availableTags.length;
  const isFiltering = query.trim().length > 0 || catActive || tagActive;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (catActive && (!a.category || !selectedCategories.has(a.category))) return false;
      if (tagActive) {
        const ids = a.tags?.map((t) => t._id) ?? [];
        if (!ids.some((id) => selectedTags.has(id))) return false;
      }
      if (q) {
        const haystack = [
          a.title,
          a.description ?? "",
          a.category ? categoryLabel(a.category) : "",
          ...(a.tags?.map((t) => t.name) ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [articles, query, catActive, tagActive, selectedCategories, selectedTags]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "oldest":
        return arr.sort((a, b) => +new Date(a.date) - +new Date(b.date));
      case "az":
        return arr.sort((a, b) => a.title.localeCompare(b.title));
      case "za":
        return arr.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return arr.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (next: number) => {
    setPage(next);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleIn = (setter: typeof setSelectedCategories) => (value: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  const resetFilters = () => {
    setQuery("");
    setSelectedCategories(new Set(availableCategories.map((c) => c.value)));
    setSelectedTags(new Set(availableTags.map((t) => t.value)));
  };

  const total = articles.length;
  const countLabel = isFiltering
    ? `${sorted.length} / ${total}`
    : `${total} ${total === 1 ? "Article" : "Articles"}`;

  const currentSort = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  return (
    <div ref={sectionRef} className="w-full scroll-mt-24">
      {/* Section header + live result count */}
      <div className="container-content mx-auto w-full max-w-280 pb-8 pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px]">All Articles</h2>
          <p
            aria-live="polite"
            className="pb-1 font-medium text-[0.75rem] uppercase leading-[105%] tracking-[0.03rem] opacity-50"
          >
            {countLabel}
          </p>
        </div>
      </div>

      {/* Toolbar: search + filters + sort */}
      <div className="w-full bg-bg text-white">
        <div className="container-content mx-auto w-full max-w-280">
          <div className="flex flex-col lg:flex-row lg:items-stretch">
            <label className="flex flex-1 cursor-text items-center gap-4 border-b border-white/15 py-7 lg:min-w-0">
              <span className="shrink-0 opacity-60">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH"
                className="-mb-0.5 w-full border-0 bg-transparent text-[0.818rem] uppercase tracking-[0.03rem] text-white outline-none placeholder:text-white placeholder:opacity-60"
              />
            </label>

            <div className="flex flex-wrap items-center gap-x-7 gap-y-1 border-b border-white/15 py-4 lg:border-b-0 lg:border-l lg:py-0 lg:pl-8">
              {availableCategories.length > 0 && (
                <FilterDropdown label="Category" badge={catActive ? selectedCategories.size : null}>
                  <MultiSelectPanel
                    title="Category"
                    options={availableCategories}
                    selected={selectedCategories}
                    onToggle={toggleIn(setSelectedCategories)}
                    onAll={() => setSelectedCategories(new Set(availableCategories.map((c) => c.value)))}
                    onClear={() => setSelectedCategories(new Set())}
                  />
                </FilterDropdown>
              )}

              {availableTags.length > 0 && (
                <FilterDropdown label="Tags" badge={tagActive ? selectedTags.size : null}>
                  <MultiSelectPanel
                    title="Tags"
                    options={availableTags}
                    selected={selectedTags}
                    onToggle={toggleIn(setSelectedTags)}
                    onAll={() => setSelectedTags(new Set(availableTags.map((t) => t.value)))}
                    onClear={() => setSelectedTags(new Set())}
                  />
                </FilterDropdown>
              )}

              <FilterDropdown label={`Sort: ${currentSort.short}`} align="right">
                {(close) => (
                  <ul aria-label="Sort by" className="m-0 flex list-none flex-col p-0">
                    {SORT_OPTIONS.map((opt) => {
                      const active = opt.value === sort;
                      return (
                        <li key={opt.value}>
                          <button
                            type="button"
                            aria-pressed={active}
                            onClick={() => {
                              setSort(opt.value);
                              close();
                            }}
                            className="flex w-full cursor-pointer items-center justify-between gap-6 px-2 py-2 text-left transition-colors hover:bg-white/5"
                          >
                            <span className={`text-[13px] tracking-[-0.126px] ${active ? "text-white" : "text-white/70"}`}>
                              {opt.label}
                            </span>
                            {active && (
                              <span className="text-white">
                                <CheckIcon />
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </FilterDropdown>

              {isFiltering && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex cursor-pointer items-center gap-1.5 py-2 text-[0.818rem] uppercase tracking-[0.03rem] whitespace-nowrap text-white/50 transition-colors duration-300 hover:text-white"
                >
                  Reset <CloseIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-content mx-auto w-full max-w-280 pb-16 pt-8">
        {pageItems.length === 0 ? (
          <div className="flex flex-col items-start gap-4 py-16">
            <p className="text-[0.918rem] opacity-50">No articles match your filters.</p>
            {isFiltering && (
              <button
                type="button"
                onClick={resetFilters}
                className="action-link text-bg inline-flex items-center gap-2 font-medium"
              >
                Reset filters <CloseIcon />
              </button>
            )}
          </div>
        ) : (
          <>
            <ul className="m-0 flex list-none flex-col p-0">
              {pageItems.map((article) => (
                <ArticleRow key={article._id} article={article} />
              ))}
            </ul>
            <div className="h-px bg-bg" />
            <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
          </>
        )}
      </div>
    </div>
  );
}
