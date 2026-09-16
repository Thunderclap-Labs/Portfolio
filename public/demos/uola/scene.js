/* UOLA / hold viewer
   One resin hold on a section of wall panel. The blob is an icosahedron pushed
   about by a few sine waves and then flattened at the back, which is close
   enough to how a hold is actually shaped: fat at the front, flat where it
   meets the ply, one bolt through the middle. */

var UolaHold = (function () {
  "use strict";

  var renderer, scene, camera, clock, hold, group;
  var live = false;
  var spin = 0.6;
  var spinTarget = 0.6;
  var vel = 0;
  var lastT = 0;
  var wanted = new THREE.Color(0xffd400);

  function speckle() {
    var c = document.createElement("canvas");

    c.width = c.height = 256;

    var x = c.getContext("2d");

    x.fillStyle = "#ffffff";
    x.fillRect(0, 0, 256, 256);

    // resin holds are full of grit, and the grit is what catches the light
    for (var i = 0; i < 2600; i++) {
      var r = 0.6 + ((i * 37) % 11) * 0.12;
      var px = (i * 97.3) % 256;
      var py = (i * 53.7) % 256;

      x.fillStyle = i % 3 ? "rgba(0,0,0,0.32)" : "rgba(255,255,255,0.5)";
      x.beginPath();
      x.arc(px, py, r, 0, Math.PI * 2);
      x.fill();
    }

    var t = new THREE.CanvasTexture(c);

    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);

    return t;
  }

  /* The room the hold is standing in, as far as reflections are concerned: a
     dark hall with a run of ceiling strip lights and a pale floor. */
  function gymEnv() {
    var c = document.createElement("canvas");

    c.width = 256;
    c.height = 128;

    var x = c.getContext("2d");
    var g = x.createLinearGradient(0, 0, 0, 128);

    g.addColorStop(0, "#3a3d42");
    g.addColorStop(0.46, "#212329");
    g.addColorStop(0.54, "#15161a");
    g.addColorStop(1, "#4a4740");
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 128);

    // ceiling strips
    for (var i = 0; i < 4; i++) {
      x.fillStyle = "rgba(255,250,238,0.92)";
      x.fillRect(18 + i * 60, 12, 34, 7);
    }

    var t = new THREE.CanvasTexture(c);

    t.mapping = THREE.EquirectangularReflectionMapping;

    return t;
  }

  function plywood() {
    var c = document.createElement("canvas");

    c.width = c.height = 512;

    var x = c.getContext("2d");

    x.fillStyle = "#2b2a22";
    x.fillRect(0, 0, 512, 512);

    for (var i = 0; i < 90; i++) {
      x.strokeStyle = "rgba(255,255,255," + (0.012 + (i % 5) * 0.006) + ")";
      x.lineWidth = 1 + (i % 3);
      x.beginPath();
      x.moveTo(0, i * 6 + Math.sin(i) * 3);
      x.bezierCurveTo(160, i * 6 + 10, 340, i * 6 - 12, 512, i * 6 + 4);
      x.stroke();
    }

    var t = new THREE.CanvasTexture(c);

    // canvas textures are linear unless you say otherwise, and the ply comes
    // out looking like cardboard if you do not
    t.encoding = THREE.sRGBEncoding;

    return t;
  }

  /* the counterbore, in units of the hold. The floor is wider than the bolt
     head so there is a visible shoulder around it */
  var FLOOR_R = 0.26;
  var FLOOR_D = 0.16;
  var WALL = 10;
  var BOLT_R = 0.19;
  var BOLT_H = 0.16;

  var boltPoint = null;
  var boltAxis = null;

  function onSphere(theta, phi, out) {
    return out.set(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    );
  }

  /* The hold itself, before anything is cut into it.

     A moulded resin hold is a fairly disciplined object: wide, low, flat at
     the back, with one clear edge you pull on and a rounded shoulder above it.
     The noise here is deliberately small. Turned up it stops reading as a
     moulded part and starts reading as a blob, which is what it was doing. */
  function shape(v) {
    var n =
      0.065 * Math.sin(v.x * 2.4 + 0.4) +
      0.05 * Math.sin(v.y * 3.1 - 1.1) +
      0.035 * Math.sin(v.z * 2.6 + 2.2);

    v.multiplyScalar(1 + n);

    // wide, low, and not very deep
    v.x *= 1.42;
    v.y *= 0.78;
    v.z *= 0.95;

    // Flatten the top into a shoulder. A dome has nothing to stand a foot on
    // and reads as an egg from every angle.
    if (v.y > 0.22) v.y = 0.22 + (v.y - 0.22) * 0.5;

    /* The incut. Below the mid line the face rolls back toward the wall, so
       the front edge stands proud of it and there is somewhere for fingers to
       go. Without this the hold is a dome and has no edge at all. */
    if (v.y < -0.12) {
      var t = Math.min(1, (-0.12 - v.y) / 0.52);

      v.z -= t * t * 0.42;
      v.x *= 1 - t * 0.06;
    }

    /* Flat back, applied last. Run before the incut and the tuck punches
       through the mounting face. */
    if (v.z < -0.42) v.z = -0.42;

    return v;
  }

  /* Where the bolt goes, and which way it points.

     Square to the wall, straight down +Z. The T nut is fixed in the panel, so
     that is the only direction a bolt can physically go. Taking the axis from
     the lumpy surface normal instead, as this did, tilted the bore off to one
     side: the recess came out on the shoulder of the hold, the head sat half
     sunk and half proud, and the rim tore open as the hold turned. */
  function boltFrame() {
    if (boltAxis) return;

    var p = new THREE.Vector3(0, 0, 1);

    shape(p);

    boltAxis = new THREE.Vector3(0, 0, 1);
    // Held on the axis: shape() can nudge x and y off centre, and a bore that
    // is a hair off centre is a bore with a crescent shaped shoulder.
    boltPoint = new THREE.Vector3(0, 0, p.z);
  }

  /* Cut the recess in that frame. Clamping the axial offset only ever removes
     material, so where the blob already falls away below the floor nothing
     happens and no step appears at the rim. */
  var cbD = new THREE.Vector3();
  var cbP = new THREE.Vector3();

  function counterbore(v) {
    var ax = cbD.copy(v).sub(boltPoint).dot(boltAxis);

    cbP.copy(v).sub(boltPoint).addScaledVector(boltAxis, -ax);

    var rad = cbP.length();
    var limit =
      rad <= FLOOR_R ? -FLOOR_D : -FLOOR_D + (rad - FLOOR_R) * WALL;

    if (ax > limit) {
      v.copy(boltPoint).addScaledVector(boltAxis, limit).add(cbP);
    }
  }

  function buildHold() {
    /* a sphere rather than an icosahedron: it is indexed, so recomputing the
       normals after pushing the vertices about gives a smooth surface instead
       of a bag of triangles */
    var geo = new THREE.SphereGeometry(1, 64, 44);
    var pos = geo.attributes.position;
    var v = new THREE.Vector3();

    boltFrame();

    for (var i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      shape(v);
      counterbore(v);
      pos.setXYZ(i, v.x, v.y, v.z);
    }

    geo.computeVertexNormals();

    return geo;
  }

  function init(canvas) {
    if (!window.THREE) return false;

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    } catch (e) {
      return false;
    }

    if (!renderer.getContext()) return false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    // Untonemapped, the saturated tape colours clipped flat and the hold read
    // as coloured plastic with no shading left in the highlight.
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x1c1c16, 1);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
    camera.position.set(0, 0.28, 5.3);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x2a2a22, 0.5));

    /* A gym is lit from overhead, so the key comes from high and slightly off
       to one side. It casts, which is what puts the hold onto the ply rather
       than in front of it, and drops the shadow line into the incut. */
    var key = new THREE.DirectionalLight(0xfff4e2, 2.4);

    key.position.set(-3.2, 4.4, 4.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -3;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 16;
    key.shadow.bias = -0.0012;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 2.5;
    scene.add(key);

    var rim = new THREE.DirectionalLight(0x8fb4ff, 1.15);

    rim.position.set(4, 1, -3);
    scene.add(rim);

    // A short warm bounce off the floor, so the underside of the incut is dark
    // rather than black and the edge still reads.
    var bounce = new THREE.DirectionalLight(0xffd9a8, 0.45);

    bounce.position.set(0.5, -3, 2.5);
    scene.add(bounce);

    // Somewhere for the bolt head and the resin sheen to reflect.
    var pm = new THREE.PMREMGenerator(renderer);

    pm.compileEquirectangularShader();
    scene.environment = pm.fromEquirectangular(gymEnv()).texture;

    group = new THREE.Group();
    scene.add(group);

    // the sheet of ply behind it
    var panel = new THREE.Mesh(
      new THREE.BoxGeometry(11, 9, 0.35),
      new THREE.MeshStandardMaterial({
        map: plywood(),
        roughness: 0.92,
        metalness: 0,
      }),
    );

    // Front face of the ply sits just behind the flat back of the hold. It was
    // at -0.605, leaving the hold floating about 0.19 off the wall.
    panel.position.z = -0.6;
    panel.receiveShadow = true;
    group.add(panel);

    // the T nut it bolts into
    var tnut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.08, 20),
      new THREE.MeshStandardMaterial({
        color: 0x8a8a80,
        metalness: 0.9,
        roughness: 0.4,
      }),
    );

    tnut.rotation.x = Math.PI / 2;
    tnut.position.z = -0.47;
    group.add(tnut);

    /* Polyurethane hold: matte body with a faint sheen off the mould, and grit
       through it. The grit drives a bump as well as roughness, because on the
       real thing you see the grain catch the light, not just scatter it. */
    var grit = speckle();

    hold = new THREE.Mesh(
      buildHold(),
      new THREE.MeshStandardMaterial({
        color: 0xffd400,
        roughness: 0.78,
        metalness: 0.0,
        roughnessMap: grit,
        bumpMap: grit,
        bumpScale: 0.012,
        envMapIntensity: 0.35,
        flatShading: false,
      }),
    );
    hold.castShadow = true;
    hold.receiveShadow = true;
    group.add(hold);

    // the bolt head, sitting on the floor of the counterbore
    var bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(BOLT_R, BOLT_R, BOLT_H, 6),
      new THREE.MeshStandardMaterial({
        color: 0x55554c,
        metalness: 0.95,
        roughness: 0.32,
      }),
    );

    /* down the bore rather than down Z, and set so the head finishes just under
       the lip of the recess: base a shade below the floor so no gap opens up */
    bolt.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), boltAxis);
    bolt.position.copy(boltPoint).addScaledVector(boltAxis, -FLOOR_D + BOLT_H / 2 - 0.02);
    bolt.castShadow = true;
    group.add(bolt);

    /* Washer under the head. Every bolted hold has one, and it gives the
       recess a bright ring so the head does not sit in a black hole. */
    var washer = new THREE.Mesh(
      new THREE.CylinderGeometry(FLOOR_R * 0.92, FLOOR_R * 0.92, 0.03, 28),
      new THREE.MeshStandardMaterial({
        color: 0x9a9a90,
        metalness: 0.92,
        roughness: 0.34,
      }),
    );

    washer.quaternion.copy(bolt.quaternion);
    washer.position.copy(boltPoint).addScaledVector(boltAxis, -FLOOR_D + 0.015);
    group.add(washer);

    clock = new THREE.Clock();
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

  function bind(canvas) {
    var dragging = false;
    var lastX = 0;

    canvas.addEventListener("pointerdown", function (e) {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      spinTarget += (e.clientX - lastX) * 0.01;
      vel = (e.clientX - lastX) * 0.004;
      lastX = e.clientX;
    });

    function up() {
      dragging = false;
    }

    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
  }

  function tick() {
    if (!live) return;
    requestAnimationFrame(tick);

    var t = clock.getElapsedTime();
    var dt = Math.min(0.05, t - lastT);

    lastT = t;

    vel *= 0.94;
    if (Math.abs(vel) > 0.0005) {
      spinTarget += vel;
    } else {
      spinTarget += (0.6 + Math.sin(t * 0.24) * 0.5 - spinTarget) * 0.008;
    }

    spin += (spinTarget - spin) * (1 - Math.exp(-dt * 7));
    group.rotation.y = spin;
    group.rotation.x = Math.sin(t * 0.31) * 0.06;

    hold.material.color.lerp(wanted, 1 - Math.exp(-dt * 6));

    renderer.render(scene, camera);
  }

  return {
    init: init,
    setColour: function (hex) {
      wanted = new THREE.Color(hex);
    },
  };
})();
