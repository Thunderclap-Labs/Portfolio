/* Halcyon HF-1 / site behaviour
   Transport control, colourways, anatomy focus, service requests and a
   working reservation flow that persists in this browser. */

(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  var STORE = "halcyon.reservation.v1";
  var PRICE = 1480;
  var SERVICE_PRICE = {
    "": 0,
    "Head realignment": 65,
    "Belt and idler kit": 24,
    "Full transport rebuild": 180,
  };

  /* ---------------------------------------------------------------- 3D -- */

  var stage = $("#stage");
  var loading = $("#stageLoading");
  var has3d = false;

  try {
    has3d = !!(window.HalcyonScene && window.HalcyonScene.init(stage));
  } catch (e) {
    has3d = false;
  }

  if (has3d) {
    setTimeout(function () {
      loading.classList.add("is-gone");
    }, 400);
  } else {
    loading.innerHTML =
      "<span></span> This browser cannot run WebGL, so the model is not shown.";
    loading.classList.add("is-error");
    stage.classList.add("is-flat");
  }

  /* --------------------------------------------------------- transport -- */

  var stateText = $("#stateText");
  var stateDot = $("#stateDot");
  var timecodeEl = $("#timecode");
  var LABEL = {
    stopped: "STOPPED",
    play: "PLAYING",
    rew: "REWIND",
    fwd: "FORWARD",
    rec: "RECORDING",
  };
  var current = "stopped";
  var frames = 0;

  function setState(id) {
    if (id === "stop") id = "stopped";
    current = id;
    if (has3d) window.HalcyonScene.setTransport(id);

    stateText.textContent = LABEL[id] || "STOPPED";
    stateDot.className =
      "transport__dot" +
      (id === "rec" ? " is-rec" : id === "stopped" ? "" : " is-run");

    // Stop is a momentary key, so nothing stays latched once the tape halts.
    // This mirrors the model, where the same key pops the others back up.
    $$(".tkey").forEach(function (b) {
      b.classList.toggle("is-on", id !== "stopped" && b.dataset.key === id);
    });
  }

  function press(id) {
    if (has3d) window.HalcyonScene.pressKey(id);
    setState(id);
  }

  $$(".tkey").forEach(function (b) {
    b.addEventListener("click", function () {
      press(b.dataset.key);
    });
  });

  if (has3d) {
    window.HalcyonScene.onKeyPress(function (id) {
      press(id);
    });
  }

  setState("stopped");

  // timecode runs whenever the tape is moving
  setInterval(function () {
    var step =
      current === "play" || current === "rec"
        ? 1
        : current === "fwd"
          ? 6
          : current === "rew"
            ? -6
            : 0;

    if (!step) return;
    frames = Math.max(0, frames + step);

    var total = Math.floor(frames / 25);
    var mm = String(Math.floor(total / 60) % 100).padStart(2, "0");
    var ss = String(total % 60).padStart(2, "0");
    var ff = String(frames % 25).padStart(2, "0");

    timecodeEl.textContent = mm + ":" + ss + ":" + ff;
  }, 40);

  /* -------------------------------------------------------- colourways -- */

  var swatches = $$(".swatch");
  var colour = {
    name: "Bone",
    shell: "#c9c2b4",
    deep: "#8e887b",
    accent: "#e2632a",
  };

  function applyColour(btn) {
    swatches.forEach(function (b) {
      b.classList.toggle("is-active", b === btn);
    });
    colour = {
      name: btn.dataset.name,
      shell: btn.dataset.shell,
      deep: btn.dataset.deep,
      accent: btn.dataset.accent,
    };
    document.documentElement.style.setProperty("--shell", colour.shell);
    document.documentElement.style.setProperty("--shell-deep", colour.deep);
    document.documentElement.style.setProperty("--shell-accent", colour.accent);
    if (has3d) window.HalcyonScene.setColour(colour);

    var radio = $('#modalColours input[value="' + colour.name + '"]');

    if (radio) radio.checked = true;
  }

  swatches.forEach(function (b) {
    b.addEventListener("click", function () {
      applyColour(b);
    });
  });

  /* ----------------------------------------------------------- anatomy -- */

  var hots = $$(".hot");
  var zones = $$(".bp-zone");

  function focus(part) {
    hots.forEach(function (h) {
      h.classList.toggle("is-active", h.dataset.part === part);
    });
    zones.forEach(function (z) {
      z.classList.toggle("is-lit", z.dataset.zone === part);
    });
    if (has3d) window.HalcyonScene.focusPart(part);
  }

  hots.forEach(function (h) {
    h.addEventListener("mouseenter", function () {
      focus(h.dataset.part);
    });
    h.addEventListener("click", function () {
      focus(h.dataset.part);
      stage.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  var anatomy = $("#anatomy");

  var anatomyIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!has3d) return;
        if (e.isIntersecting) focus("window");
        else window.HalcyonScene.focusPart(null);
      });
    },
    { threshold: 0.3 },
  );

  anatomyIO.observe(anatomy);

  /* -------------------------------------------------------------- modal -- */

  var modal = $("#modal");
  var form = $("#reserveForm");
  var done = $("#reserveDone");
  var totalEl = $("#modalTotal");
  var subEl = $("#modalSub");
  var lastFocus = null;

  function money(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " EUR";
  }

  function recalcTotal() {
    var svc = form.service.value;

    totalEl.textContent = money(PRICE + (SERVICE_PRICE[svc] || 0));
  }

  function openModal(opts) {
    opts = opts || {};
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("is-locked");
    form.hidden = false;
    done.hidden = true;
    form.service.value = opts.service || "";

    subEl.textContent = opts.service
      ? "Service is booked alongside a unit. Pick a colourway and we confirm both in the same email."
      : "No payment is taken now. We write to you when your unit reaches the bench, and you have seven days to confirm or pass.";

    var radio = $('#modalColours input[value="' + colour.name + '"]');

    if (radio) radio.checked = true;
    recalcTotal();
    setTimeout(function () {
      form.name.focus();
    }, 40);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("is-locked");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$("[data-open-reserve]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });
  });

  $$("[data-close]", modal).forEach(function (b) {
    b.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  form.service.addEventListener("change", recalcTotal);

  $$("#modalColours input").forEach(function (r) {
    r.addEventListener("change", function () {
      var btn = swatches.filter(function (b) {
        return b.dataset.name === r.value;
      })[0];

      if (btn) applyColour(btn);
    });
  });

  /* -------------------------------------------------------- validation -- */

  function setError(field, msg) {
    var wrap = field.closest(".field");

    wrap.classList.toggle("is-bad", !!msg);
    $(".field__err", wrap).textContent = msg || "";
  }

  function validate() {
    var ok = true;

    if (!form.name.value.trim()) {
      setError(form.name, "We need a name for the build card.");
      ok = false;
    } else {
      setError(form.name, "");
    }

    var email = form.email.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError(form.email, "That address will not reach you.");
      ok = false;
    } else {
      setError(form.email, "");
    }

    return ok;
  }

  ["name", "email"].forEach(function (n) {
    form[n].addEventListener("input", function () {
      if (form[n].closest(".field").classList.contains("is-bad")) validate();
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) {
      var bad = $(".field.is-bad input");

      if (bad) bad.focus();

      return;
    }

    var svc = form.service.value;
    var entry = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      colour: form.colour.value,
      service: svc,
      note: form.note.value.trim(),
      total: PRICE + (SERVICE_PRICE[svc] || 0),
      ref: "B05-" + String(400 + Math.floor(Math.random() * 90)),
      at: new Date().toISOString().slice(0, 10),
    };

    try {
      localStorage.setItem(STORE, JSON.stringify(entry));
    } catch (err) {
      /* private mode, carry on without persisting */
    }

    $("#doneText").textContent =
      "Reference " +
      entry.ref +
      ". One HF-1 in " +
      entry.colour +
      (entry.service ? ", with " + entry.service.toLowerCase() : "") +
      ", " +
      money(entry.total) +
      ". We write to " +
      entry.email +
      " when it reaches the bench.";

    form.hidden = true;
    done.hidden = false;
    renderSaved();
  });

  /* -------------------------------------------------------- saved entry -- */

  var savedNote = $("#savedNote");
  var savedText = $("#savedText");
  var DOT = " " + String.fromCharCode(183) + " ";

  function renderSaved() {
    var raw = null;

    try {
      raw = localStorage.getItem(STORE);
    } catch (e) {
      raw = null;
    }
    if (!raw) {
      savedNote.hidden = true;

      return;
    }

    var d = JSON.parse(raw);

    savedNote.hidden = false;
    savedText.textContent =
      d.ref + DOT + d.colour + DOT + money(d.total) + DOT + "reserved " + d.at;
  }

  $("#clearSaved").addEventListener("click", function () {
    try {
      localStorage.removeItem(STORE);
    } catch (e) {
      /* nothing to remove */
    }
    renderSaved();
  });

  renderSaved();

  /* ----------------------------------------------------------- service -- */

  $$(".svc__row").forEach(function (row) {
    row.querySelector("button").addEventListener("click", function () {
      openModal({ service: row.dataset.svc });
    });
  });

  /* ---------------------------------------------------------- nav state -- */

  var navLinks = $$("#topnav a[href^='#']");
  var sections = navLinks
    .map(function (a) {
      return document.getElementById(a.getAttribute("href").slice(1));
    })
    .filter(Boolean);

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

  sections.forEach(function (s) {
    navIO.observe(s);
  });

  /* --------------------------------------------------- reveal on scroll -- */

  var reveal = $$(
    ".section-head, .hot, .spec-col, .svc__row, .order__inner, .blueprint",
  );

  reveal.forEach(function (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition =
      "opacity .7s ease, transform .7s cubic-bezier(.2,.7,.3,1)";
  });

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var sibs = Array.prototype.slice.call(el.parentNode.children);
        var delay = Math.min(sibs.indexOf(el), 6) * 70;

        setTimeout(function () {
          el.style.opacity = "1";
          el.style.transform = "none";
        }, delay);
        io.unobserve(el);
      });
    },
    { threshold: 0.14 },
  );

  reveal.forEach(function (el) {
    io.observe(el);
  });

  /* --------------------------------------------------------------- hint -- */

  var hint = $("#hint");

  stage.addEventListener(
    "pointerdown",
    function () {
      hint.classList.add("is-hidden");
    },
    { once: true },
  );
})();
