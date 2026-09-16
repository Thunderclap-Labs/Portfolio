/* Orbit / site behaviour
   Exploded view control, a real basket with quantities, a rule builder that
   writes sentences, finishes that reach the 3D model, and repair guides. */

(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  var STORE = "orbit.basket.v1";

  /* ---------------------------------------------------------------- 3D -- */

  var isoEl = $("#iso");
  var loading = $("#isoLoading");
  var has3d = false;

  try {
    has3d = !!(window.OrbitScene && window.OrbitScene.init(isoEl));
  } catch (e) {
    has3d = false;
  }

  if (has3d) {
    setTimeout(function () {
      loading.classList.add("is-gone");
      window.OrbitScene.open(true);
    }, 700);
  } else {
    loading.textContent = "WebGL is unavailable, so the model is not shown.";
    loading.classList.add("is-error");
    isoEl.classList.add("is-flat");
  }

  var explodeBtn = $("#explode");
  var isOpen = true;

  explodeBtn.addEventListener("click", function () {
    isOpen = !isOpen;
    explodeBtn.setAttribute("aria-pressed", String(isOpen));
    explodeBtn.classList.toggle("is-off", !isOpen);
    $("span", explodeBtn).nextSibling.textContent = isOpen
      ? " Exploded view"
      : " Assembled view";
    if (has3d) window.OrbitScene.open(isOpen);
  });

  /* -------------------------------------------------------- colour field -- */

  /* One field of colour behind the whole page, drifting at its own rate as you
     scroll. It is never cut into bands, and it takes the finish you pick. */
  var field = $("#field");

  if (field && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var fy = 0;
    var fTarget = 0;

    window.addEventListener(
      "scroll",
      function () {
        fTarget = window.scrollY;
      },
      { passive: true },
    );

    (function fieldFrame() {
      fy += (fTarget - fy) * 0.08;
      field.style.setProperty("--sy", fy.toFixed(1) + "px");
      requestAnimationFrame(fieldFrame);
    })();
  }

  /* ------------------------------------------------------------- basket -- */

  var basket = {}; // sku -> {name, price, qty}
  var finish = { name: "Butter", a: "#ffd86b", b: "#f2c04d" };

  function load() {
    try {
      var raw = localStorage.getItem(STORE);

      if (raw) {
        var d = JSON.parse(raw);

        basket = d.basket || {};
        if (d.finish) finish = d.finish;
      }
    } catch (e) {
      basket = {};
    }
  }

  function save() {
    try {
      localStorage.setItem(
        STORE,
        JSON.stringify({ basket: basket, finish: finish }),
      );
    } catch (e) {
      /* private mode */
    }
  }

  function count() {
    return Object.keys(basket).reduce(function (n, k) {
      return n + basket[k].qty;
    }, 0);
  }

  function total() {
    return Object.keys(basket).reduce(function (n, k) {
      return n + basket[k].qty * basket[k].price;
    }, 0);
  }

  function add(sku, name, price, qty) {
    if (!basket[sku]) basket[sku] = { name: name, price: price, qty: 0 };
    basket[sku].qty = Math.max(0, basket[sku].qty + qty);
    if (!basket[sku].qty) delete basket[sku];
    save();
    paintBasket();
    paintRows();
  }

  function paintRows() {
    $$(".part").forEach(function (row) {
      var sku = row.dataset.sku;
      var q = basket[sku] ? basket[sku].qty : 0;

      $(".qtyv", row).textContent = String(q);
      row.classList.toggle("is-in", q > 0);
    });
  }

  var basketList = $("#basketList");
  var basketEmpty = $("#basketEmpty");

  function paintBasket() {
    var keys = Object.keys(basket);

    $("#basketCount").textContent = String(count());
    $("#basketCount").classList.toggle("is-on", count() > 0);
    $("#basketTotal").textContent = total() + " " + String.fromCharCode(8364);
    $("#basketFinish").textContent = finish.name;
    basketEmpty.hidden = keys.length > 0;
    basketList.innerHTML = keys
      .map(function (sku) {
        var it = basket[sku];

        return (
          '<li class="bline"><span class="bline__n">' +
          it.name +
          '<em>' +
          sku +
          "</em></span>" +
          '<span class="bline__q">' +
          '<button type="button" data-sku="' +
          sku +
          '" data-d="-1">&minus;</button>' +
          "<b>" +
          it.qty +
          "</b>" +
          '<button type="button" data-sku="' +
          sku +
          '" data-d="1">+</button>' +
          "</span>" +
          '<span class="bline__p">' +
          it.qty * it.price +
          " " +
          String.fromCharCode(8364) +
          "</span></li>"
        );
      })
      .join("");

    $$("button", basketList).forEach(function (b) {
      b.addEventListener("click", function () {
        var it = basket[b.dataset.sku];

        add(b.dataset.sku, it.name, it.price, Number(b.dataset.d));
      });
    });
  }

  $$(".part").forEach(function (row) {
    $$(".qty", row).forEach(function (b) {
      b.addEventListener("click", function () {
        add(
          row.dataset.sku,
          row.dataset.name,
          Number(row.dataset.price),
          Number(b.dataset.d),
        );
      });
    });

    row.addEventListener("mouseenter", function () {
      if (has3d) window.OrbitScene.focus(row.dataset.part);
    });
    row.addEventListener("mouseleave", function () {
      if (has3d) window.OrbitScene.focus(null);
    });

    // clicking a row picks the module in 3D, and picking in 3D marks the row
    row.addEventListener("click", function (e) {
      if (e.target.closest(".qty")) return;
      if (!has3d) return;
      markPicked(window.OrbitScene.pick(row.dataset.part));
    });
  });

  function markPicked(key) {
    $$(".part").forEach(function (r) {
      r.classList.toggle("is-picked", r.dataset.part === key);
    });
  }

  if (has3d) {
    window.OrbitScene.onPick(function (key) {
      markPicked(key);
    });
  }

  function buyKit() {
    add("ORB-KIT-1", "Orbit, complete hub", 189, 1);
    openBasket();
  }

  $("#buyKit").addEventListener("click", buyKit);
  $("#buyKit2").addEventListener("click", buyKit);

  /* -------------------------------------------------------- basket panel -- */

  var panel = $("#basket");

  function openBasket() {
    panel.hidden = false;
    document.body.classList.add("is-locked");
    $("#basketDone").hidden = true;
  }

  function closeBasket() {
    panel.hidden = true;
    document.body.classList.remove("is-locked");
  }

  $("#basketBtn").addEventListener("click", openBasket);
  $$("[data-close]", panel).forEach(function (b) {
    b.addEventListener("click", closeBasket);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) closeBasket();
  });

  $("#checkout").addEventListener("click", function () {
    if (!count()) {
      basketEmpty.textContent = "Add something first.";

      return;
    }
    $("#basketDoneText").textContent =
      count() +
      (count() === 1 ? " item" : " items") +
      " in " +
      finish.name.toLowerCase() +
      ", " +
      total() +
      " EUR, shipping in two days. Reference ORB-" +
      String(1000 + Math.floor(Math.random() * 8999)) +
      ".";
    $("#basketDone").hidden = false;
    basket = {};
    save();
    paintBasket();
    paintRows();
  });

  /* ----------------------------------------------------------- finishes -- */

  var tintT;

  var fsw = $$(".fsw");

  function applyFinish(btn) {
    fsw.forEach(function (o) {
      o.classList.toggle("is-active", o === btn);
    });
    finish = { name: btn.dataset.name, a: btn.dataset.a, b: btn.dataset.b };
    document.documentElement.style.setProperty("--finish", finish.a);
    document.documentElement.style.setProperty("--finish-d", finish.b);
    $("#finishLabel").textContent = finish.name;
    if (has3d) window.OrbitScene.setFinish(finish.a, finish.b);
    document.body.classList.add("is-tinting");
    clearTimeout(tintT);
    tintT = setTimeout(function () {
      document.body.classList.remove("is-tinting");
    }, 700);
    save();
    paintBasket();
  }

  fsw.forEach(function (b) {
    b.addEventListener("click", function () {
      applyFinish(b);
    });
  });

  /* -------------------------------------------------------- rule builder -- */

  var rWhere = $("#rWhere");
  var rWhat = $("#rWhat");
  var rDo = $("#rDo");
  var preview = $("#rulePreview");
  var rulesEl = $("#rules");
  var rules = [];

  function sentence() {
    return (
      "If the " +
      rWhere.value +
      " " +
      rWhat.value +
      ", then " +
      rDo.value +
      "."
    );
  }

  function paintPreview() {
    preview.textContent = sentence();
  }

  [rWhere, rWhat, rDo].forEach(function (s) {
    s.addEventListener("change", paintPreview);
  });

  paintPreview();

  function paintRules() {
    rulesEl.innerHTML = rules
      .map(function (r, i) {
        return (
          '<li class="rule"><span class="rule__n">' +
          String(i + 1).padStart(2, "0") +
          '</span><span class="rule__t">' +
          r +
          '</span><button type="button" data-i="' +
          i +
          '" aria-label="Remove rule">&times;</button></li>'
        );
      })
      .join("");

    $$("button", rulesEl).forEach(function (b) {
      b.addEventListener("click", function () {
        rules.splice(Number(b.dataset.i), 1);
        paintRules();
      });
    });

    $("#rulesMeta").textContent = rules.length
      ? rules.length +
        (rules.length === 1 ? " rule" : " rules") +
        " on the hub. Stored locally, running without the internet."
      : "No rules yet. The hub ships empty on purpose.";
  }

  $("#addRule").addEventListener("click", function () {
    var s = sentence();

    if (rules.indexOf(s) !== -1) {
      preview.textContent = "That rule is already on the hub.";

      return;
    }
    rules.push(s);
    paintRules();
    paintPreview();
  });

  paintRules();

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

  /* -------------------------------------------------------------- reveal -- */

  var reveal = $$(
    ".parts__head, .part, .step, .builder, .finish__inner, .buy__card, .how__title, .acc__item, .guides__title",
  );

  reveal.forEach(function (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition =
      "opacity .7s ease, transform .7s cubic-bezier(.2,.9,.3,1)";
  });

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var sibs = Array.prototype.slice.call(el.parentNode.children);
        var delay = Math.min(sibs.indexOf(el), 5) * 80;

        setTimeout(function () {
          el.style.opacity = "1";
          el.style.transform = "none";
        }, delay);
        io.unobserve(el);
      });
    },
    { threshold: 0.15 },
  );

  reveal.forEach(function (el) {
    io.observe(el);
  });

  /* ---------------------------------------------------------------- boot -- */

  load();
  var startSwatch = fsw.filter(function (b) {
    return b.dataset.name === finish.name;
  })[0];

  applyFinish(startSwatch || fsw[0]);
  paintBasket();
  paintRows();
})();
