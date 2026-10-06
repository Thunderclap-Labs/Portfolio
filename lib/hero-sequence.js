/* =====================================================================
   Thunderclap Labs — hero sequence.

   One drawing sheet, one fixed frame, drawn in front of you. The part is
   on it in full orthographic projection and so is the interface,
   dimensioned and toleranced to the same standard, because the same
   people drew both.

   No camera, no zoom, nothing blinking. The only thing that happens is
   the drawing being made, which is the whole point.

   Composed around the headline: the middle of the frame carries nothing
   but construction lines, because on a desktop the headline sits there,
   and the centre column stays clear below 380px because on a phone the
   crop keeps only that column and the headline is anchored to the foot.
   ===================================================================== */

/** Set by renderHeroFrame before each frame. */
let X;

/** The sheet is authored at this size and scaled by CSS, exactly as the video
 *  it replaces was. */
export const HERO_W = 1920;
export const HERO_H = 1080;
const W = HERO_W, H = HERO_H;
const DUR = 27;
const INK = "#ffffff";
const ACCENT = "#DFF140";
const MONO = "ui-monospace, Consolas, 'SF Mono', monospace";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));

/* ------------------------------------------------------------ atoms */
function P() { return new Path2D(); }

function pen(a, w = 1, color = INK, dash) {
  X.strokeStyle = color; X.globalAlpha = a; X.lineWidth = w;
  X.setLineDash(dash || []);
}

function reveal(path, p, w, a, color = INK) {
  if (p <= 0.001) return;
  const L = 9000;
  X.save(); pen(a, w, color);
  X.setLineDash([L, L]); X.lineDashOffset = L * (1 - clamp(p));
  X.stroke(path); X.restore();
}

function ln(x1, y1, x2, y2, a, w = 1, color = INK, dash) {
  if (a <= 0.004) return;
  X.save(); pen(a, w, color, dash);
  X.beginPath(); X.moveTo(x1, y1); X.lineTo(x2, y2); X.stroke(); X.restore();
}

function bx(x, y, w, h, a, lw = 1, color = INK, dash) {
  if (a <= 0.004) return;
  X.save(); pen(a, lw, color, dash); X.strokeRect(x, y, w, h); X.restore();
}

function tx(str, x, y, a, size = 11, color = INK, align = "left") {
  if (a <= 0.004) return;
  X.save();
  X.globalAlpha = a; X.fillStyle = color;
  X.font = `500 ${size}px ${MONO}`;
  X.textAlign = align; X.textBaseline = "middle";
  X.fillText(str, x, y); X.restore();
}

function circ(cx, cy, r, a, w = 1, color = INK, dash) {
  if (a <= 0.004) return;
  X.save(); pen(a, w, color, dash);
  X.beginPath(); X.arc(cx, cy, r, 0, Math.PI * 2); X.stroke(); X.restore();
}

function centreMark(cx, cy, r, a) {
  const d = [r * 0.46, r * 0.2, r * 0.09, r * 0.2];
  ln(cx - r, cy, cx + r, cy, a, 1, INK, d);
  ln(cx, cy - r, cx, cy + r, a, 1, INK, d);
}

function rectPath(x, y, w, h) { const p = P(); p.rect(x, y, w, h); return p; }
function roundPath(x, y, w, h, r) {
  const p = P();
  p.moveTo(x + r, y); p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y);
  p.closePath(); return p;
}

function hatchArea(path, p, a, step = 9) {
  if (p <= 0) return;
  X.save(); X.clip(path);
  X.globalAlpha = a * clamp(p); X.strokeStyle = INK; X.lineWidth = 1;
  const n = Math.ceil((W + H) / step), lim = Math.floor(n * clamp(p));
  for (let i = 0; i < lim; i++) {
    const o = i * step - H;
    X.beginPath(); X.moveTo(o, 0); X.lineTo(o + H, H); X.stroke();
  }
  X.restore();
}

/** Dimension: witness lines, solid arrowheads, figure. */
function dim(x1, y1, x2, y2, txt, p, a, off = 0, size = 10) {
  if (p <= 0) return;
  const al = a * clamp(p * 1.4);
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const ax = x1 + nx * off, ay = y1 + ny * off;
  const bxx = x2 + nx * off, by = y2 + ny * off;
  if (off) {
    ln(x1, y1, ax + nx * 5, ay + ny * 5, al * 0.3);
    ln(x2, y2, bxx + nx * 5, by + ny * 5, al * 0.3);
  }
  ln(ax, ay, ax + (bxx - ax) * clamp(p), ay + (by - ay) * clamp(p), al * 0.55);
  const hd = 8;
  [[ax, ay, 1], [bxx, by, -1]].forEach(([hx, hy, dir], i) => {
    if (i === 1 && p < 0.95) return;
    X.save(); X.globalAlpha = al * 0.65; X.fillStyle = INK;
    X.beginPath(); X.moveTo(hx, hy);
    X.lineTo(hx + ux * hd * dir + nx * hd * 0.28, hy + uy * hd * dir + ny * hd * 0.28);
    X.lineTo(hx + ux * hd * dir - nx * hd * 0.28, hy + uy * hd * dir - ny * hd * 0.28);
    X.closePath(); X.fill(); X.restore();
  });
  if (txt && p > 0.6)
    tx(txt, (ax + bxx) / 2 + nx * 12, (ay + by) / 2 + ny * 12,
       al * seg(p, 0.6, 1), size, INK, "center");
}

