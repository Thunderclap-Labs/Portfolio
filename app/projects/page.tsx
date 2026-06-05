import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import { getAllProjectsQuery, type ProjectSummary } from "@/lib/sanity/queries";
import { ProjectCard } from "@/components/projects/project-card";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Projects | Thunderclap Labs",
  description:
    "Critical technologies engineered by Thunderclap Labs — atmospheric modification, propulsion, defense, and satellite systems.",
};

export default async function ProjectsPage() {
  let projects: ProjectSummary[] = [];
  try {
    projects = await client.fetch<ProjectSummary[]>(getAllProjectsQuery);
  } catch {
    // Sanity not configured — show empty state
  }

  return (
    <main className="bg-bg text-white min-h-screen pb-12">
      {/* Page header */}
      <header className="container-content max-w-280 mx-auto pt-40 pb-16">
        <p className="font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] mb-4">
          Projects
        </p>
        <h1 className="text-[50px] lg:text-[70px] font-normal leading-[105%] tracking-[-1.4px] m-0">
          Critical Technologies, Built In-House.
        </h1>
        <p className="mt-16 max-w-2xl text-[0.938rem] tracking-[-0.009rem] font-normal leading-[120%]">
          From atmospheric modification to propulsion, defense, and satellite systems — every
          program below is engineered end-to-end by our team in Kaunas.
        </p>
      </header>

      <div className="px-4 sm:px-6">
        {projects.length === 0 ? (
          <div className="container-content max-w-280 mx-auto py-24 text-center">
            <p className="text-[14.7px] tracking-[-0.126px] leading-[120%] py-16 opacity-50">
              No projects published yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="relative overflow-hidden"
                style={{ aspectRatio: "878/878" }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
