import { defineField, defineType } from "sanity";

export const authorType = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      description: "e.g. \"Chief Engineer\", \"Communications Lead\".",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role" },
  },
});
