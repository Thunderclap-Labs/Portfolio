/* Vakaris / the shelf
   Five lamps standing on one plinth, built from lathes, tubes and rings rather
   than from a model file. Every lamp owns its emissive parts, a point light and
   a glow sprite, so switching one on is a single call and switching them all on
   is the same call five times. */

var VakarisShelf = (function () {
  "use strict";

  var renderer, scene, camera, clock, raycaster, pmrem;
  var shelf, wall, plinth;
  var rooms = [];
  var lamps = [];
  var live = false;
  var pickHandler = null;

  var night = false;
  var focusIdx = -1;
  var lastT = 0;

  // The rooms no longer turn; spin stays at rest.
  var spin = { y: 0, x: 0, ty: 0, tx: 0 };
  var cam = {
    pos: new THREE.Vector3(-18.8, 2.1, 11),
    look: new THREE.Vector3(-18.8, 1.9, -1),
    tPos: new THREE.Vector3(-18.8, 2.1, 11),
    tLook: new THREE.Vector3(-18.8, 1.9, -1),
  };

  // Rooms sit clear of one another, so each frames on its own.
  var X = [-18.8, -9.4, 0, 9.4, 18.8];

  /* -------------------------------------------------------------- textures */

  function envTexture(dark) {
    var c = document.createElement("canvas");

    c.width = 512;
    c.height = 256;

    var x = c.getContext("2d");
    var g = x.createLinearGradient(0, 0, 0, 256);

    if (dark) {
      g.addColorStop(0, "#0b0907");
      g.addColorStop(0.55, "#171310");
      g.addColorStop(1, "#050403");
    } else {
      g.addColorStop(0, "#fbf5e9");
      g.addColorStop(0.5, "#e8dcc6");
      g.addColorStop(1, "#b9ab93");
    }
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 256);

    // A horizon. Without one, polished brass has nothing to divide sky from
    // floor and the curvature of a shade never reads.
    var hz = x.createLinearGradient(0, 120, 0, 190);

    hz.addColorStop(0, dark ? "rgba(0,0,0,0)" : "rgba(0,0,0,0)");
    hz.addColorStop(1, dark ? "rgba(0,0,0,0.55)" : "rgba(96,84,66,0.5)");
    x.fillStyle = hz;
    x.fillRect(0, 120, 512, 70);

    /* Tall softboxes. A curved metal surface only looks like metal when it has
       long vertical sources to draw down its sides; round blobs give it a
       single hotspot and nothing else, which is what flat brass is. */
    [70, 232, 400].forEach(function (cx, i) {
      var w = i === 1 ? 46 : 34;
      var top = 18;
      var h = 132;
      var lg = x.createLinearGradient(cx - w, 0, cx + w, 0);
      var core = dark
        ? "rgba(246,178,86,0.72)"
        : "rgba(255,253,246,0.98)";

      lg.addColorStop(0, "rgba(0,0,0,0)");
      lg.addColorStop(0.5, core);
      lg.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = lg;
      x.fillRect(cx - w, top, w * 2, h);

      // soft falloff at the ends so the strip does not stop dead
      var vg = x.createLinearGradient(0, top, 0, top + h);

      vg.addColorStop(0, "rgba(0,0,0,0.5)");
      vg.addColorStop(0.2, "rgba(0,0,0,0)");
      vg.addColorStop(0.8, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.5)");
      x.globalCompositeOperation = "destination-out";
      x.fillStyle = vg;
      x.fillRect(cx - w, top, w * 2, h);
      x.globalCompositeOperation = "source-over";
    });

    // one warm bounce low down, to keep the underside of the shades alive
    var bounce = x.createRadialGradient(256, 236, 0, 256, 236, 150);

    bounce.addColorStop(
      0,
      dark ? "rgba(240,163,58,0.22)" : "rgba(255,238,206,0.5)",
    );
    bounce.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = bounce;
    x.fillRect(0, 150, 512, 106);

    var t = new THREE.CanvasTexture(c);

    t.mapping = THREE.EquirectangularReflectionMapping;

    return t;
  }

  function perforation() {
    var c = document.createElement("canvas");

    c.width = 256;
    c.height = 256;

    var x = c.getContext("2d");

    x.fillStyle = "#ffffff";
    x.fillRect(0, 0, 256, 256);
    x.fillStyle = "#000000";

    for (var row = 0; row < 22; row++) {
      for (var col = 0; col < 30; col++) {
        var ox = (row % 2) * 4.3;

        x.beginPath();
        x.arc(col * 8.6 + ox + 3, row * 11.6 + 5, 2.4, 0, Math.PI * 2);
        x.fill();
      }
    }

    var t = new THREE.CanvasTexture(c);

    t.wrapS = t.wrapT = THREE.RepeatWrapping;

    return t;
  }

  function glowSprite() {
    var c = document.createElement("canvas");

    c.width = c.height = 128;

    var x = c.getContext("2d");
    var g = x.createRadialGradient(64, 64, 0, 64, 64, 64);

    g.addColorStop(0, "rgba(255,214,150,1)");
    g.addColorStop(0.32, "rgba(240,163,58,0.5)");
    g.addColorStop(1, "rgba(240,163,58,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);

    return new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(c),
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        opacity: 0,
      }),
    );
  }

  /* ------------------------------------------------------------- materials */

  var M = {};
  // Materials that cannot be shared (alpha maps, per-lamp tints) but should
  // still follow the chosen finish.
  var extraMetal = [];

  function materials(env) {
    M.brass = new THREE.MeshStandardMaterial({
      color: 0xb08444,
      metalness: 0.94,
      roughness: 0.26,
      envMap: env,
      envMapIntensity: 1.1,
    });
    M.brassDark = new THREE.MeshStandardMaterial({
      color: 0x6d5327,
      metalness: 0.9,
      roughness: 0.42,
      envMap: env,
    });
    M.steel = new THREE.MeshStandardMaterial({
      color: 0x33383c,
      metalness: 0.75,
      roughness: 0.38,
      envMap: env,
    });
    M.oak = new THREE.MeshStandardMaterial({
      color: 0x9a7648,
      metalness: 0,
      roughness: 0.78,
    });
    M.ash = new THREE.MeshStandardMaterial({
      color: 0xc4a674,
      metalness: 0,
      roughness: 0.72,
    });
    M.stone = new THREE.MeshStandardMaterial({
      color: 0x6c665d,
      metalness: 0.05,
      roughness: 0.94,
    });
    M.plinth = new THREE.MeshStandardMaterial({
      color: 0x6a4f33,
      metalness: 0,
      roughness: 0.85,
    });
    M.wall = new THREE.MeshStandardMaterial({
      color: 0xcfc2ab,
      metalness: 0,
      roughness: 1,
    });
  }

  /* frosted glass, without the cost of real transmission: five of those at
     once is more than a laptop should be asked for */
  function frost(tint) {
    return new THREE.MeshPhysicalMaterial({
      color: tint || 0xe9dcc2,
      metalness: 0,
      roughness: 0.42,
      transparent: true,
      opacity: 0.82,
      clearcoat: 1,
      clearcoatRoughness: 0.3,
      emissive: 0xf0a33a,
      emissiveIntensity: 0,
      side: THREE.DoubleSide,
    });
  }

  function emissiveMat(colour) {
    return new THREE.MeshStandardMaterial({
      color: colour || 0x2a2621,
      emissive: 0xffc271,
      emissiveIntensity: 0,
      roughness: 0.5,
      metalness: 0,
    });
  }

  /* ----------------------------------------------------------------- rooms */

  /* Where each lamp actually lives. Wall and floor colours are the point: a
     lamp is only as good as the surface it throws light at, and five different
     surfaces give five different readings of the same metal. */
  var ROOMS = [
    {
      wall: 0xd8cdb8,
      floor: 0x6a4f33,
      trim: 0x2c2620,
      // Sietas hangs over a table, so the room is a dining corner.
      furniture: "table",
      fill: 0xffe6bd,
      fillPos: [-2.6, 3.4, 1.6],
    },
    {
      wall: 0x9aa79c,
      floor: 0x4a4a46,
      trim: 0x24262a,
      // Vabalas is a desk lamp: a workshop bench under a cold window.
      furniture: "bench",
      fill: 0xcfe0ff,
      fillPos: [2.8, 3, 1.4],
    },
    {
      wall: 0xbdb2a2,
      floor: 0x55514a,
      trim: 0x2a2724,
      // Stulpas is a floor lamp, standing on stone in a bare hall.
      furniture: "none",
      fill: 0xffdcae,
      fillPos: [-2.2, 4.2, 2],
    },
    {
      wall: 0xe4dccd,
      floor: 0x7a6549,
      trim: 0x30291f,
      // Vetra is the hallway ring, on a narrow console.
      furniture: "console",
      fill: 0xfff0d6,
      fillPos: [2.4, 3.6, 1.8],
    },
    {
      wall: 0x8f9aa4,
      floor: 0x3f4247,
      trim: 0x1f2226,
      // Meduza hangs in a stairwell, so the room is taller and cooler.
      furniture: "none",
      fill: 0xd9e8ff,
      fillPos: [0, 5, 2.2],
    },
  ];

  var ROOM_W = 7.2;
  var ROOM_H = 5.2;
  var ROOM_D = 5;

  function buildRoom(i) {
    var spec = ROOMS[i];
    var g = new THREE.Group();

    g.position.x = X[i];

    var wallMat = new THREE.MeshStandardMaterial({
      color: spec.wall,
      roughness: 0.95,
      metalness: 0,
      /* The environment is a studio built for brass, and pale plaster taking
         it at full strength is most of why the rooms went white. Plaster
         barely reflects; 0.2 is closer to the truth and keeps the lamp as the
         brightest thing in the frame. */
      envMapIntensity: 0.2,
    });
    var floorMat = new THREE.MeshStandardMaterial({
      color: spec.floor,
      roughness: 0.82,
      metalness: 0,
      envMapIntensity: 0.25,
    });

    // back wall
    var back = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_H), wallMat);

    back.position.set(0, ROOM_H / 2 - 0.6, -ROOM_D / 2);
    back.receiveShadow = true;
    g.add(back);

    // side walls, angled in very slightly so both catch a little light
    [-1, 1].forEach(function (s) {
      var side = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_D, ROOM_H),
        wallMat,
      );

      side.position.set((s * ROOM_W) / 2, ROOM_H / 2 - 0.6, 0);
      side.rotation.y = s * -Math.PI / 2;
      side.receiveShadow = true;
      g.add(side);
    });

    // floor and ceiling
    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_W, ROOM_D),
      floorMat,
    );

    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.6, 0);
    floor.receiveShadow = true;
    g.add(floor);

    var ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), wallMat);

    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, ROOM_H - 0.6, 0);
    g.add(ceil);

    /* Furniture and legs share the trim colour. The room used to carry its own
       four bar window frame as well, but the facade in front now does the
       framing and the two together read as a frame inside a frame. */
    var trimMat = new THREE.MeshStandardMaterial({
      color: spec.trim,
      roughness: 0.6,
      metalness: 0.1,
    });

    // Whatever the lamp stands on or hangs over.
    if (spec.furniture === "table" || spec.furniture === "console") {
      var w = spec.furniture === "table" ? 5.4 : 3.6;
      var top = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.16, 2.2),
        new THREE.MeshStandardMaterial({
          color: 0x8a6a42,
          roughness: 0.68,
          metalness: 0,
        }),
      );

      top.position.set(0, -0.08, 0.2);
      top.castShadow = true;
      top.receiveShadow = true;
      g.add(top);

      [-1, 1].forEach(function (s) {
        var leg = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 1.9, 0.14),
          trimMat,
        );

        leg.position.set((s * w) / 2 - s * 0.3, -1.1, 0.2);
        leg.castShadow = true;
        g.add(leg);
      });
    }

    if (spec.furniture === "bench") {
      var benchTop = new THREE.Mesh(
        new THREE.BoxGeometry(6, 0.22, 2.6),
        new THREE.MeshStandardMaterial({
          color: 0x6d6459,
          roughness: 0.9,
          metalness: 0,
        }),
      );

      benchTop.position.set(0, -0.11, 0.1);
      benchTop.castShadow = true;
      benchTop.receiveShadow = true;
      g.add(benchTop);
    }

    /* Per room fill. Weak on purpose: the lamp itself has to stay the
       brightest thing in its own room once it is switched on. */
    var fill = new THREE.PointLight(spec.fill, 0.9, 12, 2);

    fill.position.set(spec.fillPos[0], spec.fillPos[1], spec.fillPos[2]);
    g.add(fill);

    g.userData.fill = fill;

    /* Everything in the room so far is shell: walls, floor, ceiling, frame and
       furniture. Tagged here, before the lamp goes in, so the shadow pass can
       let it receive without casting. A ceiling that casts puts the whole
       interior in its own shadow and the room goes black. */
    g.traverse(function (o) {
      if (o.isMesh) o.userData.shell = true;
    });

    return g;
  }

  /* ----------------------------------------------------------------- lamps */

  function newLamp(i, x) {
    var g = new THREE.Group();

    g.position.x = x;
    g.userData = { idx: i, on: false, glowParts: [], k: 0, open: 0 };

    var light = new THREE.PointLight(0xffb257, 0, 11, 2);

    light.position.set(0, 2.1, 0);
    g.add(light);

    var sprite = glowSprite();

    sprite.renderOrder = 5;
    sprite.position.set(0, 2.1, 0);
    sprite.scale.set(5, 5, 1);
    g.add(sprite);

    g.userData.light = light;
    g.userData.sprite = sprite;

    return g;
  }

  /* 01 Sietas: a perforated brass dome hung off a cranked arm */
  function buildSietas(i) {
    var g = newLamp(i, X[i]);
    var base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.92, 1.08, 0.22, 40),
      M.brassDark,
    );

    base.position.y = 0.11;
    g.add(base);

    var post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 3.2, 16),
      M.brass,
    );

    post.position.y = 1.7;
    g.add(post);

    var arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 1.5, 14),
      M.brass,
    );

    arm.position.set(0.72, 3.28, 0);
    arm.rotation.z = Math.PI * 0.5;
    g.add(arm);

    var knuckle = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 14, 12),
      M.brassDark,
    );

    knuckle.position.set(0, 3.28, 0);
    g.add(knuckle);

    var drop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.5, 10),
      M.brassDark,
    );

    drop.position.set(1.42, 3.03, 0);
    g.add(drop);

    // the shade profile, lathed, with the holes punched by an alpha map
    var pts = [];

    for (var a = 0; a <= 14; a++) {
      var t = a / 14;

      pts.push(
        new THREE.Vector2(0.07 + Math.sin(t * Math.PI * 0.5) * 1.1, 1.0 - t * 1.0),
      );
    }

    var shade = new THREE.Mesh(
      new THREE.LatheGeometry(pts, 48),
      new THREE.MeshStandardMaterial({
        color: 0xb08444,
        metalness: 0.9,
        roughness: 0.3,
        envMap: M.brass.envMap,
        alphaMap: perforation(),
        transparent: true,
        side: THREE.DoubleSide,
      }),
    );

    shade.position.set(1.42, 2.78, 0);
    // The perforated dome needs its own material for the alpha map, so it is
    // registered here to be retinted along with the rest of the metal.
    extraMetal.push(shade.material);
    g.add(shade);

    var rim = new THREE.Mesh(
      new THREE.TorusGeometry(1.17, 0.035, 8, 44),
      M.brassDark,
    );

    rim.position.set(1.42, 2.78, 0);
    rim.rotation.x = Math.PI * 0.5;
    g.add(rim);

    var bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 20, 16),
      emissiveMat(0xf3e3c8),
    );

    bulb.position.set(1.42, 3.06, 0);
    g.add(bulb);

    g.userData.glowParts.push(bulb);
    g.userData.light.position.set(1.42, 2.9, 0);
    g.userData.sprite.position.set(1.42, 2.98, 0);

    return g;
  }

  /* 02 Vabalas: six shells that lift apart when it is switched on */
  function buildVabalas(i) {
    var g = newLamp(i, X[i]);
    var base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.02, 1.16, 0.34, 8),
      M.oak,
    );

    base.position.y = 0.17;
    g.add(base);

    var core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.58, 2.2, 22),
      emissiveMat(0x2b2622),
    );

    core.position.y = 1.5;
    g.add(core);
    g.userData.glowParts.push(core);

    var plates = [];

    for (var k = 0; k < 6; k++) {
      var rb = 1.02 - k * 0.13;
      var rt = 0.94 - k * 0.13;
      var plate = new THREE.Mesh(
        new THREE.CylinderGeometry(rt, rb, 0.34, 28, 1, true),
        M.steel,
      );

      plate.position.y = 0.52 + k * 0.33;
      plate.userData.rest = plate.position.y;
      plate.userData.tilt = k * 0.16;
      plate.rotation.y = plate.userData.tilt;
      g.add(plate);
      plates.push(plate);
    }

    var cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
      M.brass,
    );

    cap.position.y = 2.5;
    g.add(cap);

    g.userData.plates = plates;
    g.userData.light.position.set(0, 1.5, 0);
    g.userData.sprite.position.set(0, 1.5, 0);
    g.userData.sprite.scale.set(5.4, 5.4, 1);

    return g;
  }

  /* 03 Stulpas: stone and glass stacked like a core sample */
  function buildStulpas(i) {
    var g = newLamp(i, X[i]);
    var y = 0;
    var order = [
      ["stone", 0.34, 1.02],
      ["glass", 0.3, 0.86],
      ["stone", 0.26, 0.94],
      ["glass", 0.42, 0.8],
      ["stone", 0.3, 0.9],
      ["glass", 0.26, 0.74],
      ["stone", 0.5, 0.84],
    ];

    order.forEach(function (o) {
      var isGlass = o[0] === "glass";
      var mat = isGlass ? frost(0xf6e6c6) : M.stone;
      var m = new THREE.Mesh(
        new THREE.CylinderGeometry(o[2] * 0.92, o[2], o[1], 34),
        mat,
      );

      m.position.y = y + o[1] / 2;
      y += o[1];
      m.rotation.y = y * 1.7;
      g.add(m);

      if (isGlass) g.userData.glowParts.push(m);
    });

    g.userData.light.position.set(0, 1.4, 0);
    g.userData.light.distance = 9;
    g.userData.sprite.position.set(0, 1.4, 0);
    g.userData.sprite.scale.set(4.2, 6.4, 1);

    return g;
  }

  /* 04 Vetra: a broken ring on three legs, tilted the way a gate is */
  function buildVetra(i) {
    var g = newLamp(i, X[i]);
    var hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.3, 0.3, 18),
      M.brassDark,
    );

    hub.position.y = 1.16;
    g.add(hub);

    for (var k = 0; k < 3; k++) {
      var leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.055, 1.6, 12),
        M.ash,
      );
      var a = (k / 3) * Math.PI * 2 + 0.5;

      leg.position.set(Math.cos(a) * 0.4, 0.68, Math.sin(a) * 0.4);
      leg.rotation.z = -Math.cos(a) * 0.44;
      leg.rotation.x = Math.sin(a) * 0.44;
      g.add(leg);
    }

    var stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 1.2, 12),
      M.brass,
    );

    stem.position.y = 1.72;
    g.add(stem);

    var ring = new THREE.Group();

    ring.position.y = 2.72;
    ring.rotation.set(0.3, 0.22, 0.42);
    g.add(ring);

    var glassRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.34, 0.2, 20, 64, Math.PI * 1.74),
      frost(0xf3e4c9),
    );

    ring.add(glassRing);

    // a thin brass edge on each side, so the ring has a line to read against
    [1.53, 1.15].forEach(function (r) {
      var edge = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.028, 8, 60, Math.PI * 1.74),
        M.brass,
      );

      ring.add(edge);
    });

    var endA = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 10),
      M.brassDark,
    );

    endA.position.set(1.34, 0, 0);
    ring.add(endA);

    var endB = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 10),
      M.brassDark,
    );

    endB.position.set(
      Math.cos(Math.PI * 1.74) * 1.34,
      Math.sin(Math.PI * 1.74) * 1.34,
      0,
    );
    ring.add(endB);

    g.userData.glowParts.push(glassRing);
    g.userData.ring = ring;
    g.userData.light.position.set(0, 2.72, 0);
    g.userData.light.distance = 10;
    g.userData.sprite.position.set(0, 2.72, 0);
    g.userData.sprite.scale.set(6.4, 6.4, 1);

    return g;
  }

  /* 05 Meduza: a bell with lit strands hanging under it */
  function buildMeduza(i) {
    var g = newLamp(i, X[i]);
    var stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.05, 0.2, 36),
      M.brassDark,
    );

    stand.position.y = 0.1;
    g.add(stand);

    var post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 3.5, 14),
      M.brass,
    );

    post.position.y = 1.85;
    g.add(post);

    var pts = [];

    for (var a = 0; a <= 14; a++) {
      var t = a / 14;

      pts.push(
        new THREE.Vector2(0.05 + Math.sin(t * Math.PI * 0.62) * 1.18, 1.05 - t * 1.05),
      );
    }

    var bell = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), frost(0xefdfc0));

    bell.position.y = 2.5;
    g.add(bell);
    g.userData.glowParts.push(bell);

    var bellRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.23, 0.04, 8, 46),
      M.brass,
    );

    bellRim.position.y = 2.5;
    bellRim.rotation.x = Math.PI * 0.5;
    g.add(bellRim);

    var strands = [];

    for (var k = 0; k < 22; k++) {
      var ang = (k / 22) * Math.PI * 2;
      var rad = 0.55 + (k % 3) * 0.22;
      var len = 0.7 + (k % 5) * 0.18;
      var strand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, len, 5),
        M.brassDark,
      );

      strand.position.set(
        Math.cos(ang) * rad,
        2.46 - len / 2,
        Math.sin(ang) * rad,
      );
      g.add(strand);

      var tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 6),
        emissiveMat(0xd8c8a8),
      );

      tip.position.set(
        Math.cos(ang) * rad,
        2.46 - len,
        Math.sin(ang) * rad,
      );
      g.add(tip);
      strands.push(tip);
      g.userData.glowParts.push(tip);
    }

    g.userData.strands = strands;
    g.userData.light.position.set(0, 2.1, 0);
    g.userData.sprite.position.set(0, 2.2, 0);
    g.userData.sprite.scale.set(5.6, 5.6, 1);

    return g;
  }

  /* ------------------------------------------------------------------ init */

  function init(canvas) {
    if (!window.THREE) return false;

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    } catch (e) {
      return false;
    }

    if (!renderer.getContext()) return false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.82;
    renderer.outputEncoding = THREE.sRGBEncoding;
    // Without shadows the lamps sit on the shelf with no contact at all, which
    // is most of why the shading read as flat.
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xefe9df);

    camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
    camera.position.copy(cam.pos);

    pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    var env = pmrem.fromEquirectangular(envTexture(false)).texture;

    scene.environment = env;
    materials(env);

    scene.add(new THREE.HemisphereLight(0xfff3e2, 0x8a7a63, 0.26));

    var key = new THREE.DirectionalLight(0xfff1dd, 0.75);

    key.position.set(-6, 9, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -20;
    key.shadow.camera.right = 20;
    key.shadow.camera.top = 12;
    key.shadow.camera.bottom = -6;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 56;
    // Tight bias range: the shades are thin, so a heavier bias detaches the
    // shadow from the object and a lighter one stipples the curved surfaces.
    key.shadow.bias = -0.0009;
    key.shadow.normalBias = 0.022;
    key.shadow.radius = 3;
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xdfe6f0, 0.18);

    fill.position.set(7, 4, 6);
    scene.add(fill);

    // Rim from behind, so brass separates from the wall instead of merging
    // into it at the silhouette.
    var rim = new THREE.DirectionalLight(0xffe9c8, 0.22);

    rim.position.set(2, 5, -8);
    scene.add(rim);

    scene.userData.lights = [scene.children[0], key, fill];

    shelf = new THREE.Group();
    scene.add(shelf);

    /* The building front, with a window cut for each room. Built as one shape
       with five holes rather than five separate frames: it occludes the gaps
       between rooms, so pulling back reads as a terrace of lit windows instead
       of five stage sets with daylight between them. */
    var facade = new THREE.Shape();
    var fx = 34;

    facade.moveTo(X[0] - fx, -0.6);
    facade.lineTo(X[4] + fx, -0.6);
    facade.lineTo(X[4] + fx, ROOM_H + 9);
    facade.lineTo(X[0] - fx, ROOM_H + 9);
    facade.lineTo(X[0] - fx, -0.6);

    X.forEach(function (x) {
      var hole = new THREE.Path();
      var hw = ROOM_W / 2;

      hole.moveTo(x - hw, -0.6);
      hole.lineTo(x + hw, -0.6);
      hole.lineTo(x + hw, ROOM_H - 0.6);
      hole.lineTo(x - hw, ROOM_H - 0.6);
      hole.lineTo(x - hw, -0.6);
      facade.holes.push(hole);
    });

    var front = new THREE.Mesh(
      new THREE.ShapeGeometry(facade),
      new THREE.MeshStandardMaterial({
        color: 0x241f1a,
        roughness: 0.95,
        metalness: 0,
        envMapIntensity: 0.15,
      }),
    );

    front.position.z = ROOM_D / 2 + 0.28;
    front.receiveShadow = true;
    // In the same group as the rooms, so nothing can slide out of register
    // with the openings it is supposed to frame.
    shelf.add(front);

    /* One room per lamp behind it. The five used to stand side by side on a
       single plinth against one flat wall, which lit them all identically and
       told you nothing about where any of them belongs. Each room now carries
       its own wall, floor, furniture and light, so the same brass reads
       differently in a hallway and a workshop. */
    [buildSietas, buildVabalas, buildStulpas, buildVetra, buildMeduza].forEach(
      function (fn, i) {
        var room = buildRoom(i);

        shelf.add(room);
        rooms.push(room);

        var lamp = fn(i);

        // Lamps are built at the origin and placed by X; inside a room they
        // stand at the room's own centre instead.
        lamp.position.x = 0;
        room.add(lamp);
        lamps.push(lamp);
      },
    );

    /* Shadow flags, set in one pass once everything is built. Emissive parts
       (bulbs, halos, glow sprites) are skipped: a light source casting its own
       shadow is what makes a lit lamp look switched off. */
    shelf.traverse(function (o) {
      if (!o.isMesh) return;
      var m = o.material;
      var emissive = m && m.emissive && m.emissive.getHex() !== 0x000000;

      if (m && (m.isSpriteMaterial || m.transparent === true)) return;
      o.castShadow = !emissive && !o.userData.shell;
      o.receiveShadow = true;
    });

    // The room surfaces set their own flags as they are built; the single
    // plinth and backdrop they replaced are gone.

    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    live = true;

    bind(canvas);
    resize(canvas);
    window.addEventListener("resize", function () {
      resize(canvas);
    });

    tick();

    return true;
  }

  function resize(canvas) {
    var w = canvas.clientWidth || 1;
    var h = canvas.clientHeight || 1;

    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* --------------------------------------------------------------- pointer */

  function bind(canvas) {
    var dragging = false;
    var moved = 0;
    var last = { x: 0, y: 0 };

    canvas.addEventListener("pointerdown", function (e) {
      dragging = true;
      moved = 0;
      last.x = e.clientX;
      last.y = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;

      var dx = e.clientX - last.x;
      var dy = e.clientY - last.y;

      /* Drag no longer turns anything. It used to spin the whole shelf, which
         made sense when the five lamps stood on one plinth. Now they are five
         rooms behind a building front, and swinging that on a drag reads as
         the building tipping over. Movement is still measured, because a click
         is a drag that went nowhere. */
      moved += Math.abs(dx) + Math.abs(dy);
      last.x = e.clientX;
      last.y = e.clientY;
    });

    function release(e) {
      if (!dragging) return;
      dragging = false;

      // a click is a drag that went nowhere
      if (moved < 6) pick(canvas, e);
    }

    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", function () {
      dragging = false;
    });
  }

  function pick(canvas, e) {
    var r = canvas.getBoundingClientRect();
    var p = new THREE.Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1,
    );

    raycaster.setFromCamera(p, camera);

    var hits = raycaster.intersectObjects(shelf.children, true);

    for (var i = 0; i < hits.length; i++) {
      var o = hits[i].object;

      while (o && o.parent) {
        if (o.userData && typeof o.userData.idx === "number") {
          if (pickHandler) pickHandler(o.userData.idx);

          return;
        }
        o = o.parent;
      }
    }
  }

  /* ------------------------------------------------------------------ loop */

  function tick() {
    if (!live) return;
    requestAnimationFrame(tick);

    /* getElapsedTime already consumes the delta, so keep our own */
    var t = clock.getElapsedTime();
    var dt = Math.min(0.05, t - lastT);

    lastT = t;

    spin.y += (spin.ty - spin.y) * 0.09;
    spin.x += (spin.tx - spin.x) * 0.09;
    shelf.rotation.y = spin.y;
    shelf.rotation.x = spin.x;

    cam.pos.lerp(cam.tPos, 0.06);
    cam.look.lerp(cam.tLook, 0.06);
    camera.position.copy(cam.pos);
    camera.lookAt(cam.look);

    lamps.forEach(function (g, i) {
      var d = g.userData;
      var want = d.on ? 1 : 0;

      d.k += (want - d.k) * Math.min(1, dt * 5.5);

      // a filament does not come up perfectly smoothly
      var flick = d.on ? 1 + Math.sin(t * 7.3 + i) * 0.02 : 1;
      var k = d.k * flick;

      var lift = night ? 1.45 : 1;

      d.glowParts.forEach(function (m) {
        m.material.emissiveIntensity =
          k * lift * (m.material.transparent ? 1.7 : 2.6);
        if (m.material.transparent) {
          m.material.opacity = 0.8 + k * 0.18;
        }
      });

      d.light.intensity = k * (night ? 2.6 : 1.5);
      d.sprite.material.opacity = k * (night ? 0.55 : 0.3);

      if (d.plates) {
        d.open += (want - d.open) * Math.min(1, dt * 4);
        d.plates.forEach(function (p, k2) {
          p.position.y = p.userData.rest + d.open * (0.06 + k2 * 0.055);
          p.rotation.y = p.userData.tilt + d.open * (0.2 + k2 * 0.1);
          p.rotation.z = d.open * 0.06 * (k2 % 2 ? 1 : -1);
        });
      }

      if (d.ring) d.ring.rotation.z = 0.42 + Math.sin(t * 0.5 + i) * 0.04;

      if (d.strands) {
        d.strands.forEach(function (s, k3) {
          s.position.y =
            s.position.y * 0.97 +
            0.03 * (s.position.y + Math.sin(t * 1.4 + k3) * 0.004);
        });
      }
    });

    renderer.render(scene, camera);
  }

  /* --------------------------------------------------------------- control */

  function setOn(i, on) {
    if (!lamps[i]) return;
    lamps[i].userData.on = !!on;
  }

  function isOn(i) {
    return lamps[i] ? lamps[i].userData.on : false;
  }

  function setNight(v) {
    if (!live) return;
    night = !!v;

    var env = pmrem.fromEquirectangular(envTexture(night)).texture;

    scene.environment = env;
    Object.keys(M).forEach(function (k) {
      if (M[k].envMap) M[k].envMap = env;
      M[k].needsUpdate = true;
    });

    scene.background = new THREE.Color(night ? 0x0d0b09 : 0xefe9df);
    M.wall.color.set(night ? 0x191510 : 0xcfc2ab);
    M.plinth.color.set(night ? 0x2b2018 : 0x6a4f33);

    var l = scene.userData.lights;

    l[0].intensity = night ? 0.1 : 0.7;
    l[1].intensity = night ? 0.12 : 1.1;
    l[2].intensity = night ? 0.05 : 0.35;
    renderer.toneMappingExposure = night ? 0.72 : 0.82;
  }

  function focus(i) {
    focusIdx = i;

    if (i < 0 || !lamps[i]) {
      // Stood back far enough to see the row of windows at once.
      cam.tPos.set(0, 3, 42);
      cam.tLook.set(0, 2, 0);
      spin.ty = 0;
      spin.tx = 0.02;

      return;
    }

    /* Square on to the one room, close enough that its frame fills the view.
       Looking in at a slight angle would show the side wall of the next room
       through the gap, so the camera sits dead centre on the opening. */
    var x = X[i];

    cam.tPos.set(x, 2.1, 11);
    cam.tLook.set(x, 1.9, -1);
    spin.ty = 0;
    spin.tx = 0;
  }

  function onPick(fn) {
    pickHandler = fn;
  }

  /* The four finishes the workshop will actually do. Every metal part on the
     shelf shares three materials, so a finish is a retint of those three
     rather than a walk over the meshes. Roughness moves with the colour:
     lacquered brass and blackened steel do not scatter light the same way,
     and leaving roughness fixed is what makes a recolour look like a recolour
     rather than a different metal. */
  var FINISHES = {
    brass: {
      label: "Polished brass",
      base: 0xb08444,
      dark: 0x6d5327,
      steel: 0x33383c,
      rough: 0.26,
      darkRough: 0.42,
      metal: 0.94,
    },
    brushed: {
      label: "Brushed brass",
      base: 0xa88b57,
      dark: 0x6b562f,
      steel: 0x3b4044,
      rough: 0.52,
      darkRough: 0.62,
      metal: 0.9,
    },
    copper: {
      label: "Copper",
      base: 0xb46e4e,
      dark: 0x6f3f2a,
      steel: 0x3a3230,
      rough: 0.3,
      darkRough: 0.46,
      metal: 0.95,
    },
    blackened: {
      label: "Blackened steel",
      base: 0x4a474a,
      dark: 0x2a282b,
      steel: 0x232528,
      rough: 0.58,
      darkRough: 0.7,
      metal: 0.82,
    },
  };

  var finish = "brass";

  function setFinish(name) {
    var f = FINISHES[name];

    if (!f || !M.brass) return false;
    finish = name;

    M.brass.color.setHex(f.base);
    M.brass.roughness = f.rough;
    M.brass.metalness = f.metal;

    M.brassDark.color.setHex(f.dark);
    M.brassDark.roughness = f.darkRough;
    M.brassDark.metalness = f.metal;

    M.steel.color.setHex(f.steel);
    M.steel.roughness = f.darkRough;

    M.brass.needsUpdate = true;
    M.brassDark.needsUpdate = true;
    M.steel.needsUpdate = true;

    extraMetal.forEach(function (m) {
      m.color.setHex(f.base);
      m.roughness = f.rough;
      m.metalness = f.metal;
      m.needsUpdate = true;
    });

    return true;
  }

  function finishes() {
    return Object.keys(FINISHES).map(function (k) {
      return { id: k, label: FINISHES[k].label, swatch: FINISHES[k].base };
    });
  }

  return {
    init: init,
    setOn: setOn,
    isOn: isOn,
    setNight: setNight,
    focus: focus,
    onPick: onPick,
    setFinish: setFinish,
    finishes: finishes,
    finish: function () {
      return finish;
    },
  };
})();
