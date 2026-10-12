/* Certificate — classic frame (1000 × 707). */
import { env, tfam, tw } from '../../render/env.js';
import { FONTS } from '../../schema/themes.js';
import { T, setF, para, fitPara, fitLine, toAr } from '../../render/text.js';
import { hair, paper } from '../../render/shapes.js';
import { starField, divider, cornerStar } from '../../ornaments/index.js';
import { officialHeader, sign, seal } from '../../render/blocks.js';

export default function certClassic(ctx, d, rec, th){
  const W = 1000, H = 707, S = env.state.school, tf = tfam(), w = tw();
  paper(ctx, W, H);
  starField(ctx, 42, 42, W - 84, H - 84, 48, 12, th.primary, 0.045);
  ctx.save();
  ctx.strokeStyle = th.primary; ctx.lineWidth = 8; ctx.strokeRect(22, 22, W - 44, H - 44);
  ctx.strokeStyle = th.accent; ctx.lineWidth = 1.6; ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.lineWidth = 0.8; ctx.strokeRect(41.5, 41.5, W - 83, H - 83);
  ctx.restore();
  [[36, 36], [W - 36, 36], [36, H - 36], [W - 36, H - 36]].forEach(p => cornerStar(ctx, p[0], p[1], 18, th));
  officialHeader(ctx, 78, 922, 58, th, 1, false);
  let s = fitLine(ctx, d.title, 600, 58, 30, tf, w);
  T(ctx, d.title, 500, 208, {size:s, fam:tf, w, color:th.primary});
  divider(ctx, 500, 236, 150, th);
  if(d.intro){ s = fitLine(ctx, d.intro, 780, 23, 14, FONTS.naskh, 400); T(ctx, d.intro, 500, 284, {size:s, fam:FONTS.naskh, color:th.ink}); }
  const name = rec.name || 'اسم الطالب';
  s = fitLine(ctx, name, 640, 52, 24, tf, w);
  T(ctx, name, 500, 350, {size:s, fam:tf, w, color:th.primary});
  setF(ctx, s, tf, w);
  const nw = Math.min(640, ctx.measureText(toAr(name)).width);
  hair(ctx, 500 - nw / 2 - 34, 500 + nw / 2 + 34, 372, th.accent, 1.2);
  let y = 372; const cls = rec.cls || d.cls;
  if(cls){ T(ctx, 'الصف: ' + cls, 500, 404, {size:18, fam:FONTS.sans, w:500, color:th.muted}); y = 404; }
  if(d.reason){
    s = fitPara(ctx, d.reason, 720, 3, 22, 14, FONTS.naskh, 400);
    const last = para(ctx, d.reason, 500, y + 44, 720, {size:s, fam:FONTS.naskh, color:th.ink, lh:s * 1.72});
    if(last > 545) env.OVER = true;
  }
  sign(ctx, 790, 584, d.teacherLabel, d.teacherName, th, 1);
  sign(ctx, 210, 584, 'مدير المدرسة', S.director, th, 1);
  if(d.seal) seal(ctx, 500, 588, 36, th);
  if(d.date) T(ctx, 'تحريراً في: ' + d.date, 500, 648, {size:14, fam:FONTS.sans, color:th.muted});
}
