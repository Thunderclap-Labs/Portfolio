# Projects Feature — Agent Reference

> This document covers the CMS-backed projects feature in the Portfolio site.
> Read alongside `AGENTS.md`, `ARTICLES.md`, and `STYLE_GUIDE.md`.

---

## Overview

Projects are managed in **Sanity CMS**. Editors author content in the embedded Studio at `/studio`.
Projects appear:

- On the listing page at `/projects`
- On individual detail pages at `/projects/[slug]`
- On the homepage in a featured showcase grid (via `getFeaturedProjectsQuery`)
- In article sidebars (auto-computed back-reference — see Cross-References below)

---

## File Map

```text
sanity/schemaTypes/
  index.ts                             Schema registry (exports both article + project types)
  project.ts                           Project document type definition

lib/sanity/
  queries.ts                           GROQ queries + TypeScript types

app/
  projects/
    page.tsx                           Listing page — 3-col card grid
    [slug]/page.tsx                    Detail page — cinematic hero + two-column layout

components/
  projects/
    project-card.tsx                   Card component with ScrambleText hover effect
  common/
    media-gallery.tsx                  Shared lightbox gallery (used by both projects + articles)
    portable-text-dark.tsx             Shared dark-theme PortableText components
    related-list.tsx                   Sidebar cross-reference list (thumbnail + title + subtitle)
```

---

## Project Schema

Defined in `sanity/schemaTypes/project.ts`. Fields are grouped into three tabs in the Studio.

### Group: Card

| Field | Type | Notes |
| --- | --- | --- |
| `title` | `string` | Required |
| `slug` | `slug` | Auto-generated from title. Becomes the URL segment. Required |
| `tagline` | `string` (max 80) | Short scramble phrase shown on card hover. Required |
| `summary` | `text` (max 300) | One–two sentence summary used in listings and sidebar. Required |
| `mainImage` | `image` + `alt` | Cover image for cards and fallback hero. Required |
| `heroImage` | `image` + `alt` | Wide-format hero image for detail page. Falls back to `mainImage` if omitted |

### Group: Metadata

| Field | Type | Notes |
| --- | --- | --- |
| `status` | `string` (radio) | `active` \| `in-development` \| `concept` \| `archived`. Default: `active` |
| `categories` | `string[]` (checklist) | At least one required. See values below |
| `featured` | `boolean` | Show in homepage showcase grid. Default: `false` |
| `order` | `number` | Manual display order (lower = earlier). Blank = sort by date |
| `startDate` | `datetime` | Optional |
| `endDate` | `datetime` | Optional — leave empty for ongoing |
| `keyTech` | `string[]` (tags) | Short technology tags shown on detail page |
| `collaborators` | `string[]` (tags) | Partner institutions / external contributors |
| `externalLinks` | `{ label, href }[]` | Press, papers, demos, repos |

**Category values:** `aerospace`, `atmospheric`, `defense`, `ai`, `hardware`, `chemistry`, `research`, `software`, `satellites`

**Status display:** `active` gets an accent-lime pill border on cards and in the hero overlay; others get a muted white border.

### Group: Content

| Field | Type | Notes |
| --- | --- | --- |
| `body` | Portable Text + images | Full writeup. Blocks + embedded images with alt + caption |
| `gallery` | `image[]` + alt + caption | Additional images shown in the gallery section at page bottom |

---

## GROQ Queries

All queries and TypeScript types live in `lib/sanity/queries.ts`.

```ts
getAllProjectsQuery        → ProjectSummary[]   // all projects, sorted
getFeaturedProjectsQuery   → ProjectSummary[]   // featured == true, pass { limit: number }
getProjectBySlugQuery      → Project            // full fields, pass { slug: string }
getAllProjectSlugsQuery     → { slug: string }[] // for generateStaticParams
```

### Sort order

```groq
order(coalesce(order, 9999) asc, startDate desc, _createdAt desc)
```

Explicit `order` field wins; unordered projects fall back to `startDate` desc.

### Key TypeScript types

```ts
type ProjectStatus = "active" | "in-development" | "concept" | "archived";

interface ProjectSummary {
  _id: string;
  title: string;
  slug: { current: string };
  tagline: string;
  summary: string;
  mainImage?: SanityImage;
  status: ProjectStatus;
  categories: string[];
  featured?: boolean;
  order?: number;
  startDate?: string;
  endDate?: string;
}

interface Project extends ProjectSummary {
  heroImage?: SanityImage;
  keyTech?: string[];
  collaborators?: string[];
  externalLinks?: CmsLink[];
  body?: PortableTextBlock[];
  gallery?: SanityImage[];
  relatedArticles?: ArticleSummary[];   // computed — see Cross-References
}
```

`SanityImage` is `SanityImageSource & { alt?: string; caption?: string }`.
`CmsLink` is `{ label: string; href: string }`.

---

## Detail Page Layout (`/projects/[slug]`)

Theme: **dark** — `bg-bg text-white`.

```text
┌─────────────────────────────────────────────────────┐
│  Hero image (70vh, min-h-120)                       │
│  gradient overlay (dark bottom → transparent top)  │
│  ┌── overlay content (bottom-left) ──────────────┐  │
│  │  status pill + category chips                  │  │
│  │  h1 title (70px, bold, –1.4px tracking)        │  │
│  │  tagline (21px, white/75)                       │  │
│  └────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  ← All Projects   (back link)                       │
├─────────────────────────────────────────────────────┤
│  summary (21px, white/85)                           │
│  ─────────────────                                  │
│  Portable Text body    │  Sidebar (280px)           │
│                        │  Status                    │
│                        │  Timeline                  │
│                        │  Key Technologies (chips)  │
│                        │  Collaborators             │
│                        │  Links (external)          │
│                        │  Related Articles          │
├─────────────────────────────────────────────────────┤
│  Gallery (4-col grid → lightbox)                    │
└─────────────────────────────────────────────────────┘
```

Hero image source: `project.heroImage ?? project.mainImage`, sized `2000×1000` with `fit("crop")`.

---

## Project Card (`components/projects/project-card.tsx`)

A `"use client"` component.

- Square `878×878` aspect ratio in the listing grid
- `ScrambleText` hook on hover: randomises the tagline character-by-character (12 ms interval, 0.45 step) then settles to the real string
- Status pill (accent-lime border if `active`) + category chips top-right
- Project name (21px bold) bottom-left
- Arrow button bottom-right
- Sanity image at `900×900`

---

## Shared Components

### `components/common/media-gallery.tsx`

Client component. Used by both project and article detail pages.

```tsx
<MediaGallery images={project.gallery} title={project.title} />
```

- Props: `images: SanityImage[]`, `title: string` (used in fallback alt text)
- 4-col grid on desktop (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`), `aspect-video` cells
- Thumbnails: `640×360`, `fit("crop")`, `auto("format")`
- Lightbox: `yet-another-react-lightbox` v3, full-size at 2560px
- `noScroll={{ disabled: true }}` — prevents page-jump when lightbox opens
- `animation={{ fade: 220, swipe: 280 }}`, `closeOnBackdropClick: true`

### `components/common/portable-text-dark.tsx`

Exports `darkPortableTextComponents: PortableTextComponents` — the shared dark-theme renderer
used by both project and article detail pages. Renders white/80 body text, white headings,
white/40 blockquote border, bg/10 inline code.

To customise rendering for a single page, copy the object inline in that page instead of
importing the shared one.

### `components/common/related-list.tsx`

```tsx
<RelatedList items={[{ href, title, subtitle?, image? }]} />
```

Compact `48×48` thumbnail + bold title + muted subtitle. Used in dark sidebars.
For the light-theme article sidebar a local `RelatedListLight` variant is defined inline in
`app/articles/[slug]/page.tsx`.

---

## Cross-References (Projects ↔ Articles)

Relationships are maintained **from the article side only**:

- Articles have a `relatedProjects` field (array of Sanity references to project documents).
- The project detail page computes `relatedArticles` at query time via a GROQ back-reference —
  it does **not** store a `relatedArticles` field on the project document:

```groq
"relatedArticles": *[_type == "article" && ^._id in relatedProjects[]._ref] | order(date desc) {
  _id, title, slug, date, description, mainImage { ..., asset-> }, ...
}
```

**Consequence:** editors add/remove the relationship only in the article document. The project
sidebar updates automatically on the next request (no manual sync required).

---

## Portable Text (Project Body)

Rendered in `app/projects/[slug]/page.tsx` using `darkPortableTextComponents` from
`components/common/portable-text-dark.tsx`.

| Block | Output |
| --- | --- |
| `normal` | `<p>` — `text-[14.7px]`, `leading-[170%]`, `text-white/80` |
| `h2` | `35px`, normal weight, `–0.7px` tracking |
| `h3` | `21px`, bold, `–0.21px` tracking |
| `h4` | `16px`, bold, `–0.16px` tracking |
| `blockquote` | Left border `white/40`, muted italic text |
| `bullet` / `number` | `<ul>` / `<ol>`, `text-white/80` |
| `strong` | Bold, `text-white` |
| `em` | `text-white/70` |
| `code` (inline) | `bg-white/10`, monospace |
| `link` mark | Underline, `text-white/80 hover:text-white` |
| `image` type | Full-width `next/image`, `aspect-video`, optional caption |

---

## Styling Notes

Project pages use the **dark theme**: `bg-bg text-white` (`bg-bg` = `#010101`).

Key patterns:

- Eyebrow labels: `eyebrow` utility class (defined in `globals.css`) — `uppercase`, `10.5px`, `0.42px` tracking
- Sidebar divider: `lg:border-l lg:border-white/10 lg:pl-8`
- Divider lines: `<div className="h-px bg-white/15" />`
- Tech / category chips: `border border-white/20`, `12px`, no border-radius
- Action links: `action-link text-white`
- Status pill accent: `border: 1px solid var(--color-accent)`, `bg: rgba(223,241,64,0.18)` — only for `active` status

Do **not** use inline `style` attributes where a Tailwind class works. The existing pages use
inline styles only for values that cannot be expressed as static Tailwind classes (e.g. exact
`rgba` gradient values, exact `px` font sizes not in the default scale). The ESLint rule
`react/no-inline-styles` produces warnings for these — they are tolerated project-wide.

---

## Revalidation

Both the listing and detail pages use `export const revalidate = 3600` (1-hour ISR).

---

## Known Constraints & Potential TODOs

- **No draft preview** — same as articles; can be added with `SANITY_API_READ_TOKEN` + draft mode route.
- **No pagination** — listing shows all projects. Add if volume grows.
- **`ScrambleText` is local** — the hook is defined inline in `project-card.tsx`; extract if reuse is needed elsewhere.
- **Homepage showcase** — `getFeaturedProjectsQuery` is ready; wire it up in the homepage once the section is being built.
