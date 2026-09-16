/* Vakaris / site behaviour
   Two kinds of lamp on one page: the drawn ones, which are SVG plus a class,
   and the modelled ones, which are three.js. Both answer to the same master
   switch, and the master switch remembers what was on before it. */

(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* ------------------------------------------------------------- the range */

  var LAMPS = [
    {
      no: "01",
      name: "Sietas",
      line: "Sieve, pendant on a cranked arm",
      desc:
        "A brass dome with eleven hundred holes drilled in it, hung off a cranked arm so it sits over a table without anything above the table. The holes throw the room full of small light and keep the glare inside the shade.",
      spec: [
        ["Height", "380 mm"],
        ["Reach", "310 mm"],
        ["Materials", "Brass, cast iron base"],
        ["Bulb", "E27, 2200 K, 4 W"],
        ["Weight", "3.4 kg"],
      ],
      price: "390 EUR",
    },
    {
      no: "02",
      name: "Vabalas",
      line: "Beetle, opens as it lights",
      desc:
        "Six steel shells that sit closed when the lamp is off and lift apart when it is on, so the light comes out of the gaps rather than the bottom. The mechanism is one cam and a spring, and you can hear it.",
      spec: [
        ["Height", "240 mm closed"],
        ["Opens to", "290 mm"],
        ["Materials", "Blued steel, oak"],
        ["Bulb", "E14, 2200 K, 3 W"],
        ["Weight", "2.1 kg"],
      ],
      price: "340 EUR",
    },
    {
      no: "03",
      name: "Stulpas",
      line: "Post, stone and glass stacked",
      desc:
        "Seven discs alternating between quarry stone and cast glass, threaded on one brass rod. The glass carries the light and the stone stops it, so the column reads as bands rather than as a lamp.",
      spec: [
        ["Height", "820 mm"],
        ["Diameter", "190 mm"],
        ["Materials", "Karpenai limestone, cast glass"],
        ["Bulb", "Three E14, 2200 K"],
        ["Weight", "14 kg"],
      ],
      price: "780 EUR",
    },
    {
      no: "04",
      name: "Vetra",
      line: "Gale, a ring with a piece missing",
      desc:
        "A frosted ring on an ash tripod, tilted the way a gate is tilted after a storm. The gap in the ring is where the wiring goes in, which is the only reason it is there, and it is the best thing about it.",
      spec: [
        ["Height", "610 mm"],
        ["Ring", "290 mm across"],
        ["Materials", "Frosted glass, ash, brass"],
        ["Bulb", "Integrated strip, 2200 K"],
        ["Weight", "4.8 kg"],
      ],
      price: "520 EUR",
    },
    {
      no: "05",
      name: "Meduza",
      line: "Jellyfish, twenty two lit tips",
      desc:
        "A glass bell with twenty two brass strands hanging under it, each one ending in a point of light. Made after a bad idea about the Curonian Lagoon in November that turned out to be a good one.",
      spec: [
        ["Height", "760 mm"],
        ["Spread", "340 mm"],
        ["Materials", "Blown glass, brass"],
        ["Bulb", "Fibre bundle, 2200 K"],
        ["Weight", "5.2 kg"],
      ],
      price: "690 EUR",
    },
  ];

  /* ------------------------------------------------------- drawn lamps 2D */

  var drawn = $$("[data-lamp]");

  function paintCount() {
    var lit = $$(".dwgs__grid .card.is-on").length;

    $("#litCount").textContent = lit;

    $$(".dwgs__grid .card").forEach(function (c) {
      var st = $(".card__st", c);

      if (st) st.textContent = c.classList.contains("is-on") ? "Lit" : "Off";
    });
  }

  drawn.forEach(function (el) {
    el.addEventListener("click", function () {
      el.classList.toggle("is-on");
      paintCount();
    });
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.classList.toggle("is-on");
        paintCount();
      }
    });
  });

  paintCount();

  /* ------------------------------------------------------- modelled lamps */

  var on = [false, false, false, false, false];
  var sel = 0;
  var has3d = false;

  function paintShelf() {
    $("#shelf").innerHTML = LAMPS.map(function (l, i) {
      return (
        '<li data-i="' +
        i +
        '" class="' +
        (on[i] ? "is-on " : "") +
        (i === sel ? "is-sel" : "") +
        '"><div class="shelf__top"><span>' +
        l.no +
        '</span><i class="shelf__dot"></i></div><b>' +
        l.name +
        '</b><span class="shelf__mt">' +
        l.line +
        "</span></li>"
      );
    }).join("");

    $$("#shelf li").forEach(function (li) {
      li.addEventListener("click", function () {
        var i = Number(li.dataset.i);

        if (i === sel) {
          toggle(i);
        } else {
          select(i);
        }
      });
    });
  }

  function paintTabs() {
    $("#tabs").innerHTML =
      '<button class="tab" data-i="-1" type="button">All five</button>' +
      LAMPS.map(function (l, i) {
        return (
          '<button class="tab" data-i="' + i + '" type="button">' + l.name + "</button>"
        );
      }).join("");

    $$(".tab").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.dataset.i);

        markTab(i);
        if (has3d) VakarisShelf.focus(i);
        if (i >= 0) select(i, true);
      });
    });
    markTab(-1);
  }

  function markTab(i) {
    $$(".tab").forEach(function (b) {
      b.classList.toggle("is-on", Number(b.dataset.i) === i);
    });
  }

  function paintPicked() {
    var l = LAMPS[sel];

    $("#pkNo").textContent = l.no;
    $("#pkName").textContent = l.name;
    $("#pkLine").textContent = l.line;
    $("#pkDesc").textContent = l.desc;
    $("#pkPrice").textContent = l.price;
    $("#pkSpec").innerHTML = l.spec
      .map(function (s) {
        return "<div><dt>" + s[0] + "</dt><dd>" + s[1] + "</dd></div>";
      })
      .join("");

    var sw = $("#pkSwitch");

    sw.setAttribute("aria-pressed", on[sel] ? "true" : "false");
    $("span", sw).textContent = on[sel] ? "Switch off" : "Switch on";
  }

  function select(i, keepTab) {
    sel = i;
    if (!keepTab && has3d) {
      // clicking a lamp in the scene should not yank the camera at it
      markTab(-1);
    }
    paintShelf();
    paintPicked();
  }

  function toggle(i) {
    on[i] = !on[i];
    if (has3d) VakarisShelf.setOn(i, on[i]);
    paintShelf();
    paintPicked();
  }

  $("#pkSwitch").addEventListener("click", function () {
    toggle(sel);
  });

  paintTabs();
  /* Metal finish swatches. The whole shelf changes together, because the
     workshop finishes a batch in one go rather than a lamp at a time. */
  function buildFinishes() {
    var row = $("#finishRow");
    var now = $("#finishNow");

    if (!row) return;

    VakarisShelf.finishes().forEach(function (f) {
      var b = document.createElement("button");

      b.type = "button";
      b.className = "fsw";
      b.dataset.finish = f.id;
      b.title = f.label;
      b.setAttribute("aria-label", f.label);
      b.setAttribute(
        "aria-pressed",
        String(f.id === VakarisShelf.finish()),
      );
      b.style.setProperty(
        "--sw",
        "#" + f.swatch.toString(16).padStart(6, "0"),
      );
      b.addEventListener("click", function () {
        if (!VakarisShelf.setFinish(f.id)) return;
        if (now) now.textContent = f.label;
        row.querySelectorAll(".fsw").forEach(function (o) {
          o.setAttribute("aria-pressed", String(o === b));
        });
      });
      row.appendChild(b);
    });
  }

  paintShelf();
  paintPicked();

  has3d = !!(window.VakarisShelf && VakarisShelf.init($("#lampCanvas")));

  if (!has3d) {
    $("#stageFail").hidden = false;
    $("#stageHint").hidden = true;
    // The swatches only mean anything against the rendered shelf.
    var fw = $("#finishRow");

    if (fw && fw.parentNode) fw.parentNode.hidden = true;
  } else {
    buildFinishes();
    VakarisShelf.onPick(function (i) {
      if (i === sel) {
        toggle(i);
      } else {
        select(i);
        toggle(i);
      }
      $("#stageHint").classList.add("is-gone");
    });

    $("#lampCanvas").addEventListener(
      "pointerdown",
      function () {
        $("#stageHint").classList.add("is-gone");
      },
      { once: true },
    );
  }

  /* --------------------------------------------------------- master switch */

  var master = $("#master");
  var night = false;
  var before = null;

  master.addEventListener("click", function () {
    night = !night;
    master.setAttribute("aria-pressed", night ? "true" : "false");
    document.body.classList.toggle("is-night", night);

    if (night) {
      // remember the room as it was, then light everything
      before = {
        drawn: drawn.map(function (el) {
          return el.classList.contains("is-on");
        }),
        lamps: on.slice(),
      };
      drawn.forEach(function (el) {
        el.classList.add("is-on");
      });
      on = [true, true, true, true, true];
    } else if (before) {
      drawn.forEach(function (el, i) {
        el.classList.toggle("is-on", before.drawn[i]);
      });
      on = before.lamps.slice();
    }

    if (has3d) {
      VakarisShelf.setNight(night);
      on.forEach(function (v, i) {
        VakarisShelf.setOn(i, v);
      });
    }

    paintCount();
    paintShelf();
    paintPicked();
  });

  /* ------------------------------------------------------------------ form */

  $("#eLamp").innerHTML = LAMPS.map(function (l) {
    return "<option>" + l.no + " " + l.name + ", " + l.price + "</option>";
  })
    .concat("<option>Not decided yet</option>")
    .join("");

  var form = $("#eform");
  var RULES = {
    name: [2, "We need something to put on the order."],
    email: [0, "That does not look like an address we can answer."],
    brief: [12, "One line is enough, but we do need one."],
  };

  function field(i) {
    return i.closest(".efield");
  }

  function check(i) {
    var rule = RULES[i.name];

    if (!rule) return true;

    var v = i.value.trim();
    var ok =
      i.name === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : v.length >= rule[0];
    var wrap = field(i);

    wrap.classList.toggle("is-bad", !ok);
    $("em", wrap).textContent = ok ? "" : rule[1];

    return ok;
  }

  $$("#eform input, #eform textarea").forEach(function (i) {
    i.addEventListener("blur", function () {
      if (i.value.trim()) check(i);
    });
    i.addEventListener("input", function () {
      if (field(i).classList.contains("is-bad")) check(i);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var fields = $$("#eform input, #eform textarea");
    var bad = fields.filter(function (i) {
      return !check(i);
    });

    if (bad.length) {
      bad[0].focus();

      return;
    }

    var batch = new Date().getMonth() < 8 ? "September" : "February";

    $("#edoneText").textContent =
      "Your " +
      form.lamp.value.replace(/,.*$/, "") +
      " is down for the batch that closes in " +
      batch +
      ", in " +
      form.finish.value.toLowerCase() +
      ". We will write back within two working days with a date and a drawing, and nothing is charged until you have both.";
    form.hidden = true;
    $("#edone").hidden = false;
  });

  $("#eagain").addEventListener("click", function () {
    form.reset();
    $$(".efield").forEach(function (f) {
      f.classList.remove("is-bad");
      var em = $("em", f);

      if (em) em.textContent = "";
    });
    $("#edone").hidden = true;
    form.hidden = false;
    $('#eform input[name="name"]').focus();
  });

  /* ------------------------------------------------------------------- nav */

  var links = $$("#nav a");
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
    { rootMargin: "-35% 0px -55% 0px" },
  );

  links.forEach(function (a) {
    var s = document.getElementById(a.getAttribute("href").slice(1));

    if (s) io.observe(s);
  });
})();
