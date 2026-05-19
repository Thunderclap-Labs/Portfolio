export function AboutSection() {
  return (
    <section className="bg-bg text-text border-b border-white/20">
      <div className="container-content max-w-280 mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
          
          {/* Left Column */}
          <div className="py-10.5 md:py-16 xl:py-16 border-b md:border-b-0 md:border-r border-white/20 flex flex-col justify-between md:pr-8">
            <span className="block font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 leading-[105%]">
              Who We Are
            </span>
            <h2 className="text-[35px] font-normal leading-[110%] tracking-[-0.7px] max-w-2xl mt-16 md:mt-0 pr-4 md:pr-0">
              Engineering critical tech for extreme environments.
            </h2>
          </div>
          
          {/* Right Column */}
          <div className="py-10.5 md:py-16 xl:py-16 flex flex-col justify-end md:pt-16">
            <div className="max-w-xl flex flex-col gap-6">
              <p className="text-[14.7px] tracking-[-0.126px]">
                Based in Kaunas, Lithuania, Thunderclap Labs is an advanced engineering startup. We build physical hardware and AI-driven systems from the ground up, skipping the bureaucracy in favor of rapid prototyping, aggressive testing, and vertical integration.
              </p>
              <p className="text-[14.7px] tracking-[-0.126px] opacity-60">
                Our expertise spans comprehensive R&D services, reusable rocket propulsion, artificial intelligence, in-house propellant synthesis, and active autonomous defense tracking (Thunder Eye). We partner with ambitious organizations to turn complex challenges into functional hardware. We don&apos;t just design theories; we manufacture reality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
