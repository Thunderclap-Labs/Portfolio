"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// easeOutQuint — matches the rest of the site's motion (page transition, etc.)
const EASE = [0.22, 1, 0.36, 1] as const;
const DOCK_THRESHOLD = 8; // px of scroll before the mobile video docks
const DOCK_INSET = 16; // docked card inset on mobile (matches the old p-4 box)

// Defined at module level so its identity is stable across re-renders — if it
// were defined inside HeroSection, every scroll-triggered state change would
// produce a new component type and cause React to unmount/remount the motion
// spans, replaying the entrance animation.
function HeadlineLine({
  children,
  delay,
  reduceMotion,
}: {
  children: string;
  delay: number;
  reduceMotion: boolean | null;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={reduceMotion ? false : { y: "115%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.95, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  // --- Desktop hover-reveal (unchanged behaviour) ---
  const [hasHoveredOff, setHasHoveredOff] = useState(false);

  // --- Mobile: full-screen video that docks on scroll ---
  const [isMobile, setIsMobile] = useState(false);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onScroll = () => setDocked(window.scrollY > DOCK_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The video card. On desktop the responsive classes define the framed box and
  // we never touch the inline style. On mobile we drive a smooth full-screen ⇄
  // docked transition by animating the four edge insets (never opacity — the
  // video must always stay fully visible on small screens).
  const cardStyle: React.CSSProperties | undefined =
    isMobile
      ? {
          top: docked ? DOCK_INSET : 0,
          right: docked ? DOCK_INSET : 0,
          bottom: docked ? DOCK_INSET : 0,
          left: docked ? DOCK_INSET : 0,
          borderRadius: docked ? 2 : 0,
          transition: reduceMotion
            ? "none"
            : "top 0.7s cubic-bezier(0.22,1,0.36,1), right 0.7s cubic-bezier(0.22,1,0.36,1), bottom 0.7s cubic-bezier(0.22,1,0.36,1), left 0.7s cubic-bezier(0.22,1,0.36,1), border-radius 0.7s cubic-bezier(0.22,1,0.36,1)",
        }
      : undefined;

  // Desktop overlay/content classes — first hover-off hides them, hover reveals.
  const overlayClass = hasHoveredOff
    ? "absolute inset-0 bg-[rgba(1,1,1,0.26)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
    : "absolute inset-0 bg-[rgba(1,1,1,0.26)] opacity-100 pointer-events-none transition-opacity duration-500";

  const contentClass = hasHoveredOff
    ? "relative z-10 flex flex-col items-center gap-6 text-center px-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-auto sm:pointer-events-none sm:group-hover:pointer-events-auto transition-opacity duration-500"
    : "relative z-10 flex flex-col items-center gap-6 text-center px-8 opacity-100 pointer-events-auto transition-opacity duration-500";

  return (
    <section className="relative w-full h-[100svh] sm:h-[calc(100svh-40px)] sm:min-h-120 overflow-hidden">
      <div
        className="absolute inset-0 sm:inset-6 overflow-hidden rounded-none sm:rounded-xs"
        style={cardStyle}
      >
        {/* Video — always full opacity, always fully visible */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/rnd-bg.mp4"
          aria-hidden="true"
        />

        {/* ----------------------------- MOBILE ----------------------------- */}
        <div className="sm:hidden absolute inset-0">
          {/* Cinematic bottom scrim — keeps the top of the video clean while
              anchoring the text in a readable pool of shadow. */}
          <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-[rgba(1,1,1,0.92)] via-[rgba(1,1,1,0.32)] to-[rgba(1,1,1,0.04)]" />
          {/* Faint top scrim so the (transparent) navbar's logo stays legible. */}
          <div className="absolute inset-x-0 top-0 h-28 pointer-events-none bg-linear-to-b from-[rgba(1,1,1,0.5)] to-transparent" />

          {/* Editorial, bottom-anchored content */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-[max(4rem,calc(env(safe-area-inset-bottom)+2.75rem))]">
            <div className="relative z-10 flex flex-col gap-5">
              {/* Eyebrow with a drawing accent rule */}
              <div className="flex items-center gap-3">
                <motion.span
                  className="block h-px bg-accent"
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: 30 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                />
                <span className="eyebrow text-white !opacity-80">
                  Aerospace · Atmospheric · Defense
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-white m-0 font-extrabold uppercase leading-[0.9] tracking-[-1.5px] text-[clamp(38px,12vw,54px)]">
                <HeadlineLine delay={0.15} reduceMotion={reduceMotion}>Engineering</HeadlineLine>
                <HeadlineLine delay={0.27} reduceMotion={reduceMotion}>The Future</HeadlineLine>
              </h1>

              {/* CTAs */}
              <motion.div
                className="flex flex-col gap-3 mt-1"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.52 }}
              >
                <Link href="/projects" className="btn-border-light w-full justify-between">
                  Explore Projects
                  <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path
                      d="M1 9L9 1M9 1H3M9 1V7"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link href="/contact" className="btn-border-light w-full justify-between opacity-65">
                  Partner with us
                  <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path
                      d="M1 9L9 1M9 1H3M9 1V7"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Scroll cue — invites the dock interaction, fades once docked */}
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: docked ? 0 : 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: docked ? 0 : 0.9 }}
          >
            <span className="relative block w-px h-7 bg-white/20 overflow-hidden">
              <motion.span
                className="absolute inset-x-0 top-0 block h-2.5 bg-white/80"
                animate={reduceMotion ? undefined : { y: ["-110%", "330%"] }}
                transition={{ duration: 1.7, ease: "easeInOut", repeat: Infinity }}
              />
            </span>
          </motion.div>
        </div>

        {/* ----------------------------- DESKTOP ---------------------------- */}
        {/* Unchanged hover-reveal experience. */}
        <div
          className="hidden sm:flex group absolute inset-0 items-center justify-center"
          onMouseLeave={() => setHasHoveredOff(true)}
        >
          <div className={overlayClass} />

          <div className={contentClass}>
            <h1 className="text-white m-0 font-bold leading-[105%] tracking-[-1.4px] uppercase text-[clamp(42px,7vw,70px)]">
              Engineering
              <br />
              The Future
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="eyebrow text-white opacity-80">Aerospace</span>
              <span className="w-px h-3 bg-white opacity-40" aria-hidden="true" />
              <span className="eyebrow text-white opacity-80">Atmospheric Tech</span>
              <span className="w-px h-3 bg-white opacity-40" aria-hidden="true" />
              <span className="eyebrow text-white opacity-80">Defense Systems</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <Link href="/projects" className="btn-border-light">
                Explore Projects
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path
                    d="M1 9L9 1M9 1H3M9 1V7"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link href="/contact" className="btn-border-light opacity-[0.65]">
                Partner Up
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path
                    d="M1 9L9 1M9 1H3M9 1V7"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
