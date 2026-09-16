# Halcyon HF-1

Concept promotional site for a fictional hardware brand.

**Brief it answers:** a small manufacturer selling one physical product in
limited batches, where the object itself has to carry the page.

## Direction
Retro futuristic. Warm bone paper, machined greys, a single oxide orange.
Film grain and scanlines over everything so nothing reads as flat digital.

- Display type: Bahnschrift (condensed grotesk), falling back to Archivo Narrow
- Instrumentation type: Consolas
- Palette: #EDE4D3 paper, #191512 ink, #E2632A amber

## The 3D
A real Three.js model, not an image. The body and the transport keys are
extruded rounded slabs; the face graphics, the back plate engraving and the VU
meter are drawn to canvases and used as textures. The meter canvas is redrawn
every frame, so the needle has genuine ballistics rather than a CSS animation.

Lighting is a key, fill and rim, plus a procedural studio environment map
generated from a canvas gradient and run through PMREM, which is what gives
the anodised aluminium something to reflect.

## What works
- Drag or arrow keys to orbit the model, with momentum and an idle sway
- Transport: play, rewind, forward, stop and record, driven from the page
  buttons or by clicking the keys on the 3D model itself. Reels spin at the
  right speed and direction, the tape pack grows and shrinks, the timecode
  runs and the VU responds to what the machine is doing
- Three colourways that repaint the model, the panel texture and the page
- The anatomy list flies the camera to each part and lights the matching zone
  on the blueprint
- Service items open a prefilled request
- A reservation flow with validation, a live total, a reference number and
  persistence in localStorage, shown back on the order section

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
