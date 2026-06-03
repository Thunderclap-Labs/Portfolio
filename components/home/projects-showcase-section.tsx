import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { getFeaturedProjectsQuery, type ProjectSummary } from "@/lib/sanity/queries";
import { ProjectCard } from "@/components/projects/project-card";

export async function ProjectsShowcaseSection() {
  let projects: ProjectSummary[] = [];
  try {
    projects = await client.fetch<ProjectSummary[]>(getFeaturedProjectsQuery, { limit: 3 });
  } catch {
    // Sanity not configured — render nothing
  }

  if (projects.length === 0) return null;

  return (
    <section style={{ background: "var(--color-bg)" }} className="px-4 sm:px-6 sm:pt-0 pt-4 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "16px" }}>
        {projects.map((project) => (
          <div
            key={project._id}
            style={{ aspectRatio: "878/878", position: "relative", overflow: "hidden" }}
          >
            <ProjectCard project={project} showHeader={false} />
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
