"use client";

import Link from "next/link";
import { useState } from "react";

export function HeroSection() {
  const [hasHoveredOff, setHasHoveredOff] = useState(false);

  // Before first hover-off: content is always visible.
  // After first hover-off: hidden by default, shown on hover (original behaviour).
  const overlayClass = hasHoveredOff
    ? "absolute inset-0 bg-[rgba(1,1,1,0.26)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
    : "absolute inset-0 bg-[rgba(1,1,1,0.26)] opacity-100 pointer-events-none transition-opacity duration-500";

  const contentClass = hasHoveredOff
    ? "relative z-10 flex flex-col items-center gap-6 text-center px-8 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-500"
    : "relative z-10 flex flex-col items-center gap-6 text-center px-8 opacity-100 pointer-events-auto transition-opacity duration-500";

  return (
    <section className="relative w-full h-[calc(100svh-40px)] min-h-120 overflow-hidden p-4 sm:p-6 pb-0">
      <div className="relative w-full h-full overflow-hidden">
        {/* Video — always full opacity */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/rnd-bg.mp4"
          aria-hidden="true"
        />

        {/* Hover zone — covers the full video area; triggers overlay + content */}
        <div
          className="group absolute inset-0 flex items-center justify-center"
          onMouseLeave={() => setHasHoveredOff(true)}
        >
          {/* Dark overlay */}
          <div className={overlayClass} />

          {/* Content */}
          <div className={contentClass}>
            <h1 className="text-white m-0 font-bold leading-[105%] tracking-[-1.4px] uppercase text-[clamp(42px,7vw,70px)]">
              Engineering
              <br />
              The Future
            </h1>

            {/* Tag row */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="eyebrow text-white opacity-80">Aerospace</span>
              <span className="w-px h-3 bg-white opacity-40" aria-hidden="true" />
              <span className="eyebrow text-white opacity-80">Atmospheric Tech</span>
              <span className="w-px h-3 bg-white opacity-40" aria-hidden="true" />
              <span className="eyebrow text-white opacity-80">Defense Systems</span>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <Link href="/projects" className="btn-border-light">
                Explore Projects
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path
                    d="M1 9L9 1M9 1H3M9 1V7"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link href="/contact" className="btn-border-light opacity-[0.65]">
                Partner Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
