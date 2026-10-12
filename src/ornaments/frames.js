/* Frame bands. A band runs around a box; each side is filled with a whole number of motif units stretched to
 * fit the side exactly (no clipped units), and the four corners get their own square piece so sides meet cleanly.
 * Local coordinates for motifs: u runs along the side, v runs inward from the outer edge (0) to the band width (bw). */
import { opts, paint, solid, scoped, polyPath, flat, TAU } from './core.js';
import { pattern } from './patterns.js';
import { starPoly, rosette, interlacedStar } from './stars.js';

/* ---- motifs: draw(ctx, u0, unit, bw, o, main, accent) — structure in the main color, detail in the accent (gold) ---- */
const MOTIFS = {
  /** 8-point star outline at the centre of each unit, linked tip to tip by a strap. */
  khatam:{ratio:1.5, draw(ctx, u0, L, bw, o, st, ac){
    const cx = u0 + L / 2, cy = bw / 2, r = bw * 0.3;
    ctx.beginPath(); ctx.moveTo(u0, cy); ctx.lineTo(cx - r, cy); ctx.moveTo(cx + r, cy); ctx.lineTo(u0 + L, cy);
    ctx.strokeStyle = ac; ctx.stroke();
    starPoly(ctx, cx, cy, r, 8, 2, Math.PI / 8); ctx.stroke();
    starPoly(ctx, cx, cy, r * 0.42, 8, 2); ctx.fillStyle = st; ctx.fill();
    ctx.fillStyle = ac;
    // half-diamonds at unit joints
    const dj = bw * 0.14;
    ctx.beginPath(); polyPath(ctx, [[u0, cy - dj], [u0 + dj, cy], [u0, cy + dj], [u0 - dj, cy]]); ctx.fill();
  }},
  /** Two crossing straps forming a chain of lozenges with a dot in each. */
  interlace:{ratio:1.2, draw(ctx, u0, L, bw, o, st, ac){
    const a = bw * 0.24, b = bw * 0.76, m = bw / 2;
    ctx.beginPath(); ctx.moveTo(u0, a); ctx.lineTo(u0 + L / 2, b); ctx.lineTo(u0 + L, a);
    ctx.moveTo(u0, b); ctx.lineTo(u0 + L / 2, a); ctx.lineTo(u0 + L, b);
    ctx.strokeStyle = ac; ctx.stroke();
    ctx.fillStyle = st;
    ctx.beginPath(); ctx.arc(u0 + L / 4, m, bw * 0.05, 0, TAU); ctx.arc(u0 + 3 * L / 4, m, bw * 0.05, 0, TAU); ctx.fill();
  }},
  /** Omani fort crenellation (shurfa): stepped, pointed merlons rising from the inner edge. */
  merlons:{ratio:0.9, draw(ctx, u0, L, bw, o, st, ac){
    const c = u0 + L / 2, base = bw * 0.92, w = L * 0.78, top = bw * 0.12, s1 = bw * 0.62, s2 = bw * 0.36;
    const pts = [[c - w / 2, base], [c - w / 2, s1], [c - w * 0.33, s1], [c - w * 0.33, s2], [c - w * 0.17, s2], [c, top],
      [c + w * 0.17, s2], [c + w * 0.33, s2], [c + w * 0.33, s1], [c + w / 2, s1], [c + w / 2, base]];
    ctx.beginPath(); polyPath(ctx, pts, false); ctx.closePath();
    solid(ctx, o, o.color, [u0, 0, L, bw]);
    // triangular loophole
    ctx.beginPath(); polyPath(ctx, [[c, s1 - bw * 0.14], [c - bw * 0.07, s1 + bw * 0.06], [c + bw * 0.07, s1 + bw * 0.06]]);
    ctx.fillStyle = o.ink ? st : o.bg; ctx.fill();
  }},
  /** Arcade of pointed (two-centred) arches. */
  arcade:{ratio:1.0, draw(ctx, u0, L, bw, o, st, ac){
    const x0 = u0 + L * 0.12, x1 = u0 + L * 0.88, sp = bw * 0.82, w = x1 - x0, R = w * 0.85, cx = (x0 + x1) / 2;
    const ty = sp - Math.sqrt(R * R - (R - w / 2) ** 2);
    ctx.beginPath(); ctx.moveTo(x0, bw * 0.92); ctx.lineTo(x0, sp);
    ctx.arc(x0 + R, sp, R, Math.PI, Math.PI + Math.acos((R - w / 2) / R) * 1, false);
    ctx.lineTo(cx, ty);
    ctx.arc(x1 - R, sp, R, -Math.acos((R - w / 2) / R), 0, false);
    ctx.lineTo(x1, bw * 0.92);
    ctx.strokeStyle = ac; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, ty - bw * 0.1, bw * 0.045, 0, TAU); ctx.fillStyle = st; ctx.fill();
  }},
  /** Brass studs of Omani carved doors: domed stud with a ring, small diamond between. */
  studs:{ratio:0.9, draw(ctx, u0, L, bw, o, st, ac){
    const cx = u0 + L / 2, cy = bw / 2, r = bw * 0.2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); solid(ctx, o, o.accent, [cx - r, cy - r, 2 * r, 2 * r]);
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.45, 0, TAU); ctx.strokeStyle = st; ctx.stroke();
    if(!o.ink){ ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.28, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(); }
    const d = bw * 0.08;
    ctx.beginPath(); polyPath(ctx, [[u0, cy - d], [u0 + d, cy], [u0, cy + d], [u0 - d, cy]]); ctx.fillStyle = st; ctx.fill();
  }},
  /** Fine pearls: modern and quiet. */
  pearls:{ratio:0.55, draw(ctx, u0, L, bw, o, st, ac){
    ctx.beginPath(); ctx.arc(u0 + L / 2, bw / 2, bw * 0.12, 0, TAU); ctx.fillStyle = ac; ctx.fill();
  }},
  /** Small stepped squares (Omani carved plaster rhythm) alternating with a tiny star. */
  steps:{ratio:1.0, draw(ctx, u0, L, bw, o, st, ac){
    const cx = u0 + L / 2, cy = bw / 2, s = bw * 0.26;
    ctx.beginPath();
    polyPath(ctx, [[cx, cy - s], [cx + s * 0.5, cy - s], [cx + s * 0.5, cy - s * 0.5], [cx + s, cy - s * 0.5], [cx + s, cy],
      [cx + s, cy + s * 0.5], [cx + s * 0.5, cy + s * 0.5], [cx + s * 0.5, cy + s], [cx, cy + s], [cx - s * 0.5, cy + s],
      [cx - s * 0.5, cy + s * 0.5], [cx - s, cy + s * 0.5], [cx - s, cy - s * 0.5], [cx - s * 0.5, cy - s * 0.5], [cx - s * 0.5, cy - s]]);
    ctx.strokeStyle = ac; ctx.stroke();
    starPoly(ctx, u0, cy, bw * 0.1, 8, 2); ctx.fillStyle = st; ctx.fill();
  }}
};

