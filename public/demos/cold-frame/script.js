/* Cold Frame / site behaviour
   A sowing calendar with real per month contents, a catalogue that filters on
   three axes at once, and a seed box that adds up. */

(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* the misregistered ghost layer needs a copy of each line */
  $$(".riso__a").forEach(function (l) {
    l.setAttribute("data-ghost", l.textContent);
  });

  /* ------------------------------------------------------------ calendar -- */

  var MONTHS = [
    ["Jan", [], [], "Nothing goes in. Order seed, clean pots, sharpen the hoe."],
    ["Feb", ["Chilli", "Aubergine", "Celeriac"], [], "Heat mat weather. Anything sown now needs 20 degrees to germinate at all."],
    ["Mar", ["Tomato", "Leek", "Onion", "Brassica"], ["Broad bean", "Spinach"], "The first outdoor sowing usually rots. Sow half, keep half."],
    ["Apr", ["Courgette", "Cucumber", "Basil"], ["Carrot", "Beetroot", "Radish", "Pea"], "Soil needs to be 8 degrees. Sit on it, if you cannot, it is too cold."],
    ["May", ["Squash", "Sweetcorn"], ["Bean", "Chard", "Lettuce", "Dill"], "Last frost here is around 18 May. Nothing tender goes out before it."],
    ["Jun", [], ["Bean", "Carrot", "Beetroot", "Coriander"], "Sow successions every ten days now or you get one glut and nothing after."],
    ["Jul", ["Autumn brassica"], ["Carrot", "Chard", "Fennel", "Turnip"], "The last honest sowing month for roots. After this you are gambling."],
    ["Aug", [], ["Spinach", "Rocket", "Winter lettuce", "Radish"], "Sow for autumn, not for summer. Days are already getting shorter."],
    ["Sep", [], ["Winter salad", "Rye green manure"], "Everything sown now is a cold frame crop. Outdoors it will sit and sulk."],
    ["Oct", [], ["Garlic", "Broad bean", "Field bean"], "Garlic wants a cold spell. Get it in before the ground turns."],
    ["Nov", [], ["Garlic, late"], "Last chance for garlic. Otherwise clear beds and leave the roots in."],
    ["Dec", [], [], "Nothing. Read the catalogue and lie about how well last year went."],
  ];

  var monthsEl = $("#months");

  monthsEl.innerHTML = MONTHS.map(function (m, i) {
    var busy = m[1].length + m[2].length > 0;

    return (
      '<button class="month' +
      (busy ? " is-busy" : "") +
      '" data-m="' +
      i +
      '" type="button">' +
      m[0] +
      "</button>"
    );
  }).join("");

  function paintMonth(i) {
    var m = MONTHS[i];

    $$(".month").forEach(function (b) {
      b.classList.toggle("is-on", Number(b.dataset.m) === i);
    });

    function list(items) {
      return items.length
        ? items
            .map(function (x) {
              return "<li>" + x + "</li>";
            })
            .join("")
        : "<li>Nothing</li>";
    }

    $("#calGlass").innerHTML = list(m[1]);
    $("#calOut").innerHTML = list(m[2]);
    $("#calNote").textContent = m[3];
  }

  $$(".month").forEach(function (b) {
    b.addEventListener("click", function () {
      paintMonth(Number(b.dataset.m));
    });
  });

  // open on the current month so the page is useful the second it loads
  paintMonth(new Date().getMonth());

  /* ----------------------------------------------------------- catalogue -- */

  var SEEDS = [
    ["CF-014", "Ausma Tomato", "Solanum lycopersicum", "sun", "pot", "easy", 2.8, "A short season beefsteak that ripens before the light goes. Cracks if you water unevenly, so do not."],
    ["CF-031", "Nemunas Runner", "Phaseolus coccineus", "sun", "ground", "easy", 2.4, "Climbs four metres and keeps producing until the first frost hits it in the face."],
    ["CF-009", "Cold Frame Rocket", "Eruca sativa", "part", "pot", "easy", 1.9, "Sow in August, cut all winter under glass. Hotter than the supermarket sort."],
    ["CF-047", "Sandy Ground Carrot", "Daucus carota", "sun", "ground", "fussy", 2.2, "Bred on our own sand. Stubby, sweet, and completely wrong for heavy clay."],
    ["CF-022", "Girionys Kale", "Brassica oleracea", "part", "ground", "easy", 2.1, "Stands to minus eighteen. Improves after frost and is inedible before it."],
    ["CF-055", "Dune Squash", "Cucurbita maxima", "sun", "ground", "fussy", 3.2, "Needs the whole season and all the compost you have. Worth the bed it takes."],
    ["CF-018", "Balcony Chard", "Beta vulgaris", "part", "pot", "easy", 1.9, "Cut and come again for six months in a thirty centimetre pot. Hard to kill."],
    ["CF-063", "Rye Green Manure", "Secale cereale", "sun", "ground", "easy", 4.5, "Sow in September, dig in in April. Half a kilo does a hundred square metres."],
    ["CF-071", "Curonian Dill", "Anethum graveolens", "sun", "pot", "fussy", 1.8, "Bolts if you look at it wrong. Sow every fortnight and stop resenting it."],
    ["CF-084", "Shade Lettuce", "Lactuca sativa", "part", "pot", "easy", 2.0, "Sown for a north facing balcony. Slow, soft, and does not go bitter."],
    ["CF-090", "Winter Leek", "Allium porrum", "sun", "ground", "fussy", 2.3, "In the ground fourteen months. Stands through everything and is worth the wait."],
    ["CF-102", "Frost Radish", "Raphanus sativus", "part", "pot", "easy", 1.7, "Twenty five days from sowing. The only thing on this list that rewards impatience."],
  ];

  var filters = { light: "any", where: "any", effort: "any" };
  var box = {};

  function matches(s) {
    return (
      (filters.light === "any" || s[3] === filters.light) &&
      (filters.where === "any" || s[4] === filters.where) &&
      (filters.effort === "any" || s[5] === filters.effort)
    );
  }

  var TINT = {
    sun: "rgba(255,77,109,0.2)",
    part: "rgba(46,125,80,0.18)",
  };

  function paintCat() {
    var shown = SEEDS.filter(matches);

    $("#packets").innerHTML = shown
      .map(function (s, i) {
        return (
          '<article class="pk' +
          (box[s[0]] ? " is-in" : "") +
          '" data-sku="' +
          s[0] +
          '" style="--pk:' +
          TINT[s[3]] +
          ";animation-delay:" +
          Math.min(i, 10) * 30 +
          'ms">' +
          '<div class="pk__top"><span class="pk__n">' +
          s[0] +
          "</span></div>" +
          "<h3>" +
          s[1] +
          '</h3><p class="pk__lat">' +
          s[2] +
          '</p><div class="pk__tags"><span>' +
          (s[3] === "sun" ? "Full sun" : "Part shade") +
          "</span><span>" +
          (s[4] === "pot" ? "Pots" : "Ground") +
          "</span><span>" +
          (s[5] === "easy" ? "Forgiving" : "Needs watching") +
          '</span></div><p class="pk__desc">' +
          s[7] +
          '</p><div class="pk__foot"><span class="pk__price">' +
          s[6].toFixed(2) +
          ' EUR</span><button class="pk__add" type="button">' +
          (box[s[0]] ? "In the box" : "Add") +
          "</button></div></article>"
        );
      })
      .join("");

    $("#catMeta").textContent =
      shown.length + (shown.length === 1 ? " variety" : " varieties") + " shown";

    $$(".pk__add").forEach(function (b) {
      b.addEventListener("click", function () {
        var sku = b.closest(".pk").dataset.sku;

        add(sku, 1);
        paintCat();
      });
    });
  }

  $$(".chip").forEach(function (b) {
    b.addEventListener("click", function () {
      $$('.chip[data-f="' + b.dataset.f + '"]').forEach(function (o) {
        o.classList.remove("is-on");
      });
      b.classList.add("is-on");
      filters[b.dataset.f] = b.dataset.v;
      paintCat();
    });
  });

  /* ---------------------------------------------------------- the box -- */

  function seed(sku) {
    return SEEDS.filter(function (s) {
      return s[0] === sku;
    })[0];
  }

  function add(sku, n) {
    box[sku] = Math.max(0, (box[sku] || 0) + n);
    if (!box[sku]) delete box[sku];
    paintBox();
  }

  function packets() {
    return Object.keys(box).reduce(function (n, k) {
      return n + box[k];
    }, 0);
  }

  function total() {
    return Object.keys(box).reduce(function (n, k) {
      return n + box[k] * seed(k)[6];
    }, 0);
  }

  function paintBox() {
    var keys = Object.keys(box);

    $("#boxCount").textContent = packets();
    $("#boxPackets").textContent = packets();
    $("#boxTotal").textContent =
      (packets() ? total() + 2.4 : 0).toFixed(2) + " EUR";
    $("#boxEmpty").hidden = keys.length > 0;

    $("#boxList").innerHTML = keys
      .map(function (k) {
        var s = seed(k);

        return (
          '<li class="bline"><span><b>' +
          s[1] +
          "</b><em>" +
          s[2] +
          '</em></span><span class="bq">' +
          '<button type="button" data-sku="' +
          k +
          '" data-d="-1">&minus;</button><i>' +
          box[k] +
          '</i><button type="button" data-sku="' +
          k +
          '" data-d="1">+</button></span>' +
          '<span class="bline__p">' +
          (box[k] * s[6]).toFixed(2) +
          "</span></li>"
        );
      })
      .join("");

    $$("#boxList button").forEach(function (b) {
      b.addEventListener("click", function () {
        add(b.dataset.sku, Number(b.dataset.d));
        paintCat();
      });
    });
  }

  var panel = $("#box");

  $("#boxBtn").addEventListener("click", function () {
    panel.hidden = false;
    document.body.classList.add("is-locked");
    $("#boxDone").hidden = true;
  });

  $$("[data-close]", panel).forEach(function (b) {
    b.addEventListener("click", function () {
      panel.hidden = true;
      document.body.classList.remove("is-locked");
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) {
      panel.hidden = true;
      document.body.classList.remove("is-locked");
    }
  });

  $("#boxGo").addEventListener("click", function () {
    if (!packets()) {
      $("#boxEmpty").textContent = "Put something in it first.";

      return;
    }
    $("#boxDoneText").textContent =
      packets() +
      (packets() === 1 ? " packet" : " packets") +
      ", " +
      (total() + 2.4).toFixed(2) +
      " EUR, in a plain envelope on Thursday. Sowing notes are printed on the back of each one. Order CF-" +
      String(4000 + Math.floor(Math.random() * 899)) +
      ".";
    $("#boxDone").hidden = false;
    box = {};
    paintBox();
    paintCat();
  });

  paintCat();
  paintBox();

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
})();
