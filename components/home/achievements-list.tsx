"use client";

import { useState } from "react";
import Link from "next/link";
import type { Achievement } from "@/lib/sanity/queries";

const INITIAL_COUNT = 6;

function ArrowIcon() {
  return (
    <svg className="w-[0.55rem] h-[0.55rem]" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 9L9 1M9 1H3.5M9 1V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

const CARD_CLASS =
  "group relative border-r border-b border-bg py-8 px-6 lg:px-8 flex flex-col justify-between min-h-[300px] hover:bg-bg hover:text-white transition-colors duration-300 ease-out";

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const href = achievement.relatedArticle ? `/articles/${achievement.relatedArticle.slug}` : null;

  const inner = (
    <>
      <div className="flex justify-between items-start mb-8">
        <span className="font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 group-hover:opacity-60 leading-[105%]">
          {achievement.type}
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
          {achievement.prize}
        </p>
        {href && (
          <div className="mt-6 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <span className="text-[12.25px] capitalize tracking-[-0.009rem]">Read More</span>
            <ArrowIcon />
          </div>
        )}
      </div>
    </>
  );

  if (href) {
    return <Link href={href} className={CARD_CLASS}>{inner}</Link>;
  }
  return <div className={CARD_CLASS}>{inner}</div>;
}

export function AchievementsList({ achievements }: { achievements: Achievement[] }) {
  const [open, setOpen] = useState(false);

  const initial = achievements.slice(0, INITIAL_COUNT);
  const extra = achievements.slice(INITIAL_COUNT);
  const hasExtra = extra.length > 0;

  return (
    <>
      {/* Header */}
      <div className="mb-10.5 px-4 sm:px-6 w-full">
        <span className="block font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 mb-5.25 leading-[105%]">
          Recognition
        </span>
        <h2 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px]">
          Achievements
        </h2>
      </div>

      {/* Grid */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-bg">
          {initial.map((a) => <AchievementCard key={a._key} achievement={a} />)}
        </div>

        {hasExtra && (
          <>
            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-bg">
                  {extra.map((a) => <AchievementCard key={a._key} achievement={a} />)}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8 pb-2">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open ? "true" : "false"}
                className="action-link text-bg"
              >
                {open ? "Fewer Achievements" : "More Achievements"}
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                  aria-hidden="true"
                  className={`transition-transform duration-300 ease-out ${open ? "rotate-180" : "rotate-0"}`}
                >
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
