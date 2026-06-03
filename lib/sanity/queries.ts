import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";

// ─── Shared types ────────────────────────────────────────────────────────────

export type SanityImage = SanityImageSource & {
  alt?: string;
  caption?: string;
};

export interface CmsLink {
  label: string;
  href: string;
}

// Backwards-compat aliases (still used by existing components)
export type ArticleImage = SanityImage;
export type ArticleLink = CmsLink;
export type ProjectImage = SanityImage;
export type ProjectLink = CmsLink;

// ─── Articles ─────────────────────────────────────────────────────────────────

export type ArticleCategory =
  | "news"
  | "insight"
  | "press"
  | "case-study"
  | "technical"
  | "announcement";

export interface ArticleSummary {
  _id: string;
  title: string;
  slug: { current: string };
  date: string;
  description: string;
  mainImage?: SanityImage;
  category?: ArticleCategory;
  tags?: Tag[];
  featured?: boolean;
  readingTime?: number;
}

export interface Article extends ArticleSummary {
  heroImage?: SanityImage;
  author?: Author;
  keyTakeaways?: string[];
  links?: CmsLink[];
  body?: PortableTextBlock[];
  gallery?: SanityImage[];
  relatedProjects?: ProjectSummary[];
  relatedArticles?: ArticleSummary[];
}

export const ARTICLE_SUMMARY_FIELDS = `
  _id,
  title,
  slug,
  date,
  description,
  mainImage { ..., asset-> },
  category,
  tags[]->{ _id, name, slug },
  featured,
  readingTime
`;

// ─── Projects ─────────────────────────────────────────────────────────────────

export type ProjectStatus = "active" | "in-development" | "concept" | "completed" | "archived";

export interface Author {
  _id: string;
  name: string;
  role?: string;
}

export interface Collaborator {
  _id: string;
  name: string;
  url?: string;
}

export interface Tag {
  _id: string;
  name: string;
  slug: { current: string };
}

export interface ProjectSummary {
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

export interface Project extends ProjectSummary {
  heroImage?: SanityImage;
  keyTech?: string[];
  collaborators?: Collaborator[];
  externalLinks?: CmsLink[];
  body?: PortableTextBlock[];
  gallery?: SanityImage[];
  relatedArticles?: ArticleSummary[];
}

export const PROJECT_SUMMARY_FIELDS = `
  _id,
  title,
  slug,
  tagline,
  summary,
  mainImage { ..., asset-> },
  status,
  categories,
  featured,
  order,
  startDate,
  endDate
`;

// ─── Article full / queries ───────────────────────────────────────────────────

export const ARTICLE_FULL_FIELDS = `
  ${ARTICLE_SUMMARY_FIELDS},
  heroImage { ..., asset-> },
  author->{ _id, name, role },
  keyTakeaways,
  links[] { label, href },
  body[] {
    ...,
    _type == "image" => { ..., asset-> }
  },
  gallery[] { ..., asset-> },
  "relatedProjects": relatedProjects[]->{
    ${PROJECT_SUMMARY_FIELDS}
  },
  // Bidirectional related articles: forward references + back-references from other articles
  "relatedArticles": coalesce(relatedArticles[]->{
    ${ARTICLE_SUMMARY_FIELDS}
  }, []) + *[_type == "article" && ^._id in relatedArticles[]._ref && _id != ^._id] | order(date desc) {
    ${ARTICLE_SUMMARY_FIELDS}
  }
`;

// Sort: featured first, then newest publish date.
const ARTICLE_ORDER = `order(coalesce(featured, false) desc, date desc)`;

export const getAllArticlesQuery = `
  *[_type == "article"] | ${ARTICLE_ORDER} {
    ${ARTICLE_SUMMARY_FIELDS}
  }
`;

export const getLatestArticlesQuery = `
  *[_type == "article"] | ${ARTICLE_ORDER} [0...$limit] {
    ${ARTICLE_SUMMARY_FIELDS}
  }
`;

export const getArticleBySlugQuery = `
  *[_type == "article" && slug.current == $slug][0] {
    ${ARTICLE_FULL_FIELDS}
  }
`;

export const getAllArticleSlugsQuery = `
  *[_type == "article"] { "slug": slug.current }
`;

// All tags, alphabetically — for building a tag filter UI.
export const getAllTagsQuery = `
  *[_type == "tag"] | order(name asc) { _id, name, slug }
`;

// Articles filtered to a single tag slug — pass { tagSlug: string }.
export const getArticlesByTagQuery = `
  *[_type == "article" && $tagSlug in tags[]->slug.current] | ${ARTICLE_ORDER} {
    ${ARTICLE_SUMMARY_FIELDS}
  }
`;

// ─── Project full / queries ───────────────────────────────────────────────────

export const PROJECT_FULL_FIELDS = `
  ${PROJECT_SUMMARY_FIELDS},
  heroImage { ..., asset-> },
  keyTech,
  collaborators[]->{ _id, name, url },
  externalLinks[] { label, href },
  body[] {
    ...,
    _type == "image" => { ..., asset-> }
  },
  gallery[] { ..., asset-> },
  // Compute back-references: any article that lists this project in its relatedProjects
  "relatedArticles": *[_type == "article" && ^._id in relatedProjects[]._ref] | order(date desc) {
    ${ARTICLE_SUMMARY_FIELDS}
  }
`;

// Sort: explicit `order` first (asc), then by startDate desc as a tiebreaker.
const PROJECT_ORDER = `order(coalesce(order, 9999) asc, startDate desc, _createdAt desc)`;

export const getAllProjectsQuery = `
  *[_type == "project"] | ${PROJECT_ORDER} {
    ${PROJECT_SUMMARY_FIELDS}
  }
`;

export const getFeaturedProjectsQuery = `
  *[_type == "project" && featured == true] | ${PROJECT_ORDER} [0...$limit] {
    ${PROJECT_SUMMARY_FIELDS}
  }
`;

export const getProjectBySlugQuery = `
  *[_type == "project" && slug.current == $slug][0] {
    ${PROJECT_FULL_FIELDS}
  }
`;

export const getAllProjectSlugsQuery = `
  *[_type == "project"] { "slug": slug.current }
`;

// ─── Navbar dropdown queries ──────────────────────────────────────────────────

export interface NavbarItem {
  _id: string;
  title: string;
  slug: { current: string };
  subtitle?: string;
}

export const getNavbarProjectsQuery = `
  *[_type == "project" && showInNavbar == true] | ${PROJECT_ORDER} [0...4] {
    _id,
    title,
    slug,
    "subtitle": tagline
  }
`;

export const getNavbarArticlesQuery = `
  *[_type == "article" && showInNavbar == true] | ${ARTICLE_ORDER} [0...4] {
    _id,
    title,
    slug,
    "subtitle": description
  }
`;
