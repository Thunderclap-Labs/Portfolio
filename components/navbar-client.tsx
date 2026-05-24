"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { NavbarItem } from "@/lib/sanity/queries";
import { ScrambleText } from "@/components/common/scramble-text";

type DropdownKey = "projects" | "articles";
type PanelKey = DropdownKey | "contact";

interface NavLink {
  label: string;
  href: string;
  dropdown?: PanelKey;
}

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/thunderclap-labs/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/thunderclap_labs/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@thunderclaplabs",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/Thunderclap-Labs",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
];

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/articles", dropdown: "articles" },
  { label: "Projects", href: "/projects", dropdown: "projects" },
  { label: "Contact", href: "/contact", dropdown: "contact" },
];

const DROPDOWN_COPY: Record<DropdownKey, { eyebrow: string; description: string; viewAllHref: string; viewAllLabel: string }> = {
  projects: {
    eyebrow: "Projects",
    description: "Selected work across atmospheric engineering, aerospace propulsion, and defense systems.",
    viewAllHref: "/projects",
    viewAllLabel: "View all projects",
  },
  articles: {
    eyebrow: "Articles",
    description: "News, technical writeups, and dispatches from the lab.",
    viewAllHref: "/articles",
    viewAllLabel: "View all articles",
  },
};

export interface NavbarClientProps {
  dropdowns: Record<DropdownKey, NavbarItem[]>;
}

