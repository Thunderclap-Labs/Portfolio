import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArticleLink {
  label: string;
  href: string;
}

export type ArticleImage = SanityImageSource & {
  alt?: string;
  caption?: string;
};

export interface ArticleSummary {
  _id: string;
  title: string;
  slug: { current: string };
  date: string;
  description: string;
  mainImage?: ArticleImage;
}

export interface Article extends ArticleSummary {
  links?: ArticleLink[];
  body?: PortableTextBlock[];
}

// ─── GROQ Queries ─────────────────────────────────────────────────────────────

export const ARTICLE_SUMMARY_FIELDS = `
  _id,
  title,
  slug,
  date,
  description,
  mainImage { ..., asset-> }
`;

export const ARTICLE_FULL_FIELDS = `
  ${ARTICLE_SUMMARY_FIELDS},
  links[] { label, href },
  body[] {
    ...,
    _type == "image" => { ..., asset-> }
  }
`;

export const getAllArticlesQuery = `
  *[_type == "article"] | order(date desc) {
    ${ARTICLE_SUMMARY_FIELDS}
  }
`;

export const getLatestArticlesQuery = `
  *[_type == "article"] | order(date desc) [0...$limit] {
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
