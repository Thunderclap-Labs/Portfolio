# UOLA

Concept promotional site for a fictional bouldering gym.

**Brief it answers:** a gym whose product is a wall that changes every
fortnight, where the page has to show the climbing rather than describe it.

## Direction
Concrete, tape and heavy type. Everything is square, the display face is as
heavy as the browser will give us, and the only colour on the page comes from
the tape colours of the problems themselves.

- Display type: Arial Black, falling back to Haettenschweiler and Impact
- Data type: Consolas
- Palette: #d7d3cb concrete, #14140f black, #ffd400 tape yellow

## The wall
The wall is generated rather than drawn. A fixed seed lays out about ninety
holds on a jittered grid, each one a lumpy polygon rather than a circle, and
every problem is a line walked upward through nearby holds. Selecting a problem
lights its holds in its tape colour, numbers them from the start and dims
everything else, which is what the tape on a real wall does.

## The 3D
A Three.js resin hold on a sheet of ply: a sphere pushed about by a few sine
waves, flattened at the back where it bolts on, with a bolt and washer through
the front. It takes the tape colour of whichever problem is selected.

## What works
- Hover a problem to preview it on the wall, click to keep it, arrow keys to
  step through
- Filter by grade band
- Click any hold on the wall to jump to the problem that owns it
- A booking flow: seven days, seven slots a day, capacity worked out the same
  way every time, live price for people and shoe hire, and a reservation code

## Running it
Open `index.html`, or serve the folder with any static server. No build step,
no network request, no image files.

```
index.html    markup
styles.css    page furniture
scene.js      the Three.js hold
script.js     wall generator, problems, booking
vendor/       three.js r147 (MIT)
```
