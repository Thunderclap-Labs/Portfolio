import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  CONTACT_ADDRESS,
} from "@/constants/contact";

type Method = {
  eyebrow: string;
  title: string;
  description: string;
  value: string;
  href: string;
  external?: boolean;
  accent?: boolean;
  cta: string;
};

const METHODS: Method[] = [
  {
    eyebrow: "Direct",
    title: "Email the team",
    description:
      "For partnerships, press, careers, or anything technical. We read every message.",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    accent: true,
    cta: "Write to us",
  },
  {
    eyebrow: "Voice",
    title: "Call the studio",
    description:
      "Prefer to talk it through? Reach us during office hours, Mon — Fri.",
    value: CONTACT_PHONE,
    href: `tel:${CONTACT_PHONE_HREF}`,
    cta: "Place a call",
  },
  {
    eyebrow: "In person",
    title: "Visit us in Kaunas",
    description:
      "Drop by the workshop. Coordinate ahead — we'd hate to be out in the field when you arrive.",
    value: `${CONTACT_ADDRESS.street}, ${CONTACT_ADDRESS.city}`,
    href: CONTACT_ADDRESS.mapsUrl,
    external: true,
    cta: "Open in Maps",
  },
];

function ArrowIcon() {
  return (
    <svg
      className="w-[0.55rem] h-[0.55rem] transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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
  );
}

export function ContactMethods() {
  return (
    <section
      id="contact-methods"
      className="bg-bg text-white border-t border-white/10"
    >
      <div className="container-content max-w-280 mx-auto pt-16 md:pt-20 pb-4">
        <div className="mb-10 flex items-end justify-between gap-6 flex-wrap">
          <div className="flex flex-col gap-4">
            <span className="eyebrow text-white/60">Channels</span>
            <h2 className="section-heading text-white">
              Three ways to reach us.
            </h2>
          </div>
          <p className="text-[14.7px] tracking-[-0.126px] text-white/50 max-w-sm">
            Pick whichever fits. All routes land with the same small team.
          </p>
        </div>
      </div>

      <div className="container-content max-w-280 mx-auto pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-white/15">
          {METHODS.map((method) => {
            const isVisit = method.eyebrow === "In person";
            const Inner = (
              <>
                <div className="flex justify-between items-start mb-8">
                  <span className="font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 leading-[105%]">
                    {method.eyebrow}
                  </span>
                  <span className="text-[10.5px] uppercase tracking-[0.42px] opacity-40 leading-[105%]">
                    0{METHODS.indexOf(method) + 1}
                  </span>
                </div>

                <div className="flex flex-col gap-5">
                  <h3 className="text-[21px] font-bold leading-[115%] tracking-[-0.21px]">
                    {method.title}
                  </h3>
                  <p className="text-[14.7px] leading-[120%] tracking-[-0.126px] text-white/60">
                    {method.description}
                  </p>

                  <span
                    className={
                      method.accent
                        ? "text-[14.7px] leading-[120%] tracking-[-0.126px] text-accent break-all"
                        : "text-[14.7px] leading-[120%] tracking-[-0.126px] text-white break-all"
                    }
                  >
                    {method.value}
                  </span>

                  <div className="mt-2 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="text-[12.25px] capitalize tracking-[-0.009rem]">
                      {method.cta}
                    </span>
                    <ArrowIcon />
                  </div>
                </div>
              </>
            );

            const commonClass =
              "group relative border-r border-b border-white/15 py-10 px-6 lg:px-8 flex flex-col justify-between min-h-[340px] transition-colors duration-300 ease-out hover:bg-white/3 focus-visible:outline-1 focus-visible:outline-white focus-visible:-outline-offset-2";

            if (isVisit) {
              return (
                <a
                  key={method.title}
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${method.title} — opens Google Maps in a new tab`}
                  className={commonClass}
                >
                  <address className="not-italic contents">{Inner}</address>
                </a>
              );
            }

            return (
              <a
                key={method.title}
                href={method.href}
                aria-label={method.title}
                className={commonClass}
                {...(method.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {Inner}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
