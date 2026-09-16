/* UOLA / site behaviour
   The wall is generated rather than drawn: a fixed seed lays out the holds, and
   each problem is a line walked up through them. Everything else on the page
   reads from the same set of problems. */

(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* ------------------------------------------------------------ the layout */

  /* one seeded generator, so the wall is the same wall on every visit */
  function rng(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;

      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);

      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var W = 900;
  var H = 620;
  var rand = rng(20260826);
  var holds = [];

  (function layout() {
    var cols = 12;
    var rows = 9;
    var mx = 58;
    var my = 42;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (rand() < 0.16) continue;

        var x = mx + ((W - mx * 2) * c) / (cols - 1) + (rand() - 0.5) * 46;
        var y = my + ((H - my * 2) * r) / (rows - 1) + (rand() - 0.5) * 34;

        holds.push({
          i: holds.length,
          x: Math.round(x),
          y: Math.round(y),
          s: 8 + rand() * 9,
          rot: rand() * 360,
          pts: 6 + Math.floor(rand() * 3),
          jit: 0.24 + rand() * 0.3,
          seed: Math.floor(rand() * 9999),
        });
      }
    }
  })();

  /* a hold is a lumpy polygon, not a circle */
  function holdPath(h) {
    var r2 = rng(h.seed);
    var d = "";

    for (var i = 0; i < h.pts; i++) {
      var a = (i / h.pts) * Math.PI * 2 + (h.rot * Math.PI) / 180;
      var rad = h.s * (1 - h.jit / 2 + r2() * h.jit);
      var px = h.x + Math.cos(a) * rad * 1.25;
      var py = h.y + Math.sin(a) * rad;

      d += (i ? "L" : "M") + px.toFixed(1) + " " + py.toFixed(1);
    }

    return d + "Z";
  }

  /* --------------------------------------------------------- the problems */

  var TAPE = {
    yellow: "#ffd400",
    pink: "#ff3d7f",
    blue: "#2f7bff",
    green: "#3fd07a",
    orange: "#ff6b1f",
    purple: "#9b5cff",
  };

  var ROUTES = [
    {
      n: "Warm Up Tax",
      g: 2,
      c: "yellow",
      setter: "R. Jankauskas",
      set: "12.08",
      style: "Slab, big holds",
      note:
        "Everybody starts here and nobody talks about it. Big feet all the way, and the only hard part is trusting the smear on the fourth move.",
      sends: 214,
      tries: 268,
      col: 1,
    },
    {
      n: "Textile Hall",
      g: 3,
      c: "blue",
      setter: "G. Rimkute",
      set: "12.08",
      style: "Vertical, crimps",
      note:
        "Straight up the old machine bay. Small holds, but they are all where you expect them, which is the point of a three.",
      sends: 168,
      tries: 240,
      col: 3,
    },
    {
      n: "Nemunas Dyno",
      g: 4,
      c: "pink",
      setter: "M. Petrauskas",
      set: "26.08",
      style: "Overhang, one jump",
      note:
        "Two moves in and then a jump to the jug. You can do it static if you are tall, and everybody who can will tell you so.",
      sends: 96,
      tries: 402,
      col: 5,
    },
    {
      n: "Left Hand Rule",
      g: 4,
      c: "green",
      setter: "D. Sarkis",
      set: "26.08",
      style: "Vertical, technical",
      note:
        "Only works if you lead with the left. Half the gym has done it wrong and got up anyway, which annoys the setter.",
      sends: 88,
      tries: 260,
      col: 7,
    },
    {
      n: "Pocket Money",
      g: 5,
      c: "orange",
      setter: "R. Jankauskas",
      set: "26.08",
      style: "Overhang, two finger pockets",
      note:
        "Three pockets, none of them comfortable. Tape up before you try it a fifth time.",
      sends: 41,
      tries: 310,
      col: 9,
    },
    {
      n: "The Kettle",
      g: 6,
      c: "purple",
      setter: "G. Rimkute",
      set: "12.08",
      style: "Roof, heel hooks",
      note:
        "Named after the kettle at the desk, because that is how long you will be resting between attempts. Heel goes on before the hand comes off.",
      sends: 22,
      tries: 288,
      col: 2,
    },
    {
      n: "Second Tuesday",
      g: 7,
      c: "pink",
      setter: "M. Petrauskas",
      set: "12.08",
      style: "Steep, compression",
      note:
        "Squeeze the volume, do not pull on it. Coming down on the next reset, so it is now or never.",
      sends: 9,
      tries: 214,
      col: 6,
    },
    {
      n: "Loom Room",
      g: 8,
      c: "blue",
      setter: "D. Sarkis",
      set: "26.08",
      style: "Roof, one hand jam",
      note:
        "The hardest thing up at the moment. Two people have done it and both of them are annoyed about the third move.",
      sends: 2,
      tries: 96,
      col: 10,
    },
  ];

  /* walk each problem up the wall through nearby holds */
  (function line() {
    var byY = holds.slice().sort(function (a, b) {
      return b.y - a.y;
    });

    ROUTES.forEach(function (r, ri) {
      var pick = rng(4000 + ri * 137);
      var startX = 58 + ((W - 116) * r.col) / 11;
      var start = byY
        .filter(function (h) {
          return h.y > H - 150;
        })
        .sort(function (a, b) {
          return Math.abs(a.x - startX) - Math.abs(b.x - startX);
        })[0];

      var seq = [start];
      var cur = start;
      var guard = 0;

      while (cur && cur.y > 90 && guard++ < 20) {
        var cands = holds
          .filter(function (h) {
            var dy = cur.y - h.y;

            return dy > 42 && dy < 118 && Math.abs(h.x - cur.x) < 132;
          })
          .sort(function (a, b) {
            var da = Math.hypot(a.x - cur.x, a.y - cur.y);
            var db = Math.hypot(b.x - cur.x, b.y - cur.y);

            return da - db;
          });

        if (!cands.length) break;

        // not always the nearest, or every problem would climb the same line
        var next = cands[Math.min(cands.length - 1, Math.floor(pick() * 2.4))];

        seq.push(next);
        cur = next;
      }

      r.holds = seq;
      r.tape = TAPE[r.c];
    });
  })();

  /* ------------------------------------------------------------- the wall */

  var svg = $("#board");
  var sel = -1;
  var preview = -1;
  var filter = "all";

  (function panels() {
    var d = [
      ["M0 0 L300 0 L268 620 L0 620 Z", "panel"],
      ["M300 0 L610 0 L596 620 L268 620 Z", "panel panel--b"],
      ["M610 0 L900 0 L900 620 L596 620 Z", "panel"],
      ["M268 200 L596 236 L580 470 L262 442 Z", "panel panel--b"],
    ];

    $("#panels").innerHTML = d
      .map(function (p) {
        return '<path class="' + p[1] + '" d="' + p[0] + '"></path>';
      })
      .join("");
  })();

  function paintWall() {
    var active = preview >= 0 ? preview : sel;
    var r = ROUTES[active];
    var inRoute = {};

    if (r) {
      r.holds.forEach(function (h, i) {
        inRoute[h.i] = i + 1;
      });
    }

    $("#holds").innerHTML = holds
      .map(function (h) {
        var no = inRoute[h.i];
        var fill = "#5d5d4e";
        var dim = "";

        if (r) {
          if (no) {
            fill = r.tape;
          } else {
            dim = " is-dim";
          }
        } else {
          // with nothing selected every hold wears the colour of its problem
          var owner = ROUTES.filter(function (x) {
            return x.holds.indexOf(h) !== -1;
          })[0];

          if (owner) fill = owner.tape;
        }

        return (
          '<g class="hold' +
          dim +
          '" data-h="' +
          h.i +
          '">' +
          '<path class="hold__shape" d="' +
          holdPath(h) +
          '" fill="' +
          fill +
          '"></path>' +
          (no
            ? '<text class="hold__no" x="' +
              h.x +
              '" y="' +
              (h.y + 4) +
              '" text-anchor="middle">' +
              no +
              "</text>"
            : "") +
          "</g>"
        );
      })
      .join("");

    if (r) {
      var pts = r.holds
        .map(function (h) {
          return h.x + " " + h.y;
        })
        .join(" L ");

      $("#path").innerHTML =
        '<path class="line" stroke="' + r.tape + '" d="M ' + pts + '"></path>' +
        '<circle class="startmark" stroke="' +
        r.tape +
        '" cx="' +
        r.holds[0].x +
        '" cy="' +
        r.holds[0].y +
        '" r="' +
        (r.holds[0].s + 12) +
        '"></circle>';
    } else {
      $("#path").innerHTML = "";
    }

    $("#boardName").textContent = r
      ? "V" + r.g + "  " + r.n + "  /  " + r.holds.length + " holds"
      : "Every problem on the face";
  }

  /* ------------------------------------------------------------- the list */

  var BANDS = [
    ["all", "All"],
    ["easy", "V0 to V3"],
    ["mid", "V4 to V6"],
    ["hard", "V7 and up"],
  ];

  function band(g) {
    return g <= 3 ? "easy" : g <= 6 ? "mid" : "hard";
  }

  $("#gradeChips").innerHTML = BANDS.map(function (b) {
    return (
      '<button class="chip' +
      (b[0] === "all" ? " is-on" : "") +
      '" data-b="' +
      b[0] +
      '" type="button">' +
      b[1] +
      "</button>"
    );
  }).join("");

  $$(".chip").forEach(function (c) {
    c.addEventListener("click", function () {
      filter = c.dataset.b;
      $$(".chip").forEach(function (o) {
        o.classList.toggle("is-on", o === c);
      });
      paintList();
    });
  });

  function shown() {
    return ROUTES.filter(function (r) {
      return filter === "all" || band(r.g) === filter;
    });
  }

  function paintList() {
    $("#rlist").innerHTML = shown()
      .map(function (r) {
        var i = ROUTES.indexOf(r);

        return (
          '<li class="rrow' +
          (i === sel ? " is-on" : "") +
          '" data-i="' +
          i +
          '">' +
          '<i class="rrow__tape" style="background:' +
          r.tape +
          '"></i>' +
          '<span class="rrow__g">V' +
          r.g +
          "</span>" +
          '<span><span class="rrow__n">' +
          r.n +
          '</span><span class="rrow__s">' +
          r.setter +
          "  /  set " +
          r.set +
          "</span></span>" +
          '<span class="rrow__x">' +
          r.sends +
          " sends</span>" +
          "</li>"
        );
      })
      .join("");

    $$(".rrow").forEach(function (row) {
      var i = Number(row.dataset.i);

      row.addEventListener("mouseenter", function () {
        preview = i;
        paintWall();
      });
      row.addEventListener("mouseleave", function () {
        preview = -1;
        paintWall();
      });
      row.addEventListener("click", function () {
        select(i);
      });
    });
  }

  /* ----------------------------------------------------------- the detail */

  function select(i) {
    sel = i;
    preview = -1;
    paintList();
    paintWall();
    paintDetail();
  }

  function paintDetail() {
    var r = ROUTES[sel] || ROUTES[0];
    var rate = Math.round((r.sends / r.tries) * 100);

    $("#dGrade").textContent = "V" + r.g + "  /  " + r.style;
    $("#dName").textContent = r.n;
    $("#dNote").textContent = r.note;
    $("#dSpec").innerHTML = [
      ["Setter", r.setter],
      ["Set on", r.set],
      ["Holds", r.holds.length],
      ["Tape", r.c.charAt(0).toUpperCase() + r.c.slice(1)],
      ["Send rate", rate + " %"],
    ]
      .map(function (s) {
        return "<div><dt>" + s[0] + "</dt><dd>" + s[1] + "</dd></div>";
      })
      .join("");

    $("#dBar").style.width = rate + "%";
    $("#dBar").style.background = r.tape;
    $("#dSends").textContent = r.sends;
    $("#dTries").textContent = r.tries;

    if (has3d) UolaHold.setColour(r.tape);
  }

  $("#showAll").addEventListener("click", function () {
    sel = -1;
    paintList();
    paintWall();
  });

  /* clicking a hold on the wall jumps to whichever problem owns it */
  svg.addEventListener("click", function (e) {
    var g = e.target.closest ? e.target.closest(".hold") : null;

    if (!g) return;

    var h = holds[Number(g.dataset.h)];
    var owner = ROUTES.filter(function (x) {
      return x.holds.indexOf(h) !== -1;
    })[0];

    if (owner) select(ROUTES.indexOf(owner));
  });

  /* ------------------------------------------------------------- sessions */

  var DAYNAME = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
  var CAP = 24;
  var today = new Date();

  today.setHours(0, 0, 0, 0);

  var days = [];

  for (var d = 0; d < 7; d++) {
    days.push(new Date(today.getTime() + d * 86400000));
  }

  var dayIdx = 0;
  var slotIdx = -1;

  /* how full a slot is, worked out the same way every time */
  function taken(dayI, slotI) {
    var date = days[dayI];
    var dow = date.getDay();
    var base = 4 + ((date.getDate() * 7 + slotI * 11 + dow * 5) % 9);
    var evening = slotI >= 4 ? 9 : 0;
    var weekend = dow === 0 || dow === 6 ? 4 : 0;

    return Math.min(CAP, base + evening + weekend);
  }

  function paintDays() {
    $("#days").innerHTML = days
      .map(function (dt, i) {
        return (
          '<button class="day' +
          (i === dayIdx ? " is-on" : "") +
          '" data-i="' +
          i +
          '" type="button"><b>' +
          (i === 0 ? "Today" : DAYNAME[dt.getDay()]) +
          "</b><span>" +
          String(dt.getDate()).padStart(2, "0") +
          "." +
          String(dt.getMonth() + 1).padStart(2, "0") +
          "</span></button>"
        );
      })
      .join("");

    $$(".day").forEach(function (b) {
      b.addEventListener("click", function () {
        dayIdx = Number(b.dataset.i);
        slotIdx = -1;
        paintDays();
        paintSlots();
        paintBasket();
      });
    });
  }

  function paintSlots() {
    $("#slots").innerHTML = TIMES.map(function (t, i) {
      var used = taken(dayIdx, i);
      var left = CAP - used;
      var cls = left === 0 ? " is-full" : left <= 5 ? " is-tight" : "";

      return (
        '<button class="slot' +
        (i === slotIdx ? " is-on" : "") +
        '" data-i="' +
        i +
        '" type="button"' +
        (left === 0 ? " disabled" : "") +
        "><b>" +
        t +
        "</b><span>" +
        (left === 0 ? "Full" : left + " of " + CAP + " left") +
        '</span><span class="slot__cap"><i class="' +
        cls.trim() +
        '" style="width:' +
        Math.round((used / CAP) * 100) +
        '%"></i></span></button>'
      );
    }).join("");

    $$(".slot").forEach(function (b) {
      b.addEventListener("click", function () {
        slotIdx = Number(b.dataset.i);
        paintSlots();
        paintBasket();
      });
    });
  }

  function price() {
    var people = Number($("#bkPeople").value);
    var shoes = $("#bkShoes").value.indexOf("Rental") === 0 ? 3 : 0;

    return people * (9 + shoes);
  }

  function paintBasket() {
    var dt = days[dayIdx];

    if (slotIdx < 0) {
      $("#bkWhen").textContent = "Pick a time above";
      $("#bkPrice").textContent = "0 EUR";

      return;
    }

    $("#bkWhen").textContent =
      DAYNAME[dt.getDay()] +
      " " +
      String(dt.getDate()).padStart(2, "0") +
      "." +
      String(dt.getMonth() + 1).padStart(2, "0") +
      ", " +
      TIMES[slotIdx] +
      " to " +
      TIMES[slotIdx].replace(/^(\d+)/, function (m) {
        return String(Number(m) + 2).padStart(2, "0");
      });
    $("#bkPrice").textContent = price() + " EUR";
  }

  ["#bkPeople", "#bkShoes"].forEach(function (s) {
    $(s).addEventListener("change", paintBasket);
  });

  $("#bkGo").addEventListener("click", function () {
    if (slotIdx < 0) {
      $("#bkWhen").textContent = "Pick a time first";

      return;
    }

    var dt = days[dayIdx];
    var code =
      "UO" +
      String(dt.getDate()).padStart(2, "0") +
      TIMES[slotIdx].replace(":", "") +
      String(Math.floor(Math.random() * 90) + 10);

    $("#doneCode").textContent = code;
    $("#doneTxt").textContent =
      $("#bkPeople").value +
      " in on " +
      DAYNAME[dt.getDay()] +
      " at " +
      TIMES[slotIdx] +
      ", " +
      price() +
      " EUR on arrival. Show the code at the desk. If you cannot make it, tell us before the slot starts and it goes back in the pool.";
    $("#basket").hidden = true;
    $("#days").hidden = true;
    $("#slots").hidden = true;
    $("#done").hidden = false;
  });

  $("#doneAgain").addEventListener("click", function () {
    slotIdx = -1;
    $("#done").hidden = true;
    $("#basket").hidden = false;
    $("#days").hidden = false;
    $("#slots").hidden = false;
    paintSlots();
    paintBasket();
  });

  /* ---------------------------------------------------------------- hours */

  var HOURS = [
    ["Mon", 7, 23],
    ["Tue", 7, 23],
    ["Wed", 7, 23],
    ["Thu", 7, 23],
    ["Fri", 7, 23],
    ["Sat", 9, 22],
    ["Sun", 9, 22],
  ];

  var now = new Date();
  var dowIdx = (now.getDay() + 6) % 7;

  $("#hours").innerHTML = HOURS.map(function (h, i) {
    return (
      '<tr class="' +
      (i === dowIdx ? "is-today" : "") +
      '"><th scope="row">' +
      h[0] +
      "</th><td>" +
      String(h[1]).padStart(2, "0") +
      ":00 to " +
      h[2] +
      ":00</td></tr>"
    );
  }).join("");

  (function openState() {
    var h = HOURS[dowIdx];
    var hour = now.getHours() + now.getMinutes() / 60;
    var open = hour >= h[1] && hour < h[2];

    $("#open").classList.toggle("is-shut", !open);
    $("#openState").textContent = open ? "Open" : "Closed";
    $("#openUntil").textContent = open
      ? "until " + h[2] + ":00"
      : "opens " + String(HOURS[(dowIdx + (hour >= h[2] ? 1 : 0)) % 7][1]).padStart(2, "0") + ":00";
  })();

  /* ------------------------------------------------------------------ wire */

  var has3d = false;

  paintList();
  paintWall();
  paintDays();
  paintSlots();
  paintBasket();

  has3d = !!(window.UolaHold && UolaHold.init($("#holdCanvas")));
  if (!has3d) $("#holdFail").hidden = false;

  select(2);

  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "SELECT") return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      var list = shown();
      var pos = list.indexOf(ROUTES[sel]);

      if (pos === -1) pos = 0;
      pos = (pos + (e.key === "ArrowDown" ? 1 : list.length - 1)) % list.length;
      e.preventDefault();
      select(ROUTES.indexOf(list[pos]));
    }
  });

  var links = $$("#nav a");
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle(
            "is-here",
            a.getAttribute("href") === "#" + en.target.id,
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
