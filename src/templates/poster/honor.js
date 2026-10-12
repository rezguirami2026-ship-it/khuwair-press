/* Poster — honor board, up to 24 names in one or two columns (1000 × 1414). */
import { env, tfam, tw } from '../../render/env.js';
import { FONTS } from '../../schema/themes.js';
import { parseNames } from '../../schema/parse.js';
import { T, setF, para, fitPara, fitLine, toAr } from '../../render/text.js';
import { rr, starPath, paper } from '../../render/shapes.js';
import { starField, divider, cornerStar, emblem } from '../../ornaments/index.js';
import { officialHeader } from '../../render/blocks.js';

export default function posterHonor(ctx, d, rec, th){
  const W = 1000, H = 1414, tf = tfam(), w = tw();
  paper(ctx, W, H);
  starField(ctx, 46, 46, W - 92, H - 92, 56, 14, th.accent, 0.06);
  ctx.save();
  ctx.strokeStyle = th.primary; ctx.lineWidth = 10; ctx.strokeRect(26, 26, W - 52, H - 52);
  ctx.strokeStyle = th.accent; ctx.lineWidth = 2; ctx.strokeRect(44, 44, W - 88, H - 88);
  ctx.restore();
  [[44, 44], [W - 44, 44], [44, H - 44], [W - 44, H - 44]].forEach(p => cornerStar(ctx, p[0], p[1], 24, th));
  officialHeader(ctx, 88, 912, 66, th, 1.12, false);
  let y = 312;
  const s = fitLine(ctx, d.hTitle, 560, 100, 44, tf, w);
  T(ctx, d.hTitle, 500, y, {size:s, fam:tf, w, color:th.primary});
  setF(ctx, s, tf, w);
  const tW = Math.min(560, ctx.measureText(toAr(d.hTitle)).width);
  [-1, 1].forEach(sg => emblem(ctx, 500 + sg * (tW / 2 + 62), y - s * 0.32, 30, th, false));
  if(d.hSub && d.hSub.trim()){ const s2 = fitPara(ctx, d.hSub, 780, 2, 30, 18, FONTS.sans, 600); y = para(ctx, d.hSub, 500, y + 70, 780, {size:s2, fam:FONTS.sans, w:600, color:th.muted, lh:s2 * 1.5}); }
  y += 48; divider(ctx, 500, y, 190, th);
  const list = parseNames(d.hNames), shown = list.slice(0, 24);
  if(list.length > 24) env.OVER = true;
  const top = y + 42, bottom = H - 196, avail = bottom - top;
  const n = shown.length, cols = n > 8 ? 2 : 1, rows = Math.max(1, Math.ceil(n / cols)), gapY = 14;
  const rowH = Math.min(96, (avail + gapY) / rows), ph = rowH - gapY;
  const colW = cols === 2 ? 382 : 600, colR = cols === 2 ? [902, 480] : [800];
  const totH = rows * rowH - gapY, y0 = top + Math.max(0, avail - totH) * 0.4;
  shown.forEach((e, i) => {
    const c = Math.floor(i / rows), r = i % rows, xr = colR[c], xl = xr - colW, py = y0 + r * rowH, cy = py + ph / 2;
    ctx.save(); rr(ctx, xl, py, colW, ph, Math.min(18, ph * 0.3)); ctx.fillStyle = th.tint; ctx.fill();
    ctx.strokeStyle = th.accent; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
    ctx.fillStyle = th.accent; starPath(ctx, xr - 26, cy, Math.min(12, ph * 0.2)); ctx.fill();
    const fsN = Math.min(ph * 0.42, 31);
    let cw = 0;
    if(e.cls){ setF(ctx, fsN * 0.8, FONTS.sans, 700); cw = ctx.measureText(toAr(e.cls)).width + 24; }
    const ns = fitLine(ctx, e.name, colW - 70 - cw, fsN, 12, FONTS.sans, 700);
    T(ctx, e.name, xr - 48, cy + 1, {size:ns, fam:FONTS.sans, w:700, color:th.ink, align:'right', base:'middle'});
    if(e.cls) T(ctx, e.cls, xl + 20, cy + 1, {size:fsN * 0.8, fam:FONTS.sans, w:700, color:th.primary, align:'left', base:'middle'});
  });
  if(!n) T(ctx, 'أضف أسماء المتفوّقين من لوحة التحكم', 500, top + avail / 2, {size:26, fam:FONTS.sans, color:th.muted});
  if(d.hFooter && d.hFooter.trim()){ const f = fitLine(ctx, d.hFooter, 760, 44, 22, tf, w); T(ctx, d.hFooter, 500, H - 108, {size:f, fam:tf, w, color:th.primary}); }
}
