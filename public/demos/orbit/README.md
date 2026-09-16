# Orbit

Concept promotional site for a fictional modular smart home hub.

**Brief it answers:** a consumer hardware product with an argument to make
(repairability), which needs to feel friendly without becoming childish.

## Direction
Soft, light, rounded. Pastel modules on one continuous field of colour rather
than a stack of coloured bands: five washes sit behind the whole page, drift at
different rates as you scroll, and two of them take whichever finish is
selected, so choosing Clay repaints the site.

- Type: Segoe UI Variable Display at heavy weights
- Palette: #F7F4FF paper, #22203A ink, plus mint, butter, clay and periwinkle

## The 3D
A Three.js exploded view. Each module is an extruded rounded slab with a
second, slightly larger slab behind it acting as the moulded rim, plus real
geometry for the cells, the traces, the speaker perforations and the light
ring. Tone mapping is deliberately off: ACES desaturates pastels, and the
whole point of the palette is that the pigment stays put.

## What works
- The stack assembles on load and can be toggled between exploded and
  assembled
- Drag to rotate, and it sways on its own when left alone
- Hovering a part row lifts that module and fades the others back
- A real basket: quantities per part, a complete kit at a different price, a
  slide over panel, running total, checkout with a reference, and persistence
  in localStorage
- Four finishes that repaint the cap in the 3D model, the swatch, the preview,
  the order and the colour field behind the whole page
- A rule builder that composes a sentence from three selects, refuses
  duplicates and keeps a list
- Four repair guides with real step by step instructions

## Running it

Open `index.html` directly, or serve the folder with any static server. There
is no build step and no network request: Three.js is vendored in `vendor/`,
every texture is drawn to a canvas at runtime, and there are no image files.

```
index.html    markup
styles.css    page furniture
scene.js      the Three.js scene
script.js     everything the page does
vendor/       three.js r147 (MIT), see vendor/three-LICENSE.txt
```
