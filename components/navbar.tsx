import { client } from "@/lib/sanity/client";
import {
  getNavbarArticlesQuery,
  getNavbarProjectsQuery,
  type NavbarItem,
} from "@/lib/sanity/queries";
import { NavbarClient } from "@/components/navbar-client";
import { demos } from "@/constants/demos";

async function fetchNavbarItems(query: string): Promise<NavbarItem[]> {
  try {
    return await client.fetch<NavbarItem[]>(query);
  } catch {
    return [];
  }
}

/** The demos are a fixed set in the repo rather than Sanity documents, so the
 *  panel is built here instead of being fetched. Shaped like the Sanity items
 *  so the dropdown renders them through the same branch. All ten go in: the
 *  panel splits into two columns rather than truncating the list. */
const demoNavItems: NavbarItem[] = demos.map((demo) => ({
  _id: demo.slug,
  title: demo.name,
  slug: { current: demo.slug },
  subtitle: demo.tagline,
}));

export async function Navbar() {
  const [projects, articles] = await Promise.all([
    fetchNavbarItems(getNavbarProjectsQuery),
    fetchNavbarItems(getNavbarArticlesQuery),
  ]);

  return <NavbarClient dropdowns={{ projects, articles, demos: demoNavItems }} />;
}
