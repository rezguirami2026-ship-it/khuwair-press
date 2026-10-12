/* Omani architecture: fort crenellations (shurfat), arches, carved wooden doors with brass studs. */
import { opts, paint, solid, scoped, polyPath, TAU } from './core.js';
import { starPoly, rosette } from './stars.js';

/** Row of stepped, pointed merlons standing on y + h, filling width w exactly (count from o.density).
 *  o.hole adds the triangular loophole; o.base draws the wall course below. */
export function crenellation(ctx, x, y, w, h, o){
  o = opts(Object.assign({hole:true, base:true, gapRatio:0.22}, o));
  const n = Math.max(1, Math.round(w / (h * 0.95) * o.density)), unit = w / n, mw = unit * (1 - o.gapRatio);
  const box = [x, y, w, h];
  scoped(ctx, o, () => {
    ctx.beginPath();
    for(let i = 0; i < n; i++){
      const c = x + unit * (i + 0.5), b = y + h, s1 = y + h * 0.55, s2 = y + h * 0.28;
      polyPath(ctx, [[c - mw / 2, b], [c - mw / 2, s1], [c - mw * 0.33, s1], [c - mw * 0.33, s2], [c - mw * 0.16, s2], [c, y],
        [c + mw * 0.16, s2], [c + mw * 0.33, s2], [c + mw * 0.33, s1], [c + mw / 2, s1], [c + mw / 2, b]]);
    }
    solid(ctx, o, o.color, box);
    if(o.hole && !o.ink){
      ctx.beginPath();
      for(let i = 0; i < n; i++){
        const c = x + unit * (i + 0.5), t = y + h * 0.5;
        polyPath(ctx, [[c, t], [c - mw * 0.09, t + h * 0.2], [c + mw * 0.09, t + h * 0.2]]);
      }
      ctx.fillStyle = o.bg; ctx.fill();
    }
    if(o.base){ ctx.beginPath(); ctx.rect(x, y + h - Math.max(1, h * 0.06), w, Math.max(1, h * 0.06)); ctx.fillStyle = paint(ctx, o.color, box); ctx.fill(); }
  });
}

/** Arch path over [x, y, w, h] (springing line at y + h·spring). kinds: pointed | round | scalloped | ogee. */
export function archPath(ctx, x, y, w, h, kind = 'pointed', spring = 0.32){
  const sy = y + h * spring, cx = x + w / 2, half = w / 2;
  ctx.moveTo(x, y + h); ctx.lineTo(x, sy);
  if(kind === 'round'){ ctx.arc(cx, sy, half, Math.PI, 0); }
  else if(kind === 'ogee'){
    const rise = sy - y;
    ctx.bezierCurveTo(x, sy - rise * 0.55, cx - half * 0.35, sy - rise * 0.5, cx - half * 0.12, y + rise * 0.22);
    ctx.quadraticCurveTo(cx, y + rise * 0.08, cx, y);
    ctx.quadraticCurveTo(cx, y + rise * 0.08, cx + half * 0.12, y + rise * 0.22);
    ctx.bezierCurveTo(cx + half * 0.35, sy - rise * 0.5, x + w, sy - rise * 0.55, x + w, sy);
  } else {
    // two-centred pointed arch through the apex (cx, y)
    const rise = sy - y, R = (half * half + rise * rise) / (2 * half);
    const a = Math.atan2(rise, R - half);
    if(kind === 'scalloped'){
      // small lobes following the pointed arch outline
      const lobes = 5, pts = [];
      for(let side = 0; side < 2; side++) for(let i = 0; i <= lobes; i++){
        const t = i / lobes;
        const ang = side === 0 ? Math.PI + a * t : -a + a * t;
        const ox = side === 0 ? x + R : x + w - R;
        pts.push([ox + Math.cos(ang) * R, sy + Math.sin(ang) * R]);
      }
      const right = pts.slice(lobes + 1).reverse(), left = pts.slice(0, lobes + 1), seq = left.concat(right.reverse().slice(1));
      for(let i = 1; i < seq.length; i++){
        const p = seq[i - 1], q = seq[i], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, d = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const nx = -(q[1] - p[1]) / d, ny = (q[0] - p[0]) / d;
        ctx.quadraticCurveTo(mx - nx * d * 0.45, my - ny * d * 0.45, q[0], q[1]);
      }
    } else {
      ctx.arc(x + R, sy, R, Math.PI, Math.PI + a);
      ctx.arc(x + w - R, sy, R, -a, 0);
    }
  }
  ctx.lineTo(x + w, y + h);
}

