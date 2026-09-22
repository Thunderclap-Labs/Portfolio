import { visibleDemos } from "@/constants/demos";

export interface FocusArea {
  title: string;
  description: string;
  image: string;
}

export interface StatData {
  value: string;
  title: string;
  description: string;
}

export const focusAreas: FocusArea[] = [
  {
    title: "Marketing Sites & Storefronts",
    description:
      "The public face of the business. Fast, searchable, editable by the people who own the copy, and built to sell.",
    image: "/images/dronewireframe.png",
  },
  {
    title: "3D & Interactive Product Pages",
    description:
      "Real-time product models, configurators and scroll-driven walkthroughs for products a photograph cannot explain.",
    image: "/images/rockettop.png",
  },
  {
    title: "Web Apps & Internal Tools",
    description:
      "Dashboards, booking flows and back-office tools, with the data model and the permissions thought through first.",
    image: "/images/conveyorwireframe.png",
  },
  {
    title: "Platform & Integrations",
    description:
      "CMS, payments, analytics and third-party APIs wired together, deployed on infrastructure we hand over documented.",
    image: "/images/cansatwireframe.png",
  },
];

export const statsData: StatData[] = [
  {
    value: "11",
    title: "Awards Won",
    description: "Across AI, space, defence, startup and business categories.",
  },
  {
    value: "7",
    title: "People On The Team",
    description: "Design, front-end, back-end and 3D, all in one room.",
  },
  {
    // Counted from the catalogue itself, so it cannot drift out of date.
    value: String(visibleDemos.length),
    title: "Demo Sites Live",
    description:
      "Concept builds you can open and click through in the browser, not mockups.",
  },
];
