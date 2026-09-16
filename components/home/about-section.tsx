export function AboutSection() {
  return (
    <section className="bg-bg text-text border-b border-white/20">
      <div className="container-content max-w-280 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
          
          {/* Left Column */}
          <div className="py-10.5 md:py-16 xl:py-16 border-b md:border-b-0 md:border-r border-white/20 flex flex-col justify-between md:pr-8">
            <span className="block font-medium text-[10.5px] uppercase tracking-[0.42px] opacity-60 leading-[105%]">
              Who We Are
            </span>
            <h2 className="text-[35px] font-normal leading-[110%] tracking-[-0.7px] max-w-2xl mt-16 md:mt-0 pr-4 md:pr-0">
              We research the hard parts, then build the whole thing.
            </h2>
          </div>
          
          {/* Right Column */}
          <div className="py-10.5 md:py-16 xl:py-16 flex flex-col justify-end md:pt-16">
            <div className="max-w-xl flex flex-col gap-6">
              <p className="text-[14.7px] tracking-[-0.126px]">
                Thunderclap Labs is a web studio in Kaunas, Lithuania. We came out of hardware engineering, where nothing counts until the thing actually runs, and that is still how we work. Every project opens with a prototype of whatever looks riskiest, so the unknowns get settled while they are cheap to settle.
              </p>
              <p className="text-[14.7px] tracking-[-0.126px] opacity-60">
                Once that part holds, the rest follows quickly. Design, front-end, back-end, CMS, 3D and the infrastructure underneath all come from the same small team, across marketing sites, storefronts, configurators, dashboards and internal tools. Nothing gets passed between four agencies, so nothing goes missing on the way.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
