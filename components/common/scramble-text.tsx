"use client";

import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_/[]{}=+*^?#@&$%";

export interface ScrambleTextProps {
  text: string;
  isActive: boolean;
  /** Speed of resolved-character progression per tick. Default 0.45. Ignored when `duration` is set. */
  speed?: number;
  /** Tick interval in ms. Default 12. */
  tickMs?: number;
  /** If set, overrides `speed` so the full animation takes exactly this many ms regardless of text length. */
  duration?: number;
}

export function ScrambleText({ text, isActive, speed = 0.45, tickMs = 12, duration }: ScrambleTextProps) {
  const [displayed, setDisplayed] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iterRef = useRef(0);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isActive) {
      iterRef.current = 0;
      setDisplayed(text);
      return;
    }

    // If duration is provided, derive speed so the animation finishes in exactly `duration` ms.
    const effectiveSpeed = duration !== undefined
      ? Math.max(text.length / (duration / tickMs), 0.01)
      : speed;

    iterRef.current = 0;

    intervalRef.current = setInterval(() => {
      iterRef.current += effectiveSpeed;
      const resolved = Math.floor(iterRef.current);

      setDisplayed(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < resolved) return char;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join(""),
      );

      if (resolved >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayed(text);
      }
    }, tickMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, text, speed, tickMs, duration]);

  return <span aria-label={text}>{displayed}</span>;
}
