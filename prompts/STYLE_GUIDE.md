# Thunderclap Portfolio — Style Guide
> For use by AI agents when building, designing, or reviewing any part of this website.

---

## 1. Design Philosophy

- **Dark, cinematic, and mission-driven.** The default canvas is near-black with white text. Every element earns its place.
- **Typography does the heavy lifting.** Massive display type, tight letter-spacing, and uppercase labels are the primary design language.
- **Full-bleed imagery.** Sections alternate between full-bleed video/photo heroes and clean typographic layouts.
- **Minimal ornamentation.** No decorative borders, gradients, or drop shadows. Contrast and spacing create hierarchy.
- **Inverted themes per section.** The global theme is dark, but specific sections (product detail pages, news panels) flip to a light warm-off-white to create visual rhythm.
- **Confident and direct copy.** Short, declarative phrases. All-caps for labels and eyebrows. Action-oriented CTAs.

---

## 2. Color Palette

All CSS custom properties are declared on `:root`.

```css
:root {
  --color-bg:              #010101;   /* Near-black — primary page background */
  --color-bg-inverse:      #D8D8D4;   /* Warm off-white — light-theme sections */
  --color-bg-news:         #F1F0EA;   /* Slightly warmer off-white — news/editorial */
  --color-bg-banner:       #6C6E6B;   /* Muted olive-grey — announcement banners */
  --color-bg-dark-olive:   #505544;   /* Dark military olive — editorial highlights */
  --color-bg-mid-grey:     #8E9291;   /* Mid grey — secondary elements */

  --color-text:            #FFFFFF;   /* Primary text on dark backgrounds */
  --color-text-inverse:    #010101;   /* Primary text on light backgrounds */
  --color-text-muted:      rgba(255, 255, 255, 0.5);  /* Subdued text/labels */
  --color-overlay:         rgba(78, 78, 78, 0.70);    /* Image overlays */

  --color-accent:          #DFF140;   /* Lime yellow-green — ACCENT ONLY, use sparingly */
  --color-border-dark:     #010101;   /* Border on light elements */
  --color-border-light:    #FFFFFF;   /* Border on dark elements */
}
```

### Usage Rules
| Role | Dark Theme | Light Theme |
|---|---|---|
| Page background | `#010101` | `#D8D8D4` |
| Section background (alt) | `#6C6E6B` | `#F1F0EA` |
| Body text | `#FFFFFF` | `#010101` |
| Muted / secondary text | `rgba(255,255,255,0.5)` | `rgba(1,1,1,0.5)` |
| Accent highlight | `#DFF140` | `#DFF140` |
| CTA button (secondary-dark) | `#FFFFFF` bg, `#010101` text | `#010101` bg, `#FFFFFF` text |

---

## 3. Typography

### 3.1 Font Families

```css
/* Primary UI font — used everywhere */
font-family: 'HelveticaNowDisplay', Helvetica, Arial, sans-serif;

/* Decorative / display accent font — use sparingly for editorial moments */
font-family: 'Elios', serif;
```

**HelveticaNowDisplay** is a custom font loaded via `@font-face` with the following weights available:
- `400` — Regular
- `500` — Medium
- `700` — Bold
- `800` — ExtraBold
- `900` — Black / ExtraBlack

> **Note:** HelveticaNowDisplay is a licensed font. For development/prototyping, substitute **Inter** or **DM Sans** as a close approximation. In production, license HelveticaNowDisplay from Monotype.

---

### 3.2 Type Scale

All sizes are based on a `1rem = 14px` base.

