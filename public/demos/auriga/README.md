# AURIGA Drive 12

Concept promotional site for a fictional robotics joint manufacturer.

**Brief it answers:** a components supplier selling to engineers, who will not
believe a marketing page and want to see inside the part before they specify
it.

## Direction
Dark technical. Near black ground, one mint accent, a faint engineering grid,
and numbers set in a monospace so specification tables line up.

- Display type: Segoe UI Variable Display, falling back to a system grotesk
- Data type: Cascadia Mono
- Palette: #0b0d0c ground, #eef3f0 ink, #3fd0a5 accent

## The 3D
A Three.js drive unit built from lathes and tubes: housing, end cap, encoder
board, stator, rotor, brake, gearbox and output flange. Scroll separates the
eight layers along the axis, each with its own start and end point, so the
motor comes apart in the order you would actually take it apart.

Materials are shared per part rather than created per mesh, and the transparent
flag is only flipped on the edges of a fade, because toggling it recompiles the
shader and that is what a scroll stutter is made of. All easing is expressed as
a rate per second, so the model keeps up with the scroll on a slow frame.

## What works
- Scroll drives the separation and the camera pose, chapter by chapter
- Clicking a layer in the list flies to it and dims the rest of the motor
- A ratio configurator (1:9, 1:36, 1:121) that rewrites peak torque, continuous
  torque, output speed, mass, price and lead time
- A torque and speed curve drawn to canvas from the selected build
- A quote form that carries the configured build into the request

## Running it
Open `index.html`, or serve the folder with any static server. No build step
and no network request: Three.js is vendored, every texture is drawn to a
canvas at runtime, and there are no image files.

```
index.html    markup
styles.css    page furniture
scene.js      the Three.js drive
script.js     configurator, curve, quote
vendor/       three.js r147 (MIT)
```
