# Articles / Blog Feature — Agent Reference

> This document covers the CMS-backed articles feature added to the Portfolio site.
> Read alongside `AGENTS.md` and `STYLE_GUIDE.md`.

---

## Overview

Articles are managed in **Sanity CMS** (headless, hosted). Non-technical users author content
in the embedded Studio at `/studio`. Published articles appear:

- On the homepage in a "News & Insights" section (`components/home/news-section.tsx`)
- On the full listing page at `/articles`
- On individual detail pages at `/articles/[slug]`

---

## Environment Variables

Copy `.env.example` → `.env.local` and fill in values from [sanity.io/manage](https://sanity.io/manage).

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=   # required — found in Sanity project settings
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

Without `NEXT_PUBLIC_SANITY_PROJECT_ID`, all article fetches silently return empty arrays (caught
by try/catch). The site builds and runs — the News section is hidden, `/articles` shows an empty
state. This is intentional and safe.

---

## File Map

```text
sanity.config.ts                       Sanity Studio config (root of project)
sanity/schemaTypes/
  index.ts                             Schema registry
  article.ts                           Article document type definition

lib/sanity/
  client.ts                            Sanity client (next-sanity createClient)
  queries.ts                           GROQ queries + TypeScript types
  image.ts                             urlFor() image URL builder (@sanity/image-url)

app/
  studio/[[...tool]]/page.tsx          Embedded Sanity Studio (client component, ssr: false)
  articles/
    page.tsx                           Full article listing page
    [slug]/page.tsx                    Individual article detail page

components/home/
  news-section.tsx                     Homepage section — shows latest 3 articles
```

---

## Article Schema

Defined in `sanity/schemaTypes/article.ts`. Fields:

| Field | Sanity type | Notes |
| --- | --- | --- |
| `title` | `string` | Required |
| `slug` | `slug` | Auto-generated from title. Becomes the URL segment. Required |
| `date` | `datetime` | Publish date. Required |
| `mainImage` | `image` (with hotspot) | Has nested `alt` (string) field |
| `description` | `text` (max 300 chars) | Short excerpt — shown in listings and previews. Required |
| `links` | `array` of `{ label, href }` | Optional external references / press links |
| `body` | `array` (Portable Text + images) | Rich HTML content — supports headings, bold, italic, lists, blockquotes, links, embedded images with captions |

---

## GROQ Queries

All queries and their TypeScript return types are in `lib/sanity/queries.ts`.

```ts
// All articles, newest first — used by /articles listing page
getAllArticlesQuery      → ArticleSummary[]

// Latest N articles — used by homepage NewsSection
// Pass { limit: number } as query params
getLatestArticlesQuery  → ArticleSummary[]

// Single article by slug — used by /articles/[slug]
// Pass { slug: string } as query params
getArticleBySlugQuery   → Article

// All slugs — used by generateStaticParams
getAllArticleSlugsQuery  → { slug: string }[]
```

### Key types

```ts
ArticleSummary {
  _id, title, slug: { current }, date, description, mainImage?: ArticleImage
}

Article extends ArticleSummary {
  links?: { label, href }[]
  body?: PortableTextBlock[]
}
```

---

## Image Handling

Sanity hosts images on `cdn.sanity.io`. The `urlFor()` helper (from `lib/sanity/image.ts`)
wraps `@sanity/image-url`'s `createImageUrlBuilder`.

```ts
import { urlFor } from "@/lib/sanity/image";

// Generate a URL
const src = urlFor(article.mainImage).width(720).height(405).fit("crop").url();
```

`cdn.sanity.io` is already allowlisted in `next.config.ts` under `images.remotePatterns`.

Always use `next/image` (not `<img>`) with Sanity image URLs for optimisation.

---

## Revalidation

Both the listing and detail pages use `export const revalidate = 86400`.
Content updates in Sanity Studio become live within one hour without a redeploy.

For instant updates, a Sanity webhook → Next.js `revalidate` API route can be added later
(not currently implemented).

---

## Portable Text (Article Body)

The article body is Sanity **Portable Text** — a structured JSON format that maps to HTML.
It is rendered using `@portabletext/react` in `app/articles/[slug]/page.tsx`.

Custom component overrides are defined in `portableTextComponents` in that file. They map:

| Block type | Output |
| --- | --- |
| `normal` | `<p>` with body-text styles |
| `h1`–`h4` | Sized headings with negative tracking |
| `blockquote` | Left-bordered, muted italic block |
| `bullet` / `number` list | `<ul>` / `<ol>` with disc/decimal markers |
| `strong` | `<strong>` bold |
| `em` | `<em>` muted italic |
| `code` (inline) | Monospace code span with muted background |
| `link` mark | `<a>` with underline, opens in new tab if `blank: true` |
| `image` type | Full-width `next/image` with optional caption |

To customise article body rendering (add new block types, change styles), edit the
`portableTextComponents` object in `app/articles/[slug]/page.tsx`.

---

## Styling Notes

Articles pages use the `#F1F0EA` warm off-white light theme (`bg-bg-news text-bg`).

Key class patterns (consistent with rest of site):

- Background: `bg-bg-news`
- Text: `text-bg` (maps to `--color-bg` = `#010101`)
- Dividers: `<div className="h-px bg-bg" />` — NOT `<hr>` with inline styles
- Eyebrow/date: `font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 leading-[105%]`
- Featured article title: `text-[35px] font-normal leading-[125%] tracking-[-0.7px]`
- Secondary article title: `text-[21px] font-bold leading-[115%] tracking-[-0.21px]`
- Action links: `action-link text-bg` (defined in `globals.css`)

Do **not** use inline `style` attributes — use Tailwind classes. The ESLint config enforces this.

---

## Sanity Studio

Embedded at `/studio` (deployed alongside the site).

- Requires a Sanity account with access to the project — public users cannot reach the CMS
- In development: `npm run dev` → visit `http://localhost:3000/studio`
- The page is a `"use client"` component using `next/dynamic` with `ssr: false` to avoid
  Turbopack/React context errors during SSR

The Studio config is in `sanity.config.ts` at the project root.
Schema types are in `sanity/schemaTypes/`.

---

## Known Constraints & TODOs

- **No draft preview** — articles are only visible after publishing. A preview mode with
  `SANITY_API_READ_TOKEN` and a Next.js `/api/draft-mode` route can be added later.
- **Revalidation webhook** — for instant publish-to-live, add a Sanity webhook that calls
  Next.js `revalidatePath('/articles')`.

### Listing controls (`components/articles/`)

The `/articles` listing toolbar is fully client-side and lives in two files:

- `article-list.tsx` — orchestrates search, filtering, sorting and pagination over the
  articles passed from the server component. State is local React state (not URL params),
  consistent with the rest of the site.
- `filter-dropdown.tsx` — reusable dark popover primitive (outside-click + `Escape` close,
  kept `inert` while closed) used for the Category, Tags and Sort controls.

Behaviour:

- **Search** matches title, description, category label and tag names.
- **Category / Tags filters** are multi-select, derived from the articles actually present,
  and start with everything selected. A filter only narrows results once it is *not* fully
  selected (so uncategorised articles still show by default). Each shows a count badge when active.
- **Sort By** — `Newest` (default), `Oldest`, `Title A–Z`, `Title Z–A`.
- **Pagination** — client-side, `PAGE_SIZE = 6`, with windowed page numbers; changing any
  filter resets to page 1 and paging scrolls back to the top of the list.

To change the page size or sort options, edit the `PAGE_SIZE` / `SORT_OPTIONS` constants at the
top of `article-list.tsx`. Category display labels live in `CATEGORY_LABELS` there (kept in
sync with `CATEGORY_OPTIONS` in `sanity/schemaTypes/article.ts`).
