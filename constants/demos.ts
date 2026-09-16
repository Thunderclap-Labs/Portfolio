/** The concept sites shown on /demos.
 *
 *  Each one lives as a plain static folder in `public/demos/<slug>`. This file
 *  is only the framing: who the site was made for, what it is made of, and
 *  what a visitor can do on it.
 */

export const CAPABILITIES = [
  "3D",
  "Scroll driven",
  "Configurator",
  "Checkout",
  "Booking",
  "Charts",
  "Filtering",
  "Theming",
  "Custom tools",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export interface Swatch {
  name: string;
  hex: string;
}

export interface Demo {
  slug: string;
  name: string;
  tagline: string;
  /** Who it was made for */
  sector: string;
  /** The problem the page has to solve */
  brief: string;
  /** Card blurb, one or two sentences */
  summary: string;
  capabilities: Capability[];
  direction: string;
  typefaces: string[];
  palette: Swatch[];
  /** How the hard part works. Absent on the two sites with no 3D. */
  build?: string;
  features: string[];
  accent: string;
  /** Kept out of the index, the nav and the sitemap while it is being worked
   *  on. The page itself still resolves, so the URL can be checked directly. */
  hidden?: boolean;
}

export const demos: Demo[] = [
  {
    slug: "halcyon",
    name: "Halcyon HF-1",
    tagline: "Portable field recorder",
    sector: "Small batch hardware",
    brief:
      "A manufacturer selling one product in limited runs, where the object has to carry the page.",
    summary:
      "A four track recorder you can turn over and operate in the browser. The transport keys work, the reels spin at the right speed, and the VU needle has real ballistics.",
    capabilities: ["3D", "Configurator", "Checkout", "Theming"],
    direction:
      "Retro futuristic. Bone paper, machined greys, one oxide orange, with film grain and scanlines over everything.",
    typefaces: ["Bahnschrift", "Consolas"],
    palette: [
      { name: "Paper", hex: "#EDE4D3" },
      { name: "Ink", hex: "#191512" },
      { name: "Amber", hex: "#E2632A" },
    ],
    build:
      "The body and the transport keys are extruded rounded slabs. The face graphics, the back plate engraving and the VU meter are drawn to canvases and used as textures, and the meter canvas is redrawn every frame so the needle moves like a needle. A procedural studio environment map run through PMREM gives the anodised aluminium something to reflect.",
    features: [
      "Drag or use the arrow keys to orbit the model",
      "Play, rewind, forward, stop and record, from the page buttons or by clicking the keys on the model",
      "The reels spin at the right speed, the tape pack grows and shrinks, and the timecode runs",
      "Three colourways that repaint the model, the panel texture and the page",
      "The anatomy list flies the camera to each part and lights the matching zone on the blueprint",
      "A reservation flow with validation, a live total, a reference number, and persistence across visits",
    ],
    accent: "#E2632A",
  },
  {
    slug: "auriga",
    name: "Auriga Drive 12",
    tagline: "Robot joint actuator",
    sector: "Industrial components",
    brief:
      "A components supplier selling to engineers, who want to see inside the part before they specify it.",
    summary:
      "Scroll and the motor comes apart in the order you would take it apart. A configurator rewrites torque, speed, mass, price and lead time as you change the ratio.",
    capabilities: ["3D", "Scroll driven", "Configurator", "Charts"],
    direction:
      "Dark technical. Near black ground, one mint accent, a faint engineering grid, and every number in a monospace so the tables line up.",
    typefaces: ["Segoe UI Variable Display", "Cascadia Mono"],
    palette: [
      { name: "Ground", hex: "#0B0D0C" },
      { name: "Ink", hex: "#EEF3F0" },
      { name: "Accent", hex: "#3FD0A5" },
    ],
    build:
      "Eight layers built from lathes and tubes, each with its own start and end point along the axis. Materials are shared per part rather than made per mesh, and the transparent flag only flips at the edges of a fade, because toggling it recompiles the shader and that is what a scroll stutter is made of.",
    features: [
      "Scroll drives the separation and the camera, chapter by chapter",
      "Clicking a layer in the list flies to it and dims the rest of the motor",
      "Three gear ratios that rewrite peak torque, continuous torque, output speed, mass, price and lead time",
      "A torque and speed curve drawn to canvas from the selected build",
      "A quote form that carries the configured build into the request",
    ],
    accent: "#3FD0A5",
  },
  {
    slug: "vakaris",
    name: "Vakaris",
    // Being reworked; hidden from the listings for now.
    hidden: true,
    tagline: "Lamps for the dark half of the year",
    sector: "Maker workshop",
    brief:
      "A maker whose product is light, so the page has to be able to turn the lights on.",
    summary:
      "SVG shop elevations you can switch on, and a shelf of five lamps in glass and brass. A master switch takes the whole page to dusk and lights every one of them.",
    capabilities: ["3D", "Theming", "Booking", "Custom tools"],
    direction:
      "Warm editorial. Bone paper and brass, a serif for headings. The page has a daylight state and a dusk state, and the switch sits where a light switch would be.",
    typefaces: ["Georgia", "Segoe UI"],
    palette: [
      { name: "Paper", hex: "#EFE9DF" },
      { name: "Ink", hex: "#1C1814" },
      { name: "Brass", hex: "#A9761F" },
      { name: "Lamp", hex: "#F0A33A" },
    ],
    build:
      "The drawn lamps are SVG elevations with dimension lines, each carrying a bulb, a halo and a beam that switch with one class. The modelled lamps sit on a Three.js shelf, and every lamp owns its emissive parts, its point light and its glow sprite, so switching one on is a single call.",
    features: [
      "Click any drawing, or the hero pendant, to switch that lamp on",
      "Drag the shelf to turn it, or click a lamp to light it",
      "Tabs fly the camera to one lamp and back out to all five",
      "The master switch drops the room lighting, lights everything, and restores exactly what was on before when you switch back",
      "An order form with validation that names the batch it lands in",
    ],
    accent: "#F0A33A",
  },
  {
    slug: "orbit",
    name: "Orbit",
    tagline: "A hub you can take apart",
    sector: "Consumer hardware",
    brief:
      "A consumer product whose argument is repairability, which has to feel friendly without going childish.",
    summary:
      "An exploded modular hub with a working basket behind it. Choosing a finish repaints the model, the swatch, the order and the field of colour behind the whole page.",
    capabilities: ["3D", "Checkout", "Configurator", "Theming"],
    direction:
      "Soft, light and rounded. Pastel modules sit on one continuous field of colour that drifts at different rates as you scroll.",
    typefaces: ["Segoe UI Variable Display"],
    palette: [
      { name: "Paper", hex: "#F7F4FF" },
      { name: "Ink", hex: "#22203A" },
      { name: "Mint", hex: "#A7E8D0" },
      { name: "Butter", hex: "#F6E3A1" },
      { name: "Clay", hex: "#E8B4A0" },
      { name: "Periwinkle", hex: "#8B7FE8" },
    ],
    build:
      "Each module is an extruded rounded slab with a slightly larger slab behind it acting as the moulded rim, plus real geometry for the cells, the traces, the speaker perforations and the light ring. Tone mapping is off on purpose, because ACES desaturates pastels and the point of this palette is that the pigment stays where you put it.",
    features: [
      "The stack assembles on load and toggles between exploded and assembled",
      "Drag to rotate, and it sways on its own when left alone",
      "Hovering a part row lifts that module and fades the others back",
      "A basket with quantities per part, a complete kit at its own price, a running total, and persistence across visits",
      "Four finishes that repaint the cap in 3D, the swatch, the preview and the page",
      "A rule builder that composes a sentence from three selects and refuses duplicates",
      "Four repair guides with step by step instructions",
    ],
    accent: "#8B7FE8",
  },
  {
    slug: "giria",
    name: "Giria",
    tagline: "Three nights of songs in a pine wood",
    sector: "Festival",
    brief:
      "A two day festival that sells on atmosphere rather than a line up, where the page has to feel like the place.",
    summary:
      "Scrolling walks you into a forest and from afternoon into night. A hundred and twenty trunks, six glass lanterns, and five hundred fireflies that drift toward your pointer.",
    capabilities: ["3D", "Scroll driven", "Checkout", "Custom tools"],
    direction:
      "Indie folk. Deep green dark, lantern amber, and a serif that looks printed. Everything is soft edged and slow.",
    typefaces: ["Georgia", "Segoe UI"],
    palette: [
      { name: "Ground", hex: "#0B120E" },
      { name: "Ink", hex: "#EFE6D3" },
      { name: "Lantern", hex: "#F0B064" },
    ],
    build:
      "Tapered trunks with a drawn bark texture, exponential fog, lanterns in real transmissive glass, and additive fireflies that follow the pointer. Scrolling dollies the camera through the trees with a walking sway while the scene turns from afternoon to night.",
    features: [
      "Scroll walks you deeper into the wood and into the evening",
      "Opening an entry in the songbook lights the lanterns",
      "A programme across two days, with the stages and the walking times",
      "Tickets with a live total, and a form that validates before it confirms",
    ],
    accent: "#F0B064",
  },
  {
    slug: "vilnis",
    name: "Vilnis Type",
    // Being reworked; hidden from the listings for now.
    hidden: true,
    tagline: "A grotesk for the Baltic",
    sector: "Type foundry",
    brief:
      "A foundry selling one family, where the product is the typography, so the page has nothing else to lean on.",
    summary:
      "A type tester you can type into, a nine weight specimen, a hundred and ninety glyphs you can filter, and a licence calculator that reprices as you change seats and traffic.",
    capabilities: ["Custom tools", "Filtering", "Configurator"],
    direction:
      "Swiss. White, black, one red, a strict grid. Everything that looks like decoration is a specimen.",
    typefaces: ["System grotesk, set very large and very small"],
    palette: [
      { name: "Paper", hex: "#FFFFFF" },
      { name: "Ink", hex: "#101010" },
      { name: "Red", hex: "#E4002B" },
    ],
    features: [
      "A type tester with size, weight, tracking, leading, case and style, applied live to a field you can type into",
      "A nine weight specimen list",
      "A glyph table of a hundred and ninety characters, filterable by category, with a zoom panel for the selection",
      "A licence calculator priced on package, seats, web traffic and app installs",
    ],
    accent: "#E4002B",
  },
  {
    slug: "iron-hare",
    name: "Iron Hare",
    tagline: "Distilled in Kaunas since 1927",
    sector: "Spirits",
    brief:
      "A single product spirits brand, where the bottle is the whole identity and a photograph will not do.",
    summary:
      "A bottle in real transmissive glass, lathed from a millimetre profile. Pick three botanicals from eleven and the spirit changes colour while the label redraws itself.",
    capabilities: ["3D", "Configurator", "Booking", "Custom tools"],
    direction:
      "Art deco. Bottle green and brass on cream, stepped corners, sunburst rules, and a high contrast serif for display.",
    typefaces: ["Bodoni MT", "Segoe UI"],
    palette: [
      { name: "Green", hex: "#0E2019" },
      { name: "Cream", hex: "#F3EAD6" },
      { name: "Brass", hex: "#C9A227" },
    ],
    build:
      "The glass is a transmissive material with attenuation, so the green comes from the depth of the glass rather than from paint on it, and the spirit inside is a separate lathe with its own fill line. The room has two tall softboxes in it, because a bottle only reads as glass when it has long vertical sources to catch down its shoulders.",
    features: [
      "Drag to turn the bottle, with momentum and an idle drift",
      "Choose three botanicals from eleven, and they average into the colour of the spirit",
      "The label is drawn to a canvas and redrawn with your selection",
      "Serves, each with its build and its glassware",
      "A visit and tour booking form",
    ],
    accent: "#C9A227",
  },
  {
    slug: "cold-frame",
    name: "Cold Frame",
    tagline: "Seeds for a short season",
    sector: "Catalogue retail",
    brief:
      "A small grower selling a catalogue, where the useful thing is knowing what to sow and when.",
    summary:
      "A twelve month sowing calendar that opens on the current month, a catalogue you can filter three ways at once, and a seed box that adds up postage.",
    capabilities: ["Filtering", "Checkout", "Custom tools"],
    direction:
      "Risograph. Two spot inks, a deliberate misregistration on the display lines, a halftone paper overlay, and hard offset shadows.",
    typefaces: ["System grotesk, very heavy"],
    palette: [
      { name: "Paper", hex: "#F6F1E4" },
      { name: "Ink", hex: "#1F2419" },
      { name: "Pink", hex: "#FF4D6D" },
      { name: "Green", hex: "#2E7D50" },
    ],
    features: [
      "A twelve month calendar with real contents per month, under glass and direct outside",
      "Twelve varieties filtered on light, on where you are growing, and on how much attention they need",
      "A seed box with quantities, postage and a confirmation",
    ],
    accent: "#FF4D6D",
  },
  {
    slug: "uola",
    name: "UOLA",
    tagline: "Bouldering in Kaunas",
    sector: "Gym membership",
    brief:
      "A gym whose product is a wall that changes every fortnight, where the page has to show the climbing.",
    summary:
      "The wall is generated. Ninety holds on a jittered grid, and every problem is a line walked upward through them. Select one and it lights in its tape colour, numbered from the start.",
    capabilities: ["3D", "Custom tools", "Filtering", "Booking"],
    direction:
      "Concrete, tape and heavy type. Everything is square, and the only colour on the page comes from the tape on the problems.",
    typefaces: ["Arial Black", "Consolas"],
    palette: [
      { name: "Concrete", hex: "#D7D3CB" },
      { name: "Black", hex: "#14140F" },
      { name: "Tape", hex: "#FFD400" },
    ],
    build:
      "A fixed seed lays out the holds as lumpy polygons on a jittered grid, so the wall is the same every time you load it. Alongside it sits a resin hold on a sheet of ply, a sphere pushed about by a few sine waves and flattened at the back where it bolts on, taking the tape colour of whichever problem is selected.",
    features: [
      "Hover a problem to preview it on the wall, click to keep it, arrow keys to step through",
      "Filter by grade band",
      "Click any hold to jump to the problem that owns it",
      "A booking flow with seven days, seven slots a day, live pricing for people and shoe hire, and a reservation code",
    ],
    accent: "#FFD400",
  },
  {
    slug: "baltic-watch",
    name: "Baltic Watch",
    tagline: "Coastal observation network",
    sector: "Public data",
    brief:
      "A public data service, where the page has to be read quickly and trusted.",
    summary:
      "Six stations, four charts and a sea state model, all from one deterministic generator, so neighbouring stations agree with each other and the archive holds still while you read it.",
    capabilities: ["Charts", "3D", "Custom tools", "Filtering"],
    direction:
      "Institutional and pale. Humanist sans for prose, tabular monospace for every number, one blue, one warning amber, one alarm red.",
    typefaces: ["Segoe UI", "Consolas"],
    palette: [
      { name: "Paper", hex: "#F2F5F8" },
      { name: "Ink", hex: "#12212E" },
      { name: "Blue", hex: "#0A6ED1" },
    ],
    build:
      "Wind, wave height, water and air temperature, sea level and visibility are smooth functions of the absolute hour and a per station phase. The sea state panel is a sixty by sixty grid displaced by three directional waves taken from the selected station and hour, with a buoy riding the surface it is standing on.",
    features: [
      "Six stations on a drawn map, coloured by current wave height",
      "A slider from twenty four hours back to forty eight ahead that moves the readout, the charts and the model",
      "Sea level, a sixteen sector wind rose, wave height by hour, and water against air temperature",
      "A seven day table with a confidence column and a duty forecaster note",
      "Metric and imperial throughout",
    ],
    accent: "#4A9EE8",
  },
];

export const getDemo = (slug: string) => demos.find((d) => d.slug === slug);

/** Everything listed publicly. Use this for the index, the nav, the sitemap
 *  and the home montage; use `demos` where the full set is needed, such as
 *  generating the routes so a hidden page still answers on its own URL. */
export const visibleDemos = demos.filter((d) => !d.hidden);

/** Next.js serves `public/` verbatim and does not resolve directory indexes,
 *  so the filename has to be explicit. */
export const demoUrl = (demo: Demo) => `/demos/${demo.slug}/index.html`;

export const previewUrl = (demo: Demo) => `/demos/${demo.slug}/preview.png`;
