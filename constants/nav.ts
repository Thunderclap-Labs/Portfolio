export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Demos", href: "/demos" },
  { label: "Articles", href: "/articles" },
  { label: "Contact", href: "/contact" },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];
