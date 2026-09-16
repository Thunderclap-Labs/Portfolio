"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ScrambleText } from "@/components/common/scramble-text";
import { type Demo, demoUrl, previewUrl } from "@/constants/demos";

/** Small uppercase section label, matching `.eyebrow` but without the opacity
 *  drop where it sits on a dark band next to body copy. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="m-0 mb-4 font-medium uppercase"
      style={{ fontSize: "10.5px", letterSpacing: "0.42px", color: "rgba(255,255,255,0.6)" }}
    >
      {children}
    </p>
  );
}

function NavCard({ demo, direction }: { demo: Demo; direction: "prev" | "next" }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/demos/${demo.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-1 no-underline text-white border border-[rgba(255,255,255,0.14)] p-6 transition-colors duration-300 hover:border-[rgba(255,255,255,0.4)]"
      style={{ textAlign: direction === "next" ? "right" : "left" }}
    >
      <Eyebrow>{direction === "next" ? "Next" : "Previous"}</Eyebrow>
      <p className="m-0" style={{ fontSize: "21px", fontWeight: 700, letterSpacing: "-0.21px" }}>
        <ScrambleText text={demo.name} isActive={hovered} />
      </p>
      <p
        className="m-0 mt-1.5"
        style={{ fontSize: "13.132px", color: "rgba(255,255,255,0.6)", letterSpacing: "-0.126px" }}
      >
        {demo.tagline}
      </p>
    </Link>
  );
}

export function DemoDetail({
  demo,
  next,
  previous,
}: {
  demo: Demo;
  next: Demo;
  previous: Demo;
}) {
  // The live site only mounts once asked for. Most of these are heavy WebGL
  // pages, so loading one on route entry would cost a lot for nothing.
  const [live, setLive] = useState(false);

  return (
    <main className="bg-bg text-white min-h-screen pb-24">
      {/* Header */}
      <header className="container-content max-w-280 mx-auto pt-40 pb-12">
        <Link href="/demos" className="action-link mb-8">
          <span aria-hidden>&larr;</span>
          <span>All demos</span>
        </Link>

        <p className="font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] mb-4">
          {demo.sector}
        </p>
        <h1 className="text-[50px] lg:text-[70px] font-normal leading-[105%] tracking-[-1.4px] m-0">
          {demo.name}
        </h1>
        <p
          className="mt-4 m-0"
          style={{ fontSize: "21px", letterSpacing: "-0.21px", color: demo.accent }}
        >
          {demo.tagline}
        </p>
        <p className="mt-12 max-w-2xl text-[0.938rem] tracking-[-0.009rem] font-normal leading-[140%]">
          {demo.summary}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-1.5">
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
      </header>

      {/* Live viewer */}
      <section className="container-content max-w-280 mx-auto pb-20">
        <div
          className="relative w-full overflow-hidden border border-[rgba(255,255,255,0.14)]"
          style={{ aspectRatio: "16/10" }}
        >
          {live ? (
            <iframe
              src={demoUrl(demo)}
              title={`${demo.name} live demo`}
              className="absolute inset-0 w-full h-full"
              style={{ border: 0, borderRadius: 0 }}
            />
          ) : (
            <>
              <Image
                src={previewUrl(demo)}
                alt={`${demo.name} preview`}
                fill
                className="object-cover"
                sizes="(max-width: 1120px) 100vw, 1120px"
                priority
              />
              <div className="absolute inset-0" style={{ background: "rgba(1,1,1,0.45)" }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <button type="button" className="btn-border-light" onClick={() => setLive(true)}>
                  <span>Run it here</span>
                  <span aria-hidden>&#9654;</span>
                </button>
                <a
                  href={demoUrl(demo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-link"
                >
                  <span>Or open it full screen</span>
                  <span aria-hidden>&#8599;</span>
                </a>
              </div>
            </>
          )}
        </div>

        {live && (
          <div className="mt-4 flex items-center justify-between">
            <button type="button" className="action-link" onClick={() => setLive(false)}>
              <span aria-hidden>&times;</span>
              <span>Close the live site</span>
            </button>
            <a
              href={demoUrl(demo)}
              target="_blank"
              rel="noopener noreferrer"
              className="action-link"
            >
              <span>Open full screen</span>
              <span aria-hidden>&#8599;</span>
            </a>
          </div>
        )}
      </section>

      {/* Brief + direction */}
      <section className="container-content max-w-280 mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <Eyebrow>The brief</Eyebrow>
            <p
              className="m-0"
              style={{ fontSize: "17px", lineHeight: "150%", letterSpacing: "-0.126px" }}
            >
              {demo.brief}
            </p>
          </div>
          <div>
            <Eyebrow>Art direction</Eyebrow>
            <p
              className="m-0"
              style={{ fontSize: "17px", lineHeight: "150%", letterSpacing: "-0.126px" }}
            >
              {demo.direction}
            </p>
          </div>
        </div>
      </section>

      {/* Palette + typefaces */}
      <section className="container-content max-w-280 mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <Eyebrow>Palette</Eyebrow>
            <div className="flex flex-wrap gap-4">
              {demo.palette.map((swatch) => (
                <div key={swatch.hex} className="flex items-center gap-3">
                  <span
                    className="block"
                    style={{
                      width: "36px",
                      height: "36px",
                      background: swatch.hex,
                      border: "1px solid rgba(255,255,255,0.18)",
                    }}
                  />
                  <span>
                    <span
                      className="block"
                      style={{ fontSize: "14.7px", letterSpacing: "-0.126px" }}
                    >
                      {swatch.name}
                    </span>
                    <span
                      className="block"
                      style={{
                        fontSize: "12.25px",
                        color: "rgba(255,255,255,0.5)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {swatch.hex}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow>Typefaces</Eyebrow>
            <ul className="m-0 p-0 list-none flex flex-col gap-2">
              {demo.typefaces.map((face) => (
                <li key={face} style={{ fontSize: "17px", letterSpacing: "-0.126px" }}>
                  {face}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it is built, absent on the sites with no 3D */}
      {demo.build && (
        <section className="container-content max-w-280 mx-auto pb-20">
          <Eyebrow>How the hard part works</Eyebrow>
          <p
            className="m-0 max-w-3xl"
            style={{ fontSize: "17px", lineHeight: "160%", letterSpacing: "-0.126px" }}
          >
            {demo.build}
          </p>
        </section>
      )}

      {/* Features */}
      <section className="container-content max-w-280 mx-auto pb-20">
        <Eyebrow>What you can do on it</Eyebrow>
        <ul className="m-0 p-0 list-none flex flex-col">
          {demo.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 py-4 border-t border-[rgba(255,255,255,0.12)] last:border-b"
              style={{ fontSize: "15.75px", lineHeight: "140%", letterSpacing: "-0.154px" }}
            >
              <span aria-hidden style={{ color: demo.accent, opacity: 0.9 }}>
                +
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Prev / next */}
      <nav className="container-content max-w-280 mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <NavCard demo={previous} direction="prev" />
          <NavCard demo={next} direction="next" />
        </div>
      </nav>
    </main>
  );
}
