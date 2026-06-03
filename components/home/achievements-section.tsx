import { client } from "@/lib/sanity/client";
import { getAchievementsQuery, type Achievement } from "@/lib/sanity/queries";
import { AchievementsList } from "@/components/home/achievements-list";

export async function AchievementsSection() {
  let achievements: Achievement[] = [];
  try {
    achievements = (await client.fetch<Achievement[] | null>(getAchievementsQuery)) ?? [];
  } catch {
    // Sanity not configured — section is hidden
  }

  if (achievements.length === 0) return null;

  return (
    <section className="bg-bg-news text-bg py-10.5">
      <div className="w-full">
        <AchievementsList achievements={achievements} />
      </div>
    </section>
  );
}
