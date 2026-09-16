/* Vilnis Type / site behaviour
   A working specimen tester, a weight list, a filterable glyph table and a
   licence calculator that prices itself as you change it. */

(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* ------------------------------------------------------------- tester -- */

  var field = $("#field");
  var state = { size: 96, weight: 700, track: -3, lead: 95, tcase: "none", style: "normal" };

  function paintField() {
    field.style.fontSize = state.size + "px";
    field.style.fontWeight = state.weight;
    field.style.letterSpacing = state.track / 100 + "em";
    field.style.lineHeight = state.lead / 100;
    field.style.textTransform = state.tcase;
    field.style.fontStyle = state.style;

    $("#vSize").textContent = state.size;
    $("#vWeight").textContent = state.weight;
    $("#vTrack").textContent = state.track;
    $("#vLead").textContent = (state.lead / 100).toFixed(2);
  }

  [
    ["size", "size"],
    ["weight", "weight"],
    ["track", "track"],
    ["lead", "lead"],
  ].forEach(function (pair) {
    $("#" + pair[0]).addEventListener("input", function (e) {
      state[pair[1]] = Number(e.target.value);
      paintField();
    });
  });

  $$("[data-case]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("[data-case]").forEach(function (o) {
        o.classList.remove("is-on");
      });
      b.classList.add("is-on");
      state.tcase = b.dataset.case;
      paintField();
    });
  });

  $$("[data-style]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("[data-style]").forEach(function (o) {
        o.classList.remove("is-on");
      });
      b.classList.add("is-on");
      state.style = b.dataset.style;
      paintField();
    });
  });

  paintField();

  /* the three masthead lines take their weight from the data attribute */
  $$(".giant__line").forEach(function (l) {
    l.style.fontWeight = l.dataset.w;
  });

  /* ------------------------------------------------------------ weights -- */

  var WEIGHTS = [
    [100, "Hairline", "Vilnis Grotesk Hairline"],
    [200, "Thin", "Sideways rain on a low coast"],
    [300, "Light", "Nine weights, one skeleton"],
    [400, "Book", "Set the body text in this one"],
    [500, "Medium", "Signage at forty metres"],
    [600, "Semibold", "Timetables and platform numbers"],
    [700, "Bold", "Headlines that mean it"],
    [800, "Heavy", "Poster weight, tight tracking"],
    [900, "Black", "VILNIS GROTESK BLACK"],
  ];

  $("#wlist").innerHTML = WEIGHTS.map(function (w) {
    return (
      '<li class="wrow"><span class="wrow__k">' +
      w[0] +
      '</span><span class="wrow__name">' +
      w[1] +
      '</span><span class="wrow__spec" style="font-weight:' +
      w[0] +
      '">' +
      w[2] +
      '</span><span class="wrow__n">' +
      (w[0] === 900 ? "incl. italic" : "roman") +
      "</span></li>"
    );
  }).join("");

  /* ------------------------------------------------------------- glyphs -- */

  function range(from, to) {
    var out = [];

    for (var i = from; i <= to; i++) out.push(String.fromCharCode(i));

    return out;
  }

  var SETS = {
    upper: range(65, 90),
    lower: range(97, 122),
    fig: range(48, 57).concat(["¼", "½", "¾", "⁰", "¹", "²", "³"]),
    punct: [
      ".", ",", ":", ";", "!", "?", "'", '"', "(", ")", "[", "]", "{", "}",
      "/", "\\", "|", "-", "_", "@", "#", "&", "*", "+", "=", "<", ">", "%",
      "§", "¶", "†", "‡", "•", "…", "€", "£", "$", "¥",
    ],
    dia: [
      "Ą", "Č", "Ę", "Ė", "Į", "Š", "Ų", "Ū", "Ž", "ą", "č", "ę", "ė", "į",
      "š", "ų", "ū", "ž", "Å", "Ä", "Ö", "Ø", "Æ", "Œ", "Ç", "Ñ", "Ł", "Ð",
      "Þ", "å", "ä", "ö", "ø", "æ", "œ", "ç", "ñ", "ł", "ð", "þ", "Ā", "Ē",
      "Ī", "Ō", "Ū", "Ă", "Ĕ", "Ğ", "Ș", "Ț",
    ],
  };

  var LABEL = {
    upper: "Uppercase",
    lower: "Lowercase",
    fig: "Figures",
    punct: "Punctuation",
    dia: "Diacritics",
  };

  var grid = $("#ggrid");

  function paintGlyphs(filter) {
    var keys = filter === "all" ? Object.keys(SETS) : [filter];
    var html = "";

    keys.forEach(function (k) {
      SETS[k].forEach(function (ch) {
        html +=
          '<div class="gcell" data-set="' +
          k +
          '" data-ch="' +
          (ch === '"' ? "&quot;" : ch) +
          '">' +
          (ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === "&" ? "&amp;" : ch) +
          "</div>";
      });
    });
    grid.innerHTML = html;

    $$(".gcell", grid).forEach(function (c) {
      c.addEventListener("click", function () {
        $$(".gcell", grid).forEach(function (o) {
          o.classList.remove("is-on");
        });
        c.classList.add("is-on");
        var ch = c.textContent;

        $("#gzoomChar").textContent = ch;
        $("#gzoomCode").textContent =
          "U+" + ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
        $("#gzoomSet").textContent = LABEL[c.dataset.set];
      });
    });
  }

  $$("[data-g]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("[data-g]").forEach(function (o) {
        o.classList.remove("is-on");
      });
      b.classList.add("is-on");
      paintGlyphs(b.dataset.g);
    });
  });

  paintGlyphs("all");

  /* ------------------------------------------------------------ licence -- */

  var lic = { pkg: "single", desktop: 3, web: 0, app: 0 };
  var PKG = { single: [40, "Single weight"], text: [110, "Text pair, roman and italic"], full: [340, "Full family, 18 styles"] };
  var WEB = { 0: [0, "No web licence"], 50: [60, "Web to 50 k pageviews"], 500: [180, "Web to 500 k pageviews"], 5000: [520, "Web to 5 M pageviews"] };
  var APP = { 0: [0, "No app bundling"], 1: [240, "One app bundled"], 3: [560, "Up to three apps bundled"] };

  function money(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " EUR";
  }

  function paintLic() {
    var base = PKG[lic.pkg][0];
    var seats = Math.max(1, lic.desktop);
    // seats one to five are covered, after that each is a third of the base
    var extra = Math.max(0, seats - 5) * Math.round(base / 3);
    var web = WEB[lic.web][0];
    var app = APP[lic.app][0];
    var rows = [
      [PKG[lic.pkg][1], money(base)],
      ["Desktop, " + seats + (seats === 1 ? " seat" : " seats"), extra ? money(extra) : "included"],
      [WEB[lic.web][1], web ? money(web) : "—"],
      [APP[lic.app][1], app ? money(app) : "—"],
    ];

    $("#licTable tbody").innerHTML = rows
      .map(function (r) {
        return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td></tr>";
      })
      .join("")
      .replace(/—/g, "none");

    $("#licTotal").textContent = money(base + extra + web + app);
    $("#nDesktop").textContent = seats;
  }

  $$("[data-pkg]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("[data-pkg]").forEach(function (o) {
        o.classList.remove("is-on");
      });
      b.classList.add("is-on");
      lic.pkg = b.dataset.pkg;
      paintLic();
    });
  });

  $$("[data-web]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("[data-web]").forEach(function (o) {
        o.classList.remove("is-on");
      });
      b.classList.add("is-on");
      lic.web = Number(b.dataset.web);
      paintLic();
    });
  });

  $$("[data-app]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$("[data-app]").forEach(function (o) {
        o.classList.remove("is-on");
      });
      b.classList.add("is-on");
      lic.app = Number(b.dataset.app);
      paintLic();
    });
  });

  $$(".stepper button").forEach(function (b) {
    b.addEventListener("click", function () {
      lic.desktop = Math.max(1, lic.desktop + Number(b.dataset.d));
      paintLic();
    });
  });

  paintLic();

  $("#licBuy").addEventListener("click", function () {
    $("#licDoneText").textContent =
      PKG[lic.pkg][1] +
      ", " +
      lic.desktop +
      " desktop seats, " +
      WEB[lic.web][1].toLowerCase() +
      ", " +
      APP[lic.app][1].toLowerCase() +
      ". Total " +
      $("#licTotal").textContent +
      ", perpetual. Reference VT-" +
      String(700 + Math.floor(Math.random() * 299)) +
      ".";
    $("#licDone").hidden = false;
  });

  $("#licAgain").addEventListener("click", function () {
    $("#licDone").hidden = true;
  });

  /* ---------------------------------------------------------- nav state -- */

  var navLinks = $$("#nav a");
  var navIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle(
            "is-here",
            a.getAttribute("href") === "#" + e.target.id,
          );
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );

  navLinks.forEach(function (a) {
    var s = document.getElementById(a.getAttribute("href").slice(1));

    if (s) navIO.observe(s);
  });

  /* the big specimen lines drift, which is the only motion on the page */
  var lines = $$(".giant__line");

  lines.forEach(function (l, i) {
    var dir = i % 2 ? -1 : 1;
    var x = 0;

    (function step() {
      x += dir * 0.22;
      if (Math.abs(x) > 120) dir *= -1;
      l.style.transform = "translateX(" + x.toFixed(1) + "px)";
      requestAnimationFrame(step);
    })();
  });
})();

/* ---------------------------------------------------------- wave specimen --
   Kinetic specimen in the masthead. Progressive: if the canvas or the pixel
   read is unavailable the section drops out and the page loses nothing. */
(function () {
  var canvas = document.getElementById("waveCanvas");
  var section = document.getElementById("wave");

  if (!canvas || !window.VilnisWave) {
    if (section) section.hidden = true;
    return;
  }

  if (!VilnisWave.init(canvas)) {
    section.hidden = true;
    return;
  }

  var row = document.getElementById("waveWords");

  if (!row) return;

  row.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-word]");

    if (!b) return;
    VilnisWave.setWord(b.dataset.word);
    row.querySelectorAll("button").forEach(function (o) {
      o.setAttribute("aria-pressed", String(o === b));
    });
  });
})();
