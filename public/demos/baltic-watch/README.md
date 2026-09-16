# Baltic Watch

Concept promotional site for a fictional coastal observation network.

**Brief it answers:** a public data service, where the job of the page is to be
read quickly and to be trusted, not to be admired.

## Direction
Institutional and pale. Humanist sans for prose, tabular monospace for every
number so columns line up, one blue, one warning amber, one alarm red.

- Running type: Segoe UI
- Data type: Consolas
- Palette: #f2f5f8 paper, #12212e ink, #0a6ed1 blue

## The data
One deterministic generator feeds the whole page. Wind, wave height, water and
air temperature, sea level and visibility are all smooth functions of the
absolute hour and a per station phase, so neighbouring stations agree with each
other and the archive does not change while you are reading it.

## The 3D
A sea state panel: a sixty by sixty grid displaced by three directional waves
whose amplitude, period and heading come from the selected station and hour,
with a buoy riding the surface it is standing on.

## What works
- Six stations on a drawn map, coloured by current wave height
- A time slider from twenty four hours back to forty eight hours ahead that
  moves the readout, all four charts and the sea state model
- Four canvas charts: sea level, a sixteen sector wind rose binned by speed,
  wave height by hour, and water against air temperature
- A seven day table with a confidence column and a duty forecaster note
- Metric and imperial throughout

## Running it
Open `index.html`, or serve the folder with any static server. No build step,
no network request, no image files.

```
index.html    markup
styles.css    page furniture
scene.js      the Three.js sea state panel
script.js     record generator, map, charts, forecast
vendor/       three.js r147 (MIT)
```