export function NavbarClient({ dropdowns }: NavbarClientProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<PanelKey | null>(null);
  // `renderedDropdown` keeps the last panel content mounted during the close animation
  const [renderedDropdown, setRenderedDropdown] = useState<PanelKey | null>(null);
  const [contentVisible, setContentVisible] = useState(false);
  // bumped on every swap to retrigger ScrambleText
  const [scrambleKey, setScrambleKey] = useState(0);
  const [headerHovered, setHeaderHovered] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredContactLink, setHoveredContactLink] = useState<string | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  const closeAll = () => {
    setOpenDropdown(null);
    setHeaderHovered(false);
    setMenuOpen(false);
  };

  const handleEnterLink = (key: PanelKey | undefined) => {
    if (!key) { setOpenDropdown(null); return; }
    if (key === "contact") { setOpenDropdown("contact"); return; }
    if (dropdowns[key]?.length > 0) setOpenDropdown(key);
    else setOpenDropdown(null);
  };

  const handleHeaderLeave = () => {
    setHeaderHovered(false);
    setOpenDropdown(null);
  };

  // Cross-fade orchestration: when user moves to a different dropdown,
  // fade current content out, swap, then fade in. Mirrors anduril.com Land↔Air.
  const FADE_MS = 180;
  useEffect(() => {
    // Closing the panel: fade content out but keep it mounted; unmount happens on height transitionend.
    if (openDropdown === null) {
      setContentVisible(false);
      return;
    }

    // First open (nothing rendered yet): mount immediately and fade in next frame.
    if (renderedDropdown === null) {
      setRenderedDropdown(openDropdown);
      setScrambleKey((k) => k + 1);
      const raf = requestAnimationFrame(() => setContentVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    // Same dropdown already shown: just ensure visible.
    if (openDropdown === renderedDropdown) {
      setContentVisible(true);
      return;
    }

    // Swap: fade out, then swap content, then fade in.
    setContentVisible(false);
    const swapTimer = setTimeout(() => {
      setRenderedDropdown(openDropdown);
      setScrambleKey((k) => k + 1);
      const raf = requestAnimationFrame(() => setContentVisible(true));
      // store cancel on the timeout closure via a ref-like dance isn't needed; clearTimeout below covers most cases.
      return () => cancelAnimationFrame(raf);
    }, FADE_MS);
    return () => clearTimeout(swapTimer);
  }, [openDropdown, renderedDropdown]);

  const navStyles: React.CSSProperties = {
    letterSpacing: "-0.009rem",
    alignItems: "center",
    gap: "2.7rem",
    fontSize: "0.938rem",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "120%",
    display: "flex",
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const activeItems = (renderedDropdown && renderedDropdown !== "contact") ? dropdowns[renderedDropdown as DropdownKey] : [];
  const activeCopy = (renderedDropdown && renderedDropdown !== "contact") ? DROPDOWN_COPY[renderedDropdown as DropdownKey] : null;
  const panelOpen = openDropdown !== null && (openDropdown === "contact" || (dropdowns[openDropdown as DropdownKey]?.length ?? 0) > 0);
  const overlayActive = (headerHovered || panelOpen) && !menuOpen;

  // easeOutCubic — matches anduril.com
  const PANEL_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

  // Measure the inner content so we can animate height between different dropdowns and on enter/exit.
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => setPanelHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [renderedDropdown]);

  // Once the close transition finishes, drop the persisted content to free DOM.
  const handlePanelTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "height") return;
    if (!panelOpen) setRenderedDropdown(null);
  };

  return (
    <>
      {/* Backdrop blur — anduril.com pattern: blur(7px) + faint dark wash */}
      <div
        aria-hidden
        className="hidden md:block fixed inset-0 z-40"
        style={{
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(7px)",
          backgroundColor: "rgba(1,1,1,0.1)",
          opacity: overlayActive ? 1 : 0,
          pointerEvents: "none",
          transition: `opacity 0.6s ${PANEL_EASE}`,
        }}
      />
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: menuOpen || panelOpen ? "#010101" : "rgba(1,1,1,1)" }}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={handleHeaderLeave}
      >
      {/* Desktop top-nav */}
      <nav
        className="hidden md:flex items-center justify-between relative"
        style={{ zIndex: 100, padding: "1.5rem 2rem", margin: 0 }}
      >
        {/* Left wrapper — logo */}
        <div style={navStyles}>
          <Link
            href="/"
            className="flex items-center text-white no-underline"
            onClick={closeAll}
          >
            <img
              src="/logo.png"
              alt="Thunderclap Labs Logo"
              className="h-9 w-auto"
            />
          </Link>
        </div>

        {/* Center wrapper — nav links */}
        <div style={{ ...navStyles, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          {navLinks.map((link) => {
            const hasDropdown = !!link.dropdown && (link.dropdown === "contact" || (dropdowns[link.dropdown as DropdownKey]?.length ?? 0) > 0);
            return (
              <div
                key={link.href}
                onMouseEnter={() => handleEnterLink(link.dropdown)}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Link
                  href={link.href}
                  onClick={closeAll}
                  style={{
                    opacity: isActive(link.href) || (hasDropdown && openDropdown === link.dropdown) ? 1 : 0.55,
                    color: "inherit",
                    textDecoration: "none",
                    transition: "opacity 0.3s ease-out",
                  }}
                  className="hover:opacity-100"
                >
                  {link.label}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right wrapper — CTA */}
        <div
          style={navStyles}
          onMouseEnter={() => setOpenDropdown(null)}
        >
          <Link
            href="/contact"
            onClick={closeAll}
            style={{
              opacity: isActive("/contact") ? 1 : 0.55,
              color: "inherit",
              textDecoration: "none",
              transition: "opacity 0.3s ease-out",
            }}
            className="hover:opacity-100"
          >
            Partner Up
          </Link>
        </div>
      </nav>

      {/* Desktop mega dropdown — measured-height animation, anduril.com pattern */}
      <div
        className="hidden md:block"
        style={{
          height: panelOpen ? panelHeight : 0,
          overflow: "hidden",
          transition: `height 0.5s ${PANEL_EASE}, border-color 0.3s ease-out`,
          background: "#010101",
          borderTop: panelOpen ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        }}
        onTransitionEnd={handlePanelTransitionEnd}
      >
        <div ref={measureRef}>
          {/* Contact panel */}
          {renderedDropdown === "contact" && (
            <div
              className="w-full"
              style={{
                padding: "42px 2rem 56px",
                opacity: contentVisible ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease-out`,
              }}
            >
              <div className="grid grid-cols-12 gap-x-12 gap-y-16">
                {/* Left section: Info, Contact & Social */}
                <div className="col-span-6 flex flex-col justify-between" style={{ minHeight: "100px" }}>
                  <div>
                    <div
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 500,
                        letterSpacing: "0.42px",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.6)",
                        marginBottom: "16px",
                      }}
                    >
                      <ScrambleText key={`contact-tl-${scrambleKey}`} text="Thunderclap Labs" isActive duration={500} />
                    </div>
                    <p
                      style={{
                        fontSize: "14.7px",
                        lineHeight: "150%",
                        letterSpacing: "-0.126px",
                        color: "rgba(255,255,255,1)",
                        maxWidth: "50ch",
                      }}
                    >
                      Thunderclap Labs is an aerospace & atmospheric engineering startup building critical technologies across atmospheric modification, aerospace propulsion, and active defense systems.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mt-16">
                    <div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 500,
                          letterSpacing: "0.42px",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.6)",
                          marginBottom: "16px",
                        }}
                      >
                        <ScrambleText key={`contact-label-${scrambleKey}`} text="Contact" isActive duration={500} />
                      </div>
                      <a
                        href="mailto:thunderclaplabs@gmail.com"
                        style={{
                          fontSize: "14.7px",
                          letterSpacing: "-0.126px",
                          color: "#fff",
                          textDecoration: "none",
                        }}
                        className="hover:opacity-70 transition-opacity"
                      >
                        thunderclaplabs@gmail.com
                      </a>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 500,
                          letterSpacing: "0.42px",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.6)",
                          marginBottom: "16px",
                        }}
                      >
                        <ScrambleText key={`contact-social-${scrambleKey}`} text="Social" isActive duration={500} />
                      </div>
                      <div className="flex items-center gap-6">
                        {SOCIALS.map((s) => (
                          <a
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={s.label}
                            style={{
                              color: "#fff",
                              transition: "color 0.3s ease-out",
                            }}
                            className="hover:text-[#DFF140]"
                          >
                            {s.icon}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle section: Company Links */}
                <div className="col-span-3 flex flex-col gap-4" onMouseLeave={() => setHoveredContactLink(null)}>
                  <div
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 500,
                      letterSpacing: "0.42px",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.6)",
                      marginBottom: "4px",
                    }}
                  >
                    <ScrambleText key={`contact-company-${scrambleKey}`} text="Company" isActive duration={500} />
                  </div>
                  {[
                    { label: "Home", href: "/" },
                    { label: "Projects", href: "/projects" },
                    { label: "Articles", href: "/articles" },
                    { label: "Contact Us", href: "/contact" },
                  ].map((link) => {
                    const isLinkHovered = hoveredContactLink === link.href;
                    const isAnyLinkHovered = hoveredContactLink !== null;
                    return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeAll}
                      onMouseEnter={() => setHoveredContactLink(link.href)}
                      style={{
                        fontSize: "15.75px",
                        letterSpacing: "-0.154px",
                        color: "#fff",
                        textDecoration: "none",
                        opacity: isAnyLinkHovered && !isLinkHovered ? 0.3 : 1,
                        transition: "opacity 0.25s ease-out",
                      }}
                      className="flex items-center gap-3"
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          color: isLinkHovered ? "#DFF140" : "inherit",
                          opacity: isLinkHovered ? 1 : 0.5,
                          transition: "color 0.25s ease-out, opacity 0.25s ease-out",
                        }}
                      >
                        +
                      </span> {link.label}
                    </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Projects / Articles panel */}
          {activeCopy && (
          <div
            className="w-full grid grid-cols-12 gap-12"
            style={{
              padding: "42px 2rem 56px",
              opacity: contentVisible ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-out`,
            }}
          >
            {/* Left col — context */}
            <div className="col-span-4 flex flex-col justify-between">
              <div>
                <div
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 500,
                    letterSpacing: "0.42px",
                    lineHeight: "105%",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <ScrambleText key={`eyebrow-${scrambleKey}`} text={activeCopy.eyebrow} isActive duration={500} />
                </div>
                <p
                  className="mt-3 text-white/80"
                  style={{
                    fontSize: "14.7px",
                    lineHeight: "150%",
                    letterSpacing: "-0.126px",
                    maxWidth: "32ch",
                  }}
                >
                  {activeCopy.description}
                </p>
              </div>
              <Link
                href={activeCopy.viewAllHref}
                onClick={closeAll}
                className="mt-6 inline-flex items-center gap-2 text-white hover:opacity-100"
                style={{
                  opacity: 0.7,
                  fontSize: "13.132px",
                  letterSpacing: "-0.126px",
                  textDecoration: "none",
                  transition: "opacity 0.3s ease-out",
                }}
              >
                <span>{activeCopy.viewAllLabel}</span>
                <span aria-hidden>↗</span>
              </Link>
            </div>

            {/* Right col — items */}
            <div className="col-span-8 flex flex-col gap-4" onMouseLeave={() => setHoveredItem(null)}>
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 500,
                  letterSpacing: "0.42px",
                  lineHeight: "105%",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "4px",
                }}
              >
                <ScrambleText key={`featured-${scrambleKey}`} text="Featured" isActive duration={500} />
              </div>
              {activeItems.map((item) => {
                const isItemHovered = hoveredItem === item._id;
                const isAnyHovered = hoveredItem !== null;
                return (
                <Link
                  key={item._id}
                  href={`/${renderedDropdown}/${item.slug.current}`}
                  onClick={closeAll}
                  onMouseEnter={() => setHoveredItem(item._id)}
                  style={{
                    fontSize: "15.75px",
                    letterSpacing: "-0.154px",
                    color: "#fff",
                    textDecoration: "none",
                    opacity: isAnyHovered && !isItemHovered ? 0.3 : 1,
                    transition: "opacity 0.25s ease-out",
                  }}
                  className="flex items-center gap-3"
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: isItemHovered ? "#DFF140" : "inherit",
                      opacity: isItemHovered ? 1 : 0.5,
                      transition: "color 0.25s ease-out, opacity 0.25s ease-out",
                    }}
                  >
                    +
                  </span> {item.title}
                </Link>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Mobile top-nav */}
      <div
        className="md:hidden flex items-center justify-between"
        style={{ padding: "1.25rem 1.5rem" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center text-white no-underline"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src="/logo.png"
            alt="Thunderclap Labs Logo"
            className="h-8 w-auto"
          />
        </Link>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col justify-center items-center gap-1.5 w-8 h-8 cursor-pointer bg-transparent border-0 p-0"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span
            className="block w-5 h-px bg-white transition-all duration-300"
            style={{
              transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="block w-5 h-px bg-white transition-all duration-300"
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block w-5 h-px bg-white transition-all duration-300"
            style={{
              transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div
          className="md:hidden flex flex-col px-6 pb-8 pt-4 gap-6"
          style={{ background: "#010101", borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                opacity: isActive(link.href) ? 1 : 0.55,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          {/* Mobile contact info */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 500,
                  letterSpacing: "0.42px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "8px",
                }}
              >
                Contact
              </div>
              <a
                href="mailto:thunderclaplabs@gmail.com"
                style={{
                  fontSize: "14.7px",
                  letterSpacing: "-0.126px",
                  color: "rgba(255,255,255,1)",
                  textDecoration: "none",
                }}
              >
                thunderclaplabs@gmail.com
              </a>
            </div>
            
            <div>
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 500,
                  letterSpacing: "0.42px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "12px",
                }}
              >
                Social
              </div>
              <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{
                      color: "rgba(255,255,255,1)",
                      textDecoration: "none",
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
