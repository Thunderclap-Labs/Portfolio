import { defineField, defineType } from "sanity";

export const collaboratorType = defineType({
  name: "collaborator",
  title: "Collaborator",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      title: "Website URL",
      description: "Optional. Makes the name a clickable link on project pages.",
      type: "url",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "url" },
  },
});
