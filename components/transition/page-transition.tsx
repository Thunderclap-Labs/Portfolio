"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

/**
 * Diagonal wipe page transitions.
 *
 * An over-sized, skewed dark panel sweeps in from the left to cover the page,
 * holds while the next route loads, then continues off to the right to reveal
 * it. An accent line rides the panel's leading (diagonal) edge.
 *
 *   idle ──click──▶ cover ──anim done──▶ load ──route ready──▶ reveal ──anim done──▶ idle
 *
 * The "load" hold is what makes this account for loading time: we push inside
 * a React transition (`useTransition`), keep the panel up while `isPending` is
 * true, and only reveal once the destination's RSC payload + loading UI are
 * ready and `usePathname()` has caught up to the target.
 *
 * The sweep is a GPU-friendly translate (`x`) on a `skewX`-ed panel — no
 * clip-path animation, and nothing transforms the page itself, so the fixed
 * navbar never reflows.
 *
 * Navigation is captured globally so every existing <Link> (and plain internal
 * <a>) animates without having to be rewritten.
 */

type Stage = "idle" | "cover" | "load" | "reveal";

const DURATION = 0.55; // per half (cover / reveal)
const SKEW = -8; // panel slant, degrees
const TRAVEL = "160vw"; // off-screen offset on each side (panel is over-sized)

// Decelerate into the cover (soft landing), accelerate out of the reveal
// (smooth launch) — the pass-through reads as one continuous motion.
const EASE_OUT = [0.22, 1, 0.36, 1] as const; // easeOutQuint
const EASE_IN = [0.5, 0, 0.75, 0] as const; // easeInQuart

function pathOf(href: string): string {
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href;
  }
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();
  const [stage, setStage] = useState<Stage>("idle");
  const targetRef = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string) => {
      if (stage !== "idle") return; // ignore clicks mid-transition
      targetRef.current = href;
      if (reduceMotion) {
        startTransition(() => router.push(href));
        return;
      }
      setStage("cover");
    },
    [stage, reduceMotion, router]
  );

  // Once the panel finishes covering the screen, kick off the real navigation.
  const handleCoverComplete = useCallback(() => {
    const href = targetRef.current;
    if (!href) return;
    startTransition(() => router.push(href));
    setStage("load");
  }, [router]);

  // Reveal as soon as the destination is ready. Because clicks to the current
  // path are never intercepted, `pathname === target` reliably means the new
  // route committed; `!isPending` means its data + loading UI finished.
  useEffect(() => {
    if (stage !== "load") return;
    const target = targetRef.current;
    if (target && !isPending && pathname === pathOf(target)) {
      setStage("reveal");
    }
  }, [stage, isPending, pathname]);

  const handleRevealComplete = useCallback(() => {
    targetRef.current = null;
    setStage("idle");
  }, []);

  // Global click interception — turns ordinary internal navigations into
  // animated ones without touching the rest of the app.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const target = anchor.getAttribute("target");
      if ((target && target !== "_self") || anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      // External links, the Sanity studio, and same-page (hash/query) jumps
      // fall through to the browser / Next defaults.
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/studio")) return;
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  return (
    <>
      {children}

      {stage !== "idle" && (
        <div aria-hidden className="fixed inset-0 z-9999 overflow-hidden">
          {/* Sweeping panel — over-sized and skewed so its slanted edges still
              cover the corners at rest. Translate is what's animated. */}
          <motion.div
            className="absolute top-[-15%] left-[-20vw] h-[130%] w-[140vw] bg-bg"
            style={{ willChange: "transform" }}
            initial={{ x: `-${TRAVEL}`, skewX: SKEW }}
            animate={{ x: stage === "reveal" ? TRAVEL : "0vw", skewX: SKEW }}
            transition={{ duration: DURATION, ease: stage === "reveal" ? EASE_IN : EASE_OUT }}
            onAnimationComplete={() => {
              if (stage === "cover") handleCoverComplete();
              else if (stage === "reveal") handleRevealComplete();
            }}
          >
            {/* Feathered edges — the dark fades softly into the page ahead of
                the cover and behind the reveal, so neither edge reads as a
                hard slicing line. Leading edge (right), trailing edge (left). */}
            <span className="absolute inset-y-0 left-full w-[12vw] bg-[linear-gradient(to_right,var(--color-bg),transparent)]" />
            <span className="absolute inset-y-0 right-full w-[12vw] bg-[linear-gradient(to_left,var(--color-bg),transparent)]" />
            {/* Accent line on the leading (right) edge — rides the diagonal. */}
            <span className="absolute inset-y-0 right-0 w-px bg-accent/80" />
          </motion.div>

          {/* Logo — its own fixed, un-skewed layer so it stays upright and
              centered on screen while the panel sweeps behind it. */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
              opacity: stage === "reveal" ? 0 : 1,
              scale: stage === "reveal" ? 1.03 : 1,
            }}
            transition={{ duration: DURATION * 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-7 w-auto opacity-95" />
          </motion.div>
        </div>
      )}
    </>
  );
}
