/* AURIGA Drive 12 / Three.js scroll cinema
   -------------------------------------------------------------------------
   One fixed canvas behind the whole page. The actuator is built from
   primitives (lathes, tori, arc segments) and separates along its own axis as
   you scroll, while the camera walks it from one side of the layout to the
   other. Nothing here is a loaded model or a texture file.

   Exposed as window.AurigaScene:
     init(el)              -> boolean
     setProgress(p)        -> 0..1, drives the separation
     setPose(name)         -> which chapter the camera should sit in
     setConfig(cfg)        -> ratio / brake / feedback change the geometry
     partAt(clientX, y)    -> hit test, returns a part key or null
   ------------------------------------------------------------------------- */

window.AurigaScene = (function () {
  "use strict";

  var THREE = window.THREE;

  var COL = {
    shell: 0x59626c,
    shellDark: 0x333a41,
    steel: 0x8e99a4,
    copper: 0xc4763e,
    copperHot: 0xe09a5c,
    magnet: 0x1d2126,
    board: 0x12352c,
    gold: 0xc9a227,
    signal: 0x2be7c7,
    ink: 0x0a0c0f,
  };

  var api = {};
  var renderer, scene, camera, clock, host, rig, model;
  var parts = {};
  var labels = [];
  var raycaster, pointer;
  var progress = 0;
  var shown = 0;
  var spin = 0;
  var gearSpin = 0;

  /* per part: separation distance along the axis, and when it moves */
  var LAYERS = [
    { k: "housing", y: 4.6, from: 0.02, to: 0.26, name: "Housing" },
    { k: "endcap", y: 2.2, from: 0.05, to: 0.3, name: "End cap" },
    { k: "pcb", y: 1.4, from: 0.3, to: 0.56, name: "Encoder board" },
    { k: "stator", y: 0.6, from: 0.2, to: 0.48, name: "Stator" },
    { k: "rotor", y: -0.35, from: 0.24, to: 0.52, name: "Rotor" },
    { k: "brake", y: -1.2, from: 0.34, to: 0.6, name: "Brake" },
    { k: "gearbox", y: -2.2, from: 0.5, to: 0.78, name: "Gearbox" },
    { k: "flange", y: -3.2, from: 0.56, to: 0.84, name: "Output flange" },
  ];

  // x moves the object across the layout, dist frames it. The text column of
  // each chapter is always on the opposite side of the one the model sits in.
  var POSE = {
    hero: { x: 3.4, y: -0.2, dist: 21, elev: 0.16, tilt: 0.34 },
    shell: { x: 4.2, y: 1.2, dist: 19, elev: 0.28, tilt: 0.52 },
    copper: { x: -4.4, y: 0.2, dist: 14, elev: 0.05, tilt: 0.18 },
    brain: { x: 4.4, y: -1.4, dist: 13, elev: 0.6, tilt: 0.72 },
    gears: { x: -4.4, y: 2.6, dist: 14, elev: -0.28, tilt: 0.14 },
    all: { x: 0.4, y: 1.4, dist: 28, elev: 0.16, tilt: 0.38 },
    config: { x: 4.6, y: 0, dist: 21, elev: 0.14, tilt: 0.42 },
  };

  var pose = Object.assign({}, POSE.hero);
  var poseTarget = Object.assign({}, POSE.hero);
  var focusKey = null;

  /* ------------------------------------------------------------ helpers -- */

  /* one material per description per part. Making a fresh material for every
     fin cost us a hundred of them, and every one had to be touched each frame
     when a chapter dimmed the rest of the motor. */
  var matCache = {};

  function mat(colour, rough, metal, group) {
    var r = rough === undefined ? 0.45 : rough;
    var m = metal === undefined ? 0.85 : metal;
    var key = (group || currentPart || "x") + ":" + colour + ":" + r + ":" + m;

    if (!matCache[key]) {
      matCache[key] = new THREE.MeshStandardMaterial({
        color: colour,
        roughness: r,
        metalness: m,
        opacity: 1,
      });
    }

    return matCache[key];
  }

  var currentPart = null;

  function part(key) {
    var g = new THREE.Group();

    currentPart = key;

    g.userData = { key: key, mats: [], home: 0 };
    model.add(g);
    parts[key] = g;

    return g;
  }

  function add(g, mesh) {
    g.add(mesh);
    if (mesh.material && g.userData.mats.indexOf(mesh.material) === -1) {
      g.userData.mats.push(mesh.material);
    }

    return mesh;
  }

  /* an open tube, used for the housing and the stator ring */
  function tube(rOuter, rInner, h, seg) {
    var pts = [
      new THREE.Vector2(rInner, -h / 2),
      new THREE.Vector2(rOuter, -h / 2),
      new THREE.Vector2(rOuter, h / 2),
      new THREE.Vector2(rInner, h / 2),
      new THREE.Vector2(rInner, -h / 2),
    ];

    return new THREE.LatheGeometry(pts, seg || 56);
  }

  function boardTexture() {
    var c = document.createElement("canvas");

    c.width = 512;
    c.height = 512;
    var g = c.getContext("2d");

    g.fillStyle = "#12352c";
    g.fillRect(0, 0, 512, 512);

    // ground pour hatching
    g.strokeStyle = "rgba(255,255,255,0.035)";
    g.lineWidth = 2;
    for (var i = -512; i < 512; i += 9) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i + 512, 512);
      g.stroke();
    }

    // radial traces
    g.strokeStyle = "#c9a227";
    g.lineWidth = 3;
    for (var t = 0; t < 24; t++) {
      var a = (t / 24) * Math.PI * 2;

      g.beginPath();
      g.moveTo(256 + Math.cos(a) * 90, 256 + Math.sin(a) * 90);
      g.lineTo(256 + Math.cos(a) * 232, 256 + Math.sin(a) * 232);
      g.stroke();
    }

    [120, 176, 214].forEach(function (r) {
      g.beginPath();
      g.arc(256, 256, r, 0, Math.PI * 2);
      g.stroke();
    });

    // pads and parts
    for (var p = 0; p < 40; p++) {
      var pa = (p / 40) * Math.PI * 2;
      var pr = 150 + (p % 3) * 34;

      g.fillStyle = p % 4 === 0 ? "#0c0f12" : "#c9a227";
      g.fillRect(
        256 + Math.cos(pa) * pr - 7,
        256 + Math.sin(pa) * pr - 5,
        14,
        10,
      );
    }

    g.fillStyle = "#0c0f12";
    g.fillRect(212, 212, 88, 88);
    g.fillStyle = "#2be7c7";
    g.font = "600 22px Consolas, monospace";
    g.textAlign = "center";
    g.fillText("AX12", 256, 262);

    g.beginPath();
    g.arc(256, 256, 60, 0, Math.PI * 2);
    g.strokeStyle = "#2be7c7";
    g.lineWidth = 4;
    g.stroke();

    var tex = new THREE.CanvasTexture(c);

    tex.encoding = THREE.sRGBEncoding;

    return tex;
  }

  function labelTexture(text, index) {
    var c = document.createElement("canvas");

    c.width = 512;
    c.height = 128;
    var g = c.getContext("2d");

    g.clearRect(0, 0, 512, 128);

    g.strokeStyle = "rgba(43,231,199,0.85)";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(6, 64);
    g.lineTo(96, 64);
    g.stroke();

    g.fillStyle = "#2be7c7";
    g.font = "600 26px Consolas, monospace";
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.fillText(String(index + 1).padStart(2, "0"), 106, 64);

    g.fillStyle = "#e8edf2";
    g.font =
      "600 32px 'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif";
    g.fillText(text, 160, 64);

    var tex = new THREE.CanvasTexture(c);

    tex.encoding = THREE.sRGBEncoding;

    return tex;
  }

  /* ------------------------------------------------------------- build -- */

  function buildHousing() {
    var g = part("housing");

    add(g, new THREE.Mesh(tube(2.05, 1.92, 3.4), mat(COL.shell, 0.34, 0.9)));

    // cooling fins
    for (var i = 0; i < 28; i++) {
      var a = (i / 28) * Math.PI * 2;
      var fin = add(
        g,
        new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 2.6, 0.22),
          mat(COL.shell, 0.4, 0.85),
        ),
      );

      // pulled in far enough to bite into the shell rather than hover on it
      fin.position.set(Math.cos(a) * 2.09, 0, Math.sin(a) * 2.09);
      fin.rotation.y = -a;
    }

    /* Laser etched band. It has to clear the fins: the fins run to y 1.3 and
       stand proud to r 2.14, so a band sitting at their height intersects all
       twenty eight of them and its darker material saws through each one as the
       housing turns. It goes on the smooth collar above them instead, and its
       inner wall is tucked under the shell so it reads as machined into the
       part rather than as a hoop floating around it. */
    var band = add(
      g,
      new THREE.Mesh(tube(2.13, 2.03, 0.2), mat(COL.shellDark, 0.6, 0.5)),
    );

    band.position.y = 1.5;
  }

  function buildEndcap() {
    var g = part("endcap");

    /* 2.04 rather than 2.05: assembled, the skirt of this cap overlaps the top
       of the housing, and at an identical radius the two walls are coplanar and
       z fight, which is the flicker you get around the collar as the unit
       turns. A hundredth in is below the seam you would machine anyway. */
    add(g, new THREE.Mesh(tube(2.04, 0, 0.34), mat(COL.shell, 0.34, 0.9)));

    var boss = add(
      g,
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.42, 0.5, 24),
        mat(COL.shellDark, 0.4, 0.8),
      ),
    );

    boss.position.set(1.1, 0.4, 0);

    var pin = add(
      g,
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.16, 20),
        mat(COL.ink, 0.7, 0.2),
      ),
    );

    pin.position.set(1.1, 0.66, 0);

    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      var bolt = add(
        g,
        new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.11, 0.4, 12),
          mat(COL.steel, 0.3, 0.95),
        ),
      );

      bolt.position.set(Math.cos(a) * 1.75, 0.06, Math.sin(a) * 1.75);
    }
  }

  function buildPcb() {
    var g = part("pcb");
    var tex = boardTexture();

    var disc = add(
      g,
      new THREE.Mesh(
        new THREE.CylinderGeometry(1.86, 1.86, 0.07, 56),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: tex,
          roughness: 0.62,
          metalness: 0.1,
        }),
      ),
    );

    disc.material.map.center.set(0.5, 0.5);

    // the top face of a cylinder takes the texture, so keep the rim plain
    var rim = add(
      g,
      new THREE.Mesh(tube(1.87, 1.84, 0.075), mat(COL.board, 0.7, 0.1)),
    );

    rim.position.y = 0;

    var comps = [
      [0.9, 0.55, 0.34, 0.16],
      [-0.75, -0.7, 0.28, 0.13],
      [0.2, -1.1, 0.5, 0.12],
      [-1.15, 0.4, 0.22, 0.2],
    ];

    comps.forEach(function (c) {
      var m = add(
        g,
        new THREE.Mesh(
          new THREE.BoxGeometry(c[2], c[3], c[2] * 0.7),
          mat(COL.ink, 0.65, 0.2),
        ),
      );

      m.position.set(c[0], 0.06 + c[3] / 2, c[1]);
    });

    var led = add(
      g,
      new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 10),
        new THREE.MeshStandardMaterial({
          color: COL.signal,
          emissive: COL.signal,
          emissiveIntensity: 2.4,
          roughness: 0.3,
        }),
      ),
    );

    led.position.set(-0.2, 0.11, 1.3);
  }

  function buildStator() {
    var g = part("stator");

    // laminated iron ring
    var ring = add(g, new THREE.Mesh(tube(1.82, 1.5, 1.5), mat(COL.steel, 0.55, 0.9)));

    ring.userData.lam = true;

    // twelve copper windings
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2;
      var coil = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.15, 10, 22),
        mat(i % 2 ? COL.copper : COL.copperHot, 0.36, 0.75),
      );

      coil.position.set(Math.cos(a) * 1.32, 0, Math.sin(a) * 1.32);
      coil.rotation.set(Math.PI / 2, 0, 0);
      coil.rotation.y = -a;
      add(g, coil);

      var tooth = add(
        g,
        new THREE.Mesh(
          new THREE.BoxGeometry(0.34, 1.5, 0.16),
          mat(COL.steel, 0.5, 0.92),
        ),
      );

      tooth.position.set(Math.cos(a) * 1.18, 0, Math.sin(a) * 1.18);
      tooth.rotation.y = -a;
    }

    var leads = add(
      g,
      new THREE.Mesh(
        new THREE.TorusGeometry(1.6, 0.05, 8, 40),
        mat(COL.copperHot, 0.3, 0.7),
      ),
    );

    leads.rotation.x = Math.PI / 2;
    leads.position.y = 0.82;
  }

  function buildRotor() {
    var g = part("rotor");

    add(
      g,
      new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.1, 1.6, 40),
        mat(COL.steel, 0.4, 0.95),
      ),
    );

    // eight arc magnets
    for (var i = 0; i < 8; i++) {
      var start = (i / 8) * Math.PI * 2 + 0.06;
      var seg = new THREE.Mesh(
        new THREE.CylinderGeometry(
          1.22,
          1.22,
          1.4,
          14,
          1,
          true,
          start,
          Math.PI / 4 - 0.12,
        ),
        new THREE.MeshStandardMaterial({
          color: COL.magnet,
          roughness: 0.55,
          metalness: 0.6,
          side: THREE.DoubleSide,
        }),
      );

      add(g, seg);
    }

    var shaft = add(
      g,
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 3.4, 24),
        mat(COL.steel, 0.24, 0.98),
      ),
    );

    shaft.position.y = -0.4;
  }

  function buildBrake() {
    var g = part("brake");

    add(g, new THREE.Mesh(tube(1.78, 1.2, 0.5), mat(COL.shellDark, 0.5, 0.7)));

    for (var i = 0; i < 4; i++) {
      var a = (i / 4) * Math.PI * 2 + 0.4;
      var sol = add(
        g,
        new THREE.Mesh(
          new THREE.CylinderGeometry(0.19, 0.19, 0.62, 16),
          mat(COL.copper, 0.4, 0.7),
        ),
      );

      sol.position.set(Math.cos(a) * 1.5, 0, Math.sin(a) * 1.5);
    }

    var disc = add(
      g,
      new THREE.Mesh(tube(1.3, 0.42, 0.09), mat(COL.steel, 0.35, 0.95)),
    );

    disc.position.y = -0.22;
  }

  function gear(radius, teeth, h, colour) {
    var g = new THREE.Group();

    g.add(
      new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, h, 30),
        mat(colour, 0.34, 0.95),
      ),
    );
    for (var t = 0; t < teeth; t++) {
      var a = (t / teeth) * Math.PI * 2;
      var tooth = new THREE.Mesh(
        new THREE.BoxGeometry(radius * 0.24, h, radius * 0.17),
        mat(colour, 0.34, 0.95),
      );

      tooth.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      tooth.rotation.y = -a;
      g.add(tooth);
    }

    return g;
  }

  function buildGearbox() {
    var g = part("gearbox");

    var ringGear = add(
      g,
      new THREE.Mesh(tube(1.95, 1.62, 1.1), mat(COL.shellDark, 0.45, 0.85)),
    );

    ringGear.userData.ring = true;

    var stages = new THREE.Group();

    g.add(stages);
    g.userData.stages = stages;

    for (var s = 0; s < 3; s++) {
      var stage = new THREE.Group();

      stage.position.y = 0.34 - s * 0.34;

      var sun = gear(0.42, 11, 0.3, COL.steel);

      stage.add(sun);
      stage.userData.sun = sun;

      var planets = [];

      for (var p = 0; p < 3; p++) {
        var a = (p / 3) * Math.PI * 2 + s * 0.6;
        var pl = gear(0.52, 13, 0.3, s === 0 ? COL.copper : COL.steel);

        pl.position.set(Math.cos(a) * 1.02, 0, Math.sin(a) * 1.02);
        stage.add(pl);
        planets.push(pl);
      }
      stage.userData.planets = planets;
      stage.userData.a0 = s * 0.6;
      stages.add(stage);

      stage.traverse(function (o) {
        if (o.material) g.userData.mats.push(o.material);
      });
    }
  }

  function buildFlange() {
    var g = part("flange");

    add(g, new THREE.Mesh(tube(1.9, 0.55, 0.42), mat(COL.shell, 0.32, 0.92)));

    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      var hole = add(
        g,
        new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.16, 0.5, 16),
          mat(COL.ink, 0.8, 0.2),
        ),
      );

      hole.position.set(Math.cos(a) * 1.42, 0, Math.sin(a) * 1.42);
    }

    var hub = add(
      g,
      new THREE.Mesh(tube(0.62, 0.34, 0.7), mat(COL.steel, 0.3, 0.96)),
    );

    hub.position.y = -0.2;
  }

  /* --------------------------------------------------------------- init -- */

  api.init = function (el) {
    if (!THREE) return false;
    host = el;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return false;
    }
    if (!renderer || !renderer.getContext()) return false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      30,
      el.clientWidth / el.clientHeight,
      0.1,
      200,
    );
    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    rig = new THREE.Group();
    scene.add(rig);
    model = new THREE.Group();
    rig.add(model);

    /* environment: a dark studio with two hot strips, so metal has edges */
    var c = document.createElement("canvas");

    c.width = 512;
    c.height = 256;
    var g = c.getContext("2d");
    var sky = g.createLinearGradient(0, 0, 0, 256);

    sky.addColorStop(0, "#2c333b");
    sky.addColorStop(0.48, "#12161b");
    sky.addColorStop(1, "#05070a");
    g.fillStyle = sky;
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = "rgba(255,255,255,0.92)";
    g.fillRect(60, 26, 150, 26);
    g.fillStyle = "rgba(196,118,62,0.75)";
    g.fillRect(320, 60, 130, 18);
    g.fillStyle = "rgba(43,231,199,0.4)";
    g.fillRect(230, 150, 90, 12);

    var envTex = new THREE.CanvasTexture(c);

    envTex.mapping = THREE.EquirectangularReflectionMapping;
    var pm = new THREE.PMREMGenerator(renderer);

    pm.compileEquirectangularShader();
    scene.environment = pm.fromEquirectangular(envTex).texture;
    pm.dispose();
    envTex.dispose();

    var key = new THREE.DirectionalLight(0xffffff, 2.2);

    key.position.set(5, 7, 6);
    scene.add(key);

    var warm = new THREE.DirectionalLight(0xffb87a, 1.1);

    warm.position.set(-6, 1, 3);
    scene.add(warm);

    var cool = new THREE.DirectionalLight(0x2be7c7, 0.85);

    cool.position.set(2, -4, -6);
    scene.add(cool);

    scene.add(new THREE.AmbientLight(0xffffff, 0.14));

    buildFlange();
    buildGearbox();
    buildBrake();
    buildRotor();
    buildStator();
    buildPcb();
    buildEndcap();
    buildHousing();

    // resting positions so the assembled unit reads as one object
    var HOME = {
      housing: 0.1,
      endcap: 1.78,
      pcb: 1.42,
      stator: 0.1,
      rotor: 0.05,
      brake: -1.1,
      gearbox: -2.0,
      flange: -2.8,
    };

    LAYERS.forEach(function (l, i) {
      var g2 = parts[l.k];

      g2.userData.home = HOME[l.k];
      g2.position.y = HOME[l.k];

      // 3D annotation, revealed at full separation
      var sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: labelTexture(l.name, i),
          transparent: true,
          opacity: 0,
          depthTest: false,
        }),
      );

      sprite.scale.set(4.4, 1.1, 1);
      scene.add(sprite);
      labels.push({ sprite: sprite, key: l.k });
    });

    window.addEventListener("resize", resize);
    resize();
    animate();

    return true;
  };

  api.setProgress = function (p) {
    progress = Math.max(0, Math.min(1, p));
  };

  api.setPose = function (name) {
    var t = POSE[name] || POSE.hero;

    poseTarget = Object.assign({}, t);
  };

  api.setFocus = function (key) {
    focusKey = key || null;
  };

  api.setConfig = function (cfg) {
    if (!parts.gearbox) return;
    var stages = parts.gearbox.userData.stages;

    stages.children.forEach(function (st, i) {
      st.visible = i < cfg.stages;
    });
    parts.brake.visible = !!cfg.brake;
  };

  api.hit = function (clientX, clientY) {
    if (!renderer) return null;
    var r = renderer.domElement.getBoundingClientRect();

    pointer.x = ((clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    var hits = raycaster.intersectObject(model, true);

    if (!hits.length) return null;
    var o = hits[0].object;

    while (o && !o.userData.key) o = o.parent;

    return o ? o.userData.key : null;
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

  /* exponential approach, expressed as a rate per second */
  function ease(dt, rate) {
    return 1 - Math.exp(-dt * rate);
  }

  function smoothstep(a, b, x) {
    var t = Math.max(0, Math.min(1, (x - a) / (b - a)));

    return t * t * (3 - 2 * t);
  }

  var tmp = new THREE.Vector3();

  function animate() {
    requestAnimationFrame(animate);
    if (!renderer) return;

    var dt = Math.min(clock.getDelta(), 0.05);

    // easing tied to seconds, not to frames, so a slow frame does not make the
    // housing crawl behind the scroll
    shown += (progress - shown) * ease(dt, 12);

    var pe = ease(dt, 4.2);

    ["x", "y", "dist", "elev", "tilt"].forEach(function (k) {
      pose[k] += (poseTarget[k] - pose[k]) * pe;
    });

    spin += dt * 0.16;
    gearSpin += dt * (1.4 + shown * 2.2);

    camera.position.set(0, pose.elev * pose.dist, pose.dist);
    camera.lookAt(0, 0, 0);

    rig.position.x = pose.x;
    rig.position.y = pose.y;
    rig.rotation.z = pose.tilt * 0.36;
    rig.rotation.y = spin;

    LAYERS.forEach(function (l) {
      var g = parts[l.k];

      if (!g) return;
      var t = smoothstep(l.from, l.to, shown);

      g.position.y = g.userData.home + l.y * t;

      var dim = focusKey && focusKey !== l.k ? 0.16 : 1;

      g.userData.mats.forEach(function (m) {
        if (m.userData.o === undefined) m.userData.o = 1;
        m.userData.o += (dim - m.userData.o) * ease(dt, 7);
        m.opacity = m.userData.o;

        // flipping this recompiles the shader, so only do it on the edges
        var want = m.userData.o < 0.995;

        if (m.transparent !== want) m.transparent = want;
      });
    });

    // gears turn, and turn faster as the box opens
    if (parts.gearbox && parts.gearbox.userData.stages) {
      parts.gearbox.userData.stages.children.forEach(function (st, i) {
        if (!st.visible) return;
        if (st.userData.sun) st.userData.sun.rotation.y = gearSpin * (i + 1) * 0.8;
        st.userData.planets.forEach(function (pl, j) {
          pl.rotation.y = -gearSpin * 1.9 + j;
        });
        st.rotation.y = st.userData.a0 - gearSpin * 0.32;
      });
    }

    // annotations appear once everything is apart
    var showLabels = smoothstep(0.72, 0.92, shown);

    labels.forEach(function (l) {
      var g = parts[l.key];

      if (!g) {
        l.sprite.material.opacity = 0;

        return;
      }
      g.getWorldPosition(tmp);
      l.sprite.position.set(tmp.x + 3.6, tmp.y, tmp.z);
      l.sprite.material.opacity = showLabels * (g.visible ? 1 : 0);
    });

    renderer.render(scene, camera);
  }

  return api;
})();
