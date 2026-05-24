import { defineField, defineType } from "sanity";

const STATUS_OPTIONS = [
  { title: "Active", value: "active" },
  { title: "In Development", value: "in-development" },
  { title: "Concept", value: "concept" },
  { title: "Archived", value: "archived" },
];

const CATEGORY_OPTIONS = [
  { title: "Aerospace", value: "aerospace" },
  { title: "Atmospheric", value: "atmospheric" },
  { title: "Defense", value: "defense" },
  { title: "AI", value: "ai" },
  { title: "Hardware", value: "hardware" },
  { title: "Chemistry", value: "chemistry" },
  { title: "Research", value: "research" },
  { title: "Software", value: "software" },
  { title: "Satellites", value: "satellites" },
];

export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    { name: "card", title: "Card" },
    { name: "meta", title: "Metadata" },
    { name: "content", title: "Content" },
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
      name: "tagline",
      title: "Tagline",
      description: "Short scramble phrase shown on card hover (e.g. \"See Everything. Miss Nothing.\").",
      type: "string",
      group: "card",
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      description: "One to two sentence summary used in listings and previews.",
      type: "text",
      rows: 3,
      group: "card",
      validation: (r) => r.required().max(300),
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
      validation: (r) => r.required(),
    }),

    defineField({
      name: "heroImage",
      title: "Hero Image",
      description: "Wide-format image shown at the top of the project detail page. If left empty, the Cover Image is used instead.",
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

    // ─── Metadata ────────────────────────────────────────────────────────────
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "meta",
      options: { list: STATUS_OPTIONS, layout: "radio" },
      initialValue: "active",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "meta",
      of: [{ type: "string" }],
      options: { list: CATEGORY_OPTIONS },
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      description: "Show this project in the homepage showcase grid.",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
    defineField({
      name: "showInNavbar",
      title: "Show in Navbar",
      description: "Show this project in the site navbar dropdown (max 4 shown).",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      description: "Lower numbers appear first. Leave blank to sort by date.",
      type: "number",
      group: "meta",
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "datetime",
      group: "meta",
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      description: "Leave empty for ongoing projects.",
      type: "datetime",
      group: "meta",
    }),
    defineField({
      name: "keyTech",
      title: "Key Technologies",
      description: "Short tags displayed on the detail page (e.g. \"LiDAR\", \"CFD\", \"Solid Propellant\").",
      type: "array",
      group: "meta",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "collaborators",
      title: "Collaborators",
      description: "Partners, institutions, or external contributors.",
      type: "array",
      group: "meta",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "externalLinks",
      title: "External Links",
      description: "Press coverage, papers, demos, repos.",
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
      description: "The full writeup. Supports headings, lists, links, images, and embedded media.",
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
      description: "Additional images shown at the bottom of the project page.",
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

  ],
  orderings: [
    {
      title: "Display Order",
      name: "displayOrderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "startDate", direction: "desc" },
      ],
    },
    {
      title: "Start Date, Newest First",
      name: "startDateDesc",
      by: [{ field: "startDate", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", media: "mainImage", subtitle: "status" },
    prepare({ title, media, subtitle }) {
      const statusLabel = STATUS_OPTIONS.find((s) => s.value === subtitle)?.title ?? "—";
      return { title, media, subtitle: statusLabel };
    },
  },
});