/* ---- corners: draw(ctx, bw, o, st) in a bw × bw square, outer corner at (0, 0) ---- */
const CORNERS = {
  rosette(ctx, bw, o){ rosette(ctx, bw / 2, bw / 2, bw * 0.44, 8, Object.assign({}, o, {layers:1, alpha:1, ring:false, rot:0})); },
  khatam(ctx, bw, o){ interlacedStar(ctx, bw / 2, bw / 2, bw * 0.4, 8, 2, Object.assign({}, o, {alpha:1, rot:0, band:bw * 0.08, color:o.accent})); },
  star(ctx, bw, o, st, ac){
    starPoly(ctx, bw / 2, bw / 2, bw * 0.38, 8, 3); ctx.strokeStyle = ac; ctx.stroke();
    starPoly(ctx, bw / 2, bw / 2, bw * 0.17, 8, 2, Math.PI / 8); ctx.fillStyle = st; ctx.fill();
  },
  block(ctx, bw, o, st){
    ctx.beginPath(); ctx.rect(bw * 0.1, bw * 0.1, bw * 0.8, bw * 0.8); solid(ctx, o, o.color, [0, 0, bw, bw]);
    starPoly(ctx, bw / 2, bw / 2, bw * 0.3, 8, 2); ctx.fillStyle = o.ink ? st : o.bg; o.ink ? ctx.stroke() : ctx.fill();
  },
  stepped(ctx, bw, o, st){
    const s = bw / 4;
    ctx.beginPath();
    polyPath(ctx, [[s, s], [3 * s, s], [3 * s, 2 * s], [2 * s, 2 * s], [2 * s, 3 * s], [s, 3 * s]]);
    solid(ctx, o, o.color, [0, 0, bw, bw]);
    ctx.beginPath(); ctx.arc(2.6 * s, 2.6 * s, s * 0.32, 0, TAU); ctx.fillStyle = st; ctx.fill();
  },
  none(){}
};

