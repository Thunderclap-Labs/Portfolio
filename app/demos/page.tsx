import type { Metadata } from "next";

import { previewUrl, visibleDemos } from "@/constants/demos";

import { DemosIndex } from "./demos-index";

export const metadata: Metadata = {
  title: "Demos | Thunderclap Labs",
  description:
    "Concept sites built start to finish at Thunderclap Labs. 3D product pages, configurators, checkouts, live data and booking, all running in your browser.",
  alternates: { canonical: "/demos" },
  openGraph: {
    type: "website",
    title: "Demos | Thunderclap Labs",
    description:
      "Concept sites for very different businesses, built here from the brief up.",
    images: [
      {
        url: previewUrl(visibleDemos[0]),
        width: 1600,
        height: 1000,
        alt: "Thunderclap Labs demos",
      },
    ],
  },
};

export default function DemosPage() {
  return <DemosIndex />;
}