/** Double-line arch frame with a keystone star — frames a title or a whole invitation. */
export function archFrame(ctx, x, y, w, h, o){
  o = opts(Object.assign({kind:'pointed', spring:0.3, gap:10, keystone:true}, o));
  const box = [x, y, w, h], st = paint(ctx, o.color, box), ac = paint(ctx, o.accent, box), lw = Math.max(0.6, 1.4 * o.lw);
  scoped(ctx, o, () => {
    ctx.lineJoin = 'round';
    ctx.beginPath(); archPath(ctx, x, y, w, h, o.kind, o.spring); ctx.lineWidth = lw * 1.8; ctx.strokeStyle = st; ctx.stroke();
    const g = o.gap, sp = (h * o.spring - g * 0.8) / (h - g);
    ctx.beginPath(); archPath(ctx, x + g, y + g * 1.6, w - 2 * g, h - g * 1.6, o.kind, Math.max(0.05, sp)); ctx.lineWidth = lw * 0.7; ctx.strokeStyle = ac; ctx.stroke();
    if(o.keystone){ starPoly(ctx, x + w / 2, y - g * 0.4, g * 1.1, 8, 2); ctx.fillStyle = ac; ctx.fill(); }
  });
}

/** Carved Omani wooden door: arched frame, two leaves with brass stud grids and a carved rosette, chain lintel. */
export function omaniDoor(ctx, x, y, w, h, o){
  o = opts(Object.assign({wood:'#6B4527', studColor:'gold'}, o));
  const box = [x, y, w, h], fr = w * 0.07, ar = h * 0.24;
  scoped(ctx, o, () => {
    // outer frame and arch
    ctx.beginPath(); archPath(ctx, x, y, w, h, 'pointed', ar / h); ctx.closePath();
    solid(ctx, o, o.wood, box, true);
    ctx.beginPath(); archPath(ctx, x + fr, y + fr * 1.4, w - 2 * fr, h - fr * 1.4, 'pointed', (ar - fr * 0.6) / (h - fr * 1.4)); ctx.closePath();
    ctx.fillStyle = o.ink ? o.bg : shade(o.wood, 0.82); ctx.fill();
    ctx.strokeStyle = paint(ctx, o.accent, box); ctx.lineWidth = Math.max(0.6, w * 0.006 * o.lw); ctx.stroke();
    // lintel with carved chain
    const ly = y + ar + fr * 0.4, lh = h * 0.07, ix = x + fr, iw = w - 2 * fr;
    ctx.fillStyle = o.ink ? o.bg : shade(o.wood, 0.7); ctx.fillRect(ix, ly, iw, lh);
    ctx.strokeStyle = paint(ctx, o.accent, box); ctx.strokeRect(ix, ly, iw, lh);
    const nC = Math.max(3, Math.round(iw / lh)), cu = iw / nC;
    for(let i = 0; i < nC; i++){ starPoly(ctx, ix + cu * (i + 0.5), ly + lh / 2, lh * 0.34, 8, 2); ctx.stroke(); }
    // rosette in the arch tympanum
    rosette(ctx, x + w / 2, y + ar * 0.62 + fr * 0.4, Math.min(iw * 0.2, ar * 0.38), 8, {layers:1, color:o.accent, accent:o.accent, bg:o.ink ? o.bg : shade(o.wood, 0.82), fillMode:'line', lw:o.lw, ink:o.ink});
    // two leaves
    const top = ly + lh, bot = y + h - fr * 0.5, lw2 = iw / 2;
    for(let s = 0; s < 2; s++){
      const lx = ix + s * lw2, pad = lw2 * 0.12;
      ctx.strokeStyle = paint(ctx, o.accent, box); ctx.lineWidth = Math.max(0.6, w * 0.004 * o.lw);
      ctx.strokeRect(lx + pad, top + pad, lw2 - 2 * pad, bot - top - 2 * pad);
      // stud grid
      const cols = 3, rows = Math.max(4, Math.round((bot - top) / (lw2 / 2.2))), sx = (lw2 - 2 * pad) / cols, sy = (bot - top - 2 * pad) / rows;
      const r = Math.min(sx, sy) * 0.13;
      for(let j = 0; j < rows; j++) for(let i = 0; i < cols; i++){
        const cx = lx + pad + sx * (i + 0.5), cy = top + pad + sy * (j + 0.5);
        if(j === Math.floor(rows / 2) && i === 1) continue;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); solid(ctx, o, o.studColor, [cx - r, cy - r, 2 * r, 2 * r]);
      }
      // carved centre medallion on each leaf
      const mcx = lx + lw2 / 2, mcy = top + pad + sy * (Math.floor(rows / 2) + 0.5);
      starPoly(ctx, mcx, mcy, Math.min(sx, sy) * 0.42, 8, 2); ctx.strokeStyle = paint(ctx, o.studColor, box); ctx.stroke();
    }
    // centre post
    ctx.fillStyle = o.ink ? o.bg : shade(o.wood, 0.6); ctx.fillRect(x + w / 2 - fr * 0.18, top, fr * 0.36, bot - top);
    if(o.ink){ ctx.strokeRect(x + w / 2 - fr * 0.18, top, fr * 0.36, bot - top); }
  });
}
function shade(hex, k){
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(v * k));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