const SIDE = (x, y, w, h, bw) => [
  {t:[1, 0, 0, 1, x + bw, y], L:w - 2 * bw},
  {t:[0, 1, -1, 0, x + w, y + bw], L:h - 2 * bw},
  {t:[-1, 0, 0, -1, x + w - bw, y + h], L:w - 2 * bw},
  {t:[0, -1, 1, 0, x, y + h - bw], L:h - 2 * bw}
];
const CORNER_T = (x, y, w, h) => [[1, 0, 0, 1, x, y], [0, 1, -1, 0, x + w, y], [-1, 0, 0, -1, x + w, y + h], [0, -1, 1, 0, x, y + h]];

/** Ornamental band frame around [x, y, w, h].
 *  o.band — band width; o.motif — MOTIFS key; o.corner — CORNERS key; o.rails — draw edge rules (default true). */
export function frame(ctx, x, y, w, h, o){
  o = opts(Object.assign({band:30, motif:'khatam', corner:'rosette', rails:true}, o));
  const bw = o.band, m = MOTIFS[o.motif] || MOTIFS.khatam, cn = CORNERS[o.corner] || CORNERS.none;
  const box = [x, y, w, h], st = paint(ctx, o.color, box), ac = paint(ctx, o.accent, box), lw = Math.max(0.6, bw * 0.045 * o.lw);
  scoped(ctx, o, () => {
    ctx.lineWidth = lw; ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
    for(const s of SIDE(x, y, w, h, bw)){
      if(s.L <= 0) continue;
      const n = Math.max(1, Math.round(s.L / (m.ratio * bw / o.density))), unit = s.L / n;
      ctx.save(); ctx.transform(...s.t);
      ctx.beginPath(); ctx.rect(0, 0, s.L, bw); ctx.clip();
      for(let i = 0; i < n; i++) m.draw(ctx, i * unit, unit, bw, o, st, ac);
      if(m === MOTIFS.khatam || m === MOTIFS.steps || m === MOTIFS.studs){ // closing joint at the far end
        const d = m === MOTIFS.khatam ? bw * 0.14 : bw * 0.08;
        ctx.beginPath(); polyPath(ctx, [[s.L, bw / 2 - d], [s.L - d, bw / 2], [s.L, bw / 2 + d]]); ctx.fillStyle = st; ctx.fill();
      }
      ctx.restore();
    }
    for(const t of CORNER_T(x, y, w, h)){
      ctx.save(); ctx.transform(...t);
      ctx.lineWidth = lw; ctx.strokeStyle = st; ctx.fillStyle = st;
      cn(ctx, bw, o, st, ac);
      if(o.rails){ ctx.beginPath(); ctx.rect(0, 0, bw, bw); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = ac; ctx.stroke(); }
      ctx.restore();
    }
    if(o.rails){
      // bold outer rule in the main color, fine gold rules on the band inner edge
      ctx.strokeStyle = st; ctx.lineWidth = lw * 2.4;
      ctx.strokeRect(x + lw * 1.2, y + lw * 1.2, w - lw * 2.4, h - lw * 2.4);
      ctx.strokeStyle = ac; ctx.lineWidth = lw;
      ctx.strokeRect(x + bw, y + bw, w - 2 * bw, h - 2 * bw);
      ctx.lineWidth = lw * 0.6;
      ctx.strokeRect(x + bw + lw * 3, y + bw + lw * 3, w - 2 * bw - lw * 6, h - 2 * bw - lw * 6);
    }
  });
}

