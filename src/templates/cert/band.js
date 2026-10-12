/* Certificate — side band (1000 × 707). */
import { env, tfam, tw } from '../../render/env.js';
import { FONTS } from '../../schema/themes.js';
import { T, setF, wrap, para, fitPara, fitLine } from '../../render/text.js';
import { paper } from '../../render/shapes.js';
import { starField, emblem } from '../../ornaments/index.js';
import { logoAt, sign, seal } from '../../render/blocks.js';

export default function certBand(ctx, d, rec, th){
  const W = 1000, H = 707, S = env.state.school, tf = tfam(), w = tw(), bx = 748, bc = (bx + W) / 2;
  paper(ctx, W, H);
  ctx.fillStyle = th.primary; ctx.fillRect(bx, 0, W - bx, H);
  starField(ctx, bx, 0, W - bx, H, 46, 13, '#FFFFFF', 0.09);
  ctx.fillStyle = th.accent; ctx.fillRect(bx - 6, 0, 6, H);
  if(!logoAt(ctx, 'center', bc, 104, 120, 92, true)) emblem(ctx, bc, 104, 36, th, true);
  let s = fitPara(ctx, d.title, 200, 3, 48, 22, tf, w);
  setF(ctx, s, tf, w);
  const tl = wrap(ctx, d.title, 200), lh = s * 1.32, ty = 320 - (tl.length - 1) * lh / 2;
  tl.forEach((l, i) => T(ctx, l, bc, ty + i * lh, {size:s, fam:tf, w, color:'#FFFFFF'}));
  const ls = [S.l1, S.l2, S.l3].filter(x => x && x.trim());
  ls.forEach((l, i) => {
    const last = i === ls.length - 1, sz = fitLine(ctx, l, 210, 15, 10, FONTS.sans, last ? 800 : 600);
    T(ctx, l, bc, H - 122 + i * 24, {size:sz, fam:FONTS.sans, w:last ? 800 : 600, color:'#FFFFFF'});
  });
  if(S.year && S.year.trim()) T(ctx, 'العام الدراسي ' + S.year, bc, H - 122 + ls.length * 24 + 10, {size:13, fam:FONTS.sans, w:500, color:th.onDark});
  const xr = 690, mw = 610;
  logoAt(ctx, 'side', 110, 92, 120, 84, false);
  let y = 180;
  if(d.intro){ s = fitPara(ctx, d.intro, mw, 2, 24, 14, FONTS.naskh, 400); y = para(ctx, d.intro, xr, y, mw, {size:s, fam:FONTS.naskh, color:th.ink, align:'right', lh:s * 1.6}); }
  const name = rec.name || 'اسم الطالب';
  s = fitLine(ctx, name, mw, 60, 26, tf, w);
  y += s * 0.95 + 14;
  T(ctx, name, xr, y, {size:s, fam:tf, w, color:th.primary, align:'right'});
  ctx.fillStyle = th.accent; ctx.fillRect(xr - 120, y + 18, 120, 4);
  y += 18;
  const cls = rec.cls || d.cls;
  if(cls){ y += 40; T(ctx, 'الصف: ' + cls, xr, y, {size:18, fam:FONTS.sans, w:500, color:th.muted, align:'right'}); }
  if(d.reason){
    s = fitPara(ctx, d.reason, mw, 4, 21, 14, FONTS.naskh, 400);
    const last = para(ctx, d.reason, xr, y + 48, mw, {size:s, fam:FONTS.naskh, color:th.ink, align:'right', lh:s * 1.7});
    if(last > 548) env.OVER = true;
  }
  sign(ctx, 560, 590, d.teacherLabel, d.teacherName, th, 1);
  sign(ctx, 190, 590, 'مدير المدرسة', S.director, th, 1);
  if(d.seal) seal(ctx, 375, 594, 34, th);
  if(d.date) T(ctx, 'تحريراً في: ' + d.date, xr, 668, {size:14, fam:FONTS.sans, color:th.muted, align:'right'});
}
