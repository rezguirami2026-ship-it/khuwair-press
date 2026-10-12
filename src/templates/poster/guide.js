/* Poster — guidelines / awareness with numbered points (1000 × 1414). */
import { env, tfam, tw } from '../../render/env.js';
import { FONTS } from '../../schema/themes.js';
import { lines, cleanPoint } from '../../schema/parse.js';
import { T, setF, wrap, para, fitPara, fitLine, toAr } from '../../render/text.js';
import { starPath, hair, paper } from '../../render/shapes.js';
import { starField, divider } from '../../ornaments/index.js';
import { officialHeader } from '../../render/blocks.js';

export default function posterGuide(ctx, d, rec, th){
  const W = 1000, H = 1414, tf = tfam(), w = tw();
  paper(ctx, W, H);
  ctx.save(); ctx.globalAlpha = 0.05; ctx.fillStyle = th.primary;
  starPath(ctx, 130, H - 260, 330, Math.PI / 8); ctx.fill(); starPath(ctx, 930, 330, 170); ctx.fill(); ctx.restore();
  ctx.save(); ctx.strokeStyle = th.primary; ctx.lineWidth = 3; ctx.strokeRect(28, 28, W - 56, H - 56); ctx.restore();
  officialHeader(ctx, 72, 928, 46, th, 1.1, false);
  let y = 200;
  if(d.gKicker && d.gKicker.trim()){
    y = 232; setF(ctx, 30, FONTS.sans, 800); const kw = ctx.measureText(toAr(d.gKicker)).width;
    T(ctx, d.gKicker, 500, y, {size:30, fam:FONTS.sans, w:800, color:th.accent});
    ctx.fillStyle = th.accent; [-1, 1].forEach(sg => { starPath(ctx, 500 + sg * (kw / 2 + 26), y - 10, 9); ctx.fill(); });
  }
  let s = fitPara(ctx, d.gTitle, 840, 2, 96, 44, tf, w);
  y = para(ctx, d.gTitle, 500, y + s * 1.08, 840, {size:s, fam:tf, w, color:th.primary, lh:s * 1.2});
  if(d.gSub && d.gSub.trim()){ const s2 = fitPara(ctx, d.gSub, 800, 2, 32, 18, FONTS.sans, 500); y = para(ctx, d.gSub, 500, y + 66, 800, {size:s2, fam:FONTS.sans, w:500, color:th.muted, lh:s2 * 1.5}); }
  y += 52; divider(ctx, 500, y, 170, th);
  const pts = lines(d.gPoints).map(cleanPoint).filter(Boolean).slice(0, 10);
  const top = y + 46, bottom = H - 182, avail = bottom - top;
  let fs = 34, items = [], total = 0, lh = 0, gap = 0;
  for(;;){
    setF(ctx, fs, FONTS.sans, 700); lh = fs * 1.5; gap = fs * 0.85;
    items = pts.map(p => ({ls:wrap(ctx, p, 660)}));
    items.forEach(it => { it.h = Math.max(it.ls.length * lh, fs * 1.9); });
    total = items.reduce((a, it) => a + it.h, 0) + gap * Math.max(0, items.length - 1);
    if(total <= avail || fs <= 18){ if(total > avail) env.OVER = true; break; }
    fs--;
  }
  let y0 = top + Math.max(0, avail - total) * 0.35;
  items.forEach((it, i) => {
    const b1 = y0 + (it.h - it.ls.length * lh) / 2 + fs * 1.05;
    const cy = b1 - fs * 0.36;
    ctx.fillStyle = th.primary; ctx.beginPath(); ctx.arc(872, cy, fs * 0.84, 0, Math.PI * 2); ctx.fill();
    T(ctx, String(i + 1), 872, cy + fs * 0.06, {size:fs * 0.9, fam:FONTS.sans, w:800, color:'#FFFFFF', base:'middle'});
    it.ls.forEach((l, j) => T(ctx, l, 822, b1 + j * lh, {size:fs, fam:FONTS.sans, w:700, color:th.ink, align:'right'}));
    if(i < items.length - 1){
      ctx.save(); ctx.setLineDash([2, 6]); hair(ctx, 150, 900, y0 + it.h + gap / 2, th.accent, 1.2, 0.5); ctx.restore();
    }
    y0 += it.h + gap;
  });
  if(!pts.length) T(ctx, 'أضف النقاط من لوحة التحكم', 500, top + avail / 2, {size:26, fam:FONTS.sans, color:th.muted});
  ctx.fillStyle = th.primary; ctx.fillRect(30, H - 152, W - 60, 122);
  starField(ctx, 30, H - 152, W - 60, 122, 52, 14, '#FFFFFF', 0.08);
  if(d.gFooter && d.gFooter.trim()){ const f = fitLine(ctx, d.gFooter, 840, 46, 22, tf, w); T(ctx, d.gFooter, 500, H - 76, {size:f, fam:tf, w, color:'#FFFFFF'}); }
}
