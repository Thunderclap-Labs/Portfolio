/* Baltic Watch / site behaviour
   One deterministic record generator feeds everything: the map, the readout,
   the four canvases, the seven day table and the sea state panel. Nothing is
   random at load time, so the page says the same thing if you reload it. */

(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* ---------------------------------------------------------- the network */

  var STATIONS = [
    {
      k: "BUT",
      name: "Butinge Offshore",
      kind: "Waverider buoy",
      pos: "56.09 N 21.02 E",
      x: 126,
      y: 38,
      depth: 21,
      fetch: 1,
      since: 2001,
      phase: 0.4,
    },
    {
      k: "SVE",
      name: "Sventoji Mouth",
      kind: "Coastal mast",
      pos: "56.03 N 21.06 E",
      x: 148,
      y: 84,
      depth: 6,
      fetch: 0.82,
      since: 1998,
      phase: 1.7,
    },
    {
      k: "PLG",
      name: "Palanga Pier",
      kind: "Pier platform",
      pos: "55.92 N 21.05 E",
      x: 152,
      y: 132,
      depth: 8,
      fetch: 0.88,
      since: 1994,
      phase: 2.9,
    },
    {
      k: "KLJ",
      name: "Klaipeda Gate",
      kind: "Harbour entrance",
      pos: "55.70 N 21.10 E",
      x: 136,
      y: 236,
      depth: 14,
      fetch: 0.94,
      since: 1994,
      phase: 4.1,
    },
    {
      k: "JUO",
      name: "Juodkrante Bay",
      kind: "Lagoon station",
      pos: "55.54 N 21.12 E",
      x: 166,
      y: 312,
      depth: 4,
      fetch: 0.34,
      since: 2007,
      phase: 5.3,
    },
    {
      k: "NID",
      name: "Nida Spit",
      kind: "Dune mast",
      pos: "55.30 N 20.99 E",
      x: 148,
      y: 404,
      depth: 9,
      fetch: 0.72,
      since: 1996,
      phase: 6.6,
    },
  ];

  var CARDINAL = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

  function card(deg) {
    return CARDINAL[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
  }

  /* --------------------------------------------------------- the record --
     Everything is a smooth function of absolute hour and station phase, so
     neighbouring stations agree with each other and the past does not change
     while you are reading it. */

  var NOW = new Date();

  NOW.setMinutes(0, 0, 0);

  var H0 = Math.floor(NOW.getTime() / 3600000);

  function reading(st, hOffset) {
    var h = H0 + hOffset;
    var p = st.phase;
    var day = h / 24;

    var wind =
      5.4 +
      3.6 * Math.sin(h / 17.3 + p) +
      2.1 * Math.sin(h / 6.1 + p * 1.7) +
      1.2 * Math.sin(h / 2.7 + p * 0.6) +
      st.fetch * 1.4;

    wind = Math.max(0.6, wind);

    var gust = wind * (1.34 + 0.12 * Math.sin(h / 3.9 + p));

    var dir =
      ((236 +
        96 * Math.sin(h / 41 + p * 0.5) +
        26 * Math.sin(h / 9.4 + p) +
        360) %
        360);

    /* a short fetch sea builds and drops fast, so wave height follows wind
       with only an hour or so of memory */
    var lag =
      0.72 * wind +
      0.28 *
        Math.max(
          0.6,
          5.4 + 3.6 * Math.sin((h - 2) / 17.3 + p) + 2.1 * Math.sin((h - 2) / 6.1 + p * 1.7),
        );

    var hs = 0.021 * lag * lag * st.fetch + 0.06;

    hs = Math.min(hs, 4.2);

    var tp = 2.5 + 1.55 * Math.sqrt(hs * 10) * (0.7 + st.fetch * 0.4);

    /* water peaks in the third week of August and bottoms out in February,
       air peaks five weeks earlier and swings much further */
    var doy = (day % 365.25) + 0.5;
    var water =
      10.6 +
      9.1 * Math.cos(((doy - 228) / 365.25) * 2 * Math.PI) +
      st.fetch * -0.9 +
      0.9 * Math.sin(h / 53 + p);

    var air =
      8.4 +
      10.4 * Math.cos(((doy - 199) / 365.25) * 2 * Math.PI) +
      3.2 * Math.sin(((h % 24) / 24) * 2 * Math.PI - 1.9) +
      1.8 * Math.sin(h / 29 + p * 1.3);

    /* the Baltic has almost no tide, so this is wind setup and seiche */
    var level =
      13 * Math.sin(h / 13.8 + p * 0.4) +
      7 * Math.sin(h / 4.4 + p) +
      (Math.cos((dir * Math.PI) / 180 - 1.2) * wind * wind) / 11;

    var vis = Math.max(0.4, 21 - hs * 3.4 - 6 * Math.max(0, Math.sin(h / 31 + p * 2.2)));

    return {
      hour: h,
      wind: wind,
      gust: gust,
      dir: dir,
      hs: hs,
      tp: tp,
      water: water,
      air: air,
      level: level,
      vis: vis,
    };
  }

  /* ------------------------------------------------------------- formats -- */

  var units = "metric";

  function n(v, d) {
    return v.toFixed(d === undefined ? 1 : d);
  }

  var F = {
    wave: function (m) {
      return units === "metric"
        ? [n(m, 1), "m"]
        : [n(m * 3.2808, 1), "ft"];
    },
    wind: function (ms) {
      return units === "metric"
        ? [n(ms, 1), "m/s"]
        : [n(ms * 1.9438, 0), "kn"];
    },
    temp: function (c) {
      return units === "metric"
        ? [n(c, 1), "C"]
        : [n(c * 1.8 + 32, 1), "F"];
    },
    level: function (cm) {
      return units === "metric"
        ? [(cm >= 0 ? "+" : "") + n(cm, 0), "cm"]
        : [(cm >= 0 ? "+" : "") + n(cm * 0.3937, 1), "in"];
    },
    dist: function (km) {
      return units === "metric"
        ? [n(km, 1), "km"]
        : [n(km * 0.5399, 1), "nm"];
    },
    period: function (s) {
      return [n(s, 1), "s"];
    },
  };

  function pair(t) {
    return t[0] + '<i>' + t[1] + "</i>";
  }

  function hourLabel(off) {
    var d = new Date(NOW.getTime() + off * 3600000);
    var p = function (x) {
      return String(x).padStart(2, "0");
    };

    return p(d.getHours()) + ":00";
  }

  function dayLabel(off) {
    var d = new Date(NOW.getTime() + off * 3600000);

    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  }

  function dateLabel(off) {
    var d = new Date(NOW.getTime() + off * 3600000);

    return (
      String(d.getDate()).padStart(2, "0") +
      "." +
      String(d.getMonth() + 1).padStart(2, "0")
    );
  }

  /* ---------------------------------------------------------------- state */

  var stIndex = 3;
  var offset = 0;

  function station() {
    return STATIONS[stIndex];
  }

  /* ------------------------------------------------------------------ map */

  function seaColour(hs) {
    return hs > 2 ? "#b3261e" : hs > 1 ? "#b5651d" : "#2e9fbe";
  }

  function drawPins() {
    $("#pins").innerHTML = STATIONS.map(function (s, i) {
      var r = reading(s, 0);

      return (
        '<g class="pin' +
        (i === stIndex ? " is-on" : "") +
        '" data-i="' +
        i +
        '" role="button" tabindex="0" aria-label="' +
        s.name +
        '">' +
        '<circle class="pin__ring" cx="' +
        s.x +
        '" cy="' +
        s.y +
        '" r="13"></circle>' +
        '<circle class="pin__dot" cx="' +
        s.x +
        '" cy="' +
        s.y +
        '" r="6" fill="' +
        seaColour(r.hs) +
        '"></circle>' +
        '<circle class="pin__hit" cx="' +
        s.x +
        '" cy="' +
        s.y +
        '" r="20"></circle>' +
        '<text class="pin__lab" x="' +
        (s.x - 17) +
        '" y="' +
        (s.y + 3.5) +
        '" text-anchor="end">' +
        s.k +
        "</text>" +
        "</g>"
      );
    }).join("");

    $$(".pin").forEach(function (g) {
      function pick() {
        stIndex = Number(g.dataset.i);
        paintAll();
      }

      g.addEventListener("click", pick);
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick();
        }
      });
    });
  }

  /* -------------------------------------------------------------- readout */

  function trend(now, before) {
    var d = now - before;

    if (Math.abs(d) < 0.06) return '<span class="trend trend--flat">steady</span>';

    return d > 0
      ? '<span class="trend trend--up">rising</span>'
      : '<span class="trend trend--down">falling</span>';
  }

  /* Douglas sea state, in words rather than in a number nobody remembers */
  function seaWords(hs) {
    if (hs < 0.1) return "Calm, glassy";
    if (hs < 0.5) return "Smooth, small wavelets";
    if (hs < 1.25) return "Slight, the odd white crest";
    if (hs < 2.5) return "Moderate, crests breaking along the bar";
    if (hs < 4) return "Rough, spray blown off the tops";

    return "Very rough, working conditions only";
  }

  function paintReadout() {
    var st = station();
    var r = reading(st, offset);
    var prev = reading(st, offset - 3);

    $("#stName").textContent = st.name;
    $("#stMeta").textContent =
      st.k + " / " + st.kind + " / " + st.depth + " m";

    var tiles = [
      [
        "Wave height",
        pair(F.wave(r.hs)),
        trend(r.hs, prev.hs) + " over three hours",
      ],
      [
        "Wind",
        pair(F.wind(r.wind)),
        '<span class="arrow" style="transform:rotate(' +
          (r.dir + 180) +
          'deg)">&uarr;</span>from ' +
          card(r.dir) +
          " " +
          Math.round(r.dir) +
          " deg",
      ],
      ["Water", pair(F.temp(r.water)), "At 0.5 m depth"],
      ["Air", pair(F.temp(r.air)), "At 2 m above the deck"],
      [
        "Sea level",
        pair(F.level(r.level)),
        "Above chart datum, wind driven",
      ],
      ["Visibility", pair(F.dist(r.vis)), "Horizontal, from the mast"],
      [
        "Sea state",
        '<span style="font-size:19px">' + seaWords(r.hs) + "</span>",
        "Peak period " +
          pair(F.period(r.tp)) +
          ", gusting " +
          pair(F.wind(r.gust)),
        true,
      ],
    ];

    $("#read").innerHTML = tiles
      .map(function (t) {
        return (
          '<div class="rd' +
          (t[3] ? " rd--wide" : "") +
          '"><span class="rd__k">' +
          t[0] +
          '</span><div class="rd__v">' +
          t[1] +
          '</div><span class="rd__t">' +
          t[2] +
          "</span></div>"
        );
      })
      .join("");

    $("#seaHs").innerHTML = pair(F.wave(r.hs));
    $("#seaTp").innerHTML = pair(F.period(r.tp));
    $("#seaDir").innerHTML = card(r.dir) + "<i></i>";
    $("#seaMeta").textContent =
      "Grid 1 km, " + (offset === 0 ? "observed" : "modelled");

    if (window.BalticSea) {
      BalticSea.setState({ hs: r.hs, tp: r.tp, dir: r.dir });
    }

    var note;

    if (offset === 0) {
      note =
        "Observed. The instrument reported this at " +
        hourLabel(0) +
        " and it has not been adjusted since.";
    } else if (offset < 0) {
      note =
        "Archive. " +
        Math.abs(offset) +
        " hours back, quality checked against the two nearest stations.";
    } else {
      note =
        "Forecast. " +
        offset +
        " hours ahead, from the 1 km model run at " +
        hourLabel(-((H0 % 6) + 1)) +
        ".";
    }

    $("#scrubNote").textContent = note;
    $("#scrubLabel").textContent =
      (offset === 0
        ? "Now"
        : (offset > 0 ? "+" : "") + offset + " h") +
      "  " +
      dayLabel(offset) +
      " " +
      hourLabel(offset);
  }

  /* --------------------------------------------------------------- canvas */

  function ctxFor(id) {
    var c = $(id);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = c.clientWidth || 600;
    var h = c.clientHeight || 260;

    c.width = w * dpr;
    c.height = h * dpr;

    var x = c.getContext("2d");

    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, w, h);

    return { x: x, w: w, h: h };
  }

  var INK = "#12212e";
  var INK3 = "#7c93a1";
  var LINE = "#e6edf2";
  var BLUE = "#0a6ed1";
  var DEEP = "#06375f";

  function series(field) {
    var out = [];

    for (var i = -24; i <= 48; i++) out.push(reading(station(), i)[field]);

    return out;
  }

  function xAt(i, w, pad) {
    return pad + ((w - pad * 2) * i) / 72;
  }

  function axis(c, pad) {
    var x = c.x;

    x.strokeStyle = LINE;
    x.lineWidth = 1;

    for (var h = -24; h <= 48; h += 12) {
      var px = Math.round(xAt(h + 24, c.w, pad)) + 0.5;

      x.beginPath();
      x.moveTo(px, 8);
      x.lineTo(px, c.h - 22);
      x.stroke();

      x.fillStyle = INK3;
      x.font = "10px Consolas, monospace";
      x.textAlign = "center";
      x.fillText(
        (h === 0 ? "now" : (h > 0 ? "+" : "") + h),
        px,
        c.h - 8,
      );
    }
  }

  function marker(c, pad) {
    var x = c.x;
    var px = Math.round(xAt(offset + 24, c.w, pad)) + 0.5;

    x.strokeStyle = DEEP;
    x.lineWidth = 1;
    x.setLineDash([3, 3]);
    x.beginPath();
    x.moveTo(px, 6);
    x.lineTo(px, c.h - 22);
    x.stroke();
    x.setLineDash([]);
  }

  function drawTide() {
    var c = ctxFor("#tideCanvas");
    var pad = 34;
    var d = series("level");
    var max = Math.max.apply(null, d.map(Math.abs));
    var span = Math.max(20, Math.ceil(max / 10) * 10 + 5);
    var mid = (c.h - 22) / 2 + 4;
    var y = function (v) {
      return mid - (v / span) * (mid - 14);
    };

    axis(c, pad);

    var x = c.x;

    x.strokeStyle = "#c3d2dd";
    x.beginPath();
    x.moveTo(pad, Math.round(y(0)) + 0.5);
    x.lineTo(c.w - pad, Math.round(y(0)) + 0.5);
    x.stroke();

    // filled body between the curve and datum
    x.beginPath();
    x.moveTo(xAt(0, c.w, pad), y(0));
    d.forEach(function (v, i) {
      x.lineTo(xAt(i, c.w, pad), y(v));
    });
    x.lineTo(xAt(72, c.w, pad), y(0));
    x.closePath();
    x.fillStyle = "rgba(10,110,209,0.12)";
    x.fill();

    x.beginPath();
    d.forEach(function (v, i) {
      var px = xAt(i, c.w, pad);

      i ? x.lineTo(px, y(v)) : x.moveTo(px, y(v));
    });
    x.strokeStyle = BLUE;
    x.lineWidth = 1.8;
    x.stroke();

    x.fillStyle = INK3;
    x.font = "10px Consolas, monospace";
    x.textAlign = "right";
    x.fillText("+" + span, pad - 6, 16);
    x.fillText("0", pad - 6, y(0) + 3);
    x.fillText("-" + span, pad - 6, c.h - 26);

    marker(c, pad);

    var here = d[offset + 24];
    var lo = Math.min.apply(null, d);
    var hi = Math.max.apply(null, d);

    $("#tideNote").innerHTML =
      "Selected hour " +
      pair(F.level(here)) +
      ". Range across the window " +
      pair(F.level(lo)) +
      " to " +
      pair(F.level(hi)) +
      ". The Baltic tide is a few centimetres, so almost all of this is wind pushing water onto the coast.";
  }

  function drawWave() {
    var c = ctxFor("#waveCanvas");
    var pad = 34;
    var d = series("hs");
    var max = Math.max(1, Math.ceil(Math.max.apply(null, d) * 2) / 2);
    var floor = c.h - 22;
    var y = function (v) {
      return floor - (v / max) * (floor - 14);
    };
    var x = c.x;

    // horizontal grid at half metre steps
    for (var g = 0; g <= max; g += 0.5) {
      var py = Math.round(y(g)) + 0.5;

      x.strokeStyle = LINE;
      x.beginPath();
      x.moveTo(pad, py);
      x.lineTo(c.w - pad, py);
      x.stroke();
      x.fillStyle = INK3;
      x.font = "10px Consolas, monospace";
      x.textAlign = "right";
      x.fillText(g.toFixed(1), pad - 6, py + 3);
    }

    var bw = (c.w - pad * 2) / 73;

    d.forEach(function (v, i) {
      var px = xAt(i, c.w, pad);

      x.fillStyle =
        i + -24 === offset
          ? DEEP
          : v > 2
            ? "#b3261e"
            : v > 1
              ? "#b5651d"
              : "#2e9fbe";
      x.globalAlpha = i < 24 ? 0.55 : 1;
      x.fillRect(px - bw * 0.36, y(v), bw * 0.72, floor - y(v));
    });
    x.globalAlpha = 1;

    axis(c, pad);
    marker(c, pad);

    var here = d[offset + 24];
    var peak = Math.max.apply(null, d.slice(24));
    var peakAt = d.slice(24).indexOf(peak);

    $("#waveNote").innerHTML =
      "Selected hour " +
      pair(F.wave(here)) +
      ", " +
      seaWords(here).toLowerCase() +
      ". The forecast peak is " +
      pair(F.wave(peak)) +
      " at " +
      dayLabel(peakAt) +
      " " +
      hourLabel(peakAt) +
      ". Faded bars are archive, solid bars are forecast.";
  }

  function drawTemp() {
    var c = ctxFor("#tempCanvas");
    var pad = 34;
    var w = series("water");
    var a = series("air");
    var all = w.concat(a);
    var lo = Math.floor(Math.min.apply(null, all) - 1);
    var hi = Math.ceil(Math.max.apply(null, all) + 1);
    var floor = c.h - 22;
    var y = function (v) {
      return floor - ((v - lo) / (hi - lo)) * (floor - 14);
    };
    var x = c.x;

    for (var g = lo; g <= hi; g++) {
      if ((g - lo) % 2) continue;
      var py = Math.round(y(g)) + 0.5;

      x.strokeStyle = LINE;
      x.beginPath();
      x.moveTo(pad, py);
      x.lineTo(c.w - pad, py);
      x.stroke();
      x.fillStyle = INK3;
      x.font = "10px Consolas, monospace";
      x.textAlign = "right";
      x.fillText(
        units === "metric" ? String(g) : String(Math.round(g * 1.8 + 32)),
        pad - 6,
        py + 3,
      );
    }

    function line(d, colour, dash) {
      x.beginPath();
      d.forEach(function (v, i) {
        var px = xAt(i, c.w, pad);

        i ? x.lineTo(px, y(v)) : x.moveTo(px, y(v));
      });
      x.setLineDash(dash || []);
      x.strokeStyle = colour;
      x.lineWidth = 1.8;
      x.stroke();
      x.setLineDash([]);
    }

    line(a, "#b5651d", [5, 3]);
    line(w, BLUE);

    axis(c, pad);
    marker(c, pad);

    $("#tempNote").innerHTML =
      "Water " +
      pair(F.temp(w[offset + 24])) +
      ", air " +
      pair(F.temp(a[offset + 24])) +
      " at the selected hour. Water lags the air by about a week here, which is why it keeps climbing after the first cold night.";
  }

  function drawRose() {
    var c = ctxFor("#roseCanvas");
    var x = c.x;
    var cx = c.w / 2;
    var cy = (c.h - 14) / 2 + 6;
    var R = Math.min(cx, cy) - 24;
    var st = station();

    /* thirty days of hourly directions, binned into sixteen sectors and three
       speed bands, so the petals mean something */
    var bins = [];
    var i;

    for (i = 0; i < 16; i++) bins.push([0, 0, 0]);

    var total = 0;

    for (i = -720; i < 0; i++) {
      var r = reading(st, i);
      var s = Math.round((((r.dir % 360) + 360) % 360) / 22.5) % 16;
      var band = r.wind > 10 ? 2 : r.wind > 5.5 ? 1 : 0;

      bins[s][band] += 1;
      total += 1;
    }

    var max = 0;

    bins.forEach(function (b) {
      max = Math.max(max, b[0] + b[1] + b[2]);
    });

    // rings
    x.strokeStyle = LINE;
    x.fillStyle = INK3;
    x.font = "10px Consolas, monospace";
    x.textAlign = "center";

    for (i = 1; i <= 3; i++) {
      x.beginPath();
      x.arc(cx, cy, (R * i) / 3, 0, Math.PI * 2);
      x.stroke();
    }

    ["N", "E", "S", "W"].forEach(function (lab, k) {
      var a = (k * Math.PI) / 2 - Math.PI / 2;

      x.fillText(
        lab,
        cx + Math.cos(a) * (R + 13),
        cy + Math.sin(a) * (R + 13) + 3.5,
      );
    });

    var COLS = ["#bcd6e8", "#4d97cf", "#06375f"];

    bins.forEach(function (b, s) {
      var a0 = (s * 22.5 - 11.25 - 90) * (Math.PI / 180);
      var a1 = (s * 22.5 + 11.25 - 90) * (Math.PI / 180);
      var acc = 0;

      b.forEach(function (v, band) {
        var r0 = (acc / max) * R;

        acc += v;

        var r1 = (acc / max) * R;

        x.beginPath();
        x.arc(cx, cy, r1, a0, a1);
        x.arc(cx, cy, r0, a1, a0, true);
        x.closePath();
        x.fillStyle = COLS[band];
        x.fill();
        x.strokeStyle = "#ffffff";
        x.lineWidth = 1;
        x.stroke();
      });
    });

    // legend
    var lx = 6;

    ["under 5.5", "5.5 to 10", "over 10"].forEach(function (lab, k) {
      x.fillStyle = COLS[k];
      x.fillRect(lx, c.h - 12, 9, 9);
      x.fillStyle = INK3;
      x.textAlign = "left";
      x.fillText(lab, lx + 13, c.h - 4);
      lx += 22 + lab.length * 5.6;
    });

    var top = 0;

    bins.forEach(function (b, s) {
      if (b[0] + b[1] + b[2] > bins[top][0] + bins[top][1] + bins[top][2]) top = s;
    });

    var share = Math.round(
      ((bins[top][0] + bins[top][1] + bins[top][2]) / total) * 100,
    );

    $("#roseNote").textContent =
      "Prevailing " +
      CARDINAL[top] +
      " at " +
      share +
      " per cent of hours. Onshore winds from the west sector build the sea here fastest because the fetch runs unbroken to Sweden.";
  }

  function drawCharts() {
    drawTide();
    drawRose();
    drawWave();
    drawTemp();
  }

  /* -------------------------------------------------------------- forecast */

  function paintForecast() {
    var st = station();
    var rows = [];

    for (var d = 0; d < 7; d++) {
      var wind = 0;
      var gust = 0;
      var hs = 0;
      var water = 0;
      var air = 0;
      var dir = 0;
      var count = 0;

      for (var h = d * 24; h < d * 24 + 24; h++) {
        var r = reading(st, h);

        wind += r.wind;
        gust = Math.max(gust, r.gust);
        hs = Math.max(hs, r.hs);
        water += r.water;
        air = Math.max(air, r.air);
        dir += r.dir;
        count += 1;
      }

      var conf = Math.round(
        Math.max(
          38,
          94 - d * 7.5 - Math.abs(Math.sin(H0 / 19 + d * 1.7)) * 9,
        ),
      );

      rows.push({
        d: d,
        wind: wind / count,
        gust: gust,
        hs: hs,
        water: water / count,
        air: air,
        dir: dir / count,
        conf: conf,
      });
    }

    $("#fcBody").innerHTML = rows
      .map(function (r) {
        var warn =
          r.hs > 2.2
            ? '<span class="tagw tagw--red">Wave</span>'
            : r.gust > 16
              ? '<span class="tagw">Gust</span>'
              : "";

        return (
          "<tr>" +
          '<td class="fc__d"><b>' +
          (r.d === 0 ? "Today" : dayLabel(r.d * 24)) +
          "</b><span>" +
          dateLabel(r.d * 24) +
          "</span></td>" +
          '<td class="fc__n"><span class="arrow" style="transform:rotate(' +
          (r.dir + 180) +
          'deg)">&uarr;</span>' +
          pair(F.wind(r.wind)) +
          '<em class="fc__c">' +
          card(r.dir) +
          "</em></td>" +
          '<td class="fc__n">' +
          pair(F.wind(r.gust)) +
          "</td>" +
          '<td class="fc__n">' +
          pair(F.wave(r.hs)) +
          "</td>" +
          '<td class="fc__n">' +
          pair(F.temp(r.water)) +
          "</td>" +
          '<td class="fc__n">' +
          pair(F.temp(r.air)) +
          "</td>" +
          '<td><div class="conf"><b>' +
          r.conf +
          '%</b><div class="bar' +
          (r.conf < 60 ? " bar--low" : "") +
          '"><i style="width:' +
          r.conf +
          '%"></i></div></div></td>' +
          '<td class="fc__note">' +
          warn +
          fcNote(r) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  /* the duty desk does not write the same sentence seven days running, so the
     pool is picked from by day and by what the day actually looks like */
  var NOTES = {
    rough: [
      "Breaking on the outer bar. Small craft should stay inside the moles.",
      "Short steep sea against the outgoing current at the gate. Unpleasant even for the ferries.",
      "Beach work will stop. Expect the dredger to sit it out in the harbour.",
    ],
    gusty: [
      "Squally. The mast will read well above the daily average in the afternoon.",
      "Gusts arriving in bands roughly two hours apart, with lulls between them.",
      "Wind well ahead of the sea, so it will feel rougher than the wave column reads.",
    ],
    unsure: [
      "The three models put the front through eight hours apart. Treat the timing loosely.",
      "Spread is wide on wind direction, less so on strength. The turn is the uncertain part.",
      "One model keeps the ridge in place all day and the other two do not. Check again tomorrow.",
    ],
    calm: [
      "The sort of window survey crews wait three weeks for.",
      "Flat and clear. Good for diving on the outfall if anyone still needs to.",
      "Light and variable, sea glassy by the middle of the day.",
    ],
    plain: [
      "Ordinary coastal conditions, nothing that needs planning around.",
      "Steady onshore breeze, sea building slowly through the afternoon.",
      "Workable all day for anything with a wheelhouse.",
      "Nothing unusual. Water a shade warmer than the seasonal mean.",
    ],
  };

  function fcNote(r) {
    var pool =
      r.hs > 2.2
        ? NOTES.rough
        : r.gust > 16
          ? NOTES.gusty
          : r.conf < 60
            ? NOTES.unsure
            : r.hs < 0.5
              ? NOTES.calm
              : NOTES.plain;

    return pool[(r.d + Math.round(r.hs * 10)) % pool.length];
  }

  /* ---------------------------------------------------------------- alerts */

  function paintAlerts() {
    var worst = null;

    STATIONS.forEach(function (s) {
      for (var h = 0; h < 48; h++) {
        var r = reading(s, h);

        if (!worst || r.hs > worst.hs) worst = { hs: r.hs, s: s, h: h };
      }
    });

    var items = [
      {
        sev: worst.hs > 2.2 ? "red" : "warn",
        tag: worst.hs > 2.2 ? "Warning" : "Advisory",
        id: "BW-" + (H0 % 900 + 100),
        title:
          "Building sea at " + worst.s.name + ", peak " + n(worst.hs, 1) + " m",
        body:
          "Expected around " +
          dayLabel(worst.h) +
          " " +
          hourLabel(worst.h) +
          ". The outer bar breaks first and the harbour entrance follows about two hours later.",
        by: "Duty forecaster",
      },
      {
        sev: "info",
        tag: "Notice",
        id: "BW-" + (H0 % 700 + 240),
        title: "Juodkrante lagoon gauge out for service",
        body:
          "The lagoon pressure sensor is off the wire until Thursday. Sea level for that station is interpolated from the two nearest and is flagged in the archive.",
        by: "Instrument team",
      },
      {
        sev: "info",
        tag: "Notice",
        id: "BW-" + (H0 % 500 + 380),
        title: "Cold water advisory stands until October",
        body:
          "Surface temperature can drop six degrees in a day when the wind turns north and pulls the cold layer up. Swimmers should treat the surface reading as the best case.",
        by: "Duty forecaster",
      },
    ];

    $("#alist").innerHTML = items
      .map(function (a) {
        return (
          "<li>" +
          '<div class="alist__m"><span class="alist__sev' +
          (a.sev === "info" ? "" : " alist__sev--" + a.sev) +
          '">' +
          a.tag +
          "</span><span>" +
          a.id +
          "</span></div>" +
          "<h3>" +
          a.title +
          "</h3><p>" +
          a.body +
          "</p>" +
          '<div class="alist__m" style="margin-top:12px"><span>' +
          a.by +
          "</span><span>" +
          hourLabel(-2) +
          "</span></div>" +
          "</li>"
        );
      })
      .join("");
  }

  /* ---------------------------------------------------------------- ticker */

  function paintTicker() {
    var row = STATIONS.map(function (s) {
      var r = reading(s, 0);

      return (
        "<span><i>" +
        s.k +
        "</i>" +
        card(r.dir) +
        " " +
        F.wind(r.wind)[0] +
        " " +
        F.wind(r.wind)[1] +
        "  /  Hs " +
        F.wave(r.hs)[0] +
        " " +
        F.wave(r.hs)[1] +
        "  /  " +
        F.temp(r.water)[0] +
        " " +
        F.temp(r.water)[1] +
        "</span>"
      );
    }).join("");

    // doubled so the marquee can loop on a whole number
    $("#ticker").innerHTML = "<div>" + row + row + "</div>";
  }

  /* ------------------------------------------------------------------ wire */

  function paintAll() {
    drawPins();
    paintReadout();
    drawCharts();
    paintForecast();
    paintAlerts();
    paintTicker();
    $("#mapMeta").textContent = STATIONS.length + " stations reporting";
  }

  $("#scrub").addEventListener("input", function (e) {
    offset = Number(e.target.value);
    paintReadout();
    drawCharts();
  });

  $$(".unit").forEach(function (b) {
    b.addEventListener("click", function () {
      units = b.dataset.u;
      $$(".unit").forEach(function (o) {
        o.classList.toggle("is-on", o === b);
      });
      paintAll();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT") return;

    if (e.key === "[" || e.key === "]") {
      stIndex =
        (stIndex + (e.key === "]" ? 1 : STATIONS.length - 1)) % STATIONS.length;
      paintAll();
    }
  });

  $("#issued").textContent = hourLabel(0);
  $("#footStations").innerHTML = STATIONS.map(function (s) {
    return s.k + " " + s.name;
  }).join("<br />");

  paintAll();

  /* the sea panel is a nicety, the page is complete without it */
  if (!window.BalticSea || !BalticSea.init($("#seaCanvas"))) {
    $("#seaFail").hidden = false;
  } else {
    paintReadout();
  }

  var t;

  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(drawCharts, 180);
  });

  /* nav underline follows the section you are actually looking at */
  var links = $$(".mast__nav a");
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle(
            "is-here",
            a.getAttribute("href") === "#" + e.target.id,
          );
        });
      });
    },
    { rootMargin: "-30% 0px -60% 0px" },
  );

  links.forEach(function (a) {
    var s = document.getElementById(a.getAttribute("href").slice(1));

    if (s) io.observe(s);
  });
})();
