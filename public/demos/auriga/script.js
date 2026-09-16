/* AURIGA Drive 12 / site behaviour
   Scroll drives the separation and the camera pose. The configurator changes
   the model, the spec table, the torque curve and the price, and carries the
   build through to the quote form. */

(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* ---------------------------------------------------------------- 3D -- */

  var gl = $("#gl");
  var has3d = false;

  try {
    has3d = !!(window.AurigaScene && window.AurigaScene.init(gl));
  } catch (e) {
    has3d = false;
  }

  if (!has3d) {
    $("#glFail").hidden = false;
    document.body.classList.add("no-gl");
  }

  /* ------------------------------------------------------ scroll cinema -- */

  // Separation runs across the five chapters. The camera pose is set by
  // whichever chapter is nearest the middle of the viewport.
  var first = $("#hero");
  var last = $("#all");
  var chapters = $$("[data-pose]");
  var railBtns = $$(".rail button");
  var navLinks = $$("#topnav a");
  var pctEl = $("#scrollPct");
  var top = $(".top");
  var currentPose = "hero";

  function cinemaProgress() {
    var a = first.offsetTop;
    var b = last.offsetTop + last.offsetHeight - window.innerHeight * 0.9;
    var y = window.scrollY;

    return Math.max(0, Math.min(1, (y - a) / Math.max(1, b - a)));
  }

  function tick() {
    var p = cinemaProgress();

    if (has3d) window.AurigaScene.setProgress(p);
    pctEl.textContent = String(Math.round(p * 100)).padStart(2, "0") + " %";
    top.classList.toggle("is-stuck", window.scrollY > 40);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  function setPose(name, id) {
    if (currentPose === name) return;
    currentPose = name;
    if (has3d) {
      window.AurigaScene.setPose(name);
      var ch = chapters.filter(function (c) {
        return c.dataset.pose === name;
      })[0];

      window.AurigaScene.setFocus(ch ? ch.dataset.focus : null);
    }
    railBtns.forEach(function (b) {
      b.classList.toggle("is-on", b.dataset.go === name);
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("is-here", a.getAttribute("href") === "#" + id);
    });
  }

  var poseIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setPose(e.target.dataset.pose, e.target.id);
      });
    },
    { rootMargin: "-40% 0px -40% 0px" },
  );

  chapters.forEach(function (c) {
    poseIO.observe(c);
  });

  railBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var target = chapters.filter(function (c) {
        return c.dataset.pose === b.dataset.go;
      })[0];

      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ----------------------------------------------------------- parts list -- */

  var PARTS = [
    ["AX12-HSG", "Housing", "7075-T6, hard anodised", 210],
    ["AX12-CAP", "End cap", "7075-T6, M12 boss", 96],
    ["AX12-ENC", "Encoder board", "21 bit rotor, 17 bit output", 480],
    ["AX12-STA", "Stator", "12 slot, 84 turns, class H", 395],
    ["AX12-ROT", "Rotor", "N42SH, eight pole", 265],
    ["AX12-BRK", "Brake", "Fail safe, 14 Nm hold", 155],
    ["AX12-GBX", "Gearbox", "Planetary, ground helical", 420],
    ["AX12-FLG", "Output flange", "8 x M4 on 71 mm PCD", 88],
  ];

  $("#partsGrid").innerHTML = PARTS.map(function (p) {
    return (
      '<div class="pcell"><span class="pcell__n">' +
      p[0] +
      '</span><span class="pcell__t">' +
      p[1] +
      '</span><span class="pcell__s">' +
      p[2] +
      '</span><span class="pcell__p">' +
      p[3] +
      " EUR</span></div>"
    );
  }).join("");

  /* --------------------------------------------------------- configurator -- */

  var cfg = { ratio: 36, brake: 0, bus: "ethercat" };

  var RATIO = {
    9: { stages: 1, peak: 14, cont: 4.6, speed: 620, mass: 620, price: 1690, lead: 3 },
    36: { stages: 2, peak: 36, cont: 12, speed: 155, mass: 740, price: 1940, lead: 4 },
    121: { stages: 3, peak: 84, cont: 27, speed: 46, mass: 880, price: 2280, lead: 6 },
  };

  function build() {
    var r = RATIO[cfg.ratio];

    return {
      stages: r.stages,
      peak: r.peak,
      cont: r.cont,
      speed: r.speed,
      mass: r.mass + (cfg.brake ? 110 : 0),
      price: r.price + (cfg.brake ? 155 : 0) + (cfg.bus === "ethercat" ? 60 : 0),
      lead: r.lead + (cfg.brake ? 1 : 0),
    };
  }

  function money(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " EUR";
  }

  var prev = {};

  function paintSpec() {
    var b = build();
    var rows = [
      ["Reduction", "1:" + cfg.ratio],
      ["Peak torque", b.peak + " N·m for 2 s"],
      ["Continuous torque", b.cont + " N·m at 40 °C"],
      ["No load speed", b.speed + " rpm"],
      ["Backlash", "3 arcmin"],
      ["Brake", cfg.brake ? "Fail safe, 14 N·m hold" : "None"],
      ["Bus", cfg.bus === "ethercat" ? "EtherCAT, 8 kHz cyclic" : "CAN FD, 5 Mbit"],
      ["Mass", b.mass + " g"],
      ["Supply", "48 V nominal"],
      ["Sealing", "IP65"],
    ];

    $("#spec tbody").innerHTML = rows
      .map(function (r) {
        var changed = prev[r[0]] !== undefined && prev[r[0]] !== r[1];

        prev[r[0]] = r[1];

        return (
          '<tr class="' +
          (changed ? "is-changed" : "") +
          '"><td>' +
          r[0] +
          "</td><td>" +
          r[1] +
          "</td></tr>"
        );
      })
      .join("");

    $("#price").textContent = money(b.price);
    $("#lead").textContent = "Lead time " + b.lead + " weeks";
    $("#buildEcho").textContent =
      "1:" +
      cfg.ratio +
      "  /  " +
      (cfg.brake ? "fail safe brake" : "no brake") +
      "  /  " +
      (cfg.bus === "ethercat" ? "EtherCAT" : "CAN FD") +
      "  /  " +
      money(b.price);

    if (has3d) window.AurigaScene.setConfig({ stages: b.stages, brake: cfg.brake });
    drawCurve(b);
  }

  $$(".opt").forEach(function (group) {
    var key = group.dataset.opt;

    $$(".opt__b", group).forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$(".opt__b", group).forEach(function (o) {
          o.classList.remove("is-on");
        });
        btn.classList.add("is-on");
        var v = btn.dataset.v;

        cfg[key] = key === "bus" ? v : Number(v);
        paintSpec();
      });
    });
  });

  /* ------------------------------------------------------------ curve -- */

  var cv = $("#curve");
  var cx = cv.getContext("2d");

  function drawCurve(b) {
    var W = cv.width;
    var H = cv.height;
    var padL = 56;
    var padB = 42;
    var padT = 18;
    var padR = 18;
    var w = W - padL - padR;
    var h = H - padT - padB;

    cx.clearRect(0, 0, W, H);

    var maxT = Math.max(b.peak * 1.12, 20);
    var maxS = b.speed * 1.05;

    // grid
    cx.strokeStyle = "rgba(232,237,242,0.09)";
    cx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var y = padT + (h / 4) * i;

      cx.beginPath();
      cx.moveTo(padL, y);
      cx.lineTo(padL + w, y);
      cx.stroke();
    }
    for (var j = 0; j <= 5; j++) {
      var x = padL + (w / 5) * j;

      cx.beginPath();
      cx.moveTo(x, padT);
      cx.lineTo(x, padT + h);
      cx.stroke();
    }

    function px(s) {
      return padL + (s / maxS) * w;
    }
    function py(t) {
      return padT + h - (t / maxT) * h;
    }

    // continuous band: flat then falling off toward no load speed
    function torqueAt(s, top) {
      var knee = maxS * 0.55;

      if (s <= knee) return top;

      return top * (1 - (s - knee) / (maxS - knee)) * 0.98;
    }

    cx.beginPath();
    cx.moveTo(px(0), py(0));
    for (var s = 0; s <= maxS; s += maxS / 90) {
      cx.lineTo(px(s), py(torqueAt(s, b.cont)));
    }
    cx.lineTo(px(maxS), py(0));
    cx.closePath();
    cx.fillStyle = "rgba(43,231,199,0.16)";
    cx.fill();
    cx.strokeStyle = "#2be7c7";
    cx.lineWidth = 2;
    cx.beginPath();
    for (var s2 = 0; s2 <= maxS; s2 += maxS / 90) {
      var yy = py(torqueAt(s2, b.cont));

      if (s2 === 0) cx.moveTo(px(s2), yy);
      else cx.lineTo(px(s2), yy);
    }
    cx.stroke();

    // peak outline
    cx.strokeStyle = "#c9834b";
    cx.lineWidth = 2;
    cx.setLineDash([6, 5]);
    cx.beginPath();
    for (var s3 = 0; s3 <= maxS; s3 += maxS / 90) {
      var y3 = py(torqueAt(s3, b.peak));

      if (s3 === 0) cx.moveTo(px(s3), y3);
      else cx.lineTo(px(s3), y3);
    }
    cx.stroke();
    cx.setLineDash([]);

    // axes
    cx.strokeStyle = "rgba(232,237,242,0.28)";
    cx.beginPath();
    cx.moveTo(padL, padT);
    cx.lineTo(padL, padT + h);
    cx.lineTo(padL + w, padT + h);
    cx.stroke();

    cx.fillStyle = "#5d6875";
    cx.font = "500 13px Consolas, monospace";
    cx.textAlign = "right";
    cx.fillText(Math.round(maxT) + "", padL - 10, padT + 12);
    cx.fillText("0", padL - 10, padT + h + 4);
    cx.save();
    cx.translate(16, padT + h / 2);
    cx.rotate(-Math.PI / 2);
    cx.textAlign = "center";
    cx.fillText("TORQUE  N·m", 0, 0);
    cx.restore();

    cx.textAlign = "center";
    cx.fillText("0", padL, padT + h + 22);
    cx.fillText(Math.round(maxS) + " rpm", padL + w - 20, padT + h + 22);
    cx.fillText("SPEED", padL + w / 2, padT + h + 36);

    // legend
    cx.textAlign = "left";
    cx.fillStyle = "#2be7c7";
    cx.fillText("continuous " + b.cont + " N·m", padL + 14, padT + 16);
    cx.fillStyle = "#c9834b";
    cx.fillText("peak " + b.peak + " N·m", padL + 14, padT + 34);
  }

  paintSpec();

  /* ------------------------------------------------------------- quote -- */

  var qform = $("#qform");
  var qdone = $("#qdone");

  function bad(input, msg) {
    var wrap = input.closest(".qf");

    wrap.classList.toggle("is-bad", !!msg);
    $("em", wrap).textContent = msg || "";
  }

  qform.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;

    if (!qform.name.value.trim()) {
      bad(qform.name, "We need a name to reply to.");
      ok = false;
    } else bad(qform.name, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(qform.email.value.trim())) {
      bad(qform.email, "That address will not reach you.");
      ok = false;
    } else bad(qform.email, "");

    if (qform.brief.value.trim().length < 15) {
      bad(qform.brief, "One or two sentences about the joint, please.");
      ok = false;
    } else bad(qform.brief, "");

    if (!ok) {
      var f = $(".qf.is-bad input, .qf.is-bad textarea");

      if (f) f.focus();

      return;
    }

    var b = build();
    var joints = Math.max(1, Number(qform.joints.value) || 1);
    var machines = Math.max(1, Number(qform.machines.value) || 1);
    var annual = joints * machines;

    $("#qdoneText").textContent =
      annual +
      " units a year at 1:" +
      cfg.ratio +
      ", which puts you in the volume band. Indicative unit price " +
      money(Math.round(b.price * (annual >= 500 ? 0.82 : annual >= 100 ? 0.9 : 1))) +
      " at that quantity. A sample ships in five working days and the STEP file goes out with it. Reference AX-" +
      String(3100 + Math.floor(Math.random() * 799)) +
      ".";
    qform.hidden = true;
    qdone.hidden = false;
  });

  $("#qagain").addEventListener("click", function () {
    qform.reset();
    qform.hidden = false;
    qdone.hidden = true;
    qform.name.focus();
  });

  /* --------------------------------------------------- part hit testing -- */

  // Clicking a layer in the exploded view highlights its row in the list.
  window.addEventListener("click", function (e) {
    if (!has3d) return;
    if (e.target.closest("a,button,input,textarea,select,label")) return;

    var key = window.AurigaScene.hit(e.clientX, e.clientY);

    if (!key) return;

    var map = {
      housing: "AX12-HSG",
      endcap: "AX12-CAP",
      pcb: "AX12-ENC",
      stator: "AX12-STA",
      rotor: "AX12-ROT",
      brake: "AX12-BRK",
      gearbox: "AX12-GBX",
      flange: "AX12-FLG",
    };
    var cellNo = map[key];

    $$(".pcell").forEach(function (c) {
      var on = $(".pcell__n", c).textContent === cellNo;

      c.style.background = on ? "rgba(43,231,199,0.16)" : "";
      if (on) c.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  /* -------------------------------------------------- reveal on scroll -- */

  var reveal = $$(".ch__col, .ch__wide, .cfg__panel, .quote__grid > div, .qform");

  reveal.forEach(function (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(22px)";
    el.style.transition =
      "opacity .9s ease, transform .9s cubic-bezier(.2,.8,.3,1)";
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
})();