/** Fine modern frame: hairline rules with stepped (notched) corners and a small jewel at each corner. */
export function fineFrame(ctx, x, y, w, h, o){
  o = opts(Object.assign({gap:8, notch:26, rules:3, jewel:true}, o));
  const box = [x, y, w, h], st = paint(ctx, o.color, box), ac = paint(ctx, o.accent, box), lw = Math.max(0.5, o.lw);
  scoped(ctx, o, () => {
    ctx.lineJoin = 'miter';
    for(let k = 0; k < o.rules; k++){
      const d = k * o.gap, c = Math.max(0, o.notch - d);
      const X0 = x + d, Y0 = y + d, X1 = x + w - d, Y1 = y + h - d;
      ctx.beginPath();
      if(k === 0 || !c){ ctx.rect(X0, Y0, X1 - X0, Y1 - Y0); }
      else polyPath(ctx, [[X0 + c, Y0], [X1 - c, Y0], [X1 - c, Y0 + c], [X1, Y0 + c], [X1, Y1 - c], [X1 - c, Y1 - c], [X1 - c, Y1],
        [X0 + c, Y1], [X0 + c, Y1 - c], [X0, Y1 - c], [X0, Y0 + c], [X0 + c, Y0 + c]]);
      ctx.lineWidth = k === 1 ? lw * 2.2 : lw; ctx.strokeStyle = k === 1 ? st : ac; ctx.stroke();
    }
    if(o.jewel){
      const d = o.gap, r = Math.min(o.notch - d, 14) * 0.55;
      for(const [cx, cy] of [[x + d + (o.notch - d) / 2, y + d + (o.notch - d) / 2], [x + w - d - (o.notch - d) / 2, y + d + (o.notch - d) / 2],
        [x + w - d - (o.notch - d) / 2, y + h - d - (o.notch - d) / 2], [x + d + (o.notch - d) / 2, y + h - d - (o.notch - d) / 2]]){
        starPoly(ctx, cx, cy, r, 8, 2); ctx.fillStyle = ac; ctx.fill();
      }
    }
  });
}

export const FRAME_MOTIFS = Object.keys(MOTIFS);
export const FRAME_CORNERS = Object.keys(CORNERS);

/* ---- certificate-grade frames (phase 3 revision) ---- */

/** Guilloche frame: fine interwoven sine lines (security-print style) along each side, rose-curve medallions
 *  in the corners. Wave counts are whole numbers per side, so the lines meet the corners cleanly. */
