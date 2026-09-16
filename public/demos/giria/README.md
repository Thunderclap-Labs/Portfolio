# GIRIA

Concept promotional site for a fictional folk song festival in a forest.

**Brief it answers:** a two day festival that sells on atmosphere rather than
on a line up, where the page has to feel like the place.

## Direction
Indie folk, not futurism. Deep green dark, warm lantern amber, a serif that
looks printed rather than designed. Everything is soft edged and slow.

- Display type: Georgia
- Running type: Segoe UI
- Palette: #0b120e ground, #efe6d3 ink, #f0b064 lantern

## The 3D
A Three.js forest you walk into. A hundred and twenty tapered trunks with a
drawn bark texture, exponential fog, six hanging lanterns in real transmissive
glass, and five hundred and twenty additive fireflies that drift toward the
pointer. Scrolling dollies the camera through the trees with a walking sway
while the scene turns from afternoon to night.

## What works
- Scroll walks you deeper into the forest and into the evening
- Opening an entry in the songbook lights the lanterns
- A programme across two days, with the stages and the walking times
- Tickets with a live total, and a form that validates before it confirms

## Running it
Open `index.html`, or serve the folder with any static server. No build step,
no network request, no image files.

```
index.html    markup
styles.css    page furniture
scene.js      the Three.js forest
script.js     programme, songbook, tickets
vendor/       three.js r147 (MIT)
```
