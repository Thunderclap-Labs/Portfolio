# Iron Hare

Concept promotional site for a fictional gin distillery.

**Brief it answers:** a single product spirits brand, where the bottle is the
whole identity and has to be on the page in a way a photograph cannot manage.

## Direction
Art deco. Bottle green and brass on cream, stepped corners, sunburst rules,
a high contrast serif for display.

- Display type: Bodoni MT, falling back to Baskerville Old Face and Georgia
- Running type: Segoe UI
- Palette: #0e2019 green, #f3ead6 cream, #c9a227 brass

## The 3D
A Three.js bottle lathed from a millimetre profile. The glass is real
transmissive material with attenuation, so the green comes from the depth of
the glass rather than from paint on it, and the spirit inside is a separate
lathe with its own fill line. The environment is a drawn room with two tall
softboxes in it, because a bottle only reads as glass when it has long vertical
sources to catch down its shoulders. There is a contact shadow under it so it
sits on something.

The label is drawn to a canvas and wrapped on a partial cylinder, and it is
redrawn whenever the botanicals change.

## What works
- Drag to turn the bottle, with momentum and an idle drift
- Choose three botanicals from eleven: they average into a liquid colour, the
  spirit in the bottle changes, and the label is redrawn with your selection
- Serves, each with its build and its glassware
- A visit and tour booking form

## Running it
Open `index.html`, or serve the folder with any static server. No build step,
no network request, no image files.

```
index.html    markup
styles.css    page furniture
scene.js      the Three.js bottle
script.js     botanicals, label, serves, booking
vendor/       three.js r147 (MIT)
```