function leader(x, y, lx, ly, txt, p, a, size = 10) {
  if (p <= 0) return;
  const al = a * clamp(p);
  ln(x, y, x + (lx - x) * clamp(p * 1.25), y + (ly - y) * clamp(p * 1.25), al * 0.45);
  X.save(); X.globalAlpha = al * 0.75; X.fillStyle = INK;
  X.beginPath(); X.arc(x, y, 2, 0, Math.PI * 2); X.fill(); X.restore();
  if (p > 0.78) {
    const d = lx > x ? 1 : -1;
    ln(lx, ly, lx + 46 * d, ly, al * 0.45);
    tx(txt, lx + 54 * d, ly - 1, al * 0.6, size, INK, d > 0 ? "left" : "right");
  }
}

function gdt(x, y, sym, val, dat, p, a) {
  if (p <= 0) return;
  const al = a * clamp(p);
  const h = 22, w1 = 24, w2 = 62, w3 = 26;
  bx(x, y, w1 + w2 + w3, h, al * 0.5, 1);
  ln(x + w1, y, x + w1, y + h, al * 0.5);
  ln(x + w1 + w2, y, x + w1 + w2, y + h, al * 0.5);
  tx(sym, x + w1 / 2, y + h / 2, al * 0.8, 12, ACCENT, "center");
  tx(val, x + w1 + w2 / 2, y + h / 2, al * 0.6, 10, INK, "center");
  tx(dat, x + w1 + w2 + w3 / 2, y + h / 2, al * 0.6, 10, INK, "center");
}

function datum(x, y, letter, dir, p, a) {
  if (p <= 0) return;
  const al = a * clamp(p);
  X.save(); X.globalAlpha = al * 0.65; X.fillStyle = INK;
  X.beginPath();
  X.moveTo(x, y); X.lineTo(x - 7, y + 13 * dir); X.lineTo(x + 7, y + 13 * dir);
  X.closePath(); X.fill(); X.restore();
  ln(x, y + 13 * dir, x, y + 32 * dir, al * 0.45);
  bx(x - 11, dir > 0 ? y + 32 : y - 54, 22, 22, al * 0.5);
  tx(letter, x, (dir > 0 ? y + 43 : y - 43), al * 0.8, 11, INK, "center");
}

function finish(x, y, val, p, a) {
  if (p <= 0) return;
  const al = a * clamp(p);
  X.save(); pen(al * 0.55, 1);
  X.beginPath();
  X.moveTo(x - 8, y); X.lineTo(x, y + 13); X.lineTo(x + 14, y - 11);
  X.stroke(); X.restore();
  tx(val, x + 1, y - 8, al * 0.55, 9);
}

function revTri(x, y, n, p, a) {
  if (p <= 0) return;
  const al = a * clamp(p);
  X.save(); pen(al * 0.6, 1, ACCENT);
  X.beginPath();
  X.moveTo(x, y - 11); X.lineTo(x + 10, y + 7); X.lineTo(x - 10, y + 7);
  X.closePath(); X.stroke(); X.restore();
  tx(String(n), x, y + 1, al * 0.7, 9, ACCENT, "center");
}

/** A block of notes: heading reads, body is rule ticks. */
function notes(x, y, w, rows, head, t0, t, lh = 13) {
  const p = seg(t, t0, t0 + 1.3);
  if (p <= 0) return;
  tx(head, x, y, p * 0.55, 10, ACCENT);
  for (let i = 0; i < rows; i++) {
    const pp = seg(t, t0 + i * 0.06, t0 + 0.6 + i * 0.06);
    if (pp <= 0) continue;
    const ww = w * (0.45 + 0.55 * Math.abs(Math.sin(i * 2.7 + x)));
    ln(x, y + 16 + i * lh, x + ww * pp, y + 16 + i * lh, pp * 0.14, 2);
  }
}

/* ======================= LEFT COLUMN — the part, in projection ===== */
const FX = 150, FY = 400, FW = 440, FH = 330;
const FCX = FX + FW / 2, FCY = FY + FH / 2;

