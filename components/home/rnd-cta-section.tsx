import Link from "next/link";

const CAPABILITIES = [
  {
    title: "Rapid Prototyping",
    desc: "Fast turnaround from concept to functional prototype using CNC, 3D printing, and custom electronics.",
  },
  {
    title: "Systems Engineering",
    desc: "End-to-end system design, integration, and optimization across hardware and software.",
  },
  {
    title: "Testing & Validation",
    desc: "Rigorous testing protocols for aerospace components, propellants, and electronic systems.",
  },
];

export function RndCtaSection() {
  return (
    <section className="bg-bg text-white border-t border-white/10">
      <div className="container-content max-w-280 mx-auto px-6">
        {/* Top: editorial split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-white/15">
          <div className="py-10.5 md:py-16 md:border-r border-white/15 flex flex-col justify-between gap-10 md:pr-8">
            <div>
              <span className="block font-medium text-[10.5px] uppercase tracking-[0.42px] text-white/60 mb-5 leading-[105%]">
                R&amp;D Services
              </span>
              <h2 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px] text-white">
                Become Our R&amp;D Partner.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 bg-white text-bg px-7 py-4 text-[14.7px] tracking-[-0.126px] outline-1 outline-white transition-colors duration-300 ease-out hover:bg-transparent hover:text-white"
              >
                Partner Up
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
                >
                  <path
                    d="M1 9L9 1M9 1H3M9 1V7"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="square"
                  />
                </svg>
              </Link>
              <Link
                href="/rnd"
                className="group inline-flex items-center gap-2 text-[14.7px] tracking-[-0.126px] text-white/60 hover:text-white transition-colors duration-300 ease-out"
              >
                Learn More
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  <path
                    d="M1 9L9 1M9 1H3M9 1V7"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="square"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="py-10.5 md:py-16 flex flex-col justify-end md:pl-8">
            <div className="flex flex-col gap-6 max-w-xl">
              <p className="text-[14.7px] leading-[120%] tracking-[-0.126px] text-white/80">
                We partner with companies and institutions for rapid prototyping,
                systems engineering, and testing &amp; validation across
                aerospace, chemistry, and defense technologies.
              </p>
              <p className="text-[14.7px] leading-[120%] tracking-[-0.126px] text-white/40">
                From early concept to flight-ready hardware — bring us the
                problem, leave with the solution.
              </p>
            </div>
          </div>
        </div>

        {/* Capabilities — numbered process steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {CAPABILITIES.map((cap, index) => (
            <div
              key={cap.title}
              className="group relative py-10 md:py-12 md:border-r last:border-r-0 border-white/15 transition-colors duration-300 ease-out hover:bg-white/3 md:px-8 first:pl-0 last:pr-0"
            >
              <div className="flex items-baseline justify-between mb-8">
                <span className="text-[42px] leading-[100%] tracking-[-1px] font-normal text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-medium text-[10.5px] uppercase tracking-[0.42px] text-white/40 leading-[105%]">
                  Capability
                </span>
              </div>
              <div className="h-px w-12 bg-white/30 transition-all duration-300 ease-out group-hover:w-20 group-hover:bg-white/70 mb-5" />
              <h3 className="text-[14.7px] font-bold leading-[115%] tracking-[-0.126px] text-white mb-3">
                {cap.title}
              </h3>
              <p className="text-[14.7px] leading-[120%] tracking-[-0.126px] text-white/50">
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
