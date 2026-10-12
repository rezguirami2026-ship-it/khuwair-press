/* Stars, interlaced stars (khatam, Solomon's seal) and star-dish rosettes (tabaq). */
import { opts, paint, solid, flat, scoped, polar, segHit, sub, norm, add, mul, len, cross, TAU, polyPath } from './core.js';

/** Inner radius of the outline of star polygon {n/k} with outer radius r. */
export const starInner = (r, n, k) => r * Math.cos(Math.PI * k / n) / Math.cos(Math.PI * (k - 1) / n);

/** Outline path of star {n/k} (k = 1 gives the regular n-gon). */
export function starPoly(ctx, cx, cy, r, n, k, rot = 0){
  const ri = k > 1 ? starInner(r, n, k) : r, a0 = rot - Math.PI / 2;
  ctx.beginPath();
  for(let i = 0; i < n; i++){
    const p = polar(cx, cy, r, a0 + i * TAU / n);
    i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
    if(k > 1){ const q = polar(cx, cy, ri, a0 + (i + 0.5) * TAU / n); ctx.lineTo(q[0], q[1]); }
  }
  ctx.closePath();
}

/** Filled or outlined star {n/k}; o.inner adds a concentric inner star. */
export function star(ctx, cx, cy, r, n, k, o){
  o = opts(o);
  scoped(ctx, o, () => {
    const box = [cx - r, cy - r, 2 * r, 2 * r];
    starPoly(ctx, cx, cy, r, n, k, o.rot);
    if(o.outline){ ctx.strokeStyle = paint(ctx, o.color, box); ctx.lineWidth = o.lw; ctx.lineJoin = 'miter'; ctx.stroke(); }
    else solid(ctx, o, o.color, box, r > 40);
    if(o.inner){ starPoly(ctx, cx, cy, r * o.inner, n, k, o.rot + Math.PI / n); solid(ctx, Object.assign({}, o, {ink:false}), o.accent, box); }
  });
}

/* ---- interlace (over/under weaving) ---- */

/** Lines of star {n/k} drawn as chords: point i → point i+k. Returns closed strands (arrays of points). */
function starStrands(cx, cy, r, n, k, rot){
  const pts = Array.from({length:n}, (_, i) => polar(cx, cy, r, rot - Math.PI / 2 + i * TAU / n));
  const g = gcd(n, k), strands = [];
  for(let s = 0; s < g; s++){
    const st = []; let i = s;
    do { st.push(pts[i]); i = (i + k) % n; } while(i !== s);
    strands.push(st);
  }
  return strands;
}
const gcd = (a, b) => b ? gcd(b, a % b) : a;

