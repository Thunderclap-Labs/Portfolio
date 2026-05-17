import { statsData } from "@/constants/home-page";

export function StatsSection() {
  return (
    <section
      className="py-[42px]"
      style={{ background: "var(--color-bg-inverse)", color: "var(--color-text-inverse)" }}
    >
      <div className="container-content">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgba(1,1,1,0.12)]">
          {statsData.map((stat) => (
            <div
              key={stat.title}
              className="flex flex-col gap-2 p-10"
              style={{ background: "var(--color-bg-inverse)" }}
            >
              <span
                style={{
                  fontSize: "56px",
                  fontWeight: 400,
                  lineHeight: "105%",
                  letterSpacing: "-1px",
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: "21px",
                  fontWeight: 700,
                  letterSpacing: "-0.21px",
                  lineHeight: "115%",
                }}
              >
                {stat.title}
              </span>
              <p
                className="m-0 body-text"
                style={{ color: "rgba(1,1,1,0.5)" }}
              >
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
