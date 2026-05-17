export interface FeaturedProject {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  categories: string[];
  active: boolean;
  href: string;
}

export const featuredProjects: FeaturedProject[] = [
  {
    id: "thundereye",
    name: "Thunder Eye",
    tagline: "See Everything. Miss Nothing.",
    description:
      "Passive optical voxel tracking for real-time 3D airspace intelligence. GPS-independent counter-drone system for GPS-denied environments.",
    image: "/images/projects/tcl.gif",
    categories: ["AI", "Defense", "Hardware"],
    active: true,
    href: "/projects",
  },
  {
    id: "cloudseeding",
    name: "Cloud Seeding",
    tagline: "Engineering the Rain.",
    description:
      "Drone and rocket-based weather modification systems for enhanced precipitation, drought combat, and water resource management.",
    image: "/images/projects/cloudseeding.png",
    categories: ["Aerospace", "Atmospheric", "Hardware"],
    active: true,
    href: "/cloud-seeding",
  },
  {
    id: "rocket",
    name: "Propulsion & Rocket Fuel",
    tagline: "Burn Brighter. Fly Further.",
    description:
      "End-to-end design, simulation, and manufacturing of advanced reusable rocket systems with proprietary propellant development.",
    image: "/images/projects/fwd.png",
    categories: ["Aerospace", "Chemistry", "Research"],
    active: true,
    href: "/projects",
  },
];
