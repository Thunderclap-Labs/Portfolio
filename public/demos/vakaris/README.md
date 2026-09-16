# Vakaris

Concept promotional site for a fictional lamp workshop in Kaunas.

**Brief it answers:** a small maker whose product is light itself, so the page
has to be able to turn the lights on.

## Direction
Warm editorial. Bone paper, brass, a serif for headings and a grotesk for
running text. The whole page has two states, daylight and dusk, and the switch
is in the top right where a light switch would be.

- Display type: Georgia
- Running type: Segoe UI
- Palette: #efe9df paper, #1c1814 ink, #a9761f brass, #f0a33a lamp

## The two kinds of lamp
The drawn lamps are SVG shop elevations with dimension lines. Each one carries
a bulb, a halo and a beam that switch with a single class, so clicking a
drawing lights it the way the real lamp would light a wall.

The modelled lamps are a Three.js shelf of five: a perforated brass dome, a
shell lamp that opens as it lights, a stone and glass column, a broken frosted
ring and a glass bell with twenty two lit tips. Every lamp owns its emissive
parts, a point light and a glow sprite, so switching one on is one call.

## What works
- Click any drawing, or the hero pendant, to switch that lamp on. A counter
  keeps track
- Drag the shelf to turn it, click a lamp to switch it on, or use the list
- Tabs fly the camera to a single lamp and back to all five
- The master switch takes the page to dusk, lights every lamp, drops the room
  lighting in the 3D scene, and puts back exactly what was on before when you
  switch back to daylight
- An order form with validation that names the batch it lands in

## Running it
Open `index.html`, or serve the folder with any static server. No build step,
no network request, no image files.

```
index.html    markup
styles.css    page furniture, both palettes
scene.js      the Three.js shelf
script.js     drawings, shelf, master switch, order form
vendor/       three.js r147 (MIT)
```
