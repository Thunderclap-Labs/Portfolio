# Thunderclap Labs — New Website Agent Prompt

## What You're Building

A complete redesign of [thunderclaplabs.com](https://thunderclaplabs.com/) — a dark, cinematic, mission-driven website for Thunderclap Labs, an aerospace & atmospheric engineering startup based in Kaunas, Lithuania.

**Working directory:** `Portfolio/` — this is the Next.js app you edit. Start from scratch; the existing `app/page.tsx` is a placeholder.

**Reference (do not edit):** `website/` — the current live website. Use it to understand existing content, components, and data. Reuse assets and constants where sensible.

---

## Company

**Thunderclap Labs** — engineering startup building critical technologies across:

- **Atmospheric modification** — drone/rocket-based cloud seeding, weather management systems
- **Aerospace & propulsion** — reusable rockets, advanced propellants, avionics, rapid reusability
- **Proprietary rocket fuel & chemistry** — in-house synthesis, planetary ball milling, material processing
- **Satellite systems** — next-gen constellations for global coverage and real-time analytics
- **Active defense tech** — *Thunder Eye*: passive optical voxel tracking for 3D airspace intelligence (counter-drone, GPS-denied environments)

**B2B R&D services:** rapid prototyping, systems engineering, testing & validation for external partners.

**Stats:** 5+ partners, 7 team members, ∞ passion.

**Partners/Sponsors:** Lithuanian Innovation Agency, JLCPCB, Kaunas IN Startups, KTU Startup Space, Lemona, Kaunas Makerspace.

---

## Tech Stack — Portfolio (new site)

| Item | Detail |
|---|---|
| Framework | Next.js 16 (App Router) |
| React | 19 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` in globals.css — no `tailwind.config.js`) |
| Language | TypeScript |
| Dev command | `npm run dev` |
| Build | `npm run build` |

**No component library installed** — build with plain Tailwind + HTML. Do not install HeroUI or any other UI library unless explicitly asked.

---

## Design System

The full spec is in `prompts/STYLE_GUIDE.md`. Read it before writing any UI. Key rules:

**Colors**
- Background: `#010101` (NOT pure black)
- Text: `#FFFFFF`
- Accent: `#DFF140` (lime yellow-green — use sparingly, max 1 element per page)
- Light sections: `#D8D8D4` bg / `#010101` text
- Muted text: `rgba(255,255,255,0.5)` — never use grey colors for muted

**Typography**
- Font: `HelveticaNowDisplay` — not installed yet; use **Inter** as substitute during development
- Base: `1rem = 14px`
- Negative letter-spacing on all body/display text (e.g. `-1.4px` for display, `-0.126px` for body)
- Positive letter-spacing only on ALL-CAPS eyebrow labels (`+0.42px`)
- `text-transform: uppercase` ONLY for: eyebrow labels, section category labels, footer headings, hero tags

**Layout**
- `border-radius: 0` everywhere — sharp corners, no exceptions
- Max content width: `~1120px`
- Full-bleed hero sections (`100vh`, no padding)
- Standard sections: `42px` top/bottom padding
- `object-fit: cover` on all images

**Transitions**
- `0.3s ease-out` for links and buttons
- `0.5s` for circle buttons

---

## Reference Source Code

Everything in `website/` is reusable reference material:

| Path | What's there |
|---|---|
| `website/app/page.tsx` | Full homepage with all sections |
| `website/constants/home-page.ts` | Stats, focus areas, manufacturing features, propulsion timeline |
| `website/constants/sponsors.ts` | Sponsor logos and data |
| `website/components/` | Working components: navbar, FundingChart, SectionLayout, StatsGrid, TeamSwiper, FeaturedProjectsShowcase, SponsorsSwiper, etc. |
| `website/app/projects/` | Projects page + constants |
| `website/app/team/` | Team page + constants + images |
| `website/app/cloud-seeding/` | Cloud seeding project page |
| `website/app/rnd/` | R&D services page |
| `website/app/contact/` | Contact page |
| `website/public/` | Existing images and assets |
| `website/DESIGN_GUIDELINES.md` | Old site's design rules (for content/structure reference only — the new design is in `prompts/STYLE_GUIDE.md`) |

When you need content (team bios, project descriptions, stats) — pull from `website/`. When you need design decisions — use `prompts/STYLE_GUIDE.md`.

---

## Pages to Build

1. **Home** — full-bleed video/dark hero, focus areas, propulsion section, manufacturing, projects showcase, team swiper, sponsors, R&D CTA
   - **Mobile:** The hero video must always remain fully visible on mobile — never apply the fade-out/scroll-based opacity effect on small screens.
2. **Projects** — grid of all projects with category badges and status tags
3. **Team** — team grid, R&D services section
4. **Cloud Seeding** — project detail page
5. **R&D Services** — capabilities and pipeline
6. **Contact** — contact form + info
7. **Gallery** — image gallery (exists in `website/app/gallery/`)

---

## Key Conventions

- **File structure:** `app/[page]/page.tsx`, components in `components/`, shared utilities in `lib/`
- **Client components:** add `"use client"` only when needed (interactivity, hooks)
- **No inline styles** unless strictly necessary for dynamic values (e.g. animation transforms)
- **Images:** use `next/image` with `object-fit: cover`; pull assets from `website/public/` or `website/app/*/images/`
- **No icon libraries** — inline SVGs only, `color: currentColor`
- **CSS custom properties** for colors (see STYLE_GUIDE.md §2)
- Tailwind v4 uses `@import "tailwindcss"` — no separate config file; extend theme with `@theme {}` in globals.css
