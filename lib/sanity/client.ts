import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

// Use a placeholder projectId so the client initialises without throwing
// during build-time when env vars are not yet set. Actual fetches will fail
// and are caught with try/catch in each page component.
export const client = createClient({
  projectId: projectId ?? "unconfigured",
  dataset,
  apiVersion,
  useCdn: true,
});
