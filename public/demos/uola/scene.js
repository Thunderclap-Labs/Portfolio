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

  // the lumpy blob itself, before anything is cut into it
  function shape(v) {
    var n =
      0.16 * Math.sin(v.x * 2.1 + 0.4) +
      0.13 * Math.sin(v.y * 2.7 - 1.1) +
      0.1 * Math.sin(v.z * 3.3 + 2.2) +
      0.07 * Math.sin(v.x * 5.1 + v.y * 4.2);

    v.multiplyScalar(1 + n);

    // squash into a hold shape: wide, not very tall, and deep at the front
    v.x *= 1.36;
    v.y *= 0.82;
    v.z *= 1.1;

    // the back is flat, because it bolts to a sheet of ply
    if (v.z < -0.42) v.z = -0.42;

    // a lip under the front edge, which is the part you actually pull on
    if (v.y < -0.3 && v.z > 0) v.z *= 1.12;

    return v;
  }

  /* Where the bolt goes, and which way it points. The front of the blob is not
     square to the camera: the noise tilts it about forty degrees off Z, which
     is why a Z aligned bolt and washer used to sit half sunk and half proud and
     tear through the surface as the hold turned. Taking the real surface normal
     here means the bore, the shoulder and the head all share one axis, so the
     head stays inside its recess from every angle. */
  function boltFrame() {
    if (boltAxis) return;

    var h = 1e-4;
    var p = new THREE.Vector3();
    var a = new THREE.Vector3();
    var b = new THREE.Vector3();
    var c = new THREE.Vector3();
    var d = new THREE.Vector3();
    var q = Math.PI / 2;

    shape(onSphere(q, q, p));
    shape(onSphere(q + h, q, a));
    shape(onSphere(q - h, q, b));
    shape(onSphere(q, q + h, c));
    shape(onSphere(q, q - h, d));

    var n = a.sub(b).cross(c.sub(d)).normalize();

    if (n.z < 0) n.negate();

    boltPoint = p;
    boltAxis = n;
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
    renderer.setClearColor(0x1c1c16, 1);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
    camera.position.set(0, 0.28, 5.3);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x2a2a22, 0.55));

    var key = new THREE.DirectionalLight(0xfff4e2, 2.1);

    key.position.set(-3, 4, 5);
    scene.add(key);

    var rim = new THREE.DirectionalLight(0x8fb4ff, 1.1);

    rim.position.set(4, 1, -3);
    scene.add(rim);

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

    panel.position.z = -0.78;
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
    tnut.position.z = -0.52;
    group.add(tnut);

    hold = new THREE.Mesh(
      buildHold(),
      new THREE.MeshStandardMaterial({
        color: 0xffd400,
        roughness: 0.62,
        metalness: 0.02,
        roughnessMap: speckle(),
        flatShading: false,
      }),
    );
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
    group.add(bolt);

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
