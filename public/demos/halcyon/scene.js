/* Halcyon HF-1 / Three.js product scene
   -------------------------------------------------------------------------
   A real WebGL model of the recorder. Body and keys are extruded rounded
   slabs, surface graphics are drawn to canvases and used as textures, and the
   VU meter face is redrawn every frame so the needle is genuinely analogue.

   Exposed as window.HalcyonScene:
     init(el)                -> boolean, false if WebGL is unavailable
     setColour({shell,deep,accent})
     setTransport(state)     -> "stopped" | "play" | "rew" | "fwd" | "rec"
     focusPart(name | null)
     onKeyPress(fn)          -> called when a 3D transport key is clicked
   ------------------------------------------------------------------------- */

window.HalcyonScene = (function () {
  "use strict";

  var THREE = window.THREE;

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
      bevelSegments: 3,
      curveSegments: 14,
    });

    geo.center();

    return geo;
  }

  /* ------------------------------------------------------- environment map -- */

  function buildEnv(renderer) {
    var c = document.createElement("canvas");

    c.width = 512;
    c.height = 256;

    var g = c.getContext("2d");
    var sky = g.createLinearGradient(0, 0, 0, 256);

    sky.addColorStop(0, "#fefaf0");
    sky.addColorStop(0.42, "#d4cbb8");
    sky.addColorStop(0.52, "#8b8477");
    sky.addColorStop(1, "#241f1b");
    g.fillStyle = sky;
    g.fillRect(0, 0, 512, 256);

    // two soft studio sources so metal has something to catch
    function blob(x, y, r, colour) {
      var rg = g.createRadialGradient(x, y, 2, x, y, r);

      rg.addColorStop(0, colour);
      rg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = rg;
      g.fillRect(0, 0, 512, 256);
    }

    blob(140, 62, 96, "rgba(255,255,255,1)");
    blob(372, 96, 74, "rgba(255,226,196,0.92)");
    blob(268, 30, 48, "rgba(255,255,255,0.7)");

    var tex = new THREE.CanvasTexture(c);

    tex.mapping = THREE.EquirectangularReflectionMapping;

    var pmrem = new THREE.PMREMGenerator(renderer);

    pmrem.compileEquirectangularShader();

    var env = pmrem.fromEquirectangular(tex).texture;

    pmrem.dispose();
    tex.dispose();

    return env;
  }

  /* ---------------------------------------------------- panel graphics -- */

  // The face is 300 x 420 mm. Everything below is in those millimetres and
  // scaled up to texture pixels, so the layout matches the spec drawing.
  var MM = { w: 300, h: 420 };
  var K = 3.4; // px per mm

  function mmToWorld(px, py) {
    return [(px - MM.w / 2) * 0.01, (MM.h / 2 - py) * 0.01];
  }

  function drawPanel(ctx, colours) {
    var W = MM.w * K;
    var H = MM.h * K;

    ctx.clearRect(0, 0, W, H);

    // shell
    var base = ctx.createLinearGradient(0, 0, W * 0.6, H);

    base.addColorStop(0, colours.shell);
    base.addColorStop(1, colours.deep);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    // brushed metal
    ctx.globalAlpha = 0.09;
    for (var x = 0; x < W; x += 3) {
      ctx.fillStyle = x % 6 === 0 ? "#ffffff" : "#000000";
      ctx.fillRect(x, 0, 1.4, H);
    }
    ctx.globalAlpha = 1;

    function rr(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    // header
    ctx.fillStyle = "rgba(25,21,18,0.72)";
    ctx.font = "600 " + 13 * K + "px Bahnschrift, 'Arial Narrow', sans-serif";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = 3 * K + "px";
    ctx.fillText("HALCYON", 18 * K, 30 * K);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = "rgba(25,21,18,0.45)";
    ctx.font = "500 " + 8 * K + "px Consolas, monospace";
    ctx.textAlign = "right";
    ctx.fillText("HF-1  BATCH 04", 282 * K, 30 * K);
    ctx.textAlign = "left";

    // window recess
    rr(18 * K, 52 * K, 264 * K, 128 * K, 6 * K);
    var win = ctx.createLinearGradient(0, 52 * K, 0, 180 * K);

    win.addColorStop(0, "#2c2723");
    win.addColorStop(1, "#141110");
    ctx.fillStyle = win;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.stroke();

    ctx.fillStyle = colours.accent;
    ctx.font = "500 " + 7 * K + "px Consolas, monospace";
    ctx.letterSpacing = 2.4 * K + "px";
    ctx.textAlign = "center";
    ctx.fillText("TYPE II  BIAS", 150 * K, 170 * K);
    ctx.letterSpacing = "0px";
    ctx.textAlign = "left";

    // meter bezel
    rr(18 * K, 194 * K, 264 * K, 74 * K, 4 * K);
    ctx.fillStyle = "rgba(20,17,15,0.55)";
    ctx.fill();

    // key bed
    rr(16 * K, 280 * K, 268 * K, 44 * K, 5 * K);
    ctx.fillStyle = "rgba(0,0,0,0.13)";
    ctx.fill();

    // foot markings
    ctx.fillStyle = "rgba(25,21,18,0.4)";
    ctx.font = "500 " + 7 * K + "px Consolas, monospace";
    ctx.letterSpacing = 1.8 * K + "px";
    ctx.fillText("GAIN", 30 * K, 405 * K);
    ctx.textAlign = "right";
    ctx.fillText("NO. 0412", 282 * K, 380 * K);
    ctx.textAlign = "left";
    ctx.letterSpacing = "0px";

    // screw heads
    [
      [10, 10],
      [290, 10],
      [10, 410],
      [290, 410],
    ].forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p[0] * K, p[1] * K, 3.4 * K, 0, Math.PI * 2);
      var sg = ctx.createRadialGradient(
        (p[0] - 1) * K,
        (p[1] - 1) * K,
        1,
        p[0] * K,
        p[1] * K,
        3.4 * K,
      );

      sg.addColorStop(0, "#b6ada1");
      sg.addColorStop(1, "#4b443d");
      ctx.fillStyle = sg;
      ctx.fill();
    });
  }

  function drawBack(ctx, colours) {
    var W = MM.w * K;
    var H = MM.h * K;
    var base = ctx.createLinearGradient(W, 0, 0, H);

    base.addColorStop(0, colours.deep);
    base.addColorStop(1, colours.shell);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    // vent dot field
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    for (var y = 70; y < 300; y += 9) {
      for (var x = 30; x < 270; x += 9) {
        ctx.beginPath();
        ctx.arc(x * K, y * K, 1.4 * K, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "rgba(25,21,18,0.5)";
    ctx.font = "500 " + 8 * K + "px Consolas, monospace";
    ctx.letterSpacing = 1.6 * K + "px";
    [
      "HALCYON INSTRUMENTS",
      "HF-1 FOUR TRACK",
      "6061-T6 / ANODISED",
      "BATCH 04 / 120 UNITS",
      "MADE IN KAUNAS",
    ].forEach(function (line, i) {
      ctx.fillText(line, 26 * K, (330 + i * 13) * K);
    });
    ctx.letterSpacing = "0px";
  }

  function drawMeter(ctx, level, accent) {
    var W = ctx.canvas.width;
    var H = ctx.canvas.height;

    var face = ctx.createLinearGradient(0, 0, 0, H);

    face.addColorStop(0, "#f6efdd");
    face.addColorStop(1, "#ddd2ba");
    ctx.fillStyle = face;
    ctx.fillRect(0, 0, W, H);

    var cx = W / 2;
    var cy = H * 1.28;
    var R = H * 1.06;

    // scale arc
    ctx.strokeStyle = "rgba(25,21,18,0.32)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, -Math.PI * 0.78, -Math.PI * 0.22);
    ctx.stroke();

    // ticks
    for (var i = 0; i <= 12; i++) {
      var t = i / 12;
      var a = -Math.PI * 0.78 + t * Math.PI * 0.56;
      var long = i % 3 === 0;
      var r1 = R - (long ? 15 : 9);
      var hot = t > 0.66;

      ctx.strokeStyle = hot ? accent : "rgba(25,21,18,0.5)";
      ctx.lineWidth = long ? 3 : 1.6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.stroke();
    }

    // numbers
    ctx.fillStyle = "rgba(25,21,18,0.6)";
    ctx.font = "600 13px Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ["-20", "-7", "-3", "0", "+3"].forEach(function (label, i) {
      var t = i / 4;
      var a = -Math.PI * 0.78 + t * Math.PI * 0.56;
      var rr = R - 30;

      ctx.fillStyle = i >= 3 ? accent : "rgba(25,21,18,0.6)";
      ctx.fillText(label, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    });

    // needle
    var na = -Math.PI * 0.78 + level * Math.PI * 0.56;

    ctx.strokeStyle = "#a5210d";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(na) * (R + 4), cy + Math.sin(na) * (R + 4));
    ctx.stroke();

    ctx.fillStyle = "#3a332c";
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(25,21,18,0.5)";
    ctx.font = "600 11px Consolas, monospace";
    ctx.fillText("VU", cx, H - 12);
  }

  /* ---------------------------------------------------------------- API -- */

  var api = {};
  var renderer, scene, camera, root, clock;
  var panelCtx, panelTex, backCtx, backTex, meterCtx, meterTex;
  var mats = {};
  var parts = {};
  var keys = [];
  var reels = [];
  var highlight;
  var colours = { shell: "#c9c2b4", deep: "#8e887b", accent: "#e2632a" };
  var transport = "stopped";
  var level = 0.05;
  var tapePos = 0;
  var keyHandler = null;
  var latched = null;
  var host;

  // camera rig
  var view = { az: -0.5, pol: 0.16, dist: 9.9, tx: 0, ty: 0 };
  var goal = { az: -0.5, pol: 0.16, dist: 9.9, tx: 0, ty: 0 };
  var restAz = -0.5;
  var focused = null;
  var dragging = false;
  var moved = false;
  var last = { x: 0, y: 0 };
  var vel = { az: 0, pol: 0 };
  var idle = 0;

  var FOCUS = {
    window: { az: -0.3, pol: 0.06, dist: 5.4, tx: 0, ty: 0.94 },
    meter: { az: 0.22, pol: -0.12, dist: 4.8, tx: 0, ty: -0.21 },
    keys: { az: -0.18, pol: -0.3, dist: 4.6, tx: 0, ty: -0.92 },
    knob: { az: -0.5, pol: -0.26, dist: 4.2, tx: -1.05, ty: -1.68 },
    ports: { az: 0.1, pol: 0.72, dist: 5.4, tx: 0, ty: 1.9 },
  };

  var HL = {
    window: [0, 0.94, 2.64, 1.28],
    meter: [0, -0.21, 2.64, 0.74],
    keys: [0, -0.92, 2.68, 0.44],
    knob: [-1.05, -1.68, 0.56, 0.56],
    ports: [0, 2.05, 2.2, 0.5],
  };

  api.init = function (el) {
    if (!THREE) return false;

    host = el;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      return false;
    }
    if (!renderer || !renderer.getContext()) return false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.environment = buildEnv(renderer);

    camera = new THREE.PerspectiveCamera(
      30,
      el.clientWidth / el.clientHeight,
      0.1,
      100,
    );

    clock = new THREE.Clock();
    root = new THREE.Group();
    scene.add(root);

    /* lights */
    var key = new THREE.DirectionalLight(0xfff4e2, 2.1);

    key.position.set(4, 6, 7);
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xdfe6ff, 0.55);

    fill.position.set(-6, 2, 4);
    scene.add(fill);

    var rim = new THREE.DirectionalLight(0xffd9b0, 0.9);

    rim.position.set(-3, -2, -6);
    scene.add(rim);

    scene.add(new THREE.AmbientLight(0xffffff, 0.18));

    /* textures */
    var pc = document.createElement("canvas");

    pc.width = MM.w * K;
    pc.height = MM.h * K;
    panelCtx = pc.getContext("2d");
    drawPanel(panelCtx, colours);
    panelTex = new THREE.CanvasTexture(pc);
    panelTex.encoding = THREE.sRGBEncoding;
    panelTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    var bc = document.createElement("canvas");

    bc.width = MM.w * K;
    bc.height = MM.h * K;
    backCtx = bc.getContext("2d");
    drawBack(backCtx, colours);
    backTex = new THREE.CanvasTexture(bc);
    backTex.encoding = THREE.sRGBEncoding;

    var mc = document.createElement("canvas");

    mc.width = 512;
    mc.height = 144;
    meterCtx = mc.getContext("2d");
    drawMeter(meterCtx, 0.1, colours.accent);
    meterTex = new THREE.CanvasTexture(mc);
    meterTex.encoding = THREE.sRGBEncoding;

    /* materials */
    mats.shell = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colours.shell),
      metalness: 0.82,
      roughness: 0.36,
    });
    mats.panel = new THREE.MeshStandardMaterial({
      map: panelTex,
      metalness: 0.55,
      roughness: 0.42,
    });
    mats.back = new THREE.MeshStandardMaterial({
      map: backTex,
      metalness: 0.7,
      roughness: 0.45,
    });
    mats.meter = new THREE.MeshStandardMaterial({
      map: meterTex,
      metalness: 0.05,
      roughness: 0.65,
    });
    mats.glass = new THREE.MeshPhysicalMaterial({
      color: 0x0a0908,
      metalness: 0,
      roughness: 0.06,
      transparent: true,
      opacity: 0.42,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
    });
    mats.key = new THREE.MeshStandardMaterial({
      color: 0xcfc8bb,
      metalness: 0.35,
      roughness: 0.42,
    });
    mats.keyRec = new THREE.MeshStandardMaterial({
      color: 0x9c3a20,
      metalness: 0.3,
      roughness: 0.4,
    });
    mats.dark = new THREE.MeshStandardMaterial({
      color: 0x2a2521,
      metalness: 0.5,
      roughness: 0.5,
    });
    mats.led = new THREE.MeshStandardMaterial({
      color: 0x2a2521,
      emissive: new THREE.Color(colours.accent),
      emissiveIntensity: 0,
      roughness: 0.3,
    });

    /* body */
    var body = new THREE.Mesh(slab(3.0, 4.2, 0.6, 0.16, 0.03), mats.shell);

    root.add(body);
    parts.body = body;

    var panel = new THREE.Mesh(
      new THREE.PlaneGeometry(2.94, 4.14),
      mats.panel,
    );

    panel.position.z = 0.302;
    root.add(panel);

    var back = new THREE.Mesh(new THREE.PlaneGeometry(2.94, 4.14), mats.back);

    back.position.z = -0.302;
    back.rotation.y = Math.PI;
    root.add(back);

    /* reels */
    var wc = mmToWorld(150, 116);

    [-0.94, 0.94].forEach(function (dx, i) {
      var reel = new THREE.Group();

      reel.position.set(dx, wc[1], 0.3);

      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.03, 12, 40),
        mats.dark,
      );

      reel.add(ring);

      var hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.05, 20),
        mats.dark,
      );

      hub.rotation.x = Math.PI / 2;
      reel.add(hub);

      for (var s = 0; s < 3; s++) {
        var spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.028, 0.16, 0.02),
          mats.key,
        );

        spoke.position.y = 0.09;
        var pivot = new THREE.Group();

        pivot.rotation.z = (s / 3) * Math.PI * 2;
        pivot.add(spoke);
        reel.add(pivot);
      }

      // tape pack, grows and shrinks as the tape moves
      var pack = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.045, 28),
        new THREE.MeshStandardMaterial({
          color: 0x3d332b,
          roughness: 0.85,
          metalness: 0.05,
        }),
      );

      pack.rotation.x = Math.PI / 2;
      reel.add(pack);
      reel.userData.pack = pack;
      reel.userData.side = i;

      root.add(reel);
      reels.push(reel);
    });

    // tape span
    var tape = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.11, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x342c25, roughness: 0.9 }),
    );

    tape.position.set(0, wc[1], 0.3);
    root.add(tape);

    // window glass
    var glass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 1.24),
      mats.glass,
    );

    glass.position.set(0, wc[1], 0.322);
    root.add(glass);
    parts.window = glass;

    /* meter */
    var meter = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.72), mats.meter);
    var mwc = mmToWorld(150, 231);

    meter.position.set(0, mwc[1], 0.306);
    root.add(meter);
    parts.meter = meter;

    /* transport keys */
    var keyDefs = [
      { id: "rew", x: -1.08 },
      { id: "play", x: -0.54 },
      { id: "fwd", x: 0 },
      { id: "stop", x: 0.54 },
      { id: "rec", x: 1.08 },
    ];
    var keyY = mmToWorld(0, 302)[1];

    keyDefs.forEach(function (d) {
      var mesh = new THREE.Mesh(
        slab(0.46, 0.38, 0.09, 0.05, 0.012),
        d.id === "rec" ? mats.keyRec : mats.key,
      );

      mesh.position.set(d.x, keyY, 0.335);
      mesh.userData.key = d.id;
      mesh.userData.rest = 0.335;
      root.add(mesh);
      keys.push(mesh);

      // Glyph on the key top. Drawn white so the material colour can tint it,
      // which is how a latched key turns amber without a second texture.
      var g = document.createElement("canvas");

      g.width = 128;
      g.height = 106;
      var gx = g.getContext("2d");

      gx.fillStyle = "#ffffff";

      function tri(x1, x2) {
        // a triangle spanning x1 to x2, pointing whichever way they order it
        gx.beginPath();
        gx.moveTo(x1, 28);
        gx.lineTo(x2, 53);
        gx.lineTo(x1, 78);
        gx.closePath();
        gx.fill();
      }

      if (d.id === "play") {
        tri(47, 85);
      } else if (d.id === "rew") {
        tri(64, 38);
        tri(90, 64);
      } else if (d.id === "fwd") {
        tri(38, 64);
        tri(64, 90);
      } else if (d.id === "stop") {
        gx.fillRect(47, 36, 34, 34);
      } else {
        gx.beginPath();
        gx.arc(64, 53, 18, 0, Math.PI * 2);
        gx.fill();
      }

      var gTex = new THREE.CanvasTexture(g);

      gTex.encoding = THREE.sRGBEncoding;

      var glyphMat = new THREE.MeshBasicMaterial({
        map: gTex,
        transparent: true,
        opacity: 0.95,
        color: new THREE.Color(d.id === "rec" ? 0xf6e6d6 : 0x3a332c),
      });

      var glyph = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.33),
        glyphMat,
      );

      glyph.position.set(d.x, keyY, 0.382);
      glyph.userData.base = d.id === "rec" ? 0xf6e6d6 : 0x3a332c;
      root.add(glyph);
      mesh.userData.glyph = glyph;
    });

    /* knob */
    var knobY = mmToWorld(0, 380)[1];
    var knob = new THREE.Group();

    knob.position.set(-1.05, knobY, 0.3);

    var knobBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.19, 0.13, 28),
      new THREE.MeshStandardMaterial({
        color: 0x4d463f,
        metalness: 0.9,
        roughness: 0.3,
      }),
    );

    knobBody.rotation.x = Math.PI / 2;
    knobBody.position.z = 0.065;
    knob.add(knobBody);

    var mark = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.11, 0.02),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(colours.accent),
        emissive: new THREE.Color(colours.accent),
        emissiveIntensity: 0.4,
      }),
    );

    mark.position.set(0, 0.09, 0.132);
    knob.add(mark);
    knob.userData.mark = mark;
    root.add(knob);
    parts.knob = knob;

    /* LEDs */
    var leds = [];

    [0.05, 0.28, 0.51].forEach(function (x, i) {
      var led = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 16, 12),
        i === 0
          ? mats.led
          : new THREE.MeshStandardMaterial({
              color: 0x2a2521,
              roughness: 0.4,
            }),
      );

      led.position.set(x, knobY, 0.32);
      root.add(led);
      leds.push(led);
    });
    parts.leds = leds;

    /* top edge ports */
    var portMat = new THREE.MeshStandardMaterial({
      color: 0x1c1815,
      metalness: 0.6,
      roughness: 0.4,
    });
    var portGroup = new THREE.Group();

    [-0.72, 0.0].forEach(function (x) {
      var shellRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.19, 0.1, 24),
        new THREE.MeshStandardMaterial({
          color: 0x3c352f,
          metalness: 0.85,
          roughness: 0.28,
        }),
      );

      shellRing.position.set(x, 2.1, 0);
      portGroup.add(shellRing);

      var hole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.12, 20),
        portMat,
      );

      hole.position.set(x, 2.105, 0);
      portGroup.add(hole);
    });

    var dial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.1, 22),
      new THREE.MeshStandardMaterial({
        color: 0x5a524a,
        metalness: 0.9,
        roughness: 0.25,
      }),
    );

    dial.position.set(0.78, 2.1, 0);
    portGroup.add(dial);
    root.add(portGroup);
    parts.ports = portGroup;

    /* highlight frame used by the anatomy list */
    var hlGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1));

    highlight = new THREE.LineSegments(
      hlGeo,
      new THREE.LineBasicMaterial({
        color: new THREE.Color(colours.accent),
        transparent: true,
        opacity: 0,
      }),
    );
    highlight.position.z = 0.42;
    root.add(highlight);

    bindPointer(el);
    window.addEventListener("resize", resize);
    resize();
    animate();

    return true;
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

  /* -------------------------------------------------------------- input -- */

  function bindPointer(el) {
    var ray = new THREE.Raycaster();
    var ndc = new THREE.Vector2();

    el.addEventListener("pointerdown", function (e) {
      dragging = true;
      moved = false;
      last.x = e.clientX;
      last.y = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
      idle = 0;
    });

    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - last.x;
      var dy = e.clientY - last.y;

      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      goal.az -= dx * 0.007;
      goal.pol = clamp(goal.pol + dy * 0.006, -1.1, 1.1);
      vel.az = -dx * 0.004;
      vel.pol = dy * 0.003;
      last.x = e.clientX;
      last.y = e.clientY;
    });

    function up(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");

      if (moved) return;

      // a click, not a drag: test the transport keys
      var r = el.getBoundingClientRect();

      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      var hits = ray.intersectObjects(keys, false);

      if (hits.length && keyHandler) keyHandler(hits[0].object.userData.key);
    }

    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", function () {
      dragging = false;
      el.classList.remove("is-dragging");
    });

    el.addEventListener("keydown", function (e) {
      var step = 0.22;

      if (e.key === "ArrowLeft") goal.az += step;
      else if (e.key === "ArrowRight") goal.az -= step;
      else if (e.key === "ArrowUp") goal.pol = clamp(goal.pol - step, -1.1, 1.1);
      else if (e.key === "ArrowDown") goal.pol = clamp(goal.pol + step, -1.1, 1.1);
      else return;
      e.preventDefault();
      idle = 0;
    });
  }

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  /* -------------------------------------------------------------- public -- */

  api.setColour = function (c) {
    colours = { shell: c.shell, deep: c.deep, accent: c.accent };
    if (!renderer) return;
    mats.shell.color.set(colours.shell);
    mats.led.emissive.set(colours.accent);
    highlight.material.color.set(colours.accent);
    parts.knob.userData.mark.material.color.set(colours.accent);
    parts.knob.userData.mark.material.emissive.set(colours.accent);
    drawPanel(panelCtx, colours);
    drawBack(backCtx, colours);
    panelTex.needsUpdate = true;
    backTex.needsUpdate = true;
  };

  api.setTransport = function (state) {
    transport = state;
    // stop pops every key back up, exactly like the real transport
    latched = state === "stopped" ? null : state;
    if (!renderer) return;
    mats.led.emissiveIntensity =
      state === "rec" ? 2.4 : state === "stopped" ? 0.15 : 1;
  };

  api.getTransport = function () {
    return transport;
  };

  api.focusPart = function (name) {
    focused = name && FOCUS[name] ? name : null;
    if (!renderer) return;
    var g = focused ? FOCUS[focused] : { az: restAz, pol: 0.16, dist: 9.9, tx: 0, ty: 0 };

    goal.az = g.az;
    goal.pol = g.pol;
    goal.dist = g.dist;
    goal.tx = g.tx;
    goal.ty = g.ty;
    idle = 0;
  };

  api.onKeyPress = function (fn) {
    keyHandler = fn;
  };

  api.pressKey = function (id) {
    keys.forEach(function (k) {
      if (k.userData.key === id) k.userData.press = 1;
    });
  };

  /* --------------------------------------------------------------- loop -- */

  function animate() {
    requestAnimationFrame(animate);
    if (!renderer) return;

    var dt = Math.min(clock.getDelta(), 0.05);

    /* camera easing */
    if (!dragging) {
      goal.az += vel.az;
      goal.pol = clamp(goal.pol + vel.pol, -1.1, 1.1);
      vel.az *= 0.9;
      vel.pol *= 0.9;
      if (Math.abs(vel.az) < 0.0004) vel.az = 0;
      if (Math.abs(vel.pol) < 0.0004) vel.pol = 0;

      idle += dt;
      if (!focused && vel.az === 0 && idle > 1.6) {
        // slow sway once the object has been left alone
        goal.az += (restAz + Math.sin(clock.elapsedTime * 0.25) * 0.22 - goal.az) * 0.012;
        goal.pol += (0.16 + Math.cos(clock.elapsedTime * 0.19) * 0.06 - goal.pol) * 0.012;
      }
    }

    view.az += (goal.az - view.az) * 0.09;
    view.pol += (goal.pol - view.pol) * 0.09;
    view.dist += (goal.dist - view.dist) * 0.06;
    view.tx += (goal.tx - view.tx) * 0.07;
    view.ty += (goal.ty - view.ty) * 0.07;

    camera.position.set(
      view.tx + Math.sin(view.az) * Math.cos(view.pol) * view.dist,
      view.ty + Math.sin(view.pol) * view.dist,
      Math.cos(view.az) * Math.cos(view.pol) * view.dist,
    );
    camera.lookAt(view.tx, view.ty, 0);

    /* transport */
    var speed =
      transport === "play" || transport === "rec"
        ? 1
        : transport === "fwd"
          ? 5
          : transport === "rew"
            ? -5
            : 0;

    tapePos = clamp(tapePos + speed * dt * 0.012, 0, 1);
    if (tapePos >= 1 && speed > 0) api.setTransport("stopped");
    if (tapePos <= 0 && speed < 0) api.setTransport("stopped");

    reels.forEach(function (reel) {
      reel.rotation.z -= speed * dt * (reel.userData.side === 0 ? 2.6 : 2.1);
      var fill = reel.userData.side === 0 ? 1 - tapePos : tapePos;
      var r = 0.075 + fill * 0.095;

      reel.userData.pack.scale.set(r / 0.16, 1, r / 0.16);
    });

    /* VU level */
    var target =
      transport === "rec"
        ? 0.55 + Math.random() * 0.42
        : transport === "play"
          ? 0.42 + Math.random() * 0.34
          : transport === "stopped"
            ? 0.03
            : 0.12 + Math.random() * 0.1;

    level += (target - level) * (target > level ? 0.4 : 0.12);
    drawMeter(meterCtx, clamp(level, 0, 1), colours.accent);
    meterTex.needsUpdate = true;

    /* keys: a tap dips, the active one stays latched down */
    keys.forEach(function (k) {
      var u = k.userData;

      if (u.press) u.press = Math.max(0, u.press - dt * 5);

      var want = (u.key === latched ? 0.062 : 0) + Math.min(u.press || 0, 1) * 0.03;

      u.depth = (u.depth || 0) + (want - (u.depth || 0)) * 0.25;
      k.position.z = u.rest - u.depth;

      if (u.glyph) {
        u.glyph.position.z = 0.382 - u.depth;
        var lit = u.key === latched;
        var wantCol = lit
          ? u.key === "rec"
            ? 0xffffff
            : 0xd0521f
          : u.glyph.userData.base;

        u.glyph.material.color.lerp(new THREE.Color(wantCol), 0.2);
      }
    });

    /* knob follows the level, because the dial is the gain trim */
    parts.knob.rotation.z = -level * 2.2 + 1.1;

    /* highlight frame */
    var hlMat = highlight.material;

    if (focused && HL[focused]) {
      var h = HL[focused];

      highlight.position.set(h[0], h[1], focused === "ports" ? 0 : 0.42);
      highlight.scale.set(h[2], h[3], 1);
      highlight.rotation.x = focused === "ports" ? -Math.PI / 2 : 0;
      hlMat.opacity += (0.9 - hlMat.opacity) * 0.12;
    } else {
      hlMat.opacity += (0 - hlMat.opacity) * 0.14;
    }

    renderer.render(scene, camera);
  }

  return api;
})();