function planView(t) {
  const d = (a, b) => seg(t, a, b);
  const y = 150, h = 120;
  reveal(rectPath(FX, y, FW, h), d(0.5, 1.6), 1.6, 0.85);
  ln(FX, y + 30, FX + FW, y + 30, d(1.0, 1.8) * 0.4, 1);
  ln(FX, y + h - 30, FX + FW, y + h - 30, d(1.1, 1.9) * 0.4, 1);
  ln(FCX - 86, y, FCX - 86, y + h, d(1.3, 2.1) * 0.38, 1, INK, [7, 5]);
  ln(FCX + 86, y, FCX + 86, y + h, d(1.3, 2.1) * 0.38, 1, INK, [7, 5]);
  ln(FCX - 52, y, FCX - 52, y + h, d(1.5, 2.3) * 0.3, 1, INK, [7, 5]);
  ln(FCX + 52, y, FCX + 52, y + h, d(1.5, 2.3) * 0.3, 1, INK, [7, 5]);
  tx("PLAN", FX, y - 16, d(1.2, 2.0) * 0.5, 10);
  dim(FX, y, FX + FW, y, "58.60", d(2.2, 3.0), 0.75, -34);
}

function frontView(t) {
  const d = (a, b) => seg(t, a, b);

  // projection lines tying plan, front and side together
  const pp = d(0.2, 1.8);
  [FX, FX + FW, FCX].forEach((x) => ln(x, 140, x, FY + FH + 30, pp * 0.1, 1, INK, [6, 7]));
  [FY, FY + FH, FCY].forEach((y) => ln(FX - 30, y, 900, y, pp * 0.1, 1, INK, [6, 7]));

  centreMark(FCX, FCY, 250, d(0.3, 1.4) * 0.3);
  reveal(roundPath(FX, FY, FW, FH, 26), d(0.4, 1.8), 2, 1);

  const bore = P(); bore.arc(FCX, FCY, 86, 0, Math.PI * 2);
  reveal(bore, d(1.0, 2.0), 1.8, 1);
  const cb = P(); cb.arc(FCX, FCY, 108, 0, Math.PI * 2);
  reveal(cb, d(1.2, 2.2), 1.2, 0.7);

  // thread root circle, drawn broken as the convention has it
  const pth = d(1.5, 2.4);
  if (pth > 0) {
    X.save(); pen(pth * 0.5, 1, INK, [14, 9]);
    X.beginPath(); X.arc(FCX, FCY, 118, -Math.PI * 0.7, Math.PI * 1.12); X.stroke();
    X.restore();
  }

  // twelve holes, each with a centre mark
  const pb = d(1.6, 3.0);
  if (pb > 0) {
    circ(FCX, FCY, 172, pb * 0.3, 1, INK, [11, 6, 2, 6]);
    for (let i = 0; i < 12; i++) {
      if (pb < i / 12) break;
      const aa = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const hx = FCX + Math.cos(aa) * 172, hy = FCY + Math.sin(aa) * 172;
      circ(hx, hy, 11, 0.78, 1.2);
      centreMark(hx, hy, 19, 0.3);
    }
  }

  // webs out to the rim
  const pw = d(2.0, 2.9);
  for (let i = 0; i < 4 && pw > 0; i++) {
    const aa = (i / 4) * Math.PI * 2 + Math.PI / 4;
    ln(FCX + Math.cos(aa) * 118, FCY + Math.sin(aa) * 118,
       FCX + Math.cos(aa) * (118 + 50 * pw), FCY + Math.sin(aa) * (118 + 50 * pw),
       pw * 0.4, 1);
  }

  // cutting plane for A-A
  const pc = d(2.6, 3.5);
  if (pc > 0) {
    ln(FX - 44, FCY, FX + FW + 44, FCY, pc * 0.5, 1.6, ACCENT, [22, 8, 4, 8]);
    [[FX - 44, 1], [FX + FW + 44, -1]].forEach(([x, dir]) => {
      ln(x, FCY, x, FCY - 30, pc * 0.5, 1.6, ACCENT);
      X.save(); X.globalAlpha = pc * 0.65; X.fillStyle = ACCENT;
      X.beginPath();
      X.moveTo(x + 18 * dir, FCY - 30); X.lineTo(x, FCY - 24); X.lineTo(x, FCY - 36);
      X.closePath(); X.fill(); X.restore();
      tx("A", x, FCY - 48, pc * 0.7, 12, ACCENT, "center");
    });
  }

  dim(FX, FY, FX + FW, FY, "Ø 58.60", d(2.2, 3.0), 0.85, -58);
  dim(FX + FW, FY, FX + FW, FY + FH, "31.70", d(2.4, 3.2), 0.85, 60);
  dim(FCX - 86, FCY, FCX + 86, FCY, "Ø 20.00", d(2.8, 3.6), 0.7, 124, 9);
  leader(FCX + 76, FCY - 76, FCX + 232, FCY - 196, "M20x2.5 - 6H", d(3.0, 3.8), 0.85);
  leader(FCX + 172, FCY + 100, FCX + 250, FCY + 176, "12 x Ø 4.5", d(3.3, 4.1), 0.85);
  leader(FX + 26, FY + 26, FX - 86, FY - 50, "R26 TYP", d(3.6, 4.4), 0.85);
  datum(FX + FW * 0.3, FY + FH, "A", 1, d(3.2, 3.9), 0.85);
  datum(FX, FY + FH * 0.66, "B", -1, d(3.5, 4.2), 0.85);
  gdt(FX - 110, FY + FH + 96, "⌖", "Ø0.05", "A B", d(3.8, 4.6), 0.85);
  gdt(FX - 110, FY + FH + 126, "⏥", "0.02", "A", d(4.0, 4.8), 0.85);
  finish(FX + FW + 24, FY + 30, "Ra 1.6", d(4.2, 4.9), 0.85);
}

