"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { featuredProjects, type FeaturedProject } from "@/constants/projects";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_/[]{}=+*^?#@&$%";

function ScrambleText({ text, isActive }: { text: string; isActive: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iterRef = useRef(0);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isActive) {
      // Do not clear the text instantly so it can gracefully fade out via CSS transition
      iterRef.current = 0;
      return;
    }

    iterRef.current = 0;

    intervalRef.current = setInterval(() => {
      iterRef.current += 0.45;
      const resolved = Math.floor(iterRef.current);

      setDisplayed(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < resolved) return char;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("")
      );

      if (resolved >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayed(text);
      }
    }, 12);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, text]);

  return <span aria-label={text}>{displayed}</span>;
}

function ProjectCard({ project }: { project: FeaturedProject }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={project.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "absolute", inset: 0, display: "block", textDecoration: "none" }}
    >
      {/* Image */}
      <Image
        src={project.image}
        alt={project.name}
        fill
        unoptimized={project.image.endsWith(".gif")}
        className="object-cover"
        style={{ transition: "transform 0.7s ease-out", transform: hovered ? "scale(1.05)" : "scale(1)" }}
        sizes="(max-width: 768px) 100vw, 33vw"
      />

      {/* Base gradient — always present */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(1,1,1,0.88) 0%, rgba(1,1,1,0.25) 55%, rgba(1,1,1,0.08) 100%)",
          transition: "opacity 0.4s ease-out",
          opacity: hovered ? 1 : 0.8,
        }}
      />

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end justify-between gap-4">
          {/* Left: name + scramble tagline */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-white m-0"
              style={{ fontSize: "21px", fontWeight: 700, letterSpacing: "-0.21px", lineHeight: "115%" }}
            >
              {project.name}
            </h3>

            {/* Scramble tagline — slides in on hover */}
            <div
              style={{
                overflow: "hidden",
                maxHeight: hovered ? "40px" : "0px",
                opacity: hovered ? 1 : 0,
                marginTop: hovered ? "6px" : "0px",
                transition: "max-height 0.35s ease-out, opacity 0.3s ease-out, margin-top 0.35s ease-out",
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
                <ScrambleText text={project.tagline} isActive={hovered} />
              </p>
            </div>
          </div>

          {/* Right: arrow button */}
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

export function ProjectsShowcaseSection() {
  return (
    <section style={{ background: "var(--color-bg)" }} className="px-4 sm:px-6 sm:pt-0 pt-4 pb-6">

      {/* Cards grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-3"
        style={{ gap: "16px" }}
      >
        {featuredProjects.map((project) => (
          <div
            key={project.id}
            style={{ aspectRatio: "878/878", position: "relative", overflow: "hidden" }}
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      {/* Mobile CTA */}
      <div
        className="sm:hidden container-content"
        style={{ paddingTop: "24px", paddingBottom: "42px" }}
      >
        <Link href="/projects" className="action-link text-white">
          See All Projects
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
