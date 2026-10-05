import type { ReactNode } from "react";

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

/** Shared shell for the privacy and terms pages: the same hero and measure as
 *  the rest of the site, with the body held to a readable column. */
export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: LegalPageProps) {
  return (
    <main className="bg-bg text-white min-h-screen pb-24">
      <header className="container-content max-w-280 mx-auto pt-40 pb-12">
        <p className="eyebrow text-white/60 mb-4">{eyebrow}</p>
        <h1 className="text-[40px] lg:text-[70px] font-normal leading-[105%] tracking-[-1.4px] m-0">
          {title}
        </h1>
        <p className="mt-10 max-w-2xl text-[14.7px] leading-[150%] tracking-[-0.126px] text-white/70">
          {intro}
        </p>
        <p className="mt-6 font-medium text-[10.5px] uppercase tracking-[0.42px] text-white/45">
          Last updated {updated}
        </p>
      </header>

      <div className="container-content max-w-280 mx-auto">
        <div className="max-w-3xl border-t border-white/15">
          {sections.map((section, i) => (
            <section
              key={section.heading}
              className="border-b border-white/15 py-10 grid grid-cols-1 md:grid-cols-[3rem_1fr] gap-x-6 gap-y-4"
            >
              <span className="font-medium text-[10.5px] uppercase tracking-[0.42px] text-white/40 leading-[105%] md:pt-1.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-[21px] font-bold leading-[115%] tracking-[-0.21px] m-0 mb-4">
                  {section.heading}
                </h2>
                <div className="flex flex-col gap-4 text-[14.7px] leading-[150%] tracking-[-0.126px] text-white/70 [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_strong]:text-white [&_strong]:font-medium">
                  {section.body}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