function sideView(t) {
  const d = (a, b) => seg(t, a, b);
  const x = FX + FW + 120, w = 110;
  reveal(rectPath(x, FY, w, FH), d(0.8, 2.0), 1.6, 0.85);
  ln(x + 30, FY, x + 30, FY + FH, d(1.4, 2.2) * 0.38, 1, INK, [7, 5]);
  ln(x + w - 30, FY, x + w - 30, FY + FH, d(1.4, 2.2) * 0.38, 1, INK, [7, 5]);
  ln(x, FY + 40, x + w, FY + 40, d(1.8, 2.5) * 0.3, 1);
  ln(x, FY + FH - 40, x + w, FY + FH - 40, d(1.9, 2.6) * 0.3, 1);
  tx("SIDE", x, FY - 16, d(1.6, 2.4) * 0.5, 10);
  dim(x, FY + FH, x + w, FY + FH, "24.00", d(2.6, 3.4), 0.7, 42, 9);
}

/* ======================= TOP CENTRE — section, kept above 380 ====== */
function sectionAA(t) {
  const d = (a, b) => seg(t, a, b);
  const x = 760, y = 120, w = 470, h = 230;

  const outer = rectPath(x, y, w, h);
  reveal(outer, d(1.2, 2.4), 1.8, 0.95);
  const inner = P();
  inner.rect(x + 116, y + 66, w - 232, h - 132);
  inner.rect(x + 82, y + 42, 42, h - 84);
  reveal(inner, d(1.7, 2.8), 1.5, 0.9);

  const walls = P(); walls.addPath(outer); walls.addPath(inner);
  hatchArea(walls, d(2.2, 3.6), 0.2, 9);

  ln(x + 82, y + 42, x + 104, y + 20, d(2.6, 3.2) * 0.55, 1.2);
  ln(x + 82, y + h - 42, x + 104, y + h - 20, d(2.6, 3.2) * 0.55, 1.2);
  centreMark(x + w / 2, y + h / 2, 280, d(1.4, 2.4) * 0.26);

  dim(x, y, x, y + h, "24.00", d(3.0, 3.8), 0.72, -40, 9);
  dim(x + 116, y + 66, x + w - 116, y + 66, "Ø 20.00", d(3.2, 4.0), 0.68, -24, 9);
  leader(x + 104, y + 20, x + 40, y - 52, "1.5 x 45°", d(3.4, 4.2), 0.8, 9);
  finish(x + w - 60, y + h + 26, "Ra 0.8", d(3.6, 4.3), 0.8);
  tx("SECTION A-A  (2:1)", x, y - 24, d(2.0, 2.8) * 0.65, 12, ACCENT);
}

/* ======================= RIGHT COLUMN ============================== */
function detailB(t) {
  const d = (a, b) => seg(t, a, b);
  const cx = 1612, cy = 404, r = 118;

  circ(cx, cy, r, d(2.4, 3.4) * 0.45, 1.3, INK, [11, 8]);
  tx("DETAIL B  (5:1)", cx - r, cy - r - 18, d(2.8, 3.6) * 0.6, 11, ACCENT);
  // a real thread profile: crest, root, 60 degree flanks
  const pitch = 38, dep = 46;
  const prof = P();
  prof.moveTo(cx - pitch * 2.5, cy + dep / 2);
  for (let i = -2; i <= 2; i++) {
    const b = cx + i * pitch;
    prof.lineTo(b - pitch * 0.17, cy - dep / 2);
    prof.lineTo(b + pitch * 0.17, cy - dep / 2);
    prof.lineTo(b + pitch * 0.5, cy + dep / 2);
  }
  reveal(prof, d(2.8, 4.0), 1.8, 0.95);
  ln(cx - r * 0.84, cy + dep / 2, cx + r * 0.84, cy + dep / 2, d(3.4, 4.0) * 0.3, 1, INK, [9, 6]);
  ln(cx - r * 0.84, cy - dep / 2, cx + r * 0.84, cy - dep / 2, d(3.4, 4.0) * 0.3, 1, INK, [9, 6]);
  dim(cx - pitch * 0.5, cy + dep / 2 + 26, cx + pitch * 0.5, cy + dep / 2 + 26, "2.50", d(3.8, 4.6), 0.72, 0, 9);
  dim(cx + r * 0.9, cy - dep / 2, cx + r * 0.9, cy + dep / 2, "1.35", d(4.0, 4.8), 0.72, 0, 9);
  tx("60°", cx + 8, cy - dep / 2 - 15, d(4.2, 4.8) * 0.6, 9);
}

