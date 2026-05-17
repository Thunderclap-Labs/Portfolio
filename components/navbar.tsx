"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "R&D", href: "/rnd" },
  { label: "Projects", href: "/projects" },
  { label: "Team", href: "/team" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: menuOpen ? "#010101" : "rgba(1,1,1,1)" }}
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
            onClick={() => setMenuOpen(false)}
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                opacity: pathname === link.href ? 1 : 0.55,
                color: "inherit",
                textDecoration: "none",
                transition: "opacity 0.3s ease-out",
              }}
              className="hover:opacity-100"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right wrapper — CTA */}
        <div style={navStyles}>
          <Link
            href="/contact"
            style={{
              opacity: pathname === "/contact" ? 1 : 0.55,
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
                opacity: pathname === link.href ? 1 : 0.55,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            style={{
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              opacity: pathname === "/contact" ? 1 : 0.55,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Partner Up
          </Link>
        </div>
      )}
    </header>
  );
}
