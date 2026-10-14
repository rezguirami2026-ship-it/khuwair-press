/* Prestige ornaments for the official-looking identities:
 *   guillocheRosette / guillocheBorder — security-print line work (interlaced sine waves), as on diplomas and banknotes
 *   filigreeCorner — gold scroll flourish for a page corner
 * All take the standard opts {color, accent, lw, alpha, ink, bg}. */
import { opts, paint, scoped, TAU } from './core.js';
import { starPoly, rosette } from './stars.js';

/** Guilloche rosette: rings of interlaced polar waves r = R·(c + a·sin(n·t + phase)), drawn as hairlines. */
export function guillocheRosette(ctx, cx, cy, R, o){
  o = opts(Object.assign({n:14, lines:8, disc:true}, o));
  const box = [cx - R, cy - R, 2 * R, 2 * R], st = paint(ctx, o.color, box), ac = paint(ctx, o.accent, box);
  scoped(ctx, o, () => {
    if(o.disc){ ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fillStyle = o.bg; ctx.fill(); }
    const ring = (r0, r1, n, lines, style, lw) => {
      const c = (r0 + r1) / 2, a = (r1 - r0) / 2, steps = Math.max(240, n * 36);
      ctx.strokeStyle = style; ctx.lineWidth = lw;
      for(let j = 0; j < lines; j++){
        ctx.beginPath();
        for(let i = 0; i <= steps; i++){
          const t = i / steps * TAU, r = c + a * Math.sin(n * t + j * TAU / lines / 2);
          const x = cx + Math.cos(t) * r, y = cy + Math.sin(t) * r;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
    };
    const lw = Math.max(0.3, R * 0.007 * o.lw);
    ring(R * 0.62, R * 0.98, o.n, o.lines, st, lw);
    ring(R * 0.3, R * 0.64, Math.max(5, Math.round(o.n / 2)), Math.max(4, o.lines - 2), ac, lw);
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.strokeStyle = st; ctx.lineWidth = lw * 2.2; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.3, 0, TAU); ctx.lineWidth = lw * 1.6; ctx.stroke();
    starPoly(ctx, cx, cy, R * 0.24, 8, 3); ctx.fillStyle = o.ink ? st : ac; ctx.fill();
  });
}

/** Guilloche border: a band of two interlaced sine-wave families along each side of [x, y, w, h], ruled on both
 *  edges, with guilloche rosettes over the four corners. `band` is the band width. */
export function guillocheBorder(ctx, x, y, w, h, o){
  o = opts(Object.assign({band:30, lines:5}, o));
  const b = o.band, box = [x, y, w, h], st = paint(ctx, o.color, box), ac = paint(ctx, o.accent, box);
  const lw = Math.max(0.3, 0.55 * o.lw);
  scoped(ctx, o, () => {
    // one straight run from (0, 0) to (len, 0) in a local frame, band below it
    const run = len => {
      const amp = b * 0.36, mid = b / 2, per = b * 1.5, n = Math.max(1, Math.round(len / per)), P = len / n, steps = Math.ceil(len / 1.5);
      for(const [fam, style] of [[1, st], [-1, ac]]){
        ctx.strokeStyle = style; ctx.lineWidth = lw;
        for(let j = 0; j < o.lines; j++){
          ctx.beginPath();
          for(let i = 0; i <= steps; i++){
            const u = i / steps * len, v = mid + fam * amp * Math.sin(TAU * u / P + j * Math.PI / o.lines);
            i ? ctx.lineTo(u, v) : ctx.moveTo(u, v);
          }
          ctx.stroke();
        }
      }
    };
    const side = (tx, ty, ang, len) => { ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang); run(len); ctx.restore(); };
    side(x + b, y, 0, w - 2 * b);
    side(x + w, y + b, Math.PI / 2, h - 2 * b);
    side(x + w - b, y + h, Math.PI, w - 2 * b);
    side(x, y + h - b, -Math.PI / 2, h - 2 * b);
    // edge rules: heavy outside, fine inside
    ctx.strokeStyle = st;
    ctx.lineWidth = lw * 3.2; ctx.strokeRect(x, y, w, h);
    ctx.lineWidth = lw * 1.4; ctx.strokeRect(x + b, y + b, w - 2 * b, h - 2 * b);
    ctx.lineWidth = lw; ctx.strokeRect(x + b + 5, y + b + 5, w - 2 * b - 10, h - 2 * b - 10);
  });
  for(const [px, py] of [[x + b / 2, y + b / 2], [x + w - b / 2, y + b / 2], [x + w - b / 2, y + h - b / 2], [x + b / 2, y + h - b / 2]])
    guillocheRosette(ctx, px, py, b * 0.95, Object.assign({}, o, {n:10, lines:6}));
}

/** Corner piece for the top-left inside corner (x, y) of a frame: a quarter rosette under two gold arcs,
 *  with fine rules running along both edges ending in a bead and a small diamond. Mirror with ctx transforms. */
export function filigreeCorner(ctx, x, y, s, o){
  o = opts(o);
  const box = [x, y, s, s], st = paint(ctx, o.color, box), r = s * 0.42;
  scoped(ctx, o, () => {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, r * 1.02, r * 1.02); ctx.clip();
    rosette(ctx, x, y, r * 0.98, 16, {layers:2, color:o.color, accent:o.accent, bg:o.bg, ink:o.ink});
    ctx.restore();
    ctx.strokeStyle = st; ctx.fillStyle = st; ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(0.8, s * 0.014); ctx.beginPath(); ctx.arc(x, y, r * 1.02, 0, Math.PI / 2); ctx.stroke();
    ctx.lineWidth = Math.max(0.5, s * 0.006); ctx.beginPath(); ctx.arc(x, y, r * 1.12, 0, Math.PI / 2); ctx.stroke();
    // beads on the outer arc
    for(let i = 1; i < 6; i++){ const a = i * Math.PI / 12; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.21, y + Math.sin(a) * r * 1.21, s * 0.011, 0, TAU); ctx.fill(); }
    // rules along both edges
    for(const [dx, dy] of [[1, 0], [0, 1]]){
      const g = s * 0.05, a0 = r * 1.12, a1 = s;
      ctx.lineWidth = Math.max(0.5, s * 0.006);
      ctx.beginPath(); ctx.moveTo(x + dx * a0 + dy * g, y + dy * a0 + dx * g); ctx.lineTo(x + dx * a1 + dy * g, y + dy * a1 + dx * g); ctx.stroke();
      const ex = x + dx * (a1 + s * 0.04) + dy * g, ey = y + dy * (a1 + s * 0.04) + dx * g, d = s * 0.028;
      ctx.beginPath(); ctx.moveTo(ex - dx * d * 1.6, ey - dy * d * 1.6); ctx.lineTo(ex - dy * d, ey - dx * d); ctx.lineTo(ex + dx * d * 1.6, ey + dy * d * 1.6); ctx.lineTo(ex + dy * d, ey + dx * d); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(x + dx * (a1 - s * 0.06) + dy * g, y + dy * (a1 - s * 0.06) + dx * g, s * 0.012, 0, TAU); ctx.fill();
    }
  });
}
