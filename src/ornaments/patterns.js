/* Repeating geometric backgrounds generated with Hankin's "polygons in contact" method:
 * an underlying tiling is laid out, and from the midpoint of every edge two rays leave at the contact angle θ;
 * rays from neighbouring edges meet inside each tile and their segments form the star pattern.
 *   khatam  — 4.8.8 tiling → 8-point stars and crosses (the classic khatam field)
 *   girih  — 3.12.12 tiling → 12-point stars with hexagonal girih rhythm
 *   hex     — 6.6.6 tiling → 6-point stars (Solomon's seal field)
 *   square  — 4.4.4.4 tiling → 4-point stars / interlaced lattice
 *   star-cross — 8-point star & cross grid drawn directly (strong, simple, prints well). */
import { opts, paint, scoped, rot2, sub, add, mul, norm, cross, rayHit, polyPath, ngon, TAU } from './core.js';
import { starPoly } from './stars.js';

const S2 = Math.SQRT2, S3 = Math.sqrt(3);

/** Underlying tilings: return polygons covering box [x, y, w, h] with tile edge a. */
const TILINGS = {
  square(x, y, w, h, a){
    const out = [];
    for(let j = Math.floor(y / a) - 1; j * a < y + h + a; j++) for(let i = Math.floor(x / a) - 1; i * a < x + w + a; i++)
      out.push([[i * a, j * a], [(i + 1) * a, j * a], [(i + 1) * a, (j + 1) * a], [i * a, (j + 1) * a]]);
    return out;
  },
  hex(x, y, w, h, a){
    const out = [], dx = a * S3, dy = a * 1.5;
    for(let j = Math.floor(y / dy) - 1; j * dy < y + h + 2 * a; j++) for(let i = Math.floor(x / dx) - 1; i * dx < x + w + dx; i++){
      const cx = i * dx + (j & 1 ? dx / 2 : 0), cy = j * dy;
      out.push(ngon(cx, cy, a, 6, -Math.PI / 2));
    }
    return out;
  },
  '4.8.8'(x, y, w, h, a){
    const out = [], p = a * (1 + S2), R8 = a / (2 * Math.sin(Math.PI / 8)), R4 = a / S2;
    for(let j = Math.floor(y / p) - 1; j * p < y + h + p; j++) for(let i = Math.floor(x / p) - 1; i * p < x + w + p; i++){
      out.push(ngon(i * p, j * p, R8, 8, Math.PI / 8));
      out.push(ngon((i + 0.5) * p, (j + 0.5) * p, R4, 4, 0));
    }
    return out;
  },
  '3.12.12'(x, y, w, h, a){
    const out = [], D = a * (2 + S3), R12 = a / (2 * Math.sin(Math.PI / 12)), dy = D * S3 / 2, rt = a / S3;
    const C = (i, j) => [i * D + (j & 1 ? D / 2 : 0), j * dy];
    for(let j = Math.floor(y / dy) - 1; j * dy < y + h + dy * 2; j++) for(let i = Math.floor(x / D) - 2; i * D < x + w + D * 2; i++){
      const c0 = C(i, j);
      out.push(ngon(c0[0], c0[1], R12, 12, Math.PI / 12));
      // the two triangular holes below-right of this centre
      const c1 = C(i + 1, j), c2 = C(j & 1 ? i + 1 : i, j + 1), c3 = C(j & 1 ? i : i - 1, j + 1);
      for(const tri of [[c0, c1, c2], [c0, c2, c3]]){
        const g = [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3];
        out.push([[0, 1], [1, 2], [2, 0]].map(([m, n]) => {
          const mid = [(tri[m][0] + tri[n][0]) / 2, (tri[m][1] + tri[n][1]) / 2];
          return add(g, mul(norm(sub(mid, g)), rt));
        }));
      }
    }
    return out;
  }
};

