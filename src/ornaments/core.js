/* Shared ornament machinery: standard parameters, paint (flat / gold foil), ink-saving fills, 2D geometry. */

/** Standard ornament parameters. Every ornament takes these (plus its own extras).
 *  density  — 1 = default; > 1 packs more units / finer pattern.
 *  lw       — line weight multiplier.
 *  color    — main color, or 'gold' for the foil effect.
 *  accent   — secondary color (or 'gold').
 *  bg       — paper color, used to cut bands and gaps.
 *  rot      — rotation in radians.
 *  alpha    — opacity of the whole ornament.
 *  ink      — ink-saving mode: large filled areas become outlines. */
export const DEFAULTS = {density:1, lw:1, color:'#7A1F2B', accent:'#AE873A', bg:'#FFFFFF', rot:0, alpha:1, ink:false};
export const opts = o => Object.assign({}, DEFAULTS, o || {});

export const GOLD_STOPS = [[0, '#7C5A1E'], [0.22, '#C49A45'], [0.42, '#F1DA97'], [0.55, '#C8A04D'], [0.72, '#9C7429'], [0.86, '#E3C67A'], [1, '#7C5A1E']];
/** Foil-like diagonal gradient across a box: dark and light bands like light on gold leaf. */
export function goldGradient(ctx, x, y, w, h){
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  for(const [t, c] of GOLD_STOPS) g.addColorStop(t, c);
  return g;
}
/** Resolves a color ('gold' or CSS) to a fill/stroke style for the given bounding box. */
export function paint(ctx, color, box){
  if(color === 'gold') return goldGradient(ctx, box[0], box[1], box[2], box[3]);
  return color;
}
/** Solid flat representative of a color (for places that cannot take a gradient). */
export const flat = c => c === 'gold' ? '#B08A3E' : c;

/** Fills the current path, or in ink-saving mode strokes it (with an inner hairline for large shapes). */
export function solid(ctx, o, style, box, big){
  if(o.ink){
    ctx.strokeStyle = paint(ctx, style, box); ctx.lineWidth = Math.max(0.8, 1.2 * o.lw); ctx.stroke();
    if(big){ ctx.save(); ctx.clip(); ctx.lineWidth = Math.max(0.6, 0.6 * o.lw); ctx.globalAlpha *= 0.6; ctx.stroke(); ctx.restore(); }
  } else { ctx.fillStyle = paint(ctx, style, box); ctx.fill(); }
}

/* ---- geometry ---- */
export const TAU = Math.PI * 2;
export const polar = (cx, cy, r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
export const rot2 = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const mul = (a, k) => [a[0] * k, a[1] * k];
export const len = v => Math.hypot(v[0], v[1]);
export const norm = v => { const l = len(v) || 1; return [v[0] / l, v[1] / l]; };
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
export const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Intersection of rays p + t·d and q + s·e (t, s ≥ 0); null if parallel or behind. */
export function rayHit(p, d, q, e){
  const den = cross(d, e);
  if(Math.abs(den) < 1e-9) return null;
  const w = sub(q, p), t = cross(w, e) / den, s = cross(w, d) / den;
  return t >= -1e-9 && s >= -1e-9 ? add(p, mul(d, t)) : null;
}
/** Proper intersection of segments ab and cd: {p, t, u} or null. */
export function segHit(a, b, c, d){
  const r = sub(b, a), s = sub(d, c), den = cross(r, s);
  if(Math.abs(den) < 1e-9) return null;
  const w = sub(c, a), t = cross(w, s) / den, u = cross(w, r) / den;
  return t > 1e-6 && t < 1 - 1e-6 && u > 1e-6 && u < 1 - 1e-6 ? {p:add(a, mul(r, t)), t, u} : null;
}
export function polyPath(ctx, pts, close = true){
  ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if(close) ctx.closePath();
}
/** Regular polygon vertices (first vertex at angle a0). */
export const ngon = (cx, cy, r, n, a0 = -Math.PI / 2) => Array.from({length:n}, (_, i) => polar(cx, cy, r, a0 + i * TAU / n));

/** Runs fn inside save/restore with alpha applied. */
export function scoped(ctx, o, fn){ ctx.save(); ctx.globalAlpha *= o.alpha; try{ fn(); } finally { ctx.restore(); } }
