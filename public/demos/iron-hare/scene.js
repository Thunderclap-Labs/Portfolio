/* IRON HARE / Three.js bottle
   -------------------------------------------------------------------------
   One bottle, turned on a lathe profile, in real transmissive glass so the
   brass and the sunburst behind it refract through the shoulder. The liquid
   is a second, slightly smaller lathe inside the first.

   Exposed as window.HareScene:
     init(el)          -> boolean
     setLiquid(hex)    -> recolour the spirit
     setLabel(a, b)    -> two lines of label text
   ------------------------------------------------------------------------- */

window.HareScene = (function () {
  "use strict";

  var THREE = window.THREE;

  var api = {};
  var renderer, scene, camera, clock, host, group;
  var liquid, labelMat, labelCanvas, labelCtx;
  var spin = 0.5;
  var spinTarget = 0.5;
  var vel = 0;
  var dragging = false;
  var lastX = 0;

  var BRASS = 0xc9a227;
  var CREAM = 0xf3ead6;

  /* bottle profile in millimetres, read bottom to top */
  var PROFILE = [
    [0, 0],
    [34, 0],
    [34, 6],
    [35, 10],
    [35, 96],
    [33, 108],
    [22, 128],
    [12, 142],
    [11, 168],
    [13, 172],
    [13, 180],
  ];

  function lathe(points, inset, seg) {
    var pts = points.map(function (p) {
      return new THREE.Vector2(
        Math.max(0.001, (p[0] - (inset || 0)) * 0.01),
        p[1] * 0.01,
      );
    });

    return new THREE.LatheGeometry(pts, seg || 64);
  }

  function labelTexture() {
    labelCanvas = document.createElement("canvas");
    labelCanvas.width = 1024;
    labelCanvas.height = 512;
    labelCtx = labelCanvas.getContext("2d");

    return new THREE.CanvasTexture(labelCanvas);
  }

  function drawLabel(a, b) {
    var g = labelCtx;
    var W = 1024;
    var H = 512;

    g.clearRect(0, 0, W, H);

    // paper
    g.fillStyle = "#f3ead6";
    g.fillRect(0, 0, W, H);

    // deco frame
    g.strokeStyle = "#0e2019";
    g.lineWidth = 8;
    g.strokeRect(26, 26, W - 52, H - 52);
    g.lineWidth = 3;
    g.strokeRect(46, 46, W - 92, H - 92);

    // stepped corners
    g.fillStyle = "#c9a227";
    [
      [46, 46],
      [W - 46, 46],
      [46, H - 46],
      [W - 46, H - 46],
    ].forEach(function (c, i) {
      var sx = i % 2 ? -1 : 1;
      var sy = i < 2 ? 1 : -1;

      g.fillRect(c[0], c[1], sx * 54, sy * 10);
      g.fillRect(c[0], c[1], sx * 10, sy * 54);
    });

    // sunburst behind the name
    g.save();
    g.translate(W / 2, 176);
    for (var r = 0; r < 22; r++) {
      g.rotate((Math.PI * 2) / 22);
      g.fillStyle = r % 2 ? "rgba(201,162,39,0.5)" : "rgba(14,32,25,0.1)";
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(-14, -132);
      g.lineTo(14, -132);
      g.closePath();
      g.fill();
    }
    g.restore();

    g.textAlign = "center";
    g.fillStyle = "#0e2019";
    g.font = '700 40px "Bodoni MT","Baskerville Old Face",Georgia,serif';
    g.letterSpacing = "16px";
    g.fillText("IRON HARE", W / 2, 150);
    g.letterSpacing = "0px";

    g.font = '400 21px "Bodoni MT",Georgia,serif';
    g.fillStyle = "#3d5148";
    g.letterSpacing = "8px";
    g.fillText("DISTILLED IN KAUNAS", W / 2, 196);
    g.letterSpacing = "0px";

    g.fillStyle = "#0e2019";
    g.fillRect(W / 2 - 190, 226, 380, 3);

    g.font = '700 62px "Bodoni MT","Baskerville Old Face",Georgia,serif';
    g.fillText(a || "LONDON DRY", W / 2, 300);

    g.font = '400 26px "Bodoni MT",Georgia,serif';
    g.fillStyle = "#6b2231";
    g.letterSpacing = "6px";
    g.fillText(b || "JUNIPER  ANGELICA  ORRIS", W / 2, 348);
    g.letterSpacing = "0px";

    g.fillStyle = "#0e2019";
    g.fillRect(W / 2 - 120, 376, 240, 2);

    g.font = '400 24px "Bodoni MT",Georgia,serif';
    g.letterSpacing = "5px";
    g.fillText("44.2% ABV      70 CL", W / 2, 420);
    g.letterSpacing = "0px";
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      28,
      el.clientWidth / el.clientHeight,
      0.1,
      60,
    );
    camera.position.set(0, 0.26, 5.15);
    camera.lookAt(0, 0.02, 0);
    clock = new THREE.Clock();

    /* environment: a warm room with two bright strips for the glass to catch */
    var c = document.createElement("canvas");

    c.width = 512;
    c.height = 256;
    var g = c.getContext("2d");
    var grd = g.createLinearGradient(0, 0, 0, 256);

    grd.addColorStop(0, "#3b4a42");
    grd.addColorStop(0.5, "#17281f");
    grd.addColorStop(1, "#080f0c");
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 256);
    /* two tall softboxes and a warm one. A bottle reads as glass because of
       the long vertical highlights running down its shoulders, so the room has
       to contain long vertical sources for it to catch. */
    g.fillStyle = "rgba(255,250,238,0.98)";
    g.fillRect(64, 8, 30, 240);
    g.fillStyle = "rgba(255,246,224,0.7)";
    g.fillRect(48, 8, 62, 240);
    g.fillStyle = "rgba(255,255,255,0.92)";
    g.fillRect(292, 24, 18, 210);
    g.fillStyle = "rgba(255,244,214,0.55)";
    g.fillRect(276, 24, 52, 210);
    g.fillStyle = "rgba(201,162,39,0.85)";
    g.fillRect(408, 60, 74, 90);
    g.fillStyle = "rgba(255,244,214,0.9)";
    g.fillRect(180, 4, 150, 26);

    var envTex = new THREE.CanvasTexture(c);

    envTex.mapping = THREE.EquirectangularReflectionMapping;
    var pm = new THREE.PMREMGenerator(renderer);

    pm.compileEquirectangularShader();
    scene.environment = pm.fromEquirectangular(envTex).texture;
    pm.dispose();
    envTex.dispose();

    var key = new THREE.DirectionalLight(0xfff3d8, 2.1);

    key.position.set(4, 6, 5);
    scene.add(key);

    var rim = new THREE.DirectionalLight(0xc9a227, 1.9);

    rim.position.set(-5, 2, -4);
    scene.add(rim);

    // back light, the one that actually makes the spirit glow
    var back = new THREE.DirectionalLight(0xfff6e2, 1.5);

    back.position.set(-1.5, 1.2, -6);
    scene.add(back);

    scene.add(new THREE.AmbientLight(0xffffff, 0.16));

    group = new THREE.Group();
    group.position.y = -0.9;
    scene.add(group);

    /* the spirit inside, filled to the shoulder */
    var liquidProfile = PROFILE.filter(function (p) {
      return p[1] <= 120;
    });

    // close the top so there is a surface to catch the light, not an open tube

    liquid = new THREE.Mesh(
      lathe(liquidProfile.concat([[30, 120], [0.1, 120]]), 2.5, 48),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.92,
        thickness: 1.35,
        roughness: 0.05,
        ior: 1.34,
        metalness: 0,
        transparent: true,
        envMapIntensity: 1.2,
        attenuationColor: new THREE.Color(0xd8b46a),
        attenuationDistance: 0.85,
      }),
    );
    group.add(liquid);

    /* the glass */
    var glass = new THREE.Mesh(
      lathe(PROFILE, 0, 72),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 1,
        thickness: 1.15,
        roughness: 0.028,
        ior: 1.5,
        metalness: 0,
        transparent: true,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.6,
        specularIntensity: 1,
        // the green is the depth of the glass, not a coat of paint on it
        attenuationColor: new THREE.Color(0x2f6b4c),
        attenuationDistance: 1.15,
        side: THREE.DoubleSide,
      }),
    );

    group.add(glass);

    /* brass cap and collar */
    var cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.15, 0.24, 40),
      new THREE.MeshStandardMaterial({
        color: BRASS,
        metalness: 1,
        roughness: 0.22,
      }),
    );

    cap.position.y = 1.86;
    group.add(cap);

    for (var f = 0; f < 30; f++) {
      var a = (f / 30) * Math.PI * 2;
      var knurl = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.2, 0.02),
        new THREE.MeshStandardMaterial({
          color: 0xa8871c,
          metalness: 1,
          roughness: 0.3,
        }),
      );

      knurl.position.set(Math.cos(a) * 0.161, 1.86, Math.sin(a) * 0.161);
      knurl.rotation.y = -a;
      group.add(knurl);
    }

    var collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.135, 0.02, 10, 40),
      new THREE.MeshStandardMaterial({
        color: BRASS,
        metalness: 1,
        roughness: 0.28,
      }),
    );

    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.72;
    group.add(collar);

    /* the label, wrapped on a partial cylinder */
    var labelTex = labelTexture();

    drawLabel();
    labelTex.encoding = THREE.sRGBEncoding;
    labelMat = new THREE.MeshStandardMaterial({
      map: labelTex,
      roughness: 0.78,
      metalness: 0,
    });

    var label = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.353,
        0.353,
        0.66,
        48,
        1,
        true,
        -Math.PI * 0.3,
        Math.PI * 0.6,
      ),
      labelMat,
    );

    label.position.y = 0.6;
    // cancels the idle spin so the label sits square to the camera at rest
    label.rotation.y = -0.5;
    group.add(label);
    api._label = label;

    /* a soft contact shadow, so the bottle sits on something */
    var sh = document.createElement("canvas");

    sh.width = sh.height = 256;

    var sg = sh.getContext("2d");
    var srad = sg.createRadialGradient(128, 128, 0, 128, 128, 128);

    srad.addColorStop(0, "rgba(8,16,12,0.62)");
    srad.addColorStop(0.45, "rgba(8,16,12,0.28)");
    srad.addColorStop(1, "rgba(8,16,12,0)");
    sg.fillStyle = srad;
    sg.fillRect(0, 0, 256, 256);

    var shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.1),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(sh),
        transparent: true,
        depthWrite: false,
      }),
    );

    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.004, 0.05);
    group.add(shadow);

    /* a deco sunburst plate behind, seen through the glass */
    var burst = document.createElement("canvas");

    burst.width = 512;
    burst.height = 512;
    var bg = burst.getContext("2d");

    bg.fillStyle = "#08130e";
    bg.fillRect(0, 0, 512, 512);
    bg.save();
    bg.translate(256, 256);
    for (var r2 = 0; r2 < 36; r2++) {
      bg.rotate((Math.PI * 2) / 36);
      bg.fillStyle = r2 % 2 ? "#0c1a13" : "#07110c";
      bg.beginPath();
      bg.moveTo(0, 0);
      bg.lineTo(-30, -400);
      bg.lineTo(30, -400);
      bg.closePath();
      bg.fill();
    }
    bg.restore();
    bg.strokeStyle = "rgba(201,162,39,0.34)";
    bg.lineWidth = 4;
    [90, 150, 210].forEach(function (rr) {
      bg.beginPath();
      bg.arc(256, 256, rr, 0, Math.PI * 2);
      bg.stroke();
    });

    var burstTex = new THREE.CanvasTexture(burst);

    // without this the canvas is read as linear and the backdrop comes out
    // two stops brighter than it was drawn
    burstTex.encoding = THREE.sRGBEncoding;

    var plate = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 5.6),
      new THREE.MeshBasicMaterial({ map: burstTex }),
    );

    plate.position.set(0, 0.1, -5.2);
    scene.add(plate);

    /* input */
    el.addEventListener("pointerdown", function (e) {
      dragging = true;
      lastX = e.clientX;
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-drag");
    });
    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      spinTarget += (e.clientX - lastX) * 0.009;
      vel = (e.clientX - lastX) * 0.004;
      lastX = e.clientX;
    });
    function up() {
      dragging = false;
      el.classList.remove("is-drag");
    }
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);

    window.addEventListener("resize", resize);
    resize();
    animate();

    return true;
  };

  api.setLiquid = function (hex) {
    if (!liquid) return;
    liquid.material.color.set(hex);
    liquid.material.attenuationColor.set(hex);
  };

  api.setLabel = function (a, b) {
    if (!labelCtx) return;
    drawLabel(a, b);
    labelMat.map.needsUpdate = true;
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

  function animate() {
    requestAnimationFrame(animate);
    if (!renderer) return;

    var t = clock.getElapsedTime();

    if (!dragging) {
      spinTarget += vel;
      vel *= 0.94;
      if (Math.abs(vel) < 0.0004) vel = 0;
      // settle so the label always drifts back to face the room
      if (vel === 0) spinTarget += (0.5 + Math.sin(t * 0.22) * 0.32 - spinTarget) * 0.01;
    }
    spin += (spinTarget - spin) * 0.08;
    group.rotation.y = spin;
    group.position.y = -0.9 + Math.sin(t * 0.5) * 0.02;

    renderer.render(scene, camera);
  }

  return api;
})();
