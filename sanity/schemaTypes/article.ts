import { defineField, defineType } from "sanity";

export const articleType = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      title: "Publish Date",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
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
      name: "description",
      title: "Short Description",
      description: "A one or two sentence excerpt shown in listings and previews.",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(300),
    }),
    defineField({
      name: "links",
      title: "External Links",
      description: "Optional references, press links, or related resources.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "href", title: "URL", type: "url", validation: (r) => r.required() }),
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        },
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      description: "Full article content. Supports headings, lists, links, images, and embedded media.",
      type: "array",
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
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
      ],
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
          ? new Date(subtitle).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "No date set",
      };
    },
  },
});