| Token | Size | Weight | Line Height | Letter Spacing | Transform | Use |
|---|---|---|---|---|---|---|
| `--type-display` | `70px` | `700` | `73.5px (105%)` | `-1.4px` | none | Page H1 (hero, product title) |
| `--type-hero-label` | `56px` | `400` | `105%` | `0` | none | Large counter / PT labels |
| `--type-h2` | `35px` | `400` | `43.75px (125%)` | `-0.7px` | none | Section headings |
| `--type-h2-bold` | `21px` | `700` | `24.15px (115%)` | `-0.21px` | none | Product card names |
| `--type-eyebrow` | `10.5px` | `500` | `11.025px (105%)` | `+0.42px` | `UPPERCASE` | Category labels, section labels |
| `--type-body` | `14.7px` | `400` | `17.64px (120%)` | `-0.126px` | none | Body paragraphs |
| `--type-body-sm` | `13.132px` | `400` | `15.758px (120%)` | `-0.126px` | none | Nav links, small body |
| `--type-nav` | `13.132px` | `400` | `105%` | `-0.126px` | none | Main navigation |
| `--type-footer-link` | `15.75px` | `400` | `105%` | `-0.154px` | none | Footer nav links |
| `--type-footer-label` | `10.5px` | `500` | `105%` | `+0.42px` | `UPPERCASE` | Footer column headings |
| `--type-cta` | `0.875rem (12.25px)` | `400` | `105%` | `-0.009rem` | `capitalize` | CTA button text |
| `--type-cta-secondary` | `1.05rem (14.7px)` | `400` | `105%` | `-0.01rem` | `capitalize` | Secondary CTA button text |

### 3.3 Typography Rules

1. **Negative letter-spacing** on all body and display text creates a tight, modern feel. Never use default/positive spacing on body text.
2. **Positive letter-spacing** only on all-caps eyebrow labels (`+0.42px`).
3. **All-caps** (`text-transform: uppercase`) is reserved exclusively for: eyebrow labels, section category labels, footer column headings, and hero "tag" text.
4. **Font weight 400** is the default for body and navigation. Bold (700+) is used for primary display headings and product card names only.
5. **Do not use** italic styling anywhere on the site.

---

## 4. Spacing & Layout

### 4.1 Base Spacing

Use a base unit of `7px` (half-rem at 14px base).

```css
--space-1:  7px;    /* 0.5rem */
--space-2:  14px;   /* 1rem   */
--space-3:  21px;   /* 1.5rem */
--space-4:  28px;   /* 2rem   */
--space-6:  42px;   /* 3rem   */
--space-8:  56px;   /* 4rem   */
--space-12: 84px;   /* 6rem   */
```

### 4.2 Section Padding

- **Hero section**: no padding — full-bleed, edge-to-edge.
- **Standard content sections**: `42px` top and bottom padding, horizontal padding via container class.
- **Feature/card sections**: `28px` bottom padding.
- **Footer**: `49px` top and bottom.
- **Announcement banners**: `42px` top and bottom.

### 4.3 Grid

- **Max content width**: `~1120px` (inferred from screenshots).
- **Product image grid**: CSS Grid, 3 columns of unequal height (masonry-like pattern).
  - Column widths approx: `33% / 33% / 33%` with some spanning cells.
- **Feature cards**: 4-column grid on desktop, stack on mobile.
- **News section**: single column list with horizontal rule separators.
- **Editorial 2-up**: 50/50 full-width split (no gutter).
- **No border-radius on layout containers** — all corners are sharp (0px).

### 4.4 Image Aspect Ratios

| Context | Ratio |
|---|---|
| Product grid (small tiles) | `1:1` (342×342px) |
| Product grid (tall feature) | `~1:2` (342×709px) |
| Product grid (wide feature) | `~2:1` (699×350px) |
| News/media card | `16:9` |
| Full-bleed hero | `viewport width × 100vh` |

All images use `object-fit: cover`.

---

## 5. Components

### 5.1 Navigation (Header)

```
[Logo]         [Sea] [Land] [Air] [Space] [Lattice] [Arsenal-1]       [Search] [Company +]
```

