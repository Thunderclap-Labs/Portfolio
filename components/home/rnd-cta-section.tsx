import Link from "next/link";

export function RndCtaSection() {
  return (
    <section className="py-[84px]" style={{ background: "var(--color-bg)" }}>
      <div className="container-content">
        <div className="flex flex-col items-center text-center gap-6 max-w-[640px] mx-auto">
          <span className="eyebrow text-white">R&amp;D Services</span>

          <h2
            className="text-white m-0"
            style={{ fontSize: "clamp(28px, 4vw, 45px)", fontWeight: 700, letterSpacing: "-0.7px", lineHeight: "115%" }}
          >
            Become Our R&amp;D Partner
          </h2>

          <p className="m-0 body-text" style={{ color: "var(--color-text-muted)", maxWidth: "480px" }}>
            We partner with companies and institutions for rapid prototyping,
            systems engineering, and testing & validation across aerospace,
            chemistry, and defense technologies.
          </p>

          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            <Link href="/contact" className="btn-border-light">
              Partner Up
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/rnd" className="action-link text-white" style={{ opacity: 0.55 }}>
              Learn More
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Capabilities row */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-px mt-16 bg-[rgba(255,255,255,0.08)]"
        >
          {[
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
          ].map((cap) => (
            <div
              key={cap.title}
              className="flex flex-col gap-3 p-8"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <h3
                className="text-white m-0"
                style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.21px" }}
              >
                {cap.title}
              </h3>
              <p className="m-0 body-text" style={{ color: "var(--color-text-muted)" }}>
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
