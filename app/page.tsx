import { HeroSection } from "@/components/home/hero-section";
import { AboutSection } from "@/components/home/about-section";
import { AchievementsSection } from "@/components/home/achievements-section";
import { PartnersSection } from "@/components/home/partners-section";
import { ProjectsShowcaseSection } from "@/components/home/projects-showcase-section";
import { RndCtaSection } from "@/components/home/rnd-cta-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProjectsShowcaseSection />
      <AboutSection />
      <AchievementsSection />
      <PartnersSection />
      <RndCtaSection />
    </>
  );
}
