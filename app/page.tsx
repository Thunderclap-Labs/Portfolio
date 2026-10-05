import { HeroSection } from "@/components/home/hero-section";
import { AboutSection } from "@/components/home/about-section";
import { AchievementsSection } from "@/components/home/achievements-section";
import { ByTheNumbersSection } from "@/components/home/by-the-numbers-section";
import { PartnersSection } from "@/components/home/partners-section";
import { DemosShowcaseSection } from "@/components/home/demos-showcase-section";
import { RndCtaSection } from "@/components/home/rnd-cta-section";
import { NewsSection } from "@/components/home/news-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <DemosShowcaseSection />
      <AboutSection />
      <AchievementsSection />
      <ByTheNumbersSection />
      <NewsSection />
      <RndCtaSection />
      <PartnersSection />
    </>
  );
}