/** Hole table: the sort of schedule that makes a sheet a document. */
function holeTable(t) {
  const d = (a, b) => seg(t, a, b);
  const x = 1390, y = 120, w = 470, rh = 25;
  const rows = [
    ["A1", "Ø4.50", "12", "THRU"],
    ["B1", "Ø20.00", "1", "M20x2.5"],
    ["C1", "Ø32.00", "1", "⌴ 6.0"],
    ["D1", "Ø58.60", "1", "REF"],
  ];
  const p = d(1.4, 3.6);
  bx(x, y, w, rh * (rows.length + 1), 0.45 * clamp(p * 1.4), 1.2);
  ["TAG", "SIZE", "QTY", "NOTE"].forEach((hdr, k) =>
    tx(hdr, x + [12, 96, 236, 316][k], y + rh / 2, clamp(p * 1.4) * 0.5, 10, ACCENT));
  rows.forEach((r, i) => {
    const pp = seg(p, i / (rows.length + 1), (i + 1.4) / (rows.length + 1));
    if (pp <= 0) return;
    const yy = y + rh * (i + 1);
    ln(x, yy, x + w * pp, yy, 0.3, 1);
    r.forEach((cell, k) => tx(cell, x + [12, 96, 236, 316][k], yy + rh / 2, pp * 0.62, 10));
  });
  [84, 224, 304].forEach((c) =>
    ln(x + c, y, x + c, y + rh * (rows.length + 1), 0.22 * clamp(p), 1));
  tx("HOLE SCHEDULE", x, y - 14, clamp(p) * 0.55, 10, ACCENT);
}

/* ============ the interface, drawn and toleranced the same way ===== */
function viewportElevation(t) {
  const d = (a, b) => seg(t, a, b);
  const x = 150, y = 800, w = 420, h = 162;
  reveal(rectPath(x, y, w, h), d(3.0, 4.2), 1.8, 0.9);
  ln(x, y + 30, x + w, y + 30, d(3.4, 4.2) * 0.45, 1.2);
  tx("VIEWPORT", x + 12, y + 15, d(3.4, 4.2) * 0.5, 10);

  const cx = x + w / 2, cy = y + 30 + (h - 30) / 2;
  for (let k = 0; k < 5; k++) {
    const p = d(3.6 + k * 0.14, 4.4 + k * 0.14);
    if (p <= 0) continue;
    const lift = (k - 2) * 18, rw = 64;
    const pts = [];
    for (let i = 0; i < 4; i++) {
      const a0 = (i / 4) * Math.PI * 2 + Math.PI / 4;
      pts.push([cx + Math.cos(a0) * rw, cy + Math.sin(a0) * rw * 0.42 - lift]);
    }
    const slab = P();
    pts.forEach(([px, py], i) => (i ? slab.lineTo(px, py) : slab.moveTo(px, py)));
    slab.closePath();
    reveal(slab, p, k === 4 ? 1.6 : 1.1, k === 4 ? 0.95 : 0.55, k === 4 ? ACCENT : INK);
    pts.forEach(([px, py]) => ln(px, py, px, py + 8, p * 0.35, 1));
    if (p > 0.9) {
      circ(x + w - 22, cy - lift, 9, 0.5, 1.1, ACCENT);
      tx(String(5 - k), x + w - 22, cy - lift, 0.7, 9, ACCENT, "center");
    }
  }
  dim(x, y + h, x + w, y + h, "1280 px", d(4.4, 5.2), 0.7, 26, 9);
  dim(x, y + 30, x, y + h, "720 px", d(4.6, 5.4), 0.7, -30, 9);
  gdt(x + 250, y + h + 44, "⌖", "0.5 px", "C", d(4.8, 5.6), 0.8);
}

function orderElevation(t) {
  const d = (a, b) => seg(t, a, b);
  const x = 1390, y = 736, w = 400, h = 162;
  reveal(rectPath(x, y, w, h), d(3.4, 4.6), 1.8, 0.9);
  tx("ORDER", x + 12, y + 16, d(3.6, 4.4) * 0.5, 10);
  for (let i = 0; i < 3; i++) {
    const p = d(3.8 + i * 0.16, 4.6 + i * 0.16);
    if (p <= 0) continue;
    const fy = y + 30 + i * 34;
    reveal(rectPath(x + 18, fy, w - 36, 26), p, 1.1, 0.45);
    ln(x + 30, fy + 13, x + 30 + (w - 96) * p, fy + 13, p * 0.26, 1);
    if (i === 0) dim(x + 18, fy, x + 18, fy + 26, "48", p, 0.6, -22, 9);
  }
  const pt = d(4.6, 5.4);
  ln(x + 18, y + h - 40, x + w - 18, y + h - 40, pt * 0.35, 1.2);
  tx("TOTAL", x + 18, y + h - 22, pt * 0.5, 10);
  tx("189.00", x + w - 18, y + h - 22, pt * 0.72, 15, INK, "right");
  leader(x + 150, y + h - 22, x + 40, y + h + 30, "NO ORDER MAY DROP", d(5.0, 5.8), 0.8, 9);
}

