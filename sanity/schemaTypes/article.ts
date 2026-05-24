import { defineField, defineType } from "sanity";

const CATEGORY_OPTIONS = [
  { title: "News", value: "news" },
  { title: "Insight", value: "insight" },
  { title: "Press", value: "press" },
  { title: "Case Study", value: "case-study" },
  { title: "Technical", value: "technical" },
  { title: "Announcement", value: "announcement" },
];

export const articleType = defineType({
  name: "article",
  title: "Article",
  type: "document",
  groups: [
    { name: "card", title: "Card" },
    { name: "meta", title: "Metadata" },
    { name: "content", title: "Content" },
    { name: "related", title: "Related" },
  ],
  fields: [
    // ─── Card ────────────────────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "card",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "card",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      title: "Publish Date",
      type: "datetime",
      group: "card",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Cover Image",
      type: "image",
      group: "card",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          validation: (r) => r.required().warning("Alt text is important for accessibility."),
        }),
      ],
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      description: "Wide-format image shown at the top of the article detail page. Falls back to Cover Image if empty.",
      type: "image",
      group: "card",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          validation: (r) => r.warning("Alt text is important for accessibility."),
        }),
      ],
    }),
    defineField({
      name: "description",
      title: "Short Description",
      description: "A one or two sentence excerpt shown in listings and previews.",
      type: "text",
      rows: 3,
      group: "card",
      validation: (r) => r.required().max(300),
    }),

    // ─── Metadata ────────────────────────────────────────────────────────────
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "meta",
      options: { list: CATEGORY_OPTIONS, layout: "radio" },
      initialValue: "news",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      description: "Freeform topical tags (e.g. \"propulsion\", \"AI\", \"funding\").",
      type: "array",
      group: "meta",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      group: "meta",
    }),
    defineField({
      name: "authorRole",
      title: "Author Role",
      description: "e.g. \"Chief Engineer\", \"Communications Lead\".",
      type: "string",
      group: "meta",
    }),
    defineField({
      name: "readingTime",
      title: "Reading Time (minutes)",
      description: "Manual override. Leave empty to hide.",
      type: "number",
      group: "meta",
      validation: (r) => r.min(1).max(120).integer(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      description: "Pin to the top of the listing and News section.",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
    defineField({
      name: "showInNavbar",
      title: "Show in Navbar",
      description: "Show this article in the site navbar dropdown (max 4 shown).",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
    defineField({
      name: "keyTakeaways",
      title: "Key Takeaways",
      description: "Short bullet points highlighted in the sidebar.",
      type: "array",
      group: "meta",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "links",
      title: "External Links",
      description: "Optional references, press links, or related resources.",
      type: "array",
      group: "meta",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "href", title: "URL", type: "url", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        },
      ],
    }),

    // ─── Content ─────────────────────────────────────────────────────────────
    defineField({
      name: "body",
      title: "Body",
      description: "Full article content. Supports headings, lists, links, images, and embedded media.",
      type: "array",
      group: "content",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (r) => r.required().warning("Alt text is important for accessibility."),
            }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        },
      ],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      description: "Additional images shown at the bottom of the article.",
      type: "array",
      group: "content",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (r) => r.required().warning("Alt text is important for accessibility."),
            }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        },
      ],
    }),

    // ─── Related ─────────────────────────────────────────────────────────────
    defineField({
      name: "relatedProjects",
      title: "Related Projects",
      description: "Projects this article is about. Shown in the article sidebar.",
      type: "array",
      group: "related",
      of: [{ type: "reference", to: [{ type: "project" }] }],
    }),
    defineField({
      name: "relatedArticles",
      title: "Related Articles",
      description: "Other articles related to this one. The relationship is shown on both sides automatically.",
      type: "array",
      group: "related",
      of: [{ type: "reference", to: [{ type: "article" }] }],
    }),
  ],
  orderings: [
    {
      title: "Publish Date, Newest First",
      name: "publishDateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", media: "mainImage", subtitle: "date" },
    prepare({ title, media, subtitle }) {
      return {
        title,
        media,
        subtitle: subtitle
          ? new Date(subtitle).toLocaleDateString("sv-SE").replace(/-/g, "/")
          : "No date set",
      };
    },
  },
});
