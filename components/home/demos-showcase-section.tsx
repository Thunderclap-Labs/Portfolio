"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ScrambleText } from "@/components/common/scramble-text";
import { type Demo, previewUrl, visibleDemos } from "@/constants/demos";

/** The three that open the home page. Front of the list in `constants/demos`,
 *  so reordering there reorders the montage. */
const FEATURED = visibleDemos.slice(0, 3);

function DemoShowcaseCard({ demo }: { demo: Demo }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/demos/${demo.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="block absolute inset-0 no-underline"
    >
      <Image
        src={previewUrl(demo)}
        alt={`${demo.name}, ${demo.tagline}`}
        fill
        className="object-cover"
        style={{
          transition: "transform 0.7s ease-out",
          transform: hovered ? "scale(1.05)" : "scale(1)",
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1120px) 50vw, 33vw"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(1,1,1,0.88) 0%, rgba(1,1,1,0.25) 55%, rgba(1,1,1,0.08) 100%)",
          transition: "opacity 0.4s ease-out",
          opacity: hovered ? 1 : 0.8,
        }}
      />

      {/* Who it was built for */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-start justify-end">
        <span
          className="font-medium uppercase leading-none"
          style={{
            fontSize: "10.5px",
            letterSpacing: "0.42px",
            padding: "5px 8px",
            color: "rgba(255,255,255,0.85)",
            background: "rgba(1,1,1,0.35)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          {demo.sector}
        </span>
      </div>

      {/* The demo's own accent, drawn in on hover */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-px"
        style={{
          background: demo.accent,
          width: hovered ? "100%" : "0%",
          transition: "width 0.5s cubic-bezier(0.215,0.61,0.355,1)",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3
              className="text-white m-0"
              style={{
                fontSize: "21px",
                fontWeight: 700,
                letterSpacing: "-0.21px",
                lineHeight: "115%",
              }}
            >
              {demo.name}
            </h3>

            <div
              style={{
                overflow: "hidden",
                maxHeight: hovered ? "40px" : "0px",
                opacity: hovered ? 1 : 0,
                marginTop: hovered ? "6px" : "0px",
                transition:
                  "max-height 0.35s ease-out, opacity 0.3s ease-out, margin-top 0.35s ease-out",
              }}
            >
              <p
                className="m-0"
                style={{
                  fontSize: "13.132px",
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: "-0.126px",
                  lineHeight: "120%",
                }}
              >
                <ScrambleText text={demo.tagline} isActive={hovered} />
              </p>
            </div>
          </div>

          <div
            style={{
              width: "32px",
              height: "32px",
              border: "1px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "opacity 0.3s ease-out, transform 0.35s ease-out",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateY(0px)" : "translateY(6px)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path
                d="M1 9L9 1M9 1H3M9 1V7"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DemosShowcaseSection() {
  if (FEATURED.length === 0) return null;

  return (
    <section
      style={{ background: "var(--color-bg)" }}
      className="px-4 sm:px-6 sm:pt-0 pt-4 pb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "16px" }}>
        {FEATURED.map((demo) => (
          <div
            key={demo.slug}
            style={{ aspectRatio: "878/878", position: "relative", overflow: "hidden" }}
          >
            <DemoShowcaseCard demo={demo} />
          </div>
        ))}
      </div>

      {/* Mobile CTA */}
      <div
        className="sm:hidden container-content"
        style={{ paddingTop: "24px", paddingBottom: "42px" }}
      >
        <Link href="/demos" className="action-link text-white">
          See All Demos
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M1 9L9 1M9 1H3M9 1V7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
