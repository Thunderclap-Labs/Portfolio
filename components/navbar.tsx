import { client } from "@/lib/sanity/client";
import {
  getNavbarArticlesQuery,
  getNavbarProjectsQuery,
  type NavbarItem,
} from "@/lib/sanity/queries";
import { NavbarClient } from "@/components/navbar-client";

async function fetchNavbarItems(query: string): Promise<NavbarItem[]> {
  try {
    return await client.fetch<NavbarItem[]>(query);
  } catch {
    return [];
  }
}

export async function Navbar() {
  const [projects, articles] = await Promise.all([
    fetchNavbarItems(getNavbarProjectsQuery),
    fetchNavbarItems(getNavbarArticlesQuery),
  ]);

  return <NavbarClient dropdowns={{ projects, articles }} />;
}
