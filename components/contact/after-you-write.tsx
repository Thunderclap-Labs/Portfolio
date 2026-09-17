const STEPS = [
  {
    title: "A reply within 24 hours",
    desc: "From one of the people who would actually run the build, not a sales inbox. If we are the wrong fit we say so in that first reply.",
  },
  {
    title: "A 30 minute call",
    desc: "What the site has to do, what already exists, where the deadline sits and which part worries you most. No deck, no discovery fee.",
  },
  {
    title: "Scope, price and dates",
    desc: "Written down: what we would build, in what order, what it costs and when it ships. You keep it whether or not you hire us.",
  },
];

export function AfterYouWrite() {
  return (
    <section className="bg-bg text-white border-t border-white/10">
      <div className="container-content max-w-280 mx-auto">
        <div className="pt-16 md:pt-20 pb-10 flex items-end justify-between gap-6 flex-wrap border-b border-white/15">
          <div className="flex flex-col gap-4">
            <span className="eyebrow text-white/60">What happens next</span>
            <h2 className="section-heading text-white">After you write.</h2>
          </div>
          <p className="text-[14.7px] tracking-[-0.126px] text-white/50 max-w-sm">
            Every message is read by the team that builds the work. Here is the
            path from your first email to a signed scope.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="group relative py-10 md:py-12 md:border-r last:border-r-0 border-white/15 transition-colors duration-300 ease-out hover:bg-white/3 md:px-8 first:pl-0 last:pr-0"
            >
              <div className="flex items-baseline justify-between mb-8">
                <span className="text-[42px] leading-[100%] tracking-[-1px] font-normal text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-medium text-[10.5px] uppercase tracking-[0.42px] text-white/40 leading-[105%]">
                  Step
                </span>
              </div>
              <div className="h-px w-12 bg-white/30 transition-all duration-300 ease-out group-hover:w-20 group-hover:bg-white/70 mb-5" />
              <h3 className="text-[14.7px] font-bold leading-[115%] tracking-[-0.126px] text-white mb-3">
                {step.title}
              </h3>
              <p className="text-[14.7px] leading-[120%] tracking-[-0.126px] text-white/50">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
