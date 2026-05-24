import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactMethods } from "@/components/contact/contact-methods";
import { RndCtaSection } from "@/components/home/rnd-cta-section";

export const metadata: Metadata = {
  title: "Contact — Thunderclap Labs",
  description:
    "Reach Thunderclap Labs in Kaunas, Lithuania. Partnerships, press, careers, and technical inquiries — direct lines to the engineering team.",
  openGraph: {
    title: "Contact — Thunderclap Labs",
    description:
      "Reach Thunderclap Labs in Kaunas, Lithuania. Partnerships, press, careers, and technical inquiries.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactMethods />
      <RndCtaSection />
    </>
  );
}