- **Position**: `position: fixed` (overlays hero on scroll), transparent background.
- **Logo**: Top-left, Anduril mark + wordmark, white.
- **Primary nav links**: Center/right, HelveticaNowDisplay 13.132px, weight 400, white.
- **Secondary nav right**: "Search" button + "Company +" dropdown trigger.
- **Dropdown menus**: Expand to reveal sub-links; slide-in animation.
- **Mobile**: Hamburger icon collapses nav, full-screen overlay menu with large text links.
- **No border-bottom** on header.

---

### 5.2 Buttons & CTAs

#### Inline CTA (ActionButton / Primary)
```css
.ActionButton {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.6;
  color: inherit;
  text-decoration: none;
  font-family: HelveticaNowDisplay, Helvetica, Arial, sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 105%;
  letter-spacing: -0.009rem;
  cursor: pointer;
  transition: opacity 0.3s ease-out;
}
.ActionButton:hover { opacity: 1; }

/* Arrow icon */
.ActionButton .iconWrapper {
  width: 0.55rem;
  height: 0.55rem;
}
```
> Usage: inline "Read More ↗" style links. Starts at 60% opacity, lifts to 100% on hover.

#### Pill / Badge Button (ActionButton.secondary — dark on light pages)
```css
.ActionButton.secondary {
  opacity: 1;
  color: #010101;
  background: #FFFFFF;
  width: fit-content;
  padding: 0.5rem 0.7rem;
  border-radius: 0;
  text-transform: capitalize;
  transition: 0.3s ease-out;
}
.ActionButton.secondary:hover {
  background-color: transparent;
  outline: #FFFFFF solid 1px;
  color: #FFFFFF !important;
}
```

#### Pill / Badge Button (ActionButton.secondary.light — light on dark pages)
```css
.ActionButton.secondary.light {
  color: #FFFFFF;
  background: #010101;
}
.ActionButton.secondary.light:hover {
  background-color: transparent;
  outline: #010101 solid 1px;
  color: #010101 !important;
}
```

#### Border CTA (CtaButton.border — large form factor)
```css
.CtaButton.border {
  padding: 18px 28px;
  width: max-content;
  transition: border 0.3s ease-out, background-color 0.3s ease-out, color 0.3s ease-out;
}
```

#### Circle Arrow Button (pagination, carousel)
```css
.CircleButton .button {
  background: none;
  border: 1px solid #010101;
  border-radius: 100px;
  padding: 8px;
  display: flex;
  align-items: center;
  transition: background-color 0.5s, border-color 0.5s;
}
.CircleButton .button svg { color: #010101; width: 10px; height: 10px; }
.CircleButton .button:hover { background: #010101; }
.CircleButton .button:hover svg { color: #FFFFFF; }
```

---

### 5.3 Product Image Cards (Homepage Grid)

```
┌──────────────┐ ┌───────────────────────┐ ┌──────────────┐
│              │ │                       │ │   Lattice    │
│    Ghost     │ │       Barracuda       │ │  Autonomy →  │
└──────────────┘ └───────────────────────┘ └──────────────┘
```

- Full-bleed image fills the card (`object-fit: cover`).
- Product name overlaid at **bottom-left**, white text, HelveticaNowDisplay 21px weight 700.
- **No border-radius** on cards.
- Small arrow icon (↗) appears on hover for linked cards.
- Subtle dark overlay on images for text legibility.

---

### 5.4 Feature Cards (Product Detail Pages)

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Distributed     │ │ Translate &     │ │ Intelligent     │ │ Secure Transport│
│ Mesh Arch.      │ │ Normalize Data  │ │ Routing         │ │ & Access        │
│                 │ │                 │ │                 │ │                 │
│ [Description]   │ │ [Description]   │ │ [Description]   │ │ [Description]   │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

- **Background**: `#010101` (black) on light-theme product pages.
- **Text**: `#FFFFFF`.
- **No border-radius**.
- 4-column grid, equal widths.
- H6 heading (bold) + paragraph body.

---

### 5.5 Numbered Process Steps

Step number in large display text (01, 02, 03…), H6 heading title below, paragraph description.

