import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Thunderclap Labs",
};

function ArrowIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

export default function NotFound() {
  return (
    <section className="bg-bg text-white min-h-screen">
      <div className="container-content max-w-280 mx-auto pt-40 pb-24">
        <p className="font-medium text-[0.75rem] uppercase tracking-[0.03rem] leading-[105%] mb-4 opacity-60 m-0">
          Error 404
        </p>
        <h1 className="text-[50px] lg:text-[70px] font-normal leading-[105%] tracking-[-1.4px] m-0 mt-4">
          That page isn&apos;t here.
        </h1>

        <p className="mt-16 max-w-xl text-[0.938rem] tracking-[-0.009rem] font-normal leading-[120%] text-white/60 m-0">
          The address was mistyped, the page was renamed, or it never shipped.
          Either way there is nothing behind this URL to load.
        </p>

        <div className="flex flex-wrap items-center gap-6 mt-12">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 bg-white text-bg px-7 py-4 text-[14.7px] tracking-[-0.126px] outline-1 outline-white transition-colors duration-300 ease-out hover:bg-transparent hover:text-white"
          >
            Back to home
            <ArrowIcon />
          </Link>
          <Link
            href="/demos"
            className="group inline-flex items-center gap-2 text-[14.7px] tracking-[-0.126px] text-white/60 hover:text-white transition-colors duration-300 ease-out"
          >
            See the demos
            <ArrowIcon size={10} />
          </Link>
        </div>
      </div>
    </section>
  );
}
