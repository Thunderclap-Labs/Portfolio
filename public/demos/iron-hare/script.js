/* Iron Hare / site behaviour
   Pick three botanicals and the bottle relabels and recolours, serves open,
   and the tour booking prices and validates. */

(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* ---------------------------------------------------------------- 3D -- */

  var bottle = $("#bottle");
  var has3d = false;

  try {
    has3d = !!(window.HareScene && window.HareScene.init(bottle));
  } catch (e) {
    has3d = false;
  }

  if (!has3d) $("#bottleFail").hidden = false;

  /* --------------------------------------------------------- botanicals -- */

  var picked = [];
  var out = $("#blendOut");
  var reset = $("#blendReset");

  function mix(colours) {
    // average the chosen botanical colours to tint the spirit
    var r = 0;
    var g = 0;
    var b = 0;

    colours.forEach(function (hex) {
      r += parseInt(hex.slice(1, 3), 16);
      g += parseInt(hex.slice(3, 5), 16);
      b += parseInt(hex.slice(5, 7), 16);
    });
    var n = Math.max(1, colours.length);

    return (
      "#" +
      [r / n, g / n, b / n]
        .map(function (v) {
          return Math.round(v).toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  function paintBlend() {
    reset.hidden = picked.length === 0;

    if (!picked.length) {
      out.textContent = "Pick three botanicals";
      if (has3d) {
        window.HareScene.setLabel("LONDON DRY", "JUNIPER  ANGELICA  ORRIS");
        window.HareScene.setLiquid("#e9d7a3");
      }

      return;
    }

    var names = picked.map(function (p) {
      return p.name;
    });

    out.textContent =
      names.join(", ") +
      (picked.length < 3 ? "  (pick " + (3 - picked.length) + " more)" : "");

    if (has3d) {
      window.HareScene.setLabel(
        picked.length === 3 ? "AUTUMN RUN" : "LONDON DRY",
        names.join("  ").toUpperCase(),
      );
      window.HareScene.setLiquid(
        mix(
          picked.map(function (p) {
            return p.colour;
          }),
        ),
      );
    }
  }

  $$("#bots button").forEach(function (b) {
    b.addEventListener("click", function () {
      var name = b.dataset.b;
      var i = picked.findIndex(function (p) {
        return p.name === name;
      });

      if (i > -1) {
        picked.splice(i, 1);
        b.classList.remove("is-on");
      } else {
        if (picked.length >= 3) {
          // the oldest choice falls out, so the control never dead ends
          var old = picked.shift();

          $$("#bots button").forEach(function (o) {
            if (o.dataset.b === old.name) o.classList.remove("is-on");
          });
        }
        picked.push({ name: name, colour: b.dataset.c });
        b.classList.add("is-on");
      }
      paintBlend();
    });
  });

  reset.addEventListener("click", function () {
    picked = [];
    $$("#bots button").forEach(function (o) {
      o.classList.remove("is-on");
    });
    paintBlend();
  });

  paintBlend();

  /* ------------------------------------------------------------- serves -- */

  $$(".serve").forEach(function (s) {
    $(".serve__hit", s).addEventListener("click", function () {
      var open = s.classList.contains("is-open");

      $$(".serve").forEach(function (o) {
        o.classList.remove("is-open");
      });
      if (!open) s.classList.add("is-open");
    });
  });

  /* -------------------------------------------------------------- visit -- */

  var SLOTS = [
    ["Thu 4 Sep", "15:00", 0],
    ["Thu 4 Sep", "18:00", 1],
    ["Sat 6 Sep", "15:00", 0],
    ["Sat 6 Sep", "18:00", 0],
    ["Thu 11 Sep", "15:00", 1],
    ["Thu 11 Sep", "18:00", 0],
    ["Sat 13 Sep", "15:00", 0],
    ["Sat 13 Sep", "18:00", 0],
  ];
  var chosen = null;
  var party = 2;
  var PRICE = 35;

  $("#slots").innerHTML = SLOTS.map(function (s, i) {
    return (
      '<button class="slot' +
      (s[2] ? " is-full" : "") +
      '" type="button" data-i="' +
      i +
      '"' +
      (s[2] ? " disabled" : "") +
      "><em>" +
      s[0] +
      "</em><b>" +
      s[1] +
      (s[2] ? "  full" : "") +
      "</b></button>"
    );
  }).join("");

  $$(".slot").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".slot").forEach(function (o) {
        o.classList.remove("is-on");
      });
      b.classList.add("is-on");
      chosen = SLOTS[Number(b.dataset.i)];
    });
  });

  function paintTotal() {
    $("#party").textContent = party;
    $("#vTotal").textContent = party * PRICE + " EUR";
  }

  $$(".stepper button").forEach(function (b) {
    b.addEventListener("click", function () {
      party = Math.min(8, Math.max(1, party + Number(b.dataset.d)));
      paintTotal();
    });
  });

  paintTotal();

  var vform = $("#vform");

  function bad(input, msg) {
    var wrap = input.closest(".vf");

    wrap.classList.toggle("is-bad", !!msg);
    $("em", wrap).textContent = msg || "";
  }

  vform.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;

    if (!vform.name.value.trim()) {
      bad(vform.name, "A name for the list, please.");
      ok = false;
    } else bad(vform.name, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(vform.email.value.trim())) {
      bad(vform.email, "We send the directions by email.");
      ok = false;
    } else bad(vform.email, "");

    if (!chosen) {
      bad(vform.name, "Pick one of the times first.");
      ok = false;
    }

    if (!ok) return;

    $("#vdoneText").textContent =
      chosen[0] +
      " at " +
      chosen[1] +
      ", " +
      party +
      (party === 1 ? " place" : " places") +
      ", " +
      party * PRICE +
      " EUR. Vytauto pr. 41, the green door at the side, and you leave with " +
      (party === 1 ? "a bottle" : party + " bottles") +
      ". Reference IH-" +
      String(400 + Math.floor(Math.random() * 499)) +
      ".";
    vform.hidden = true;
    $("#vdone").hidden = false;
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
    { rootMargin: "-45% 0px -50% 0px" },
  );

  navLinks.forEach(function (a) {
    var s = document.getElementById(a.getAttribute("href").slice(1));

    if (s) navIO.observe(s);
  });

  /* ------------------------------------------------------------- reveal -- */

  var reveal = $$(".chap__frame, .hero__side, .hero__stage");

  reveal.forEach(function (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition =
      "opacity 1s ease, transform 1s cubic-bezier(.2,.8,.3,1)";
  });

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = "1";
        entry.target.style.transform = "none";
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.1 },
  );

  reveal.forEach(function (el) {
    io.observe(el);
  });
})();
