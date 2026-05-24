import { SOCIAL_LINKS, RESPONSE_TIME, CONTACT_ADDRESS } from "@/constants/contact";

export function ContactHero() {
  return (
    <header className="bg-bg text-white relative overflow-hidden">
      <div className="container-content max-w-280 mx-auto pt-40 pb-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 xl:col-span-7">
            <p className="font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] mb-4 opacity-60 m-0">
              Get in touch
            </p>
            <h1 className="text-[70px] font-normal leading-[105%] tracking-[-1.4px] m-0 mt-4">
              Let&apos;s build
              <br />
              what&apos;s next.
            </h1>
          </div>
          
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-start lg:items-end">
            <div className="flex flex-col gap-6 w-full lg:items-end lg:text-right">
              <div className="flex flex-col gap-2">
                <span className="font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] opacity-60 m-0">Response time</span>
                <span className="text-[0.938rem] tracking-[-0.009rem] text-white whitespace-nowrap">
                  {RESPONSE_TIME}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] opacity-60 m-0">Headquartered in</span>
                <span className="text-[0.938rem] tracking-[-0.009rem] text-white whitespace-nowrap">
                  {CONTACT_ADDRESS.city}, {CONTACT_ADDRESS.country}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between">
            <p className="max-w-2xl text-[0.938rem] tracking-[-0.009rem] font-normal leading-[120%] m-0 text-white/60">
              Whether you have a mission profile, a research collaboration, or a
              prototype that needs to fly — we&apos;re listening. Reach the team
              directly through any channel below.
            </p>
          </div>
          
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-end lg:items-end lg:text-right z-10 relative">
            <div className="flex flex-col lg:items-end gap-3 mt-auto">
              <span className="font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] opacity-60 m-0">
                Follow the build
              </span>
              <ul className="flex flex-wrap items-center justify-start lg:justify-end gap-x-6 gap-y-3 m-0 p-0">
                {SOCIAL_LINKS.map((s) => (
                  <li key={s.label} className="list-none">
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-[0.938rem] tracking-[-0.009rem] text-white/70 hover:text-white transition-colors duration-300 ease-out no-underline"
                    >
                      {s.label}
                      <svg
                        className="w-[0.55rem] h-[0.55rem] opacity-60 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 9L9 1M9 1H3.5M9 1V6.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                        />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
