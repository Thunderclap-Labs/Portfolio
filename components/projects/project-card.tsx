"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/image";
import type { ProjectSummary, ProjectStatus } from "@/lib/sanity/queries";
import { ScrambleText } from "@/components/common/scramble-text";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  "in-development": "In Development",
  concept: "Concept",
  archived: "Archived",
};

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const [hovered, setHovered] = useState(false);

  const imageUrl = project.mainImage
    ? urlFor(project.mainImage).width(900).height(900).fit("crop").url()
    : null;
  const altText = project.mainImage?.alt ?? project.title;
  const statusLabel = STATUS_LABELS[project.status] ?? project.status;

  return (
    <Link
      href={`/projects/${project.slug.current}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="block absolute inset-0 no-underline"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={altText}
          fill
          className="object-cover"
          style={{
            transition: "transform 0.7s ease-out",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1120px) 50vw, 33vw"
        />
      )}

      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(1,1,1,0.88) 0%, rgba(1,1,1,0.25) 55%, rgba(1,1,1,0.08) 100%)",
          transition: "opacity 0.4s ease-out",
          opacity: hovered ? 1 : 0.8,
        }}
      />

      {/* Top-left: status + categories */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="font-medium uppercase leading-none"
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.42px",
              padding: "5px 8px",
              border: "1px solid rgba(255,255,255,0.5)",
              color: "#ffffff",
              background: project.status === "active" ? "rgba(223,241,64,0.18)" : "transparent",
              borderColor:
                project.status === "active"
                  ? "var(--color-accent)"
                  : "rgba(255,255,255,0.45)",
            }}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5 max-w-[60%]">
          {project.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
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
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom content */}
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
              {project.title}
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
                <ScrambleText text={project.tagline} isActive={hovered} />
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
