import { client } from "@/lib/sanity/client";
import { getNavbarArticlesQuery, type NavbarItem } from "@/lib/sanity/queries";
import { NavbarClient } from "@/components/navbar-client";
import { visibleDemos } from "@/constants/demos";

async function fetchNavbarItems(query: string): Promise<NavbarItem[]> {
  try {
    return await client.fetch<NavbarItem[]>(query);
  } catch {
    return [];
  }
}

/** The demos are a fixed set in the repo rather than Sanity documents, so the
 *  panel is built here instead of being fetched. Shaped like the Sanity items
 *  so the dropdown renders them through the same branch. Every listed demo
 *  goes in: the panel splits into two columns rather than truncating. */
const demoNavItems: NavbarItem[] = visibleDemos.map((demo) => ({
  _id: demo.slug,
  title: demo.name,
  slug: { current: demo.slug },
  subtitle: demo.tagline,
}));

export async function Navbar() {
  const articles = await fetchNavbarItems(getNavbarArticlesQuery);

  return <NavbarClient dropdowns={{ articles, demos: demoNavItems }} />;
}
