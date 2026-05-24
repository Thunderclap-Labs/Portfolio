import { statsData } from "@/constants/home-page";

export function ByTheNumbersSection() {
  return (
    <section className="bg-bg text-white py-10.5">
      <div className="container-content max-w-280 mx-auto">
        <div className="mb-10.5">
          <span className="block font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 mb-5 leading-[105%]">
            By the Numbers
          </span>
          <h2 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px]">
            What Drives Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-white/15">
          {statsData.map((stat, index) => (
            <div
              key={stat.title}
              className="group relative border-r border-b border-white/15 py-10 px-6 flex flex-col justify-between min-h-64 transition-all duration-300 ease-out hover:bg-white/3 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]"
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 leading-[105%]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="mt-8">
                <span className="block font-normal leading-none text-[56px] tracking-[-1.4px]">
                  {stat.value}
                </span>
                <div className="mt-5 h-px w-12 bg-white/30 transition-all duration-300 ease-out group-hover:w-20 group-hover:bg-white/70" />
                <h3 className="mt-5 text-[14.7px] font-bold leading-[115%] tracking-[-0.126px]">
                  {stat.title}
                </h3>
                <p className="mt-2 text-[14.7px] leading-[120%] tracking-[-0.126px] opacity-60">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