```
01                    02                    03                    04
────────────          ────────────          ────────────          ────────────
Integrate             Normalize             Connect               Transport

[Description]         [Description]         [Description]         [Description]
```

---

### 5.6 Eyebrow / Section Label

Appears above all major headings and section titles.

```css
.eyebrow {
  font-family: HelveticaNowDisplay, Helvetica, Arial, sans-serif;
  font-size: 10.5px;        /* ~0.75rem */
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.42px;
  line-height: 105%;
  color: currentColor;
  opacity: 0.6;             /* on dark sections */
}
```

---

### 5.7 News / Article List

```
────────────────────────────────────────────────────────────────
05/05/2026
Anduril, Team of Partners to Work on Space Force's...
Read More ↗                              [Thumbnail Image]
────────────────────────────────────────────────────────────────
12/09/2025
Anduril UK deepens partnerships with UK industry...
Read More ↗
────────────────────────────────────────────────────────────────
```

- Background: `#F1F0EA` (warm off-white).
- Horizontal `<hr>` separators in `#010101`.
- Date: small text (10.5px, opacity 0.6).
- Title: H2 body text (~21–35px).
- "Read More ↗": ActionButton inline style.
- Optional image thumbnail aligned right.

---

### 5.8 Announcement Banner

```css
.announcement-banner {
  background-color: #6C6E6B;   /* muted olive-grey */
  color: #FFFFFF;
  padding: 42px 0;
  font-family: HelveticaNowDisplay, Helvetica, Arial, sans-serif;
}
```

---

### 5.9 Footer

```
[Logo + Wordmark]

                  COMPANY        WORK WITH US      SOCIAL
                  ─────────────  ─────────────     ─────────────
                  Mission        Careers           X
                  Newsroom       Early Career      YouTube
                  Leadership     SkillBridge       Instagram
                  Gear Store     Open Roles        Facebook
                                                   LinkedIn

────────────────────────────────────────────────────────────────────────
COPYRIGHT © 2026  Privacy Policy  Terms of Use  Modern Anti-Slavery Policy      CONTACT
Investor Relations  UK Carbon Reduction Plan                          contact@example.com
```

- Background: `#010101`.
- Logo top-left.
- Column heading labels: 10.5px, weight 500, uppercase, letter-spacing +0.42px, white.
- Column links: 15.75px, weight 400, white, no underline.
- Bottom bar: `~8px` text, very small, uppercase, opacity 0.5.
- Padding: `49px` top and bottom.

---

## 6. Hero Section Patterns

### 6.1 Full-Bleed Video Hero (Homepage)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   [NAV BAR — transparent overlay]                         │
│                                                            │
│                                                            │
│  © ANDURIL INDUSTRIES                                      │
│  TRANSFORMING DEFENSE                                      │
│  CAPABILITIES WITH                                         │
│  ADVANCED TECHNOLOGIES                                     │
│                                                            │
│  AUTONOMY  FOR      🔺   EST. 2017                         │
│  EVERY     MISSION       → FUTURE                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

- Background: full-viewport video (cinematic hardware/drone footage), dark overlay.
- Headline: Giant all-caps text, HelveticaNowDisplay ExtraBlack/Black weight.
- Sub-row: small tag labels in a horizontal layout with the Anduril mark icon.
- Entire section is `100vh`.

### 6.2 Light Product Hero (Product Detail Pages)

```
┌────────────────────────────────────────────────────────────┐
│   [NAV BAR — white/light background]                      │
│                                                            │
│  LATTICE              [Particle/mesh animation fills RHS]  │
│                                                            │
│  Mesh                                                      │
│                                                            │
│                                                            │
│  BATTLES ARE WON AT THE EDGE       [Body description       │
│  NOT THE DATA CENTER                right column]          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

- Background: `#D8D8D4` (warm off-white / light grey-beige).
- Text: `#010101`.
- Eyebrow: product family name (e.g., "LATTICE"), small uppercase.
- H1: product name in 70px, weight 700, tight line-height.
- Left column: eyebrow + H1 + subtitle tagline (all-caps, 10.5px, 2 lines).
- Right column: 2 body paragraphs.
- Animated particle/topology background fills top half.

