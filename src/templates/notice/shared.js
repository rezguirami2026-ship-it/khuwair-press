/* Parts shared by the notice templates. */
import { env } from '../../render/env.js';
import { FONTS } from '../../schema/themes.js';
import { T, para, fitPara, fitLine } from '../../render/text.js';

/** Greeting + body paragraph. Returns the last baseline. */
export function noticeBody(ctx, d, th, y){
  if(d.greeting){ const s = fitLine(ctx, d.greeting, 800, 30, 18, FONTS.naskh, 700); T(ctx, d.greeting, 900, y, {size:s, fam:FONTS.naskh, w:700, color:th.ink, align:'right'}); y += 58; }
  if(d.body){ const s = fitPara(ctx, d.body, 800, 6, 28, 18, FONTS.naskh, 400); y = para(ctx, d.body, 900, y, 800, {size:s, fam:FONTS.naskh, color:th.ink, align:'right', lh:s * 1.8}); }
  return y;
}
/** Optional note + closing line; flags overflow past the signature zone. */
export function noticeTail(ctx, d, th, y){
  if(d.note && d.note.trim()){ y += 52; const s = fitPara(ctx, 'ملاحظة: ' + d.note, 800, 3, 24, 16, FONTS.sans, 500); y = para(ctx, 'ملاحظة: ' + d.note, 900, y, 800, {size:s, fam:FONTS.sans, w:500, color:th.muted, align:'right', lh:s * 1.65}); }
  if(d.closing && d.closing.trim()){ y += 58; const s = fitPara(ctx, d.closing, 800, 2, 29, 18, FONTS.naskh, 700); y = para(ctx, d.closing, 500, y, 800, {size:s, fam:FONTS.naskh, w:700, color:th.primary, lh:s * 1.6}); }
  if(y > 1192) env.OVER = true;
  return y;
}
