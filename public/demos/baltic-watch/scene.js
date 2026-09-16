/* Baltic Watch / sea state panel
   A 60 by 60 grid displaced by three directional waves whose amplitude, period
   and heading come from whichever station and hour is selected. It is a model,
   not a picture, so it is drawn like one: pale fill, visible grid, a buoy that
   rides the surface it is standing on. */

var BalticSea = (function () {
  "use strict";

  var renderer, scene, camera, mesh, grid, buoy, buoyMast, clock;
  var base = null;
  var seg = 60;
  var size = 40;
  var live = false;

  var state = { hs: 1, tp: 5, dir: 270 };
  var shown = { hs: 1, tp: 5, dir: 270 };

  function init(canvas) {
    if (!window.THREE) return false;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false,
      });
    } catch (e) {
      return false;
    }

    if (!renderer.getContext()) return false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0xdfeaf3, 1);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xdfeaf3, 34, 68);

    camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
    camera.position.set(0, 11.5, 27);
    camera.lookAt(0, 0.6, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8aa7bd, 0.85));

    var sun = new THREE.DirectionalLight(0xffffff, 0.75);

    sun.position.set(-12, 18, 10);
    scene.add(sun);

    var geo = new THREE.PlaneGeometry(size, size, seg, seg);

    geo.rotateX(-Math.PI / 2);

    base = new Float32Array(geo.attributes.position.array);

    mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: 0x9fc4de,
        roughness: 0.42,
        metalness: 0.02,
        flatShading: true,
      }),
    );
    scene.add(mesh);

    grid = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: 0x2f6d99,
        wireframe: true,
        transparent: true,
        opacity: 0.14,
      }),
    );
    grid.position.y = 0.02;
    scene.add(grid);

    /* the buoy is the only thing on the panel with a scale you know */
    buoy = new THREE.Group();

    var hull = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.3, 1.1, 14),
      new THREE.MeshStandardMaterial({ color: 0xd8a13a, roughness: 0.5 }),
    );

    hull.position.y = 0.2;
    buoy.add(hull);

    buoyMast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.7, 8),
      new THREE.MeshStandardMaterial({ color: 0x4b5a66, roughness: 0.6 }),
    );
    buoyMast.position.y = 1.5;
    buoy.add(buoyMast);

    var lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xb3261e }),
    );

    lamp.position.y = 2.4;
    buoy.add(lamp);
    scene.add(buoy);

    clock = new THREE.Clock();
    live = true;

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

  /* three components: the dominant swell, a shorter cross sea at an angle to
     it, and a small chop that keeps the surface from looking mechanical */
  function height(x, z, t, hs, tp, rad) {
    var k1 = (2 * Math.PI) / Math.max(4, tp * 1.9);
    var d1x = Math.cos(rad);
    var d1z = Math.sin(rad);
    var rad2 = rad + 0.55;
    var k2 = k1 * 1.7;

    var a1 = hs * 0.5;
    var a2 = hs * 0.2;
    var a3 = hs * 0.09;

    return (
      a1 * Math.sin(k1 * (x * d1x + z * d1z) - t * (6.2 / Math.max(3, tp))) +
      a2 *
        Math.sin(
          k2 * (x * Math.cos(rad2) + z * Math.sin(rad2)) -
            t * (7.4 / Math.max(3, tp)),
        ) +
      a3 * Math.sin(x * 0.9 + t * 1.9) * Math.cos(z * 0.8 - t * 1.4)
    );
  }

  function tick() {
    if (!live) return;
    requestAnimationFrame(tick);

    var t = clock.getElapsedTime();

    // ease toward the requested state so switching station is a transition
    shown.hs += (state.hs - shown.hs) * 0.06;
    shown.tp += (state.tp - shown.tp) * 0.06;

    var d = ((state.dir - shown.dir + 540) % 360) - 180;

    shown.dir += d * 0.06;

    var rad = (shown.dir * Math.PI) / 180;
    var pos = mesh.geometry.attributes.position;
    var arr = pos.array;

    for (var i = 0; i < arr.length; i += 3) {
      arr[i + 1] = height(base[i], base[i + 2], t, shown.hs, shown.tp, rad);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();

    var by = height(0, 0, t, shown.hs, shown.tp, rad);
    var bx = height(0.6, 0, t, shown.hs, shown.tp, rad);
    var bz = height(0, 0.6, t, shown.hs, shown.tp, rad);

    buoy.position.y = by;
    buoy.rotation.z = -(bx - by) * 0.9;
    buoy.rotation.x = (bz - by) * 0.9;

    renderer.render(scene, camera);
  }

  function setState(s) {
    if (typeof s.hs === "number") state.hs = Math.max(0.05, s.hs);
    if (typeof s.tp === "number") state.tp = Math.max(2, s.tp);
    if (typeof s.dir === "number") state.dir = s.dir;
  }

  return { init: init, setState: setState };
})();