---

## 7. Page-Level Themes

| Page Type | Background | Text | Accent |
|---|---|---|---|
| Homepage (default) | `#010101` | `#FFFFFF` | `#DFF140` |
| Product page hero | `#D8D8D4` | `#010101` | `#010101` |
| Product feature cards | `#010101` (on light page) | `#FFFFFF` | — |
| News/Insights section | `#F1F0EA` | `#010101` | — |
| Announcement banner | `#6C6E6B` | `#FFFFFF` | — |
| Editorial split sections | `#505544` / `#8E9291` | `#FFFFFF` | — |
| Footer | `#010101` | `#FFFFFF` | — |

---

## 8. Motion & Animation

```css
transition: opacity 0.3s ease-out;                                          /* links, buttons */
transition: background-color 0.5s, border-color 0.5s, color 0.5s;          /* circle buttons */
transition: border 0.3s ease-out, background-color 0.3s ease-out, color 0.3s ease-out; /* border CTAs */
```

- All easing is `ease-out`. No spring or bounce physics.
- Hover effects: opacity change, outline appearance, or background fill only.
- Hero sections use full-bleed video loops or particle/mesh canvas animations.
- No page-transition animations.

---

## 9. Iconography

- **Arrow icon (CTA)**: SVG, `0.55rem × 0.55rem`, `color: currentColor`. Northeast-pointing (↗) for external/read-more links.
- **Circle arrow buttons** (prev/next): 10px SVG inside a circular bordered container (see `.CircleButton` in §5.2).
- **No icon libraries** — all icons are custom inline SVG.
- Always set `color: currentColor` on SVGs so they inherit the theme automatically.

---

## 10. Voice & Tone (Copywriting Reference)

- **All-caps for headlines and labels only** — never for body text or headings.
- **Short, punchy taglines**: one or two declarative lines, no hedging.
- **Body copy is direct and specific**: describes capabilities with precision; no marketing fluff.
- **CTAs are action verbs**: "Read More", "Explore", "Join", "Rebuild" — capitalize first letter only.

---

## 11. Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use near-black (`#010101`) as the default background | Use pure `#000000` black |
| Use tight negative letter-spacing on body text | Use default or loose letter-spacing on body |
| Keep corners sharp (border-radius: 0 on cards/containers) | Add rounded corners to cards or sections |
| Use uppercase only for eyebrow labels and hero tags | Apply uppercase to headings or body text |
| Use `object-fit: cover` on all images | Use `object-fit: contain` or bare `<img>` |
| Use `opacity: 0.6` for secondary/muted text | Use grey colors for muted text |
| Use full-bleed sections that span 100% viewport width | Add gutters around hero sections |
| Alternate between dark and light section themes for rhythm | Keep all sections the same color |
| Use HelveticaNowDisplay for all UI text | Mix in other sans-serif fonts |
| Keep transitions at `0.3s ease-out` | Use faster/snappier animations or spring physics |
| Use the accent `#DFF140` sparingly (1 element per page max) | Use accent color on multiple elements |

---

## 12. Font Loading Reference

```css
@font-face {
  font-family: 'HelveticaNowDisplay';
  src: url('/assets/fonts/HelveticaNowDisplay-Regular.woff2') format('woff2'),
       url('/assets/fonts/HelveticaNowDisplay-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
/* Repeat for weights: 500, 700, 800, 900 */

@font-face {
  font-family: 'Elios';
  src: url('/assets/fonts/Elios-Regular.woff2') format('woff2'),
       url('/assets/fonts/Elios-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

> HelveticaNowDisplay is a licensed font (Monotype). Use **Inter** or **DM Sans** as a drop-in substitute during development.