function rulesElevation(t) {
  const d = (a, b) => seg(t, a, b);
  const x = 1390, y = 560, w = 400, h = 150;
  reveal(rectPath(x, y, w, h), d(3.2, 4.4), 1.6, 0.85);
  tx("RULES", x + 12, y + 16, d(3.4, 4.2) * 0.5, 10);
  ["1:9", "1:36", "1:121"].forEach((o, i) => {
    const p = d(3.6 + i * 0.12, 4.3 + i * 0.12);
    if (p <= 0) return;
    const bxx = x + 18 + i * 124, by = y + 32;
    const on = i === 1;
    reveal(rectPath(bxx, by, 108, 34), p, on ? 1.6 : 1, on ? 0.9 : 0.38, on ? ACCENT : INK);
    tx(o, bxx + 54, by + 17, p * (on ? 0.9 : 0.5), 12, on ? ACCENT : INK, "center");
  });
  [["PEAK", "36 N·m"], ["CONT", "12 N·m"], ["SPEED", "155 rpm"]].forEach(([k, v], i) => {
    const p = d(4.0 + i * 0.14, 4.7 + i * 0.14);
    if (p <= 0) return;
    const yy = y + 86 + i * 20;
    ln(x + 18, yy + 9, x + w - 18, yy + 9, p * 0.18, 1);
    tx(k, x + 18, yy, p * 0.45, 9);
    tx(v, x + w - 18, yy, p * 0.62, 11, INK, "right");
  });
}

/** A broken out section: freehand break line, hatched behind it. */
function brokenOut(t) {
  const d = (a, b) => seg(t, a, b);
  const p = d(4.4, 5.6);
  if (p <= 0) return;
  const x0 = FX + FW - 112;

  // the break line wanders, the way a drawn one does
  const brk = P();
  brk.moveTo(x0, FY + FH);
  const pts = 14;
  for (let i = 1; i <= pts; i++) {
    const u = i / pts;
    brk.lineTo(
      x0 + Math.sin(u * 7.3) * 9 + u * 18,
      FY + FH - u * 96
    );
  }
  brk.lineTo(FX + FW, FY + FH - 96);
  reveal(brk, p, 1.2, 0.6);

  const area = P();
  area.moveTo(x0, FY + FH);
  for (let i = 1; i <= pts; i++) {
    const u = i / pts;
    area.lineTo(x0 + Math.sin(u * 7.3) * 9 + u * 18, FY + FH - u * 96);
  }
  area.lineTo(FX + FW, FY + FH - 96);
  area.lineTo(FX + FW, FY + FH);
  area.closePath();
  hatchArea(area, d(4.8, 5.8), 0.17, 8);
  tx("BROKEN OUT", x0 - 26, FY + FH + 16, p * 0.45, 9, ACCENT);
}

/** Knurl, drawn as the crossed field it is. */
function knurlDetail(t) {
  const d = (a, b) => seg(t, a, b);
  const p = d(5.0, 6.2);
  if (p <= 0) return;
  const x = 620, y = 600, w = 92, h = 58;
  bx(x, y, w, h, p * 0.5, 1.1);
  X.save();
  X.beginPath(); X.rect(x, y, w, h); X.clip();
  X.strokeStyle = INK; X.lineWidth = 1; X.globalAlpha = p * 0.3;
  for (let i = -6; i < 14; i++) {
    X.beginPath();
    X.moveTo(x + i * 11, y); X.lineTo(x + i * 11 + h, y + h); X.stroke();
    X.beginPath();
    X.moveTo(x + i * 11, y + h); X.lineTo(x + i * 11 + h, y); X.stroke();
  }
  X.restore();
  tx("KNURL 0.8 DP", x, y - 10, p * 0.45, 9, ACCENT);
}

