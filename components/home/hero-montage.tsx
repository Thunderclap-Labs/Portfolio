"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

import { visibleDemos, previewUrl } from "@/constants/demos";

/* The hero used to run aerospace R&D footage, which said nothing about
   building websites. This shows the work instead: the listed concept sites,
   crossfading, each drifting slowly so a still screenshot does not sit dead
   on the page.

   Every layer stays mounted and only opacity changes, so a crossfade never
   waits on a decode. */

const HOLD_MS = 4200;
const FADE_MS = 1400;

// Alternating drift directions, so consecutive frames never move the same way.
const DRIFT = [
  "scale(1.06) translate(-1.2%, -0.8%)",
  "scale(1.08) translate(1.4%, 0.6%)",
  "scale(1.05) translate(0.8%, -1.2%)",
  "scale(1.09) translate(-1%, 1%)",
];

export function HeroMontage() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % visibleDemos.length),
      HOLD_MS,
    );

    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-bg" aria-hidden="true">
      {visibleDemos.map((demo, i) => {
        const on = i === active;

        return (
          <div
            key={demo.slug}
            className="absolute inset-0"
            style={{
              opacity: on ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
          >
            <Image
              src={previewUrl(demo)}
              alt=""
              fill
              // The first frame is the hero image on a cold load; the rest can
              // arrive as they come.
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              style={
                reduceMotion
                  ? undefined
                  : {
                      transform: on ? DRIFT[i % DRIFT.length] : "scale(1.02)",
                      transition: `transform ${HOLD_MS + FADE_MS}ms linear`,
                    }
              }
            />
          </div>
        );
      })}

      {/* Holds the headline legible over ten different palettes, some of which
          are near white. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(1,1,1,0.66) 0%, rgba(1,1,1,0.18) 52%, rgba(1,1,1,0.4) 100%)",
        }}
      />

      {/* Names the frame on screen. Kept inside the montage so it reads off the
          same index: a second component with its own timer drifts out of step
          within a minute. Desktop only, since the mobile hero is already busy
          down there. */}
      <span
        className="hidden sm:block absolute bottom-5 right-8 eyebrow text-white !opacity-70"
        style={{ letterSpacing: "0.42px" }}
      >
        {visibleDemos[active].name} &middot; {visibleDemos[active].sector}
      </span>
    </div>
  );
}
