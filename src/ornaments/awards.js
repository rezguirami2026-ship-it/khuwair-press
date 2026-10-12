/* Certificate elements: dividers, round seals, ribbons and award badges.
 * Text is never bent along a curve (Arabic must be drawn as whole strings to keep letters joined),
 * so seals and badges leave a straight label area for the template to fill. */
import { opts, paint, solid, scoped, polyPath, polar, TAU, flat } from './core.js';
import { starPoly, rosette, interlacedStar } from './stars.js';

/** Horizontal divider centred at (cx, y), half-length `half`. styles: star | rosette | diamonds | knot | taper */
export function ornDivider(ctx, cx, y, half, o){
  o = opts(Object.assign({style:'taper', size:10}, o));
  const s = o.size, box = [cx - half, y - s, 2 * half, 2 * s], st = paint(ctx, o.color, box), ac = paint(ctx, o.accent, box);
  const lw = Math.max(0.6, 1.2 * o.lw);
  const taper = (x0, x1) => { // a line that thins towards its end
    const dir = Math.sign(x1 - x0);
    ctx.beginPath(); ctx.moveTo(x0, y - lw); ctx.lineTo(x1, y); ctx.lineTo(x0, y + lw); ctx.closePath(); ctx.fillStyle = st; ctx.fill();
    return dir;
  };
  scoped(ctx, o, () => {
    if(o.style === 'star'){
      ctx.strokeStyle = st; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(cx - half, y); ctx.lineTo(cx - s * 1.8, y); ctx.moveTo(cx + s * 1.8, y); ctx.lineTo(cx + half, y); ctx.stroke();
      starPoly(ctx, cx, y, s, 8, 2); ctx.fillStyle = ac; ctx.fill();
      for(const sg of [-1, 1]){ ctx.beginPath(); ctx.arc(cx + sg * (half + s * 0.6), y, s * 0.26, 0, TAU); ctx.fillStyle = st; ctx.fill(); }
    } else if(o.style === 'rosette'){
      taper(cx - s * 2.2, cx - half); taper(cx + s * 2.2, cx + half);
      rosette(ctx, cx, y, s * 1.7, 8, {layers:1, color:o.color, accent:o.accent, bg:o.bg, fillMode:'mixed', ink:o.ink});
    } else if(o.style === 'diamonds'){
      const n = 4;
      for(let i = 0; i < n; i++){
        const d = s * (1 - i * 0.2), off = i === 0 ? 0 : s * (0.9 + i * 1.6);
        for(const sg of i ? [-1, 1] : [1]){
          const x = cx + sg * off;
          ctx.beginPath(); polyPath(ctx, [[x, y - d], [x + d * 0.7, y], [x, y + d], [x - d * 0.7, y]]);
          ctx.fillStyle = i % 2 ? ac : st; ctx.fill();
        }
      }
      const e = s * (0.9 + 3 * 1.6) + s;
      ctx.strokeStyle = st; ctx.lineWidth = lw * 0.8;
      ctx.beginPath(); ctx.moveTo(cx - half, y); ctx.lineTo(cx - e, y); ctx.moveTo(cx + e, y); ctx.lineTo(cx + half, y); ctx.stroke();
    } else if(o.style === 'knot'){
      interlacedStar(ctx, cx, y, s * 1.5, 8, 3, {color:o.color, bg:o.bg, band:s * 0.24, alpha:1});
      taper(cx - s * 1.9, cx - half); taper(cx + s * 1.9, cx + half);
    } else { // taper: modern hairline with a central jewel
      taper(cx - s * 1.2, cx - half); taper(cx + s * 1.2, cx + half);
      ctx.beginPath(); polyPath(ctx, [[cx, y - s * 0.7], [cx + s * 0.5, y], [cx, y + s * 0.7], [cx - s * 0.5, y]]); ctx.fillStyle = ac; ctx.fill();
    }
  });
}

/** Round seal: scalloped rim, dotted ring, central star; leaves a straight label band if o.label is set
 *  (the label itself is drawn by the caller). Returns the label band's inner width. */
export function seal(ctx, cx, cy, r, o){
  o = opts(Object.assign({scallops:36, star:12, label:false}, o));
  const box = [cx - r, cy - r, 2 * r, 2 * r], st = paint(ctx, o.color, box), lw = Math.max(0.6, r * 0.02 * o.lw);
  scoped(ctx, o, () => {
    // scalloped rim
    ctx.beginPath();
    const n = o.scallops;
    for(let i = 0; i < n; i++){
      const a0 = i * TAU / n, a1 = (i + 1) * TAU / n, am = (a0 + a1) / 2;
      const p0 = polar(cx, cy, r * 0.94, a0), pm = polar(cx, cy, r * 1.04, am), p1 = polar(cx, cy, r * 0.94, a1);
      i ? ctx.lineTo(p0[0], p0[1]) : ctx.moveTo(p0[0], p0[1]);
      ctx.quadraticCurveTo(pm[0], pm[1], p1[0], p1[1]);
    }
    ctx.closePath(); solid(ctx, o, o.color, box, true);
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.84, 0, TAU); ctx.fillStyle = o.bg; ctx.fill();
    ctx.lineWidth = lw; ctx.strokeStyle = st; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.78, 0, TAU); ctx.lineWidth = lw * 0.6; ctx.stroke();
    // dotted ring
    const dots = Math.round(o.scallops * 1.2);
    ctx.fillStyle = st;
    for(let i = 0; i < dots; i++){ const p = polar(cx, cy, r * 0.7, i * TAU / dots); ctx.beginPath(); ctx.arc(p[0], p[1], r * 0.018, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, 0, TAU); ctx.lineWidth = lw * 0.6; ctx.stroke();
    // centre
    if(o.label){
      starPoly(ctx, cx, cy, r * 0.56, o.star, 5); ctx.globalAlpha *= 0.14; ctx.fillStyle = st; ctx.fill(); ctx.globalAlpha /= 0.14;
      ctx.beginPath(); ctx.rect(cx - r * 0.66, cy - r * 0.17, r * 1.32, r * 0.34); ctx.fillStyle = paint(ctx, o.color, box); ctx.fill();
    } else {
      starPoly(ctx, cx, cy, r * 0.54, o.star, o.star >= 12 ? 5 : 3); ctx.lineWidth = lw; ctx.stroke();
      starPoly(ctx, cx, cy, r * 0.22, 8, 2); ctx.fillStyle = paint(ctx, o.accent, box); ctx.fill();
    }
  });
  return r * 1.2;
}

