/* GIRIA / site behaviour
   Scroll walks the camera into the wood and brings the night down, the
   songbook flares the lanterns, and the lineup and tickets do real work. */

(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* ---------------------------------------------------------------- 3D -- */

  var wood = $("#wood");
  var has3d = false;

  try {
    has3d = !!(window.GiriaScene && window.GiriaScene.init(wood));
  } catch (e) {
    has3d = false;
  }

  if (!has3d) {
    $("#woodFail").hidden = false;
    document.body.classList.add("no-gl");
  }

  /* --------------------------------------------------------- the walk in -- */

  var head = $(".head");

  (function frame() {
    var max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    var p = Math.min(1, window.scrollY / max);

    if (has3d) {
      // the camera walks most of the way in over the first three quarters,
      // and the dark arrives a little sooner than the clearing does
      window.GiriaScene.setDepth(Math.min(1, p / 0.86));
      window.GiriaScene.setNight(Math.min(1, p / 0.55));
    }
    head.classList.toggle("is-stuck", window.scrollY > 60);
    requestAnimationFrame(frame);
  })();

  /* ------------------------------------------------------------- lineup -- */

  var acts = $$(".act");
  var days = $$(".day");
  var meta = $("#actsMeta");
  var day = "all";

  function paintActs() {
    var n = 0;

    acts.forEach(function (a, i) {
      var show = day === "all" || a.dataset.day === day;

      a.classList.toggle("is-hidden", !show);
      if (!show) return;
      n++;
      a.style.opacity = "0";
      a.style.transform = "translateY(8px)";
      setTimeout(
        function () {
          a.style.transition = "opacity .45s ease, transform .45s ease";
          a.style.opacity = "1";
          a.style.transform = "none";
        },
        Math.min(i, 14) * 26,
      );
    });

    var label =
      day === "all"
        ? "across all three nights"
        : { 1: "on Thursday", 2: "on Friday", 3: "on Saturday" }[day];

    meta.textContent = n + (n === 1 ? " act " : " acts ") + label;
  }

  days.forEach(function (b) {
    b.addEventListener("click", function () {
      days.forEach(function (o) {
        o.classList.remove("is-on");
      });
      b.classList.add("is-on");
      day = b.dataset.day;
      paintActs();
    });
  });

  paintActs();

  /* ----------------------------------------------------------- songbook -- */

  $$(".song").forEach(function (song) {
    $(".song__hit", song).addEventListener("click", function () {
      var open = song.classList.contains("is-open");

      $$(".song").forEach(function (s) {
        s.classList.remove("is-open");
      });
      if (!open) {
        song.classList.add("is-open");
        // opening a song brings the lanterns up, which is the whole idea
        if (has3d) window.GiriaScene.lightUp();
      }
    });
  });

  /* ------------------------------------------------------------ tickets -- */

  var TYPES = [
    { id: "full", n: "Three nights", e: "Camping included", p: 54 },
    { id: "two", n: "Friday and Saturday", e: "Camping included", p: 38 },
    { id: "one", n: "One night", e: "Pick it at the gate", p: 22 },
    { id: "child", n: "Under fourteen", e: "With an adult", p: 0 },
  ];
  var qty = {};

  TYPES.forEach(function (t) {
    qty[t.id] = 0;
  });

  var list = $("#tkList");

  function heads() {
    return TYPES.reduce(function (n, t) {
      return n + qty[t.id];
    }, 0);
  }

  function total() {
    var sum = TYPES.reduce(function (n, t) {
      return n + qty[t.id] * t.p;
    }, 0);

    if ($("#tkCoach").checked) sum += heads() * 14;

    return sum;
  }

  function paintTk() {
    list.innerHTML = TYPES.map(function (t) {
      return (
        '<li class="tkrow"><span><b>' +
        t.n +
        "</b><em>" +
        t.e +
        '</em></span><span class="tkrow__p">' +
        (t.p ? t.p + " EUR" : "free") +
        '</span><span class="tkrow__q">' +
        '<button type="button" data-id="' +
        t.id +
        '" data-d="-1" aria-label="One fewer">&minus;</button><i>' +
        qty[t.id] +
        '</i><button type="button" data-id="' +
        t.id +
        '" data-d="1" aria-label="One more">+</button></span></li>'
      );
    }).join("");

    $$("button", list).forEach(function (b) {
      b.addEventListener("click", function () {
        qty[b.dataset.id] = Math.max(0, qty[b.dataset.id] + Number(b.dataset.d));
        paintTk();
      });
    });

    $("#tkTotal").textContent = total() + " EUR";
  }

  ["tkRota", "tkCoach"].forEach(function (id) {
    $("#" + id).addEventListener("change", paintTk);
  });

  paintTk();

  var tk = $("#tk");

  function openTk() {
    tk.hidden = false;
    document.body.classList.add("is-locked");
    $("#tkDone").hidden = true;
    if (has3d) window.GiriaScene.lightUp();
  }

  function closeTk() {
    tk.hidden = true;
    document.body.classList.remove("is-locked");
  }

  $("#openTk").addEventListener("click", openTk);
  $("#openTk2").addEventListener("click", openTk);
  $$("[data-close]", tk).forEach(function (b) {
    b.addEventListener("click", closeTk);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !tk.hidden) closeTk();
  });

  $("#tkGo").addEventListener("click", function () {
    if (!heads()) {
      $("#tkTotal").textContent = "pick one first";

      return;
    }

    var extras = [];

    if ($("#tkRota").checked) extras.push("one fire shift");
    if ($("#tkCoach").checked) extras.push("the coach both ways");

    $("#tkDoneText").textContent =
      heads() +
      (heads() === 1 ? " place" : " places") +
      " for 28 to 30 August, " +
      total() +
      " EUR" +
      (extras.length ? ", with " + extras.join(" and ") : "") +
      ". Reference GIR-" +
      String(2600 + Math.floor(Math.random() * 399)) +
      ". Bus 27 to Girionys, then the sand track east, and bring a torch.";
    $("#tkDone").hidden = false;
    if (has3d) window.GiriaScene.lightUp();
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
    { rootMargin: "-45% 0px -45% 0px" },
  );

  navLinks.forEach(function (a) {
    var s = document.getElementById(a.getAttribute("href").slice(1));

    if (s) navIO.observe(s);
  });

  /* ------------------------------------------------------------- reveal -- */

  var reveal = $$(".leaf__card, .clearing > *, .foot__grid");

  reveal.forEach(function (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(26px)";
    el.style.transition =
      "opacity 1.1s ease, transform 1.1s cubic-bezier(.16,.84,.28,1)";
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
    { threshold: 0.12 },
  );

  reveal.forEach(function (el) {
    io.observe(el);
  });

  /* the title breathes in on load */
  var title = $(".title span");

  title.style.opacity = "0";
  title.style.transform = "translateY(24px) scale(0.97)";
  title.style.transition =
    "opacity 1.6s ease, transform 1.6s cubic-bezier(.16,.84,.28,1)";
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      title.style.opacity = "1";
      title.style.transform = "none";
    });
  });
})();
