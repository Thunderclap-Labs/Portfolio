"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 transition-transform duration-300 ease-out ${open ? "rotate-180" : "rotate-0"}`}
    >
      <path
        d="M2 3.5L5 6.5L8 3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface FilterDropdownProps {
  /** Uppercase trigger label, e.g. "Category" or "Sort: Newest". */
  label: string;
  /** Small count shown on the trigger when a filter is narrowing results. */
  badge?: number | null;
  /** Which edge the panel aligns to. */
  align?: "left" | "right";
  /** Panel content. Receives `close()` so single-selects can dismiss on pick. */
  children: ReactNode | ((close: () => void) => ReactNode);
}

/**
 * Headless popover used by the article toolbar for the Category, Tags and
 * Sort controls. Dark-themed to sit on the `bg-bg` band; closes on outside
 * click and Escape; kept mounted (and `inert`) while closed so open/close
 * animates without re-rendering its children.
 */
export function FilterDropdown({ label, badge, align = "left", children }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open ? "true" : "false"}
        aria-haspopup="true"
        aria-controls={panelId}
        className="group flex cursor-pointer items-center gap-2 py-2 text-[0.818rem] uppercase tracking-[0.03rem] whitespace-nowrap text-white/60 transition-colors duration-300 hover:text-white aria-expanded:text-white"
      >
        <span>{label}</span>
        {badge != null && badge > 0 && (
          <span className="inline-flex h-4.25 min-w-4.25 items-center justify-center rounded-full bg-white px-1 text-[10px] font-medium leading-none text-bg">
            {badge}
          </span>
        )}
        <ChevronIcon open={open} />
      </button>

      <div
        id={panelId}
        // Kept in the DOM while closed for the fade/slide; `inert` removes the
        // hidden controls from tab order and the a11y tree.
        inert={!open}
        className={`absolute top-full z-30 mt-2 min-w-55 border border-white/15 bg-bg p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] transition duration-200 ease-out ${
          align === "right" ? "right-0" : "left-0"
        } ${open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
      >
        {typeof children === "function" ? children(close) : children}
      </div>
    </div>
  );
}
