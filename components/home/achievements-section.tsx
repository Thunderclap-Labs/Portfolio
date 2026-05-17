import Link from "next/link";

const ACHIEVEMENTS = [
  {
    title: "ActInSpace 2026",
    subtitle: "ESA Technology Transfer Prize",
    category: "Hackathon",
    year: "2026",
    link: "#",
  },
  {
    title: "NASA Space Apps Challenge",
    subtitle: "Official Global Nominee",
    category: "Competition",
    year: "2025",
    link: "#",
  },
  {
    title: "EUDIS Hackathon",
    subtitle: "Winner - €5,000",
    category: "Hackathon",
    year: "2025",
    link: "#",
  },
  {
    title: "Kaunas Startup Awards",
    subtitle: "Newcomer of the Year & Public's Favourite",
    category: "Awards",
    year: "2025",
    link: "#",
  },
  {
    title: "Kickstart Lab",
    subtitle: "Winner - €5,000",
    category: "Competition",
    year: "2025",
    link: "#",
  },
  {
    title: "Jaunaragiai",
    subtitle: "Competition Winner - €1,000",
    category: "Competition",
    year: "2025",
    link: "#",
  },
];

export function AchievementsSection() {
  return (
    <section className="bg-bg-inverse text-bg pt-10.5 border-b border-bg">
      <div className="w-full">
        <div className="mb-10.5 px-4 sm:px-6 w-full">
          <span className="block font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 mb-5.25 leading-[105%]">
            Recognition
          </span>
          <h2 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px]">
            Achievements
          </h2>
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-bg">
            {ACHIEVEMENTS.map((achievement, index) => (
              <Link
                key={index}
                href={achievement.link}
                className="group relative border-r border-b border-bg py-8 px-6 lg:px-8 flex flex-col justify-between min-h-[300px] hover:bg-bg hover:text-white transition-colors duration-300 ease-out"
              >
              <div className="flex justify-between items-start mb-8">
                <span className="font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 group-hover:opacity-60 leading-[105%]">
                  {achievement.category}
                </span>
                <span className="text-[14.7px] tracking-[-0.126px] opacity-60 group-hover:opacity-60">
                  {achievement.year}
                </span>
              </div>
              
              <div>
                <h3 className="text-[21px] font-bold leading-[115%] tracking-[-0.21px] mb-2">
                  {achievement.title}
                </h3>
                <p className="text-[14.7px] leading-[120%] tracking-[-0.126px] opacity-80 group-hover:opacity-80">
                  {achievement.subtitle}
                </p>
                <div className="mt-6 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="text-[12.25px] capitalize tracking-[-0.009rem]">Read More</span>
                  <svg className="w-[0.55rem] h-[0.55rem]" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 9L9 1M9 1H3.5M9 1V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}