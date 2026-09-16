/* Orbit / Three.js exploded hub
   -------------------------------------------------------------------------
   Five modules as rounded extruded slabs, stacked and separated in Z. Soft
   pastel materials under a hemisphere light with a procedural studio
   environment, so the plastic reads as plastic rather than flat colour.

   Exposed as window.OrbitScene:
     init(el)         -> boolean
     open(bool)       -> assemble or explode the stack
     focus(key|null)  -> lift and isolate one module
     setFinish(a, b)  -> recolour the cap
   ------------------------------------------------------------------------- */

window.OrbitScene = (function () {
  "use strict";

  var THREE = window.THREE;

  var api = {};
  var renderer, scene, camera, clock, host, root;
  var mods = {};
  var order = ["base", "battery", "board", "speaker", "cap"];
  var opened = false;
  var focused = null;
  var spin = -0.62;
  var spinTarget = -0.62;
  var vel = 0;
  var dragging = false;
  var moved = false;
  var lastX = 0;
  var picked = null;
  var pickHandler = null;
  var ray, ndc;

  var COL = {
    peri: 0x6b84ff,
    periD: 0x4c65e6,
    cream: 0xf3ecd6,
    creamD: 0xd2c9ac,
    mint: 0x2fc79a,
    mintD: 0x1fa77e,
    clay: 0xff7a4d,
    clayD: 0xe05c2c,
    ink: 0x22203a,
  };

  /* ------------------------------------------------------------ geometry -- */

  function roundedRect(w, h, r) {
    var s = new THREE.Shape();
    var x = -w / 2;
    var y = -h / 2;

    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);

    return s;
  }

  function slab(w, h, d, r, bevel) {
    var geo = new THREE.ExtrudeGeometry(roundedRect(w, h, r), {
      depth: Math.max(d - bevel * 2, 0.001),
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelOffset: 0,
      bevelSegments: 4,
      curveSegments: 18,
    });

    geo.center();
    geo.rotateX(-Math.PI / 2); // lie flat, thickness along Y

    return geo;
  }

  function mat(colour, rough) {
    return new THREE.MeshStandardMaterial({
      color: colour,
      roughness: rough === undefined ? 0.55 : rough,
      metalness: 0.02,
      // the studio environment is only there to shape the plastic, not to
      // wash the pigment out of it
      envMapIntensity: 0.3,
    });
  }

  function buildEnv(r) {
    var c = document.createElement("canvas");

    c.width = 512;
    c.height = 256;
    var g = c.getContext("2d");
    var sky = g.createLinearGradient(0, 0, 0, 256);

    sky.addColorStop(0, "#f2f0fa");
    sky.addColorStop(0.5, "#c8c3d9");
    sky.addColorStop(1, "#7d798c");
    g.fillStyle = sky;
    g.fillRect(0, 0, 512, 256);

    function blob(x, y, rad, col) {
      var rg = g.createRadialGradient(x, y, 2, x, y, rad);

      rg.addColorStop(0, col);
      rg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = rg;
      g.fillRect(0, 0, 512, 256);
    }

    blob(120, 50, 90, "rgba(255,255,255,0.9)");
    blob(390, 70, 70, "rgba(255,238,226,0.7)");

    var tex = new THREE.CanvasTexture(c);

    tex.mapping = THREE.EquirectangularReflectionMapping;
    var pm = new THREE.PMREMGenerator(r);

    pm.compileEquirectangularShader();
    var env = pm.fromEquirectangular(tex).texture;

    pm.dispose();
    tex.dispose();

    return env;
  }

  /* -------------------------------------------------------------- modules -- */

  var W = 2.2;
  var T = 0.34;

  function module(key, top, side, closed, open) {
    var g = new THREE.Group();
    var body = new THREE.Mesh(slab(W, W, T, 0.26, 0.03), mat(top, 0.5));

    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    // a thin darker band around the rim reads as the moulded edge
    var rim = new THREE.Mesh(slab(W * 1.005, W * 1.005, T * 0.42, 0.26, 0.02), mat(side, 0.7));

    rim.position.y = -T * 0.3;
    g.add(rim);

    g.userData = { closed: closed, open: open, body: body, rim: rim };
    root.add(g);
    mods[key] = g;

    return g;
  }

  function detailMat(c, rough) {
    return mat(c, rough === undefined ? 0.4 : rough);
  }

  api.init = function (el) {
    if (!THREE) return false;
    host = el;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return false;
    }
    if (!renderer || !renderer.getContext()) return false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.environment = buildEnv(renderer);
    camera = new THREE.PerspectiveCamera(
      26,
      el.clientWidth / el.clientHeight,
      0.1,
      100,
    );
    clock = new THREE.Clock();

    root = new THREE.Group();
    scene.add(root);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xc7c1de, 0.44));

    var sun = new THREE.DirectionalLight(0xffffff, 0.66);

    sun.position.set(2.4, 10, 3.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 30;
    sun.shadow.camera.left = -4;
    sun.shadow.camera.right = 4;
    sun.shadow.camera.top = 4;
    sun.shadow.camera.bottom = -4;
    sun.shadow.bias = -0.002;
    scene.add(sun);

    var fill = new THREE.DirectionalLight(0xfff0e6, 0.2);

    fill.position.set(-5, 2, -4);
    scene.add(fill);

    /* base */
    var base = module("base", COL.peri, COL.periD, 0, 0);

    [-0.62, 0, 0.5].forEach(function (x, i) {
      var port = new THREE.Mesh(
        i === 2
          ? new THREE.CylinderGeometry(0.11, 0.11, 0.06, 20)
          : slab(i === 0 ? 0.42 : 0.28, 0.2, 0.06, 0.06, 0.01),
        detailMat(COL.ink, 0.6),
      );

      port.position.set(x, T / 2 + 0.005, 0.72);
      base.add(port);
    });

    /* battery */
    var battery = module("battery", COL.cream, COL.creamD, 0.34, 0.74);

    [-0.61, 0, 0.61].forEach(function (x) {
      var cell = new THREE.Mesh(
        new THREE.CapsuleGeometry
          ? new THREE.CapsuleGeometry(0.2, 1.1, 6, 16)
          : new THREE.CylinderGeometry(0.2, 0.2, 1.5, 20),
        detailMat(0x2b2942, 0.35),
      );

      cell.position.set(x, T / 2 - 0.06, 0);
      cell.scale.set(1, 1, 1);
      battery.add(cell);
    });

    /* board */
    var board = module("board", COL.mint, COL.mintD, 0.68, 1.48);

    var traceH = new THREE.Mesh(
      slab(1.7, 0.06, 0.02, 0.02, 0.005),
      detailMat(0xffffff, 0.6),
    );

    traceH.position.set(0, T / 2 + 0.004, -0.12);
    board.add(traceH);

    var traceV = new THREE.Mesh(
      slab(0.06, 1.7, 0.02, 0.02, 0.005),
      detailMat(0xffffff, 0.6),
    );

    traceV.position.set(-0.36, T / 2 + 0.004, 0);
    board.add(traceV);

    var soc = new THREE.Mesh(
      slab(0.56, 0.56, 0.09, 0.06, 0.01),
      detailMat(0x2b2942, 0.35),
    );

    soc.position.set(0.16, T / 2 + 0.03, 0.1);
    soc.castShadow = true;
    board.add(soc);

    [
      [-0.72, 0.66],
      [0.62, -0.66],
    ].forEach(function (p) {
      var chip = new THREE.Mesh(
        slab(0.34, 0.2, 0.06, 0.03, 0.008),
        detailMat(0xffffff, 0.5),
      );

      chip.position.set(p[0], T / 2 + 0.02, p[1]);
      board.add(chip);
    });

    /* speaker */
    var speaker = module("speaker", COL.clay, COL.clayD, 1.02, 2.22);
    var meshRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.035, 10, 44),
      detailMat(0xffffff, 0.5),
    );

    meshRing.rotation.x = Math.PI / 2;
    meshRing.position.y = T / 2 + 0.01;
    speaker.add(meshRing);

    for (var ring = 0; ring < 3; ring++) {
      for (var n = 0; n < 14 + ring * 6; n++) {
        var a = (n / (14 + ring * 6)) * Math.PI * 2;
        var rr = 0.2 + ring * 0.22;
        var hole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.035, 0.05, 8),
          detailMat(0x8a4a34, 0.7),
        );

        hole.position.set(Math.cos(a) * rr, T / 2 - 0.01, Math.sin(a) * rr);
        speaker.add(hole);
      }
    }

    /* cap */
    var cap = module("cap", 0xffc53d, 0xeaa91f, 1.36, 2.96);
    var ledRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.66, 0.08, 14, 52),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.35,
        roughness: 0.4,
      }),
    );

    ledRing.rotation.x = Math.PI / 2;
    ledRing.position.y = T / 2 + 0.02;
    cap.add(ledRing);
    cap.userData.ring = ledRing;

    // the ring emits, so choosing a finish repaints everything below it
    var ringLight = new THREE.PointLight(0xffc53d, 1.15, 6, 2);

    ringLight.position.set(0, T / 2 + 0.5, 0);
    cap.add(ringLight);
    cap.userData.light = ringLight;

    var mic = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.06, 20),
      detailMat(0x2b2942, 0.4),
    );

    mic.position.y = T / 2 + 0.02;
    cap.add(mic);

    /* contact shadow */
    var shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 9),
      new THREE.ShadowMaterial({ opacity: 0.12 }),
    );

    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.4;
    shadow.receiveShadow = true;
    scene.add(shadow);

    /* input */
    ray = new THREE.Raycaster();
    ndc = new THREE.Vector2();

    el.addEventListener("pointerdown", function (e) {
      dragging = true;
      moved = false;
      lastX = e.clientX;
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
    });
    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;

      if (Math.abs(dx) > 3) moved = true;
      spinTarget += dx * 0.008;
      vel = dx * 0.004;
      lastX = e.clientX;
    });
    function up(e) {
      dragging = false;
      el.classList.remove("is-dragging");
      if (moved || !e) return;

      var r = el.getBoundingClientRect();

      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);

      var hits = ray.intersectObject(root, true);
      var key = null;

      if (hits.length) {
        var o = hits[0].object;

        while (o && o.parent && o.parent !== root) o = o.parent;
        Object.keys(mods).forEach(function (k) {
          if (mods[k] === o) key = k;
        });
      }
      picked = picked === key ? null : key;
      if (pickHandler) pickHandler(picked);
    }
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", function () {
      dragging = false;
      el.classList.remove("is-dragging");
    });

    window.addEventListener("resize", resize);
    resize();
    animate();

    return true;
  };

  api.open = function (v) {
    opened = v;
  };

  api.focus = function (key) {
    focused = key || null;
  };

  api.setFinish = function (a, b) {
    if (!mods.cap) return;
    mods.cap.userData.body.material.color.set(a);
    mods.cap.userData.rim.material.color.set(b);
    if (mods.cap.userData.light) mods.cap.userData.light.color.set(a);
    if (mods.cap.userData.ring) mods.cap.userData.ring.material.emissive.set(a);
  };

  /* click a module to pull it out of the stack and spin it */
  api.pick = function (key) {
    picked = picked === key ? null : key || null;

    return picked;
  };

  api.onPick = function (fn) {
    pickHandler = fn;
  };

  function resize() {
    if (!renderer || !host) return;
    var w = host.clientWidth;
    var h = host.clientHeight;

    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    var d = 15 / Math.max(camera.aspect, 0.6);

    camera.position.set(d * 0.05, d * 0.5, d * 0.62);
    camera.lookAt(0, 1.35, 0);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!renderer) return;

    var dt = Math.min(clock.getDelta(), 0.05);
    var t = clock.elapsedTime;

    if (!dragging) {
      spinTarget += vel;
      vel *= 0.93;
      if (Math.abs(vel) < 0.0004) vel = 0;
      if (vel === 0) spinTarget = -0.62 + Math.sin(t * 0.22) * 0.28;
    }
    spin += (spinTarget - spin) * 0.08;
    root.rotation.y = spin;

    order.forEach(function (key, i) {
      var g = mods[key];

      if (!g) return;

      var isPicked = picked === key;
      var lifted = focused === key || isPicked;
      var base = opened ? g.userData.open : g.userData.closed;
      var extra = (focused === key ? 0.55 : 0) + (isPicked ? 1.5 : 0);
      var target = base + extra + (opened ? Math.sin(t * 0.7 + i) * 0.02 : 0);

      g.position.y += (target - g.position.y) * 0.1;

      // the picked module steps out of the column and turns to face you
      var wantX = isPicked ? 2.7 : 0;
      var wantSpin = isPicked ? t * 0.9 : 0;
      var wantScale = isPicked ? 1.14 : 1;

      g.position.x += (wantX - g.position.x) * 0.12;
      g.rotation.y += (wantSpin - g.rotation.y) * (isPicked ? 0.3 : 0.1);

      var sc = g.scale.x + (wantScale - g.scale.x) * 0.12;

      g.scale.setScalar(sc);

      var dim = picked ? (isPicked ? 1 : 0.2) : focused && !lifted ? 0.28 : 1;

      [g.userData.body.material, g.userData.rim.material].forEach(function (m) {
        m.transparent = true;
        m.opacity += (dim - m.opacity) * 0.12;
      });
    });

    if (mods.cap && mods.cap.userData.ring) {
      mods.cap.userData.ring.material.emissiveIntensity =
        0.3 + Math.sin(t * 1.6) * 0.18;
    }

    renderer.render(scene, camera);
  }

  return api;
})();