/** General tolerance table, bottom centre, where the frame was bare. */
function toleranceTable(t) {
  const d = (a, b) => seg(t, a, b);
  const p = d(5.2, 6.8);
  if (p <= 0) return;
  const x = 640, y = 846, w = 420, rh = 21;
  const rows = [
    ["0.5 — 6", "±0.10"],
    ["6 — 30", "±0.20"],
    ["30 — 120", "±0.30"],
    ["120 — 400", "±0.50"],
  ];
  tx("GENERAL TOLERANCES  DIN ISO 2768-mK", x, y - 12, clamp(p) * 0.5, 9, ACCENT);
  bx(x, y, w, rh * rows.length, clamp(p * 1.3) * 0.4, 1.1);
  ln(x + 250, y, x + 250, y + rh * rows.length, clamp(p) * 0.22, 1);
  rows.forEach((r, i) => {
    const pp = seg(p, i / rows.length, (i + 1.2) / rows.length);
    if (pp <= 0) return;
    const yy = y + rh * i;
    if (i) ln(x, yy, x + w * pp, yy, 0.22, 1);
    tx(r[0], x + 10, yy + rh / 2, pp * 0.5, 9);
    tx(r[1], x + 262, yy + rh / 2, pp * 0.55, 9);
  });
}

/** Weld symbol on its reference line. */
function weldSymbol(t) {
  const d = (a, b) => seg(t, a, b);
  const p = d(5.4, 6.2);
  if (p <= 0) return;
  const x = 1232, y = 318;
  ln(x - 52, y + 26, x, y, p * 0.45, 1);
  ln(x, y, x + 96, y, p * 0.45, 1);
  X.save(); pen(p * 0.5, 1.1, ACCENT);
  X.beginPath();
  X.moveTo(x + 34, y); X.lineTo(x + 48, y - 16); X.lineTo(x + 62, y);
  X.stroke(); X.restore();
  tx("4", x + 24, y - 8, p * 0.5, 9);
  tx("FILLET", x + 102, y, p * 0.45, 9);
}

/** Scale bar, bottom left. */
function scaleBar(t) {
  const p = seg(t, 5.6, 6.6);
  if (p <= 0) return;
  const x = 150, y = 1004, seglen = 26;
  for (let i = 0; i < 6; i++) {
    if (p < i / 6) break;
    X.save();
    X.globalAlpha = 0.34; X.fillStyle = INK;
    if (i % 2 === 0) X.fillRect(x + i * seglen, y, seglen, 7);
    else bx(x + i * seglen, y, seglen, 7, 0.34, 1);
    X.restore();
  }
  bx(x, y, seglen * 6, 7, p * 0.34, 1);
  tx("0", x, y + 18, p * 0.4, 9, INK, "center");
  tx("60 mm", x + seglen * 6, y + 18, p * 0.4, 9, INK, "center");
}

/* ------------------------------------------------------- furniture */
function titleBlock(t) {
  const p = seg(t, 1.6, 3.2);
  if (p <= 0) return;
  const w = 460, h = 110, x = W - 60 - w, y = H - 56 - h;
  bx(x, y, w, h, p * 0.5, 1.4);
  ln(x, y + 40, x + w, y + 40, p * 0.4, 1);
  ln(x, y + 76, x + w, y + 76, p * 0.4, 1);
  ln(x + 290, y + 40, x + 290, y + h, p * 0.4, 1);
  tx("THUNDERCLAP LABS", x + 12, y + 21, p * 0.8, 15);
  tx("HARDWARE DISCIPLINE, CARRIED OVER", x + 12, y + 58, p * 0.45, 10);
  tx("3D · CONFIGURATORS · LIVE DATA · CHECKOUT", x + 12, y + 94, p * 0.4, 9);
  tx("SCALE 1:1", x + 302, y + 58, p * 0.4, 10);
  tx("SHEET 1 OF 1", x + 302, y + 94, p * 0.4, 10);
  // first angle projection symbol
  const cx = x + w - 52, cy = y + 20;
  circ(cx - 14, cy, 13, p * 0.45, 1.1);
  circ(cx - 14, cy, 6, p * 0.45, 1.1);
  X.save(); pen(p * 0.45, 1.1);
  X.beginPath();
  X.moveTo(cx + 8, cy - 13); X.lineTo(cx + 34, cy - 5);
  X.lineTo(cx + 34, cy + 5); X.lineTo(cx + 8, cy + 13);
  X.closePath(); X.stroke(); X.restore();
}

function sheetFrame(t) {
  const p = seg(t, 0.05, 1.2);
  bx(26, 26, W - 52, H - 52, p * 0.32, 1.4);
  bx(46, 46, W - 92, H - 92, p * 0.14, 1);
  for (let i = 1; i < 6; i++) {
    const yy = ((H - 52) / 6) * i + 26;
    ln(26, yy, 46, yy, p * 0.22, 1);
    tx("ABCDE"[i - 1], 36, yy - 16, p * 0.26, 10, INK, "center");
  }
  for (let i = 1; i < 9; i++) {
    const xx = ((W - 52) / 9) * i + 26;
    ln(xx, 26, xx, 46, p * 0.22, 1);
    tx(String(i), xx - 20, 36, p * 0.26, 10, INK, "center");
  }
}