/** Hankin construction on one convex polygon: returns polylines [m_i, P, m_{i+1}]. */
function hankin(poly, theta){
  const n = poly.length, lines = [];
  let area = 0;
  for(let i = 0; i < n; i++){ const p = poly[i], q = poly[(i + 1) % n]; area += p[0] * q[1] - q[0] * p[1]; }
  const s = area > 0 ? 1 : -1;
  const mids = [], dirs = [];
  for(let i = 0; i < n; i++){
    const p = poly[i], q = poly[(i + 1) % n];
    mids.push([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]); dirs.push(norm(sub(q, p)));
  }
  for(let i = 0; i < n; i++){
    const j = (i + 1) % n;
    const f = rot2(dirs[i], s * theta), b = rot2(mul(dirs[j], -1), -s * theta);
    const P = rayHit(mids[i], f, mids[j], b);
    if(P) lines.push([mids[i], P, mids[j]]);
  }
  return lines;
}

/** Contact angles that give the canonical look for each tiling (radians). */
const THETA = {square:Math.PI / 3, hex:Math.PI / 3, '4.8.8':3 * Math.PI / 8, '3.12.12':Math.PI / 3};
/** Tile edge length per unit of `size` so that every pattern has a similar visual scale. */
const EDGE = {square:1, hex:0.58, '4.8.8':0.42, '3.12.12':0.27};

/** Fills [x, y, w, h] with a pattern. o.size = repeat size, o.theta overrides the contact angle (radians),
 *  o.band > 0 draws the lines as strapwork bands of that width. */
export function pattern(ctx, kind, x, y, w, h, o){
  o = opts(Object.assign({size:80}, o));
  const size = o.size / o.density;
  scoped(ctx, o, () => {
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if(kind === 'star-cross') return starCross(ctx, x, y, w, h, size, o);
    const tiling = TILINGS[kind] || TILINGS['4.8.8'];
    // tile in rotated space around the box centre
    const cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2 + size;
    ctx.translate(cx, cy); ctx.rotate(o.rot);
    const polys = tiling(-R, -R, 2 * R, 2 * R, size * (EDGE[kind] || 0.5));
    const theta = o.theta || THETA[kind] || Math.PI / 4;
    ctx.beginPath();
    for(const poly of polys) for(const l of hankin(poly, theta)) polyPath(ctx, l, false);
    ctx.lineJoin = 'miter'; ctx.miterLimit = 6; ctx.lineCap = 'round';
    const lw = Math.max(0.5, size * 0.02 * o.lw), box = [-R, -R, 2 * R, 2 * R];
    if(o.band){
      ctx.lineWidth = o.band; ctx.strokeStyle = paint(ctx, o.color, box); ctx.stroke();
      ctx.lineWidth = Math.max(0.3, o.band - 2 * lw); ctx.strokeStyle = o.bg; ctx.stroke();
    } else { ctx.lineWidth = lw; ctx.strokeStyle = paint(ctx, o.color, box); ctx.stroke(); }
    if(o.tiles){ // faint underlying tiling (construction lines)
      ctx.beginPath(); for(const poly of polys) polyPath(ctx, poly);
      ctx.lineWidth = lw * 0.4; ctx.globalAlpha *= 0.35; ctx.stroke();
    }
  });
}

/** 8-point stars on a square grid with the crosses between them, all as outlines. */
function starCross(ctx, x, y, w, h, s, o){
  const r = s / 2 / Math.cos(Math.PI / 8) * 0.92, lw = Math.max(0.5, s * 0.02 * o.lw);
  ctx.lineWidth = lw; ctx.strokeStyle = paint(ctx, o.color, [x, y, w, h]); ctx.lineJoin = 'miter';
  for(let j = Math.floor(y / s) - 1; j * s < y + h + s; j++) for(let i = Math.floor(x / s) - 1; i * s < x + w + s; i++){
    starPoly(ctx, i * s, j * s, r, 8, 2, o.rot); ctx.stroke();
    // small inner star echo
    starPoly(ctx, i * s, j * s, r * 0.38, 8, 2, o.rot + Math.PI / 8); ctx.stroke();
  }
}

export const PATTERNS = [['khatam', '4.8.8', 'خاتم ثماني'], ['girih', '3.12.12', 'جيرة اثنا عشري'], ['hex', 'hex', 'سداسي'], ['square', 'square', 'شبكة رباعية'], ['star-cross', 'star-cross', 'نجمة وصليب']];
export { TAU };
