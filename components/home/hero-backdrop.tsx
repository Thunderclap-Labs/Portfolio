"use client";

import { useEffect, useRef } from "react";
import {
  HERO_DURATION,
  HERO_H,
  HERO_W,
  renderHeroFrame,
} from "@/lib/hero-sequence";

/**
 * The hero backdrop: a drawing sheet that draws itself, looping.
 *
 * Replaces the background video. The canvas is sized at the sheet's authored
 * 1920x1080 and laid out with object-cover, so it crops exactly the way the
 * video did and the composition holds at every aspect.
 *
 * It stops drawing when it is off screen or the tab is hidden, and renders a
 * single settled frame for anyone who asked not to see motion.
 */
export function HeroBackdrop({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      // the sheet as it stands once everything is on it
      renderHeroFrame(ctx, HERO_DURATION * 0.72);
      return;
    }

    let raf = 0;
    let last = 0;
    const started = performance.now();
    let onScreen = true;

    // 30fps is plenty for line work and halves the cost on a phone
    const FRAME = 1000 / 30;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!onScreen || document.hidden) return;
      if (now - last < FRAME) return;
      last = now;
      renderHeroFrame(ctx, (now - started) / 1000);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { rootMargin: "100px" },
    );
    io.observe(canvas);

    renderHeroFrame(ctx, 0);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      width={HERO_W}
      height={HERO_H}
      className={className}
      aria-hidden="true"
    />
  );
}