/** Ribbon banner centred at (cx, cy): w × h front, folded ends with V-cut tails behind. Returns the text box [x, y, w, h]. */
export function ribbon(ctx, cx, cy, w, h, o){
  o = opts(Object.assign({fold:0.5, tail:0.9}, o));
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2, f = h * o.fold, t = h * o.tail;
  const box = [x0 - t - f, y0, w + 2 * (t + f), h + f];
  scoped(ctx, o, () => {
    for(const sg of [-1, 1]){
      const xe = sg < 0 ? x0 : x1;
      // tail
      ctx.beginPath(); polyPath(ctx, [[xe + sg * f * 0.2, y0 + f], [xe + sg * (f + t), y0 + f], [xe + sg * (f + t * 0.55), y1 - h / 2 + f], [xe + sg * (f + t), y1 + f], [xe + sg * f * 0.2, y1 + f]]);
      solid(ctx, o, o.ink ? o.color : darker(o.color), box);
      // fold triangle
      ctx.beginPath(); polyPath(ctx, [[xe, y1], [xe + sg * f, y1 + f], [xe, y1 + f]]);
      ctx.fillStyle = o.ink ? o.bg : darker(darker(o.color)); ctx.fill(); if(o.ink){ ctx.strokeStyle = o.color; ctx.stroke(); }
    }
    ctx.beginPath(); ctx.rect(x0, y0, w, h); solid(ctx, o, o.color, box, true);
    // fine inner rule
    ctx.strokeStyle = paint(ctx, o.accent, box); ctx.lineWidth = Math.max(0.5, h * 0.025 * o.lw);
    ctx.strokeRect(x0 + h * 0.1, y0 + h * 0.1, w - h * 0.2, h - h * 0.2);
  });
  return [x0 + h * 0.2, y0, w - h * 0.4, h];
}

/** Award badge: pleated rosette rim, medallion with star, two ribbon tails. Returns the label circle radius. */
export function awardBadge(ctx, cx, cy, r, o){
  o = opts(Object.assign({pleats:28, tails:true, star:8, color:'gold'}, o));
  const box = [cx - r * 1.1, cy - r * 1.1, r * 2.2, r * 3.2];
  scoped(ctx, o, () => {
    if(o.tails){
      for(const sg of [-1, 1]){
        const bx = cx + sg * r * 0.42, by = cy + r * 0.55;
        ctx.save(); ctx.translate(bx, by); ctx.rotate(sg * 0.32);
        ctx.beginPath(); polyPath(ctx, [[-r * 0.26, 0], [r * 0.26, 0], [r * 0.26, r * 1.35], [0, r * 1.1], [-r * 0.26, r * 1.35]]);
        solid(ctx, o, o.accent, [-r * 0.26, 0, r * 0.52, r * 1.35]);
        ctx.strokeStyle = paint(ctx, o.color, [-r * 0.26, 0, r * 0.52, r * 1.35]); ctx.lineWidth = Math.max(0.5, r * 0.02);
        ctx.beginPath(); ctx.moveTo(-r * 0.16, 0); ctx.lineTo(-r * 0.16, r * 1.2); ctx.moveTo(r * 0.16, 0); ctx.lineTo(r * 0.16, r * 1.2); ctx.stroke();
        ctx.restore();
      }
    }
    // pleated rim
    ctx.beginPath();
    const n = o.pleats;
    for(let i = 0; i < 2 * n; i++){ const p = polar(cx, cy, i % 2 ? r * 0.9 : r, i * Math.PI / n); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.closePath(); solid(ctx, o, o.color, box, true);
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.78, 0, TAU); ctx.fillStyle = o.ink ? o.bg : paint(ctx, o.accent, box); ctx.fill();
    ctx.lineWidth = Math.max(0.6, r * 0.03 * o.lw); ctx.strokeStyle = paint(ctx, o.color, box); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.68, 0, TAU); ctx.lineWidth = Math.max(0.5, r * 0.015 * o.lw); ctx.strokeStyle = o.ink ? flat(o.color) : 'rgba(255,255,255,.7)'; ctx.stroke();
    if(!o.label){ starPoly(ctx, cx, cy, r * 0.5, o.star, 2); ctx.fillStyle = paint(ctx, o.color, box); ctx.fill(); }
  });
  return r * 0.62;
}

function darker(c){
  if(c === 'gold') return '#8C6A2A';
  const n = parseInt(c.slice(1), 16), k = 0.72;
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(v * k).toString(16).padStart(2, '0')).join('');
}
