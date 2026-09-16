/* GIRIA / Three.js forest
   -------------------------------------------------------------------------
   A pine wood you walk into as the page scrolls. Trunks are tapered
   cylinders scattered in depth under exponential fog, the ground is a single
   dark plane, and the light comes from hanging glass lanterns that use real
   transmission so the wood refracts through them. Fireflies are an additive
   point cloud that drifts toward the pointer.

   Exposed as window.GiriaScene:
     init(el)        -> boolean
     setDepth(p)     -> 0..1, how far into the wood the camera has walked
     setNight(p)     -> 0..1, dusk to full dark
     lightUp()       -> flare the lanterns, used when a song is opened
   ------------------------------------------------------------------------- */

window.GiriaScene = (function () {
  "use strict";

  var THREE = window.THREE;

  var C = {
    night: 0x0b120e,
    dusk: 0x1b2a22,
    bark: 0x2a231c,
    barkLit: 0x4a3b2c,
    moss: 0x14201a,
    amber: 0xffb45e,
    ember: 0xe8843c,
  };

  var api = {};
  var renderer, scene, camera, clock, host, fog;
  var trees = [];
  var lanterns = [];
  var flies, flyBase, flySeed;
  var depth = 0;
  var depthEased = 0;
  var night = 0;
  var nightEased = 0;
  var flare = 0;
  var pointer = { x: 0, y: 0 };
  var pTarget = { x: 0, y: 0 };

  /* ------------------------------------------------------------ helpers -- */

  function dotTexture(inner, outer) {
    var c = document.createElement("canvas");

    c.width = 64;
    c.height = 64;
    var g = c.getContext("2d");
    var rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);

    rg.addColorStop(0, inner);
    rg.addColorStop(0.35, outer);
    rg.addColorStop(1, "rgba(255,180,94,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(c);
  }

  function barkTexture() {
    var c = document.createElement("canvas");

    c.width = 128;
    c.height = 512;
    var g = c.getContext("2d");

    g.fillStyle = "#2a231c";
    g.fillRect(0, 0, 128, 512);

    for (var i = 0; i < 260; i++) {
      var x = Math.random() * 128;
      var y = Math.random() * 512;
      var h = 20 + Math.random() * 90;

      g.strokeStyle =
        Math.random() > 0.5
          ? "rgba(0,0,0,0.42)"
          : "rgba(120,96,70,0.28)";
      g.lineWidth = 1 + Math.random() * 3;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + (Math.random() - 0.5) * 8, y + h / 2, x, y + h);
      g.stroke();
    }

    var tex = new THREE.CanvasTexture(c);

    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    tex.encoding = THREE.sRGBEncoding;

    return tex;
  }

  /* Forest floor. Layered the way the real thing reads from standing height:
     a dark moss base, drifts of pine needle litter, worn earth showing
     through, then a scatter of twigs and fallen cones on top. */
  function floorTexture() {
    var c = document.createElement("canvas");

    c.width = 512;
    c.height = 512;
    var g = c.getContext("2d");

    g.fillStyle = "#16241c";
    g.fillRect(0, 0, 512, 512);

    // moss and earth drifts
    var drifts = [
      ["rgba(28,48,34,0.85)", 70],
      ["rgba(46,38,26,0.7)", 55],
      ["rgba(18,30,22,0.9)", 80],
      ["rgba(58,46,30,0.45)", 40],
    ];

    for (var d = 0; d < 150; d++) {
      var pick = drifts[(Math.random() * drifts.length) | 0];

      g.fillStyle = pick[0];
      g.beginPath();
      g.ellipse(
        Math.random() * 512,
        Math.random() * 512,
        pick[1] * (0.4 + Math.random()),
        pick[1] * (0.3 + Math.random() * 0.7),
        Math.random() * Math.PI,
        0,
        Math.PI * 2,
      );
      g.fill();
    }

    // needle litter
    for (var n = 0; n < 2600; n++) {
      var nx = Math.random() * 512;
      var ny = Math.random() * 512;
      var na = Math.random() * Math.PI;
      var nl = 3 + Math.random() * 7;

      g.strokeStyle =
        Math.random() > 0.45
          ? "rgba(96,78,48,0.5)"
          : "rgba(60,72,46,0.45)";
      g.lineWidth = 0.8;
      g.beginPath();
      g.moveTo(nx, ny);
      g.lineTo(nx + Math.cos(na) * nl, ny + Math.sin(na) * nl);
      g.stroke();
    }

    // twigs and cones
    for (var t = 0; t < 90; t++) {
      g.strokeStyle = "rgba(38,30,20,0.6)";
      g.lineWidth = 1 + Math.random() * 1.6;
      var tx = Math.random() * 512;
      var ty = Math.random() * 512;

      g.beginPath();
      g.moveTo(tx, ty);
      g.quadraticCurveTo(
        tx + (Math.random() - 0.5) * 22,
        ty + (Math.random() - 0.5) * 22,
        tx + (Math.random() - 0.5) * 34,
        ty + (Math.random() - 0.5) * 34,
      );
      g.stroke();
    }

    var tex = new THREE.CanvasTexture(c);

    tex.encoding = THREE.sRGBEncoding;

    return tex;
  }

  /* Ferns and grass tufts. Built as crossed billboards from one alpha sheet so
     the whole lot costs two draw calls rather than two hundred. */
  function frondTexture() {
    var c = document.createElement("canvas");

    c.width = 128;
    c.height = 128;
    var g = c.getContext("2d");

    g.clearRect(0, 0, 128, 128);

    for (var b = 0; b < 9; b++) {
      var baseX = 20 + b * 11 + (Math.random() - 0.5) * 6;
      var tipX = baseX + (b - 4) * 7 + (Math.random() - 0.5) * 10;
      var topY = 12 + Math.random() * 40;

      g.strokeStyle = "rgba(74,104,62," + (0.55 + Math.random() * 0.4) + ")";
      g.lineWidth = 2.5 + Math.random() * 2;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(baseX, 128);
      g.quadraticCurveTo(baseX + (tipX - baseX) * 0.3, 70, tipX, topY);
      g.stroke();
    }

    var tex = new THREE.CanvasTexture(c);

    tex.encoding = THREE.sRGBEncoding;

    return tex;
  }

  function addUndergrowth(sc) {
    var tex = frondTexture();
    var mat = new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.35,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
      // Muted well down. At full green the tufts read as stage grass under a
      // scene lit almost entirely by lanterns.
      color: 0x4c6642,
    });
    var geo = new THREE.PlaneGeometry(1.5, 1.2);
    var count = 260;
    var mesh = new THREE.InstancedMesh(geo, mat, count * 2);
    var m = new THREE.Matrix4();
    var q = new THREE.Quaternion();
    var e = new THREE.Euler();
    var pos = new THREE.Vector3();
    var scl = new THREE.Vector3();
    var idx = 0;

    for (var i = 0; i < count; i++) {
      // keep the walking line clear, cluster just off the path
      var side = Math.random() > 0.5 ? 1 : -1;
      var x = side * (3.2 + Math.random() * 16);
      var z = 24 - Math.random() * 150;
      var s = 0.7 + Math.random() * 0.9;

      pos.set(x, -0.56 + s * 0.42, z);
      scl.set(s, s, s);

      // crossed pair, so the tuft has volume from any angle
      for (var k = 0; k < 2; k++) {
        e.set(0, Math.random() * Math.PI + (k * Math.PI) / 2, 0);
        q.setFromEuler(e);
        m.compose(pos, q, scl);
        mesh.setMatrixAt(idx++, m);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    sc.add(mesh);

    return mesh;
  }

  /* --------------------------------------------------------------- init -- */

  api.init = function (el) {
    if (!THREE) return false;
    host = el;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch (e) {
      return false;
    }
    if (!renderer || !renderer.getContext()) return false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    el.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(C.dusk);
    fog = new THREE.FogExp2(C.dusk, 0.031);
    scene.fog = fog;

    camera = new THREE.PerspectiveCamera(
      52,
      el.clientWidth / el.clientHeight,
      0.1,
      260,
    );
    camera.position.set(0, 2.6, 26);
    clock = new THREE.Clock();

    /* light: a low warm sun through the trunks, plus cool sky fill */
    var sun = new THREE.DirectionalLight(0xffc98a, 1.5);

    sun.position.set(-14, 8, -22);
    scene.add(sun);
    api._sun = sun;

    var sky = new THREE.HemisphereLight(0x9fc7b0, 0x0a120d, 0.55);

    scene.add(sky);
    api._sky = sky;

    /* ground: a forest floor rather than a flat plane. The canvas texture
       carries moss, needle litter and worn earth along the walking line, and
       the geometry is displaced so it reads as uneven under raking light. */
    var floorTex = floorTexture();

    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(26, 26);

    var groundGeo = new THREE.PlaneGeometry(400, 400, 96, 96);
    var gp = groundGeo.attributes.position;

    for (var gi = 0; gi < gp.count; gi++) {
      var gx = gp.getX(gi);
      var gy = gp.getY(gi);
      // Keep the middle of the path flat so the camera walk stays smooth.
      var pathFade = Math.min(1, Math.abs(gx) / 7);

      // Kept shallow on purpose: the trunks sit at a fixed height, so a deep
      // dip under one opens a gap between the trunk and the ground.
      gp.setZ(
        gi,
        (Math.sin(gx * 0.21) * Math.cos(gy * 0.17) * 0.16 +
          Math.sin(gx * 0.07 + gy * 0.09) * 0.22) *
          pathFade,
      );
    }

    groundGeo.computeVertexNormals();

    var ground = new THREE.Mesh(
      groundGeo,
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: floorTex,
        roughness: 0.97,
        metalness: 0,
      }),
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.6;
    scene.add(ground);

    /* undergrowth: ferns and grass tufts either side of the path, so the
       floor has something growing out of it near the camera */
    addUndergrowth(scene);

    /* trunks: scattered either side of a walking line down the middle */
    var bark = barkTexture();
    var barkMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: bark,
      roughness: 0.95,
      metalness: 0,
    });

    for (var i = 0; i < 120; i++) {
      var side = i % 2 ? 1 : -1;
      var x = side * (2.6 + Math.pow(Math.random(), 0.6) * 22);
      var z = 18 - (i / 120) * 200 - Math.random() * 6;
      var h = 16 + Math.random() * 20;
      var r = 0.24 + Math.random() * 0.42;

      var trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 0.55, r, h, 9, 1),
        barkMat,
      );

      trunk.position.set(x, h / 2 - 0.6, z);
      trunk.rotation.y = Math.random() * 3;
      trunk.rotation.z = (Math.random() - 0.5) * 0.045;
      scene.add(trunk);
      trees.push(trunk);

      // a few low branches so the silhouette is not all verticals
      if (Math.random() > 0.62) {
        var br = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.12, 2.6 + Math.random() * 2, 6),
          barkMat,
        );

        br.position.set(
          x + side * -0.6,
          2.6 + Math.random() * 7,
          z + (Math.random() - 0.5),
        );
        br.rotation.z = side * (0.9 + Math.random() * 0.4);
        scene.add(br);
      }
    }

    /* hanging glass lanterns, the only real light in the wood */
    var glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdff0e6,
      transmission: 1,
      thickness: 0.9,
      roughness: 0.06,
      ior: 1.48,
      metalness: 0,
      transparent: true,
      opacity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });

    var LPOS = [
      [-4.2, 5.4, 6],
      [5.1, 6.6, -6],
      [-6.4, 4.6, -20],
      [3.4, 7.2, -34],
      [-2.6, 5.2, -52],
      [6.2, 6.0, -70],
    ];

    LPOS.forEach(function (p, i) {
      var g = new THREE.Group();

      g.position.set(p[0], p[1], p[2]);

      // the glass body: a squat lathe, like a blown jar
      var pts = [];

      for (var t = 0; t <= 14; t++) {
        var u = t / 14;
        var rr = 0.24 + Math.sin(u * Math.PI) * 0.62;

        pts.push(new THREE.Vector2(Math.max(0.04, rr), -0.9 + u * 1.8));
      }

      var glass = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), glassMat);

      g.add(glass);

      // the flame inside
      var core = new THREE.Mesh(
        new THREE.SphereGeometry(0.19, 14, 12),
        new THREE.MeshBasicMaterial({ color: 0xfff0cf }),
      );

      g.add(core);

      var light = new THREE.PointLight(C.amber, 5.5, 22, 2);

      g.add(light);

      var glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: dotTexture("rgba(255,228,176,0.95)", "rgba(255,166,74,0.5)"),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          opacity: 0.85,
        }),
      );

      glow.scale.set(5.4, 5.4, 1);
      g.add(glow);

      // the cord it hangs from
      var cord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 9, 5),
        new THREE.MeshStandardMaterial({ color: 0x241d17, roughness: 1 }),
      );

      cord.position.y = 5.4;
      g.add(cord);

      g.userData = { light: light, glow: glow, core: core, seed: i * 1.7 };
      scene.add(g);
      lanterns.push(g);
    });

    /* fireflies */
    var N = 520;
    var pos = new Float32Array(N * 3);

    flySeed = new Float32Array(N * 2);
    for (var f = 0; f < N; f++) {
      pos[f * 3] = (Math.random() - 0.5) * 46;
      pos[f * 3 + 1] = 0.4 + Math.random() * 9;
      pos[f * 3 + 2] = 16 - Math.random() * 150;
      flySeed[f * 2] = Math.random() * 6.28;
      flySeed[f * 2 + 1] = 0.5 + Math.random() * 1.6;
    }
    flyBase = pos.slice(0);

    var fg = new THREE.BufferGeometry();

    fg.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    flies = new THREE.Points(
      fg,
      new THREE.PointsMaterial({
        size: 0.42,
        map: dotTexture("rgba(255,240,200,1)", "rgba(255,178,80,0.65)"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.0,
        sizeAttenuation: true,
      }),
    );
    scene.add(flies);

    /* the clearing at the far end: a low stage */
    var stage = new THREE.Group();

    stage.position.set(0, 0, -138);

    var deck = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.7, 8),
      new THREE.MeshStandardMaterial({ color: 0x3a2e23, roughness: 0.95 }),
    );

    deck.position.y = -0.25;
    stage.add(deck);

    for (var s = -1; s <= 1; s += 2) {
      var post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.26, 7, 8),
        new THREE.MeshStandardMaterial({ color: 0x2e251c, roughness: 1 }),
      );

      post.position.set(s * 7.4, 3.4, 0);
      stage.add(post);
    }

    var beam = new THREE.Mesh(
      new THREE.BoxGeometry(15.6, 0.35, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x2e251c, roughness: 1 }),
    );

    beam.position.y = 6.9;
    stage.add(beam);

    /* Festoon run. Each bulb carries its own glow sprite so the string reads
       as lit rather than as white dots, and every third one holds a small
       point light, which is enough to wash the deck without paying for
       thirteen lights. */
    var bulbs = [];
    var glowTex = dotTexture(
      "rgba(255,236,196,0.95)",
      "rgba(255,178,102,0.5)",
    );

    for (var b = 0; b < 13; b++) {
      var bx = -6.6 + b * 1.1;
      // the wire sags between the posts
      var sag = Math.cos((bx / 7.4) * (Math.PI / 2)) * 0.45;

      var bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0xffe2ac }),
      );

      bulb.position.set(bx, 6.5 - 0.45 + sag, 0);
      stage.add(bulb);

      var glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xffc27a,
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );

      glow.scale.set(1.9, 1.9, 1);
      glow.position.copy(bulb.position);
      stage.add(glow);

      var bulbLight = null;

      if (b % 3 === 1) {
        bulbLight = new THREE.PointLight(0xffc98a, 1.6, 16, 2);
        bulbLight.position.copy(bulb.position);
        stage.add(bulbLight);
      }

      bulbs.push({
        mesh: bulb,
        glow: glow,
        light: bulbLight,
        seed: Math.random() * 10,
      });
    }

    /* Key light over the deck, plus a low warm bounce so the front edge and
       the faces of anyone standing on it are not left in silhouette. */
    var stageLight = new THREE.PointLight(0xffcf9a, 9, 34, 2);

    stageLight.position.set(0, 6, 2);
    stage.add(stageLight);

    var deckFill = new THREE.PointLight(0xffb673, 3.4, 20, 2);

    deckFill.position.set(0, 1.1, 4.2);
    stage.add(deckFill);

    // A backdrop catches the light and stops the stage reading as a hole in
    // the trees.
    var backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 7),
      new THREE.MeshStandardMaterial({
        color: 0x4a3524,
        roughness: 1,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    );

    backdrop.position.set(0, 3.4, -3.6);
    stage.add(backdrop);

    // Warm pool on the ground in front, so the stage looks approached rather
    // than parked.
    var pool = new THREE.Mesh(
      new THREE.CircleGeometry(13, 40),
      new THREE.MeshBasicMaterial({
        map: glowTex,
        color: 0xffa757,
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );

    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, -0.53, 5);
    stage.add(pool);

    stage.userData = {
      light: stageLight,
      fill: deckFill,
      bulbs: bulbs,
      pool: pool,
    };
    scene.add(stage);
    api._stage = stage;

    window.addEventListener("resize", resize);
    window.addEventListener(
      "pointermove",
      function (e) {
        pTarget.x = e.clientX / window.innerWidth - 0.5;
        pTarget.y = e.clientY / window.innerHeight - 0.5;
      },
      { passive: true },
    );

    resize();
    animate();

    return true;
  };

  api.setDepth = function (p) {
    depth = Math.max(0, Math.min(1, p));
  };

  api.setNight = function (p) {
    night = Math.max(0, Math.min(1, p));
  };

  api.lightUp = function () {
    flare = 1;
  };

  function resize() {
    if (!renderer || !host) return;
    var w = host.clientWidth;
    var h = host.clientHeight;

    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  var duskCol = new THREE.Color(C.dusk);
  var nightCol = new THREE.Color(C.night);
  var mixCol = new THREE.Color();

  function animate() {
    requestAnimationFrame(animate);
    if (!renderer) return;

    var dt = Math.min(clock.getDelta(), 0.05);
    var t = clock.elapsedTime;

    depthEased += (depth - depthEased) * 0.055;
    nightEased += (night - nightEased) * 0.04;
    if (flare > 0) flare = Math.max(0, flare - dt * 1.1);

    pointer.x += (pTarget.x - pointer.x) * 0.03;
    pointer.y += (pTarget.y - pointer.y) * 0.03;

    // walk forward, with the small sway of someone actually walking
    camera.position.z = 26 - depthEased * 158;
    camera.position.x = Math.sin(t * 0.4) * 0.35 + pointer.x * 2.4;
    camera.position.y = 2.6 + Math.sin(t * 0.8) * 0.09 - pointer.y * 1.1;
    camera.lookAt(
      pointer.x * 3.2,
      2.4 - pointer.y * 1.6,
      camera.position.z - 24,
    );

    // dusk falls as you go deeper
    mixCol.copy(duskCol).lerp(nightCol, nightEased);
    scene.background = mixCol;
    fog.color.copy(mixCol);
    fog.density = 0.031 + nightEased * 0.016;

    api._sun.intensity = 1.5 * (1 - nightEased * 0.86);
    api._sky.intensity = 0.55 * (1 - nightEased * 0.6);

    lanterns.forEach(function (g) {
      var flicker =
        0.82 +
        Math.sin(t * 5.1 + g.userData.seed) * 0.08 +
        Math.sin(t * 11.3 + g.userData.seed * 2) * 0.05;
      var lit = 0.35 + nightEased * 0.65 + flare * 0.7;

      g.userData.light.intensity = 5.5 * flicker * lit;
      g.userData.glow.material.opacity = 0.5 * flicker * lit;
      g.userData.core.material.color.setHSL(0.09, 0.55, 0.72 * flicker);
      g.position.y += Math.sin(t * 0.6 + g.userData.seed) * 0.0018;
      g.rotation.y = Math.sin(t * 0.3 + g.userData.seed) * 0.24;
    });

    if (api._stage) {
      var sd = api._stage.userData;
      // The stage keeps a warm floor of its own in daylight and climbs as the
      // wood goes dark, so it always reads as the lit place to walk toward.
      var stageLit = 0.72 + nightEased * 0.75 + flare * 0.5;

      sd.light.intensity = 9 * stageLit;
      sd.fill.intensity = 3.4 * stageLit;
      sd.pool.material.opacity = 0.26 * (0.5 + nightEased * 0.9 + flare * 0.4);

      sd.bulbs.forEach(function (b) {
        // Each bulb drifts on its own two sine waves, so the run never pulses
        // in unison the way a single shared flicker would.
        var f =
          0.86 +
          Math.sin(t * 3.4 + b.seed) * 0.07 +
          Math.sin(t * 8.7 + b.seed * 1.7) * 0.05;

        b.glow.material.opacity = 0.7 * f * Math.min(1.35, stageLit);
        b.mesh.material.color.setHSL(0.1, 0.62, 0.74 * f);
        if (b.light) b.light.intensity = 1.6 * f * stageLit;
      });
    }

    // fireflies wake as it gets dark and drift toward the pointer
    if (flies) {
      var p = flies.geometry.attributes.position;
      var px = pointer.x * 16;
      var py = 3 - pointer.y * 6;

      for (var i = 0; i < flySeed.length / 2; i++) {
        var s = flySeed[i * 2];
        var sp = flySeed[i * 2 + 1];
        var bx = flyBase[i * 3];
        var by = flyBase[i * 3 + 1];

        p.array[i * 3] =
          bx + Math.sin(t * 0.35 * sp + s) * 1.9 + (px - bx) * 0.012;
        p.array[i * 3 + 1] =
          by + Math.sin(t * 0.5 * sp + s * 2) * 0.9 + (py - by) * 0.01;
      }
      p.needsUpdate = true;
      flies.material.opacity = 0.15 + nightEased * 0.85 + flare * 0.3;
      flies.material.size = 0.36 + Math.sin(t * 2) * 0.03;
    }

    renderer.render(scene, camera);
  }

  return api;
})();
