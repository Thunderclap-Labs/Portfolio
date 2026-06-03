import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Website Settings",
  type: "document",
  fields: [
    defineField({
      name: "featuredArticles",
      title: "Featured Articles",
      description: "Up to 2. The first is the hero on the News & Insights page and the big item on the homepage. The second appears as a smaller item below it on the homepage.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      validation: (r) => r.max(2),
    }),
    defineField({
      name: "navbarArticles",
      title: "Navbar Articles",
      description: "Articles shown in the site navbar dropdown. Maximum 4.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      validation: (r) => r.max(4),
    }),
    defineField({
      name: "featuredProjects",
      title: "Featured Projects",
      description: "Up to 3 projects shown in the homepage showcase grid. Drag to reorder.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "project" }] }],
      validation: (r) => r.max(3),
    }),
    defineField({
      name: "navbarProjects",
      title: "Navbar Projects",
      description: "Projects shown in the site navbar dropdown. Maximum 4.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "project" }] }],
      validation: (r) => r.max(4),
    }),
    defineField({
      name: "achievements",
      title: "Achievements",
      description: "Awards, prizes, and recognition shown on the homepage.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              description: "e.g. Hackathon, Competition, Awards, Grant",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "year",
              title: "Year",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "prize",
              title: "Prize / Result",
              type: "string",
              description: "e.g. 1st Place, Winner — €5,000",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "relatedArticle",
              title: "Related Article",
              description: "Clicking the card opens this article.",
              type: "reference",
              to: [{ type: "article" }],
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "prize", type: "type", year: "year" },
            prepare({ title, subtitle, type, year }) {
              return { title, subtitle: `${type ?? ""} · ${year ?? ""}  —  ${subtitle ?? ""}` };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Website Settings" };
    },
  },
});
