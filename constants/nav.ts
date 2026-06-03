export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/articles" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];
