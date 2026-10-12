/* «ملكي» ornaments: curved corner sashes with gold ribbons, laurel award badge, small arch ornaments,
 * diamond-tipped rules. All drawn in code; colours come from the theme (primary) and gold. */
import { opts, paint, goldGradient, scoped, polyPath, TAU } from './core.js';
import { starPoly, rosette } from './stars.js';
import { pattern } from './patterns.js';
import { archPath } from './oman.js';

const gold = (ctx, x, y, w, h) => goldGradient(ctx, x, y, w, h);

/** Curved sash across the top-left corner (rotate the canvas for the other corners).
 *  a = reach along the top edge, b = reach down the left edge. */
export function cornerSash(ctx, a, b, o){
  o = opts(o);
  // a gentle outward swoop from the top edge to the left edge (passes near 0.5a, 0.5b)
  const curve = (k, join) => { join ? ctx.lineTo(a * k, -6) : ctx.moveTo(a * k, -6); ctx.bezierCurveTo(a * k * 0.78, b * k * 0.3, a * k * 0.3, b * k * 0.78, -6, b * k); };
  scoped(ctx, o, () => {
    // the sash: primary colour filled with a faint girih pattern
    ctx.save();
    ctx.beginPath(); ctx.moveTo(-6, -6); curve(1, true); ctx.closePath();
    if(o.ink){ ctx.strokeStyle = o.color; ctx.lineWidth = 1.4; ctx.stroke(); }
    else {
      ctx.fillStyle = o.color; ctx.fill(); ctx.clip();
      pattern(ctx, '3.12.12', -6, -6, a + 12, b + 12, {size:110, color:'#FFFFFF', alpha:0.13, lw:0.8, bg:o.color});
    }
    ctx.restore();
    // ribbons following the edge: wide gold, a band of the primary colour, a fine gold line
    const g = o.ink ? o.color : gold(ctx, 0, 0, a * 1.3, b * 1.3);
    for(const [k, lw, st] of [[1.0, 7, g], [1.07, 9, o.ink ? o.color : o.color], [1.13, 2.4, g], [1.19, 1.2, g]]){
      ctx.beginPath(); curve(k); ctx.lineWidth = lw; ctx.strokeStyle = st; ctx.lineCap = 'butt'; ctx.stroke();
    }
    // a highlight on the wide ribbon gives it a satin look
    if(!o.ink){ ctx.beginPath(); curve(0.995); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke(); }
  });
}

/** Award badge: pleated gold rim, disc in the theme colour, laurel wreath, a star and three small stars, two ribbon tails. */
export function laurelBadge(ctx, cx, cy, r, o){
  o = opts(o);
  const box = [cx - r, cy - r, 2 * r, 2 * r], G = o.ink ? o.color : gold(ctx, cx - r, cy - r, 2 * r, 2 * r), D = o.ink ? '#FFFFFF' : o.color;
  scoped(ctx, o, () => {
    // ribbon tails
    for(const sg of [-1, 1]){
      ctx.save(); ctx.translate(cx + sg * r * 0.3, cy + r * 0.55); ctx.rotate(sg * 0.22);
      ctx.beginPath(); polyPath(ctx, [[-r * 0.24, 0], [r * 0.24, 0], [r * 0.24, r * 1.3], [0, r * 1.06], [-r * 0.24, r * 1.3]]);
      ctx.fillStyle = D; ctx.fill(); ctx.lineWidth = Math.max(1, r * 0.035); ctx.strokeStyle = G; ctx.stroke();
      ctx.restore();
    }
    // pleated rim
    ctx.beginPath();
    const n = 30;
    for(let i = 0; i < 2 * n; i++){ const a = i * Math.PI / n, rr = i % 2 ? r * 0.93 : r; i ? ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : ctx.moveTo(cx + rr, cy); }
    ctx.closePath(); ctx.fillStyle = G; ctx.fill();
    if(o.ink){ ctx.lineWidth = 1; ctx.strokeStyle = o.color; ctx.stroke(); }
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, 0, TAU); ctx.fillStyle = D; ctx.fill(); ctx.lineWidth = r * 0.04; ctx.strokeStyle = G; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.72, 0, TAU); ctx.lineWidth = r * 0.015; ctx.stroke();
    // laurel: leaves along two arcs
    ctx.fillStyle = G;
    for(const sg of [-1, 1]){
      for(let i = 0; i < 7; i++){
        const a = Math.PI / 2 + sg * (0.35 + i * 0.27), lx = cx + Math.cos(a) * r * 0.56, ly = cy + Math.sin(a) * r * 0.56;
        ctx.save(); ctx.translate(lx, ly); ctx.rotate(a + sg * Math.PI / 2 - sg * 0.5);
        ctx.beginPath(); ctx.ellipse(0, 0, r * 0.1, r * 0.04, 0, 0, TAU); ctx.fill(); ctx.restore();
      }
    }
    star5(ctx, cx, cy + r * 0.05, r * 0.26); ctx.fill();
    for(const dx of [-1, 0, 1]){ star5(ctx, cx + dx * r * 0.17, cy - r * 0.42 + Math.abs(dx) * r * 0.04, r * 0.07); ctx.fill(); }
  });
}
function star5(ctx, cx, cy, r){
  ctx.beginPath();
  for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; i ? ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  ctx.closePath();
}

