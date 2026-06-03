"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV_LINKS } from "@/constants/nav";
import { SOCIALS } from "@/constants/socials";

type ColumnKey = "pages" | "connect";

const EYEBROW_CLASS =
  "block font-medium text-[10.5px] uppercase tracking-[0.42px] leading-[105%] text-white/60";

const LINK_BASE: React.CSSProperties = {
  fontSize: "15.75px",
  letterSpacing: "-0.154px",
  lineHeight: "120%",
  color: "#fff",
  textDecoration: "none",
  transition: "opacity 0.25s ease-out",
};

interface PlusLinkProps {
  href: string;
  label: string;
  hovered: boolean;
  anyHovered: boolean;
  external?: boolean;
  onEnter: () => void;
}

function PlusLink({
  href,
  label,
  hovered,
  anyHovered,
  external,
  onEnter,
}: PlusLinkProps) {
  const sharedStyle: React.CSSProperties = {
    ...LINK_BASE,
    opacity: anyHovered && !hovered ? 0.3 : 1,
  };

  const inner = (
    <>
      <span
        style={{
          fontSize: "14px",
          color: hovered ? "#DFF140" : "inherit",
          opacity: hovered ? 1 : 0.5,
          transition: "color 0.25s ease-out, opacity 0.25s ease-out",
        }}
      >
        +
      </span>
      {label}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={onEnter}
        style={sharedStyle}
        className="flex items-center gap-3"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onMouseEnter={onEnter}
      style={sharedStyle}
      className="flex items-center gap-3"
    >
      {inner}
    </Link>
  );
}

export function Footer() {
  const [hoveredCol, setHoveredCol] = useState<ColumnKey | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const year = new Date().getFullYear();

  const handleEnter = (col: ColumnKey, key: string) => {
    setHoveredCol(col);
    setHoveredKey(key);
  };

  const handleColLeave = () => {
    setHoveredCol(null);
    setHoveredKey(null);
  };

  return (
    <footer
      className="bg-bg text-white"
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="container-content max-w-280 mx-auto">
        {/* Single section: CTA + columns + location, with legal row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-x-12 py-12 md:py-20">
          {/* CTA / brand */}
          <div className="md:col-span-5 flex flex-col gap-7">
            <span className={EYEBROW_CLASS}>Get In Touch</span>
            <h2
              className="text-white font-normal"
              style={{
                fontSize: "clamp(34px, 3.5vw, 48px)",
                lineHeight: "100%",
                letterSpacing: "-1.1px",
              }}
            >
              Let&apos;s build the
              <br />
              future, together.
            </h2>

            <div className="flex flex-wrap items-center gap-6 mt-2">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 bg-white text-bg px-7 py-4 text-[14.7px] tracking-[-0.126px] outline-1 outline-white transition-colors duration-300 ease-out hover:bg-transparent hover:text-white"
              >
                Partner Up
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
                >
                  <path
                    d="M1 9L9 1M9 1H3M9 1V7"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="square"
                  />
                </svg>
              </Link>
              <a
                href="mailto:thunderclaplabs@gmail.com"
                className="group inline-flex items-center gap-2 text-[14.7px] tracking-[-0.126px] text-white/60 hover:text-white transition-colors duration-300 ease-out"
              >
                thunderclaplabs@gmail.com
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  <path
                    d="M1 9L9 1M9 1H3M9 1V7"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="square"
                  />
                </svg>
              </a>
            </div>

            <div className="mt-4">
              <span className={EYEBROW_CLASS}>Located</span>
              <p
                className="text-white/80 mt-3"
                style={{
                  fontSize: "14.7px",
                  letterSpacing: "-0.126px",
                  lineHeight: "150%",
                }}
              >
                Kaunas, Lithuania
              </p>
            </div>
          </div>

          {/* Right half — link columns on top, brand stamp anchoring the bottom */}
          <div className="md:col-span-7 flex flex-col justify-between gap-12">
            <div className="grid grid-cols-2 gap-x-12 gap-y-12">
              {/* Pages */}
              <div
                className="flex flex-col gap-4"
                onMouseLeave={handleColLeave}
              >
                <span className={EYEBROW_CLASS}>Pages</span>
                {NAV_LINKS.map((item) => (
                  <PlusLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    hovered={hoveredCol === "pages" && hoveredKey === item.href}
                    anyHovered={hoveredCol === "pages"}
                    onEnter={() => handleEnter("pages", item.href)}
                  />
                ))}
              </div>

              {/* Connect / socials */}
              <div
                className="flex flex-col gap-4"
                onMouseLeave={handleColLeave}
              >
                <span className={EYEBROW_CLASS}>Connect</span>
                {SOCIALS.map((item) => (
                  <PlusLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    external
                    hovered={hoveredCol === "connect" && hoveredKey === item.href}
                    anyHovered={hoveredCol === "connect"}
                    onEnter={() => handleEnter("connect", item.href)}
                  />
                ))}
              </div>
            </div>

            {/* Brand stamp — fills bottom-right void */}
            <div
              aria-hidden
              className="select-none pointer-events-none overflow-hidden"
            >
              <div className="flex items-end justify-between gap-6">
                <span
                  className={EYEBROW_CLASS}
                  style={{ flexShrink: 0, paddingBottom: "10px" }}
                >
                  Est. 2024
                </span>
                <span
                  className="text-white"
                  style={{
                    fontSize: "clamp(56px, 9vw, 132px)",
                    fontWeight: 700,
                    lineHeight: "90%",
                    letterSpacing: "-0.04em",
                    opacity: 0.08,
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                  }}
                >
                  Thunderclap
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal bar */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 py-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span
              style={{
                fontSize: "10.5px",
                letterSpacing: "0.42px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              © {year} Thunderclap Labs
            </span>
            <span
              style={{
                fontSize: "10.5px",
                letterSpacing: "0.42px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              All Rights Reserved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              style={{
                width: "6px",
                height: "6px",
                background: "#DFF140",
                display: "inline-block",
                boxShadow: "0 0 10px rgba(223, 241, 64, 0.6)",
              }}
            />
            <span
              style={{
                fontSize: "10.5px",
                letterSpacing: "0.42px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Online · Kaunas, LT
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
