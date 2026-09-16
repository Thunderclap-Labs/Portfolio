"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ScrambleText } from "@/components/common/scramble-text";
import {
  CAPABILITIES,
  type Capability,
  demoUrl,
  demos,
  previewUrl,
} from "@/constants/demos";

/** Filter chips share the toolbar styling used on the articles page: a hairline
 *  box that fills with the accent once selected. */
function chipClass(active: boolean) {
  return [
    "font-medium uppercase leading-none px-3 py-2 border transition-colors duration-300 cursor-pointer",
    active
      ? "border-accent text-accent bg-[rgba(223,241,64,0.12)]"
      : "border-[rgba(255,255,255,0.18)] text-[rgba(255,255,255,0.6)] hover:text-white hover:border-[rgba(255,255,255,0.45)]",
  ].join(" ");
}

function DemoCard({ slug }: { slug: (typeof demos)[number] }) {
  const [hovered, setHovered] = useState(false);
  const demo = slug;

  return (
    <article className="relative">
      <Link
        href={`/demos/${demo.slug}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="block no-underline text-white"
      >
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1600/1000" }}>
          <Image
            src={previewUrl(demo)}
            alt={`${demo.name}, ${demo.tagline}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1120px) 50vw, 33vw"
            style={{
              transition: "transform 0.7s ease-out",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(1,1,1,0.85) 0%, rgba(1,1,1,0.15) 60%, rgba(1,1,1,0) 100%)",
              transition: "opacity 0.4s ease-out",
              opacity: hovered ? 1 : 0.75,
            }}
          />

          {/* Sector marker, top-left */}
          <span
            className="absolute top-4 left-4 font-medium uppercase leading-none"
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

          {/* Accent hairline, keyed to the demo's own palette */}
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-px"
            style={{
              background: demo.accent,
              width: hovered ? "100%" : "0%",
              transition: "width 0.5s cubic-bezier(0.215,0.61,0.355,1)",
            }}
          />
        </div>

        <div className="pt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              className="m-0 text-white"
              style={{ fontSize: "21px", fontWeight: 700, letterSpacing: "-0.21px", lineHeight: "115%" }}
            >
              {demo.name}
            </h2>
            <p
              className="m-0 mt-1.5"
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
          <span
            className="shrink-0 flex items-center justify-center"
            style={{
              width: "32px",
              height: "32px",
              border: "1px solid rgba(255,255,255,0.35)",
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
          </span>
        </div>

        <p
          className="mt-3 m-0"
          style={{
            fontSize: "14.7px",
            lineHeight: "140%",
            letterSpacing: "-0.126px",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {demo.summary}
        </p>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {demo.capabilities.map((cap) => (
          <span
            key={cap}
            className="font-medium uppercase leading-none"
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.42px",
              padding: "5px 8px",
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            {cap}
          </span>
        ))}
      </div>

      <a
        href={demoUrl(demo)}
        target="_blank"
        rel="noopener noreferrer"
        className="action-link mt-4"
      >
        <span>Open the live site</span>
        <span aria-hidden>↗</span>
      </a>
    </article>
  );
}

export function DemosIndex() {
  const [filter, setFilter] = useState<Capability | "All">("All");

  const visible =
    filter === "All" ? demos : demos.filter((d) => d.capabilities.includes(filter));

  return (
    <main className="bg-bg text-white min-h-screen pb-24">
      <header className="container-content max-w-280 mx-auto pt-40 pb-16">
        <p className="font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] mb-4">
          Demos
        </p>
        <h1 className="text-[50px] lg:text-[70px] font-normal leading-[105%] tracking-[-1.4px] m-0">
          Ten Sites, Ten Briefs, Built From Scratch.
        </h1>
        <p className="mt-16 max-w-2xl text-[0.938rem] tracking-[-0.009rem] font-normal leading-[120%]">
          This is where we test ideas before they reach client work. Each one is a
          complete concept site for a different kind of business: a hardware maker, a
          festival, a type foundry, a public data service. None of them are mockups.
          Open any of them and the 3D, the configurators, the checkouts and the live
          data all work.
        </p>
      </header>

      {/* Capability filter */}
      <div className="container-content max-w-280 mx-auto pb-10">
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" className={chipClass(filter === "All")} onClick={() => setFilter("All")}>
            All ({demos.length})
          </button>
          {CAPABILITIES.map((cap) => {
            const count = demos.filter((d) => d.capabilities.includes(cap)).length;
            if (count === 0) return null;
            return (
              <button
                key={cap}
                type="button"
                className={chipClass(filter === cap)}
                onClick={() => setFilter(cap)}
              >
                {cap} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="container-content max-w-280 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
          {visible.map((demo) => (
            <DemoCard key={demo.slug} slug={demo} />
          ))}
        </div>
      </div>
    </main>
  );
}
