/* VILNIS / the wave specimen
   -------------------------------------------------------------------------
   The foundry is named after a wave, and the family was drawn for signage on
   a coast, so the specimen behaves like one. A word is rasterised to an
   offscreen canvas, sampled on a grid, and every sampled pixel becomes a
   particle that springs back to where the letterform wants it. A swell runs
   along x, and the pointer pushes the surface apart.

   The point of doing it this way rather than with a font animation is that
   the letterforms stay real type: the sampling reads whatever is set, at
   whatever weight, so the specimen and the tester cannot drift apart.

   Exposed as window.VilnisWave:
     init(canvas)  -> boolean
     setWord(text) -> re-rasterise and re-target
     destroy()
   ------------------------------------------------------------------------- */

window.VilnisWave = (function () {
  "use strict";

  var canvas, ctx, raf, live = false;
  var W = 0, H = 0, dpr = 1;
  var pts = [];
  var word = "Vilnis";
  var t0 = 0;
  var pointer = { x: -9999, y: -9999, on: false };

  // Sampling step in CSS pixels. Smaller is denser and costs more; 4 keeps a
  // 1440px specimen near 6000 particles, which stays at 60fps on a laptop.
  var STEP = 4;
  var INK = "#101010";
  var RED = "#e4002b";

  function rasterise(text) {
    var off = document.createElement("canvas");
    var o = off.getContext("2d", { willReadFrequently: true });

    off.width = W;
    off.height = H;

    // Fit the word to the box, then back off so the swell has somewhere to go.
    var size = Math.min(H * 0.72, (W / Math.max(3, text.length)) * 1.85);

    o.fillStyle = "#000";
    o.textAlign = "center";
    o.textBaseline = "middle";
    o.font =
      "800 " +
      size +
      'px "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';
    o.fillText(text, W / 2, H / 2);

    var data;

    try {
      data = o.getImageData(0, 0, W, H).data;
    } catch (e) {
      return [];
    }

    var out = [];

    for (var y = 0; y < H; y += STEP) {
      for (var x = 0; x < W; x += STEP) {
        if (data[(y * W + x) * 4 + 3] > 128) {
          out.push(x, y);
        }
      }
    }

    return out;
  }

  function setWord(text) {
    word = text || word;

    var target = rasterise(word);
    var n = target.length / 2;
    var i;

    // Reuse the particles we already have, so a word change flows into the
    // next shape instead of restarting from confetti every time.
    for (i = 0; i < n; i++) {
      var tx = target[i * 2];
      var ty = target[i * 2 + 1];

      if (pts[i]) {
        pts[i].tx = tx;
        pts[i].ty = ty;
        pts[i].dead = false;
      } else {
        pts[i] = {
          x: tx + (Math.random() - 0.5) * W * 0.5,
          y: ty + (Math.random() - 0.5) * H,
          vx: 0,
          vy: 0,
          tx: tx,
          ty: ty,
          // A tenth of the particles carry the accent, scattered rather than
          // banded, so the red reads as spray off the crest.
          red: Math.random() < 0.1,
          seed: Math.random() * 6.283,
          dead: false,
        };
      }
    }

    // Anything left over from a longer word sinks out instead of vanishing.
    for (i = n; i < pts.length; i++) {
      pts[i].dead = true;
      pts[i].ty = H + 60;
      pts[i].tx = pts[i].x;
    }
  }

  function resize() {
    var r = canvas.getBoundingClientRect();

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setWord(word);
  }

  function frame() {
    if (!live) return;
    raf = requestAnimationFrame(frame);

    var t = (performance.now() - t0) / 1000;

    ctx.clearRect(0, 0, W, H);

    var inkPath = [];
    var redPath = [];

    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];

      /* The swell. One long wave along x with a slow second one under it, so
         the crest never repeats on a tight loop. Amplitude is small: this is
         a specimen, and the word has to stay readable while it moves. */
      var swell =
        Math.sin(p.tx * 0.012 + t * 1.15) * 7 +
        Math.sin(p.tx * 0.004 - t * 0.6 + p.seed) * 4;

      var gx = p.tx;
      var gy = p.ty + swell;

      // Pointer pushes the surface apart, falling off over ~120px.
      if (pointer.on) {
        var dx = p.x - pointer.x;
        var dy = p.y - pointer.y;
        var d2 = dx * dx + dy * dy;

        if (d2 < 14400 && d2 > 0.01) {
          var d = Math.sqrt(d2);
          var push = (1 - d / 120) * 34;

          gx += (dx / d) * push;
          gy += (dy / d) * push;
        }
      }

      // Critically damped enough not to wobble, loose enough to feel liquid.
      p.vx += (gx - p.x) * 0.055;
      p.vy += (gy - p.y) * 0.055;
      p.vx *= 0.82;
      p.vy *= 0.82;
      p.x += p.vx;
      p.y += p.vy;

      if (p.dead && p.y > H + 40) continue;

      (p.red ? redPath : inkPath).push(p.x, p.y);
    }

    paint(inkPath, INK);
    paint(redPath, RED);
  }

  /* One path per colour rather than one per particle: six thousand separate
     fill calls is what turns this from a specimen into a slideshow. */
  function paint(list, colour) {
    if (!list.length) return;
    ctx.fillStyle = colour;
    ctx.beginPath();
    for (var i = 0; i < list.length; i += 2) {
      ctx.rect(list[i] - 1.1, list[i + 1] - 1.1, 2.2, 2.2);
    }
    ctx.fill();
  }

  function init(el) {
    if (!el || !el.getContext) return false;
    canvas = el;
    ctx = canvas.getContext("2d");
    if (!ctx) return false;

    t0 = performance.now();
    resize();

    if (!pts.length) return false;

    window.addEventListener("resize", resize);
    canvas.addEventListener(
      "pointermove",
      function (e) {
        var r = canvas.getBoundingClientRect();

        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
        pointer.on = true;
      },
      { passive: true },
    );
    canvas.addEventListener("pointerleave", function () {
      pointer.on = false;
    });

    live = true;
    frame();

    return true;
  }

  function destroy() {
    live = false;
    if (raf) cancelAnimationFrame(raf);
  }

  return { init: init, setWord: setWord, destroy: destroy };
})();