/** Small arch ornament sitting on a rule (flip = upside down, for the bottom edge), with a star dish inside
 *  and diamond-tipped lines to both sides. */
export function archOrnament(ctx, cx, y, halfLine, o){
  o = opts(Object.assign({flip:false, size:46}, o));
  const s = o.size, G = o.ink ? o.color : gold(ctx, cx - halfLine, y - s, halfLine * 2, s * 2);
  scoped(ctx, o, () => {
    ctx.save(); ctx.translate(cx, y); if(o.flip) ctx.scale(1, -1);
    // rule with diamonds
    ctx.strokeStyle = G; ctx.fillStyle = G; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-halfLine, 0); ctx.lineTo(-s * 1.15, 0); ctx.moveTo(s * 1.15, 0); ctx.lineTo(halfLine, 0); ctx.stroke();
    for(const sg of [-1, 1]){ const x = sg * (halfLine + 5); ctx.beginPath(); polyPath(ctx, [[x, -3.4], [x + 3.4, 0], [x, 3.4], [x - 3.4, 0]]); ctx.fill(); }
    // arch: gold outline, a fine inner line in the theme colour
    ctx.beginPath(); archPath(ctx, -s * 1.15, -s * 0.95, s * 2.3, s * 0.95, 'scalloped', 0.62); ctx.lineWidth = 2.2; ctx.stroke();
    ctx.beginPath(); archPath(ctx, -s * 0.98, -s * 0.8, s * 1.96, s * 0.8, 'scalloped', 0.62); ctx.lineWidth = 1.1; ctx.strokeStyle = o.color; ctx.stroke();
    ctx.restore();
    rosette(ctx, cx, y + (o.flip ? 1 : -1) * s * 0.4, s * 0.34, 8, {layers:1, ring:false, color:o.color, accent:o.ink ? o.color : 'gold', fillMode:o.ink ? 'line' : 'tint', bg:o.bg});
  });
}

/** Rule with diamond tips and a four-petal fleuron in the middle. */
export function fleuronRule(ctx, cx, y, half, o){
  o = opts(o);
  const G = o.ink ? o.color : gold(ctx, cx - half, y - 8, half * 2, 16);
  scoped(ctx, o, () => {
    ctx.strokeStyle = G; ctx.fillStyle = G; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - half, y); ctx.lineTo(cx - 16, y); ctx.moveTo(cx + 16, y); ctx.lineTo(cx + half, y); ctx.stroke();
    for(const sg of [-1, 1]){ const x = cx + sg * (half + 5); ctx.beginPath(); polyPath(ctx, [[x, y - 3.6], [x + 3.6, y], [x, y + 3.6], [x - 3.6, y]]); ctx.fill(); }
    for(let i = 0; i < 4; i++){
      const a = i * Math.PI / 2;
      ctx.save(); ctx.translate(cx, y); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(4.5, -5, 0, -11); ctx.quadraticCurveTo(-4.5, -5, 0, 0); ctx.fill(); ctx.restore();
    }
    ctx.beginPath(); ctx.arc(cx, y, 2.2, 0, TAU); ctx.fillStyle = o.color; ctx.fill();
  });
}

/** Corner rosette square for the frame (top-right / bottom-left in this design). */
export function cornerRosette(ctx, x, y, s, o){
  o = opts(o);
  scoped(ctx, o, () => {
    ctx.beginPath(); ctx.rect(x - s / 2, y - s / 2, s, s); ctx.fillStyle = o.bg; ctx.fill();
    ctx.strokeStyle = o.ink ? o.color : gold(ctx, x - s, y - s, s * 2, s * 2); ctx.lineWidth = 1.2; ctx.stroke();
    rosette(ctx, x, y, s * 0.42, 8, {layers:1, ring:false, color:o.color, accent:o.ink ? o.color : 'gold', fillMode:'line', bg:o.bg});
    starPoly(ctx, x, y, s * 0.1, 8, 2); ctx.fillStyle = o.ink ? o.color : gold(ctx, x - s, y - s, s * 2, s * 2); ctx.fill();
  });
}