export function guillocheFrame(ctx, x, y, w, h, o){
  o = opts(Object.assign({band:30, strands:5}, o));
  const bw = o.band, box = [x, y, w, h], st = paint(ctx, o.color, box), ac = paint(ctx, o.accent, box);
  const lw = Math.max(0.45, 0.55 * o.lw), K = o.strands;
  scoped(ctx, o, () => {
    for(const s of SIDE(x, y, w, h, bw)){
      if(s.L <= 0) continue;
      const n = Math.max(2, Math.round(s.L / (bw * 1.25 / o.density))), A = bw * 0.36, steps = Math.ceil(s.L / 2);
      ctx.save(); ctx.transform(...s.t);
      ctx.beginPath(); ctx.rect(0, 0, s.L, bw); ctx.clip();
      for(let k = 0; k < K; k++){
        const ph = k * Math.PI / K;
        ctx.beginPath();
        for(let i = 0; i <= steps; i++){
          const u = s.L * i / steps, v = bw / 2 + A * Math.sin(2 * Math.PI * n * u / s.L + ph) * (0.75 + 0.25 * Math.cos(4 * Math.PI * n * u / s.L));
          i ? ctx.lineTo(u, v) : ctx.moveTo(u, v);
        }
        ctx.lineWidth = lw; ctx.strokeStyle = k % 2 ? st : ac; ctx.stroke();
      }
      ctx.restore();
    }
    for(const t of CORNER_T(x, y, w, h)){
      ctx.save(); ctx.transform(...t);
      const c = bw / 2, R = bw * 0.46;
      ctx.fillStyle = o.bg; ctx.fillRect(1, 1, bw - 2, bw - 2);
      for(let k = 0; k < 4; k++){
        ctx.beginPath();
        for(let i = 0; i <= 240; i++){
          const a = i / 240 * TAU, r = R * (0.62 + 0.38 * Math.cos(8 * a + k * Math.PI / 4) * Math.cos(a * 2 + k));
          const px = c + Math.cos(a) * Math.abs(r), py = c + Math.sin(a) * Math.abs(r);
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.lineWidth = lw; ctx.strokeStyle = k % 2 ? st : ac; ctx.stroke();
      }
      starPoly(ctx, c, c, bw * 0.12, 8, 2); ctx.fillStyle = ac; ctx.fill();
      ctx.restore();
    }
    // rails: bold outer rule, fine double rule inside
    ctx.strokeStyle = st; ctx.lineWidth = Math.max(1.4, 2.6 * o.lw); ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = ac; ctx.lineWidth = lw * 1.4; ctx.strokeRect(x + bw, y + bw, w - 2 * bw, h - 2 * bw);
    ctx.lineWidth = lw; ctx.strokeRect(x + bw + 4, y + bw + 4, w - 2 * bw - 8, h - 2 * bw - 8);
    ctx.strokeStyle = st; ctx.lineWidth = lw; for(const t of CORNER_T(x, y, w, h)){ ctx.save(); ctx.transform(...t); ctx.strokeRect(0, 0, bw, bw); ctx.restore(); }
  });
}

/** Fine frame with interlaced-star corner pieces whose tapered gold lines run along the edges, and a small
 *  rosette breaking the inner rule at the middle of the top and bottom. Restrained, formal. */
export function cornerFrame(ctx, x, y, w, h, o){
  o = opts(Object.assign({gap:7, arm:0.16}, o));
  const box = [x, y, w, h], st = paint(ctx, o.color, box), ac = paint(ctx, o.accent, box), g = o.gap;
  scoped(ctx, o, () => {
    ctx.strokeStyle = st; ctx.lineWidth = Math.max(1.6, 2.8 * o.lw); ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = ac; ctx.lineWidth = 0.9 * o.lw; ctx.strokeRect(x + g, y + g, w - 2 * g, h - 2 * g);
    ctx.lineWidth = 0.6 * o.lw; ctx.strokeRect(x + g + 4, y + g + 4, w - 2 * g - 8, h - 2 * g - 8);
    const arm = Math.min(w, h) * o.arm, r = g * 2.4;
    for(const t of CORNER_T(x, y, w, h)){
      ctx.save(); ctx.transform(...t);
      const c = g + 2;
      for(const [dx, dy] of [[1, 0], [0, 1]]){            // tapered arms along both edges
        ctx.beginPath(); ctx.moveTo(c + dx * r, c + dy * r - dx * 2.2 + dy * 0); ctx.lineTo(c + dx * arm, c + dy * arm);
        ctx.lineTo(c + dx * r - dy * 2.2, c + dy * r); ctx.closePath(); ctx.fillStyle = ac; ctx.fill();
        ctx.beginPath(); ctx.arc(c + dx * (arm + 6), c + dy * (arm + 6), 2.2, 0, TAU); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(c, c, r * 1.15, 0, TAU); ctx.fillStyle = o.bg; ctx.fill();
      interlacedStar(ctx, c, c, r, 8, 2, Object.assign({}, o, {rot:0, alpha:1, color:o.accent, band:r * 0.2}));
      ctx.restore();
    }
    for(const [cx, cy] of [[x + w / 2, y + g + 2]]){   // top only: the bottom centre belongs to the award
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.5, 0, TAU); ctx.fillStyle = o.bg; ctx.fill();
      rosette(ctx, cx, cy, r * 1.35, 8, Object.assign({}, o, {layers:1, ring:false, rot:0, alpha:1, fillMode:'line'}));
    }
  });
}

/** Manuscript border: a solid band carrying gold girih strapwork (Hankin 4.8.8, woven as bands), gold rules,
 *  rosette corner squares. Rich and traditional. */
export function girihBand(ctx, x, y, w, h, o){
  o = opts(Object.assign({band:32}, o));
  const bw = o.band, box = [x, y, w, h], st = paint(ctx, o.color, box), ac = paint(ctx, o.accent, box);
  scoped(ctx, o, () => {
    const fill = o.ink ? o.bg : flat(o.color);
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.rect(x + bw, y + bw, w - 2 * bw, h - 2 * bw); ctx.clip('evenodd');
    ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
    pattern(ctx, '4.8.8', x, y, w, h, {size:bw * 2.1, color:o.ink ? o.color : o.accent, bg:fill, band:Math.max(1.6, bw * 0.09), lw:0.8});
    ctx.restore();
    for(const t of CORNER_T(x, y, w, h)){
      ctx.save(); ctx.transform(...t);
      ctx.fillStyle = fill; ctx.fillRect(0, 0, bw, bw);
      rosette(ctx, bw / 2, bw / 2, bw * 0.44, 8, {layers:1, ring:false, color:o.accent, accent:o.accent, bg:fill, fillMode:'line', lw:1.2});
      ctx.strokeStyle = ac; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, bw - 1, bw - 1);
      ctx.restore();
    }
    ctx.strokeStyle = ac; ctx.lineWidth = 1.2;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4); ctx.strokeRect(x + bw - 2, y + bw - 2, w - 2 * bw + 4, h - 2 * bw + 4);
    ctx.strokeStyle = st; ctx.lineWidth = 0.8; ctx.strokeRect(x + bw + 4, y + bw + 4, w - 2 * bw - 8, h - 2 * bw - 8);
  });
}