function sheetGrid(a) {
  X.save(); X.strokeStyle = INK; X.lineWidth = 1;
  for (let x = 0; x <= W; x += 48) {
    X.globalAlpha = a * (x % 240 ? 0.035 : 0.075);
    X.beginPath(); X.moveTo(x + 0.5, 0); X.lineTo(x + 0.5, H); X.stroke();
  }
  for (let y = 0; y <= H; y += 48) {
    X.globalAlpha = a * (y % 240 ? 0.035 : 0.075);
    X.beginPath(); X.moveTo(0, y + 0.5); X.lineTo(W, y + 0.5); X.stroke();
  }
  X.restore();
}

/* ------------------------------------------------ margins and veil */
const CODE = [
  "const geo = new THREE.ExtrudeGeometry(profile, {",
  "  depth: T, bevelSegments: 6, curveSegments: 24,",
  "});",
  "renderer.toneMapping = THREE.NoToneMapping;",
  "// ACES desaturates the pastels. keep pigment.",
  "",
  "function fit(bounds, aspect) {",
  "  const r = Math.hypot(bounds.r, bounds.halfH);",
  "  const hFov = 2*Math.atan(Math.tan(vFov/2)*aspect);",
  "  return r / Math.sin(Math.min(vFov, hFov) / 2);",
  "}",
  "",
  "mat = materialFor(part);  // per part, not mesh",
  "const left = CAP - taken(day, slot);",
  "people.max = Math.min(MAX_GROUP, left);",
  "",
  "async function confirm(order) {",
  "  const ref = await reserve(order);",
  "  if (!ref) throw new Error('not reserved');",
  "  return ref;  // an order may not vanish",
  "}",
];

function codeMargins(t, a) {
  if (a <= 0.004) return;
  X.save();
  X.font = `11px ${MONO}`;
  X.textBaseline = "top";
  const lh = 18;
  [{ x: 62, s: 7 }, { x: W - 300, s: 5 }].forEach((col) => {
    const off = (t * col.s + col.x) % (CODE.length * lh);
    for (let i = -2; i < Math.ceil(H / lh) + 2; i++) {
      const idx = (((i + Math.floor(off / lh)) % CODE.length) + CODE.length) % CODE.length;
      const l = CODE[idx];
      if (!l) continue;
      const y = i * lh - (((off % lh) + lh) % lh);
      const band = Math.sin((y / H) * Math.PI);
      if (band <= 0.03) continue;
      X.globalAlpha = a * band * (l.startsWith("//") ? 0.2 : 0.11);
      X.fillStyle = l.startsWith("//") ? ACCENT : INK;
      X.fillText(l.slice(0, 24), col.x, y);
    }
  });
  X.restore();
}

function vignette() {
  const g = X.createRadialGradient(W / 2, H / 2, H * 0.12, W / 2, H / 2, H);
  g.addColorStop(0, "rgba(1,1,1,0.34)");
  g.addColorStop(0.5, "rgba(1,1,1,0.05)");
  g.addColorStop(1, "rgba(1,1,1,0.34)");
  X.fillStyle = g; X.fillRect(0, 0, W, H);
}

/* ---------------------------------------------------------- render */
function render(t) {
  t = ((t % DUR) + DUR) % DUR;
  X.setTransform(1, 0, 0, 1, 0, 0);
  X.fillStyle = "#010101"; X.fillRect(0, 0, W, H);

  const live = seg(t, 0, 1.2) * (1 - seg(t, DUR - 1.6, DUR));

  sheetGrid(0.6 * live + 0.2);
  sheetFrame(t);

  planView(t);
  frontView(t);
  sideView(t);
  sectionAA(t);
  holeTable(t);
  detailB(t);
  rulesElevation(t);
  viewportElevation(t);
  orderElevation(t);

  brokenOut(t);
  knurlDetail(t);
  toleranceTable(t);
  weldSymbol(t);
  scaleBar(t);

  notes(150, 762, 300, 3, "NOTES", 4.4, t, 12);
  notes(760, 900, 420, 4, "TOLERANCES", 4.8, t, 12);
  notes(1180, 420, 150, 5, "REVISIONS", 5.0, t, 12);
  revTri(700, 470, 1, seg(t, 4.6, 5.4), 0.9);
  revTri(1330, 560, 2, seg(t, 4.9, 5.7), 0.9);
  revTri(1120, 880, 3, seg(t, 5.2, 6.0), 0.9);
  titleBlock(t);

  codeMargins(t, live * 0.9);
  vignette();

  if (live < 1) {
    X.save();
    X.globalAlpha = 1 - live;
    X.fillStyle = "#010101"; X.fillRect(0, 0, W, H);
    X.restore();
  }
}

/** Length of one loop, in seconds. */
export const HERO_DURATION = DUR;

/** Draw the sheet at time t into ctx. Pure: the same t gives the same frame. */
export function renderHeroFrame(ctx, t) {
  X = ctx;
  render(t);
}
    
