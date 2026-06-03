import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const SINGLETON_TYPES = new Set(["siteSettings"]);

export default defineConfig({
  name: "thunderclap-labs",
  title: "Thunderclap Labs CMS",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Website Settings")
              .id("siteSettings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !SINGLETON_TYPES.has(item.getId() ?? "")
            ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    // Prevent creating additional siteSettings documents
    templates: (templates) =>
      templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
});