/** Draws closed strands as woven bands: each strand alternates over/under at successive crossings. */
export function weave(ctx, strands, o){
  o = opts(o);
  const bw = Math.max(1, (o.band || 6) * o.lw), edge = Math.max(0.6, bw * 0.16);
  const segs = [];
  strands.forEach((st, si) => st.forEach((p, i) => segs.push({si, a:p, b:st[(i + 1) % st.length], hits:[]})));
  const xs = [];
  for(let i = 0; i < segs.length; i++) for(let j = i + 1; j < segs.length; j++){
    const h = segHit(segs[i].a, segs[i].b, segs[j].a, segs[j].b);
    if(h){ const x = {p:h.p, segs:[segs[i], segs[j]], over:null}; xs.push(x); segs[i].hits.push({t:h.t, x}); segs[j].hits.push({t:h.u, x}); }
  }
  // Walk each strand in order, alternating over/under; respect crossings already decided by an earlier strand.
  for(let si = 0; si < strands.length; si++){
    let last = null;
    for(const s of segs.filter(q => q.si === si)){
      s.hits.sort((p, q) => p.t - q.t);
      for(const {x} of s.hits){
        let mine;
        if(x.over) mine = x.over === s;
        else { mine = last === null ? true : !last; x.over = mine ? s : x.segs[0] === s ? x.segs[1] : x.segs[0]; }
        last = mine;
      }
    }
  }
  const box = boundsOf(strands), inner = Math.max(0.4, bw - 2 * edge);
  const stroke2 = () => {
    ctx.lineWidth = bw; ctx.strokeStyle = paint(ctx, o.color, box); ctx.stroke();
    ctx.lineWidth = inner; ctx.strokeStyle = o.fillBand || o.bg; ctx.stroke();
  };
  scoped(ctx, o, () => {
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.miterLimit = 10;
    for(const st of strands){ ctx.beginPath(); polyPath(ctx, st, true); stroke2(); }
    // Redraw the over strand across the under strand's band (clip = the under band's strip at this crossing).
    for(const x of xs){
      const s = x.over, u = x.segs[0] === s ? x.segs[1] : x.segs[0];
      const d = norm(sub(s.b, s.a)), e = norm(sub(u.b, u.a)), ne = [-e[1], e[0]], L = bw * 4, half = bw / 2 + 2;
      ctx.save();
      ctx.beginPath();
      polyPath(ctx, [add(add(x.p, mul(e, -L)), mul(ne, -half)), add(add(x.p, mul(e, L)), mul(ne, -half)),
        add(add(x.p, mul(e, L)), mul(ne, half)), add(add(x.p, mul(e, -L)), mul(ne, half))]);
      ctx.clip();
      const da = len(sub(x.p, s.a)), db = len(sub(s.b, x.p));
      ctx.beginPath(); ctx.moveTo(...add(x.p, mul(d, -Math.min(L, da)))); ctx.lineTo(...add(x.p, mul(d, Math.min(L, db)))); stroke2();
      ctx.restore();
    }
  });
}
function boundsOf(strands){
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for(const st of strands) for(const p of st){ x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  return [x0, y0, x1 - x0, y1 - y0];
}

/** Interlaced star {n/k}: Solomon's seal is {6/2}, the khatam is {8/2}. */
export function interlacedStar(ctx, cx, cy, r, n, k, o){
  o = opts(o);
  weave(ctx, starStrands(cx, cy, r, n, k, o.rot), Object.assign({band:r * 0.11}, o));
}
export const solomonSeal = (ctx, cx, cy, r, o) => interlacedStar(ctx, cx, cy, r, 6, 2, o);
export const khatam = (ctx, cx, cy, r, o) => interlacedStar(ctx, cx, cy, r, 8, 2, o);

/* ---- rosette (star dish) ---- */

/** Geometry of a star dish ("tabaq") built the traditional way: the edges of the central {n/k} star are
 *  continued straight outward; where continued lines from neighbouring points meet they close a ring of
 *  kite petals, whose outer edges are continued again for the next ring. Returns unit-radius rings:
 *  rings[0] = star valleys, rings[1] = star tips, rings[j+1] = apexes of petal ring j; each ring is [radius, angleOffset]. */
function tabaqRings(n, k, layers){
  const step = TAU / n, ri = starInner(1, n, k);
  const rings = [[ri, 0.5], [1, 0]];
  for(let j = 1; j <= layers; j++){
    const [rA, oA] = rings[j - 1], [rB, oB] = rings[j];   // line from ring j-2 point through ring j-1 point
    const off = oA;                                        // new apex shares the angle family of ring j-2
    const p = [rA * Math.cos((oB - 0.5) * step), rA * Math.sin((oB - 0.5) * step)];
    const q = [rB * Math.cos(oB * step), rB * Math.sin(oB * step)];
    const ray = [Math.cos((oB + 0.5) * step), Math.sin((oB + 0.5) * step)];
    // intersect line p→q with the ray from the origin at the apex angle
    const d = sub(q, p), den = cross(d, ray);
    let t = Math.abs(den) < 1e-9 ? null : cross(p, ray) / -den;
    let R = t === null ? rB * 1.3 : len(add(p, mul(d, t)));
    if(!(R > rB * 1.02) || R > rB * 2.2) R = rB * 1.35;    // keep rings well-formed for steep stars
    rings.push([R, off]);
  }
  return rings;
}

/** Star sharpness that gives the classic dish for each point count. */
const TABAQ_K = {5:2, 6:2, 8:2, 10:3, 12:4, 16:6};

/** Star-dish rosette (tabaq) of radius r. o.layers: petal rings (1–3); o.k: star sharpness;
 *  o.fillMode: 'line' (hairlines, luxurious), 'tint' (lines + soft alternating fills), 'solid' (bold print). */
export function rosette(ctx, cx, cy, r, n, o){
  o = opts(Object.assign({layers:2, k:TABAQ_K[n] || Math.max(2, Math.round(n * 0.36)), fillMode:'tint', ring:true}, o));
  const L = Math.max(1, Math.min(3, o.layers)), k = Math.max(2, Math.min(o.k, Math.floor((n - 1) / 2)));
  const rings = tabaqRings(n, k, L), scale = r * (o.ring ? 0.9 : 1) / rings[rings.length - 1][0];
  const a0 = o.rot - Math.PI / 2, step = TAU / n;
  const P = (j, i) => polar(cx, cy, rings[j][0] * scale, a0 + (i + rings[j][1]) * step);
  const box = [cx - r, cy - r, 2 * r, 2 * r];
  const lw = Math.max(0.5, r * 0.012 * o.lw);
  const tint = (style, a) => { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = paint(ctx, style, box); ctx.fill(); ctx.restore(); };
  scoped(ctx, o, () => {
    ctx.lineJoin = 'miter'; ctx.miterLimit = 12;
    if(o.ring){
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.strokeStyle = paint(ctx, o.color, box); ctx.lineWidth = lw * 1.6; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.955, 0, TAU); ctx.lineWidth = lw * 0.7; ctx.stroke();
    }
    // petal rings, outermost first
    for(let j = L; j >= 1; j--){
      for(let i = 0; i < n; i++){
        const apex = P(j + 1, i), inner = P(j - 1, i);
        // the two ring j points that flank this apex
        const oj = rings[j][1], oa = rings[j + 1][1];
        const iA = Math.round(oa - oj - 0.5) + i, sA = P(j, iA), sB = P(j, iA + 1);
        ctx.beginPath(); polyPath(ctx, [inner, sA, apex, sB]);
        if(o.fillMode === 'solid') solid(ctx, o, j % 2 ? o.accent : o.color, box);
        else { ctx.fillStyle = o.bg; ctx.fill(); if(o.fillMode === 'tint') tint(o.accent, j === L ? 0.34 : 0.14); }
        ctx.strokeStyle = paint(ctx, o.fillMode === 'solid' ? o.bg : o.color, box); ctx.lineWidth = lw; ctx.stroke();
      }
    }
    // central star and its heart
    starPoly(ctx, cx, cy, scale, n, k, o.rot);
    if(o.fillMode === 'solid') solid(ctx, o, o.color, box);
    else { ctx.fillStyle = o.bg; ctx.fill(); if(o.fillMode === 'tint') tint(o.color, 0.9); }
    ctx.strokeStyle = paint(ctx, o.color, box); ctx.lineWidth = lw; ctx.stroke();
    starPoly(ctx, cx, cy, scale * rings[0][0] * 0.62, n, k, o.rot + Math.PI / n);
    ctx.fillStyle = paint(ctx, o.fillMode === 'line' ? o.color : o.accent, box); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, scale * rings[0][0] * 0.14, 0, TAU); ctx.fillStyle = o.bg; ctx.fill();
  });
}

/** Thin concentric medallion: star {n/k} outline inside a double circle — light, modern. */
export function medallion(ctx, cx, cy, r, n, o){
  o = opts(Object.assign({k:n >= 12 ? 5 : n >= 8 ? 3 : 2}, o));
  const box = [cx - r, cy - r, 2 * r, 2 * r], lw = Math.max(0.6, r * 0.022 * o.lw);
  scoped(ctx, o, () => {
    ctx.strokeStyle = paint(ctx, o.color, box); ctx.lineWidth = lw;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.93, 0, TAU); ctx.lineWidth = lw * 0.5; ctx.stroke();
    const strands = starStrands(cx, cy, r * 0.88, n, Math.min(o.k, Math.floor((n - 1) / 2)), o.rot);
    ctx.lineWidth = lw; ctx.lineJoin = 'miter';
    for(const st of strands){ ctx.beginPath(); polyPath(ctx, st); ctx.stroke(); }
    starPoly(ctx, cx, cy, r * 0.3, n, 2, o.rot + Math.PI / n);
    ctx.fillStyle = paint(ctx, o.accent, box); ctx.fill();
  });
}
export { flat };
