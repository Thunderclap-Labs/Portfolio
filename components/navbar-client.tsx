"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { NavbarItem } from "@/lib/sanity/queries";
import { ScrambleText } from "@/components/common/scramble-text";
import { NAV_LINKS } from "@/constants/nav";
import { SOCIALS } from "@/constants/socials";

type DropdownKey = "projects" | "articles";
type PanelKey = DropdownKey | "contact";

interface NavLink {
  label: string;
  href: string;
  dropdown?: PanelKey;
}

const navLinks: NavLink[] = [
  ...NAV_LINKS.map((link) => ({
    ...link,
    dropdown:
      link.href === "/articles"
        ? ("articles" as PanelKey)
        : link.href === "/projects"
          ? ("projects" as PanelKey)
          : link.href === "/contact"
            ? ("contact" as PanelKey)
            : undefined,
  })),
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
  const [mobilePanelHeight, setMobilePanelHeight] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredContactLink, setHoveredContactLink] = useState<string | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const mobileMeasureRef = useRef<HTMLDivElement | null>(null);

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

  useLayoutEffect(() => {
    const el = mobileMeasureRef.current;
    if (!el) return;
    const update = () => setMobilePanelHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
                  className="mt-3 text-white"
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
      <div
        className="md:hidden"
        style={{
          height: menuOpen ? mobilePanelHeight : 0,
          overflow: "hidden",
          transition: `height 0.4s ${PANEL_EASE}, border-color 0.3s ease-out`,
          background: "#010101",
          borderTop: menuOpen ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
        }}
      >
        <div 
          ref={mobileMeasureRef}
          className="flex flex-col px-6 pb-8 pt-4 gap-6" 
          style={{ pointerEvents: menuOpen ? "auto" : "none" }}
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
      </div>
    </header>
    </>
  );
}
