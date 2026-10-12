/* Notice — formal letterhead (1000 × 1414). */
import { env, tfam, tw } from '../../render/env.js';
import { FONTS } from '../../schema/themes.js';
import { detRows } from '../../schema/parse.js';
import { T, para, fitPara, fitLine } from '../../render/text.js';
import { rr, starPath, hair, paper } from '../../render/shapes.js';
import { officialHeader, sign, pill, footerText } from '../../render/blocks.js';
import { noticeBody, noticeTail } from './shared.js';

export default function noticeFormal(ctx, d, rec, th){
  const W = 1000, H = 1414, S = env.state.school, tf = tfam(), w = tw();
  paper(ctx, W, H);
  ctx.fillStyle = th.primary; ctx.fillRect(0, 0, W, 14); ctx.fillStyle = th.accent; ctx.fillRect(0, 14, W, 4);
  officialHeader(ctx, 70, 930, 58, th, 1.35, false);
  hair(ctx, 70, 930, 214, th.primary, 3); hair(ctx, 70, 930, 222, th.accent, 1);
  let y = 262;
  if(d.kicker && d.kicker.trim()){ pill(ctx, d.kicker, 500, y, 56, th.primary, '#FFFFFF', 28); y += 56; }
  y += 86;
  let s = fitPara(ctx, d.title, 820, 2, 68, 36, tf, w);
  y = para(ctx, d.title, 500, y, 820, {size:s, fam:tf, w, color:th.primary, lh:s * 1.3});
  y = noticeBody(ctx, d, th, y + 78);
  const rows = detRows(d);
  if(rows.length){
    y += 34; const rh = 74, bh = rows.length * rh + 16;
    ctx.save(); ctx.fillStyle = th.tint; rr(ctx, 100, y, 800, bh, 18); ctx.fill();
    ctx.strokeStyle = th.accent; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore();
    rows.forEach((r, i) => {
      const cy = y + 8 + i * rh + rh / 2;
      if(i) hair(ctx, 130, 870, y + 8 + i * rh, th.accent, 0.8, 0.45);
      ctx.fillStyle = th.accent; starPath(ctx, 864, cy, 10); ctx.fill();
      T(ctx, r[0], 840, cy, {size:23, fam:FONTS.sans, w:700, color:th.primary, align:'right', base:'middle'});
      const vs = fitLine(ctx, r[1], 470, 27, 15, FONTS.sans, 700);
      T(ctx, r[1], 630, cy, {size:vs, fam:FONTS.sans, w:700, color:th.ink, align:'right', base:'middle'});
    });
    y += bh - 20;
  }
  y = noticeTail(ctx, d, th, y);
  sign(ctx, 230, Math.min(1236, y + 130), d.signer, S.director, th, 1.4);
  ctx.fillStyle = th.primary; ctx.fillRect(0, H - 64, W, 64);
  const ft = footerText(S);
  if(ft){ const fs = fitLine(ctx, ft, 900, 21, 12, FONTS.sans, 600); T(ctx, ft, 500, H - 24, {size:fs, fam:FONTS.sans, w:600, color:'#FFFFFF'}); }
}
