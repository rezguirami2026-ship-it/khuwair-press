/* Invitation — ornate frame (1000 × 1414). */
import { env, tfam, tw } from '../../render/env.js';
import { FONTS } from '../../schema/themes.js';
import { detRows } from '../../schema/parse.js';
import { T, para, fitPara, fitLine } from '../../render/text.js';
import { starPath, paper } from '../../render/shapes.js';
import { starField, divider, cornerStar, emblem } from '../../ornaments/index.js';
import { logoAt, sign, footerText } from '../../render/blocks.js';
import { inviteDetailsLine } from './shared.js';

export default function inviteOrnate(ctx, d, rec, th){
  const W = 1000, H = 1414, S = env.state.school, tf = tfam(), w = tw();
  paper(ctx, W, H);
  starField(ctx, 56, 56, W - 112, H - 112, 60, 15, th.primary, 0.035);
  ctx.save();
  ctx.strokeStyle = th.primary; ctx.lineWidth = 8; ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.strokeStyle = th.accent; ctx.lineWidth = 2; ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.fillStyle = th.accent;
  for(let x = 76; x <= W - 76; x += 40){ starPath(ctx, x, 36, 5); ctx.fill(); starPath(ctx, x, H - 36, 5); ctx.fill(); }
  for(let yy = 76; yy <= H - 76; yy += 40){ starPath(ctx, 36, yy, 5); ctx.fill(); starPath(ctx, W - 36, yy, 5); ctx.fill(); }
  ctx.restore();
  [[48, 48], [W - 48, 48], [48, H - 48], [W - 48, H - 48]].forEach(p => cornerStar(ctx, p[0], p[1], 26, th));
  let y = logoAt(ctx, 'center', 500, 150, 180, 120, false) ? 236 : (emblem(ctx, 500, 142, 44, th, false), 214);
  const hs = fitLine(ctx, d.heading, 700, 124, 50, tf, w);
  y += hs * 0.85;
  T(ctx, d.heading, 500, y, {size:hs, fam:tf, w, color:th.primary});
  y += 46; divider(ctx, 500, y, 170, th);
  if(d.lead && d.lead.trim()){ const s = fitPara(ctx, d.lead, 760, 3, 32, 19, FONTS.naskh, 400); y = para(ctx, d.lead, 500, y + 76, 760, {size:s, fam:FONTS.naskh, color:th.ink, lh:s * 1.7}); }
  if(d.occasion && d.occasion.trim()){ const s = fitPara(ctx, d.occasion, 780, 2, 66, 30, tf, w); y = para(ctx, d.occasion, 500, y + s * 1.25 + 16, 780, {size:s, fam:tf, w, color:th.primary, lh:s * 1.25}); }
  if(d.desc && d.desc.trim()){ const s = fitPara(ctx, d.desc, 760, 2, 28, 17, FONTS.naskh, 400); y = para(ctx, d.desc, 500, y + 66, 760, {size:s, fam:FONTS.naskh, color:th.muted, lh:s * 1.6}); }
  const rows = detRows(d);
  if(rows.length) y = inviteDetailsLine(ctx, rows, y + 92, th);
  if(d.closing && d.closing.trim()){ const s = fitLine(ctx, d.closing, 760, 34, 18, FONTS.naskh, 700); y += 92; T(ctx, d.closing, 500, y, {size:s, fam:FONTS.naskh, w:700, color:th.primary}); }
  if(y > H - 268) env.OVER = true;
  sign(ctx, 500, H - 222, d.signer, S.director, th, 1.35);
  const ft = footerText(S);
  if(ft){ const fs = fitLine(ctx, ft, 780, 20, 12, FONTS.sans, 600); T(ctx, ft, 500, H - 92, {size:fs, fam:FONTS.sans, w:600, color:th.muted}); }
}
