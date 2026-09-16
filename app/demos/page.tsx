import type { Metadata } from "next";

import { demos, previewUrl } from "@/constants/demos";

import { DemosIndex } from "./demos-index";

export const metadata: Metadata = {
  title: "Demos | Thunderclap Labs",
  description:
    "Ten concept sites built end-to-end at Thunderclap Labs — 3D product pages, configurators, checkouts, live data and booking. Every one runs in your browser.",
  alternates: { canonical: "/demos" },
  openGraph: {
    type: "website",
    title: "Demos | Thunderclap Labs",
    description:
      "Ten concept sites for ten different businesses, built here from the brief up.",
    images: [
      {
        url: previewUrl(demos[0]),
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
