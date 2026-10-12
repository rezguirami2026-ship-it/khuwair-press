/* Invitation — coloured top band (1000 × 1414). */
import { env, tfam, tw } from '../../render/env.js';
import { FONTS } from '../../schema/themes.js';
import { detRows } from '../../schema/parse.js';
import { T, setF, wrap, para, fitPara, fitLine } from '../../render/text.js';
import { hair, paper } from '../../render/shapes.js';
import { starField, emblem } from '../../ornaments/index.js';
import { logoAt, sign, detailCards, footerText } from '../../render/blocks.js';

export default function inviteBand(ctx, d, rec, th){
  const W = 1000, H = 1414, S = env.state.school, tf = tfam(), w = tw(), bh = 600;
  paper(ctx, W, H);
  ctx.fillStyle = th.primary; ctx.fillRect(0, 0, W, bh);
  starField(ctx, 0, 0, W, bh, 62, 17, '#FFFFFF', 0.08);
  ctx.fillStyle = th.accent; ctx.fillRect(0, bh, W, 8);
  if(!logoAt(ctx, 'center', 500, 122, 160, 104, true)) emblem(ctx, 500, 122, 42, th, true);
  const hs = fitLine(ctx, d.heading, 640, 130, 50, tf, w);
  T(ctx, d.heading, 500, 336, {size:hs, fam:tf, w, color:th.onDark});
  if(d.occasion && d.occasion.trim()){
    const s = fitPara(ctx, d.occasion, 820, 2, 58, 28, tf, w);
    setF(ctx, s, tf, w); const ol = wrap(ctx, d.occasion, 820), lh = s * 1.25;
    const o0 = ol.length > 1 ? 432 : 462;
    ol.forEach((l, i) => T(ctx, l, 500, o0 + i * lh, {size:s, fam:tf, w, color:'#FFFFFF'}));
  }
  const sentence = [d.lead, d.occasion, d.desc].map(x => (x || '').trim()).filter(Boolean).join(' ');
  let y = bh + 100;
  if(sentence){ const s = fitPara(ctx, sentence, 800, 4, 31, 18, FONTS.naskh, 400); y = para(ctx, sentence, 500, y, 800, {size:s, fam:FONTS.naskh, color:th.ink, lh:s * 1.75}); }
  const rows = detRows(d);
  if(rows.length) y = detailCards(ctx, rows, 100, 900, y + 46, 150, th);
  if(d.closing && d.closing.trim()){ const s = fitLine(ctx, d.closing, 800, 32, 18, FONTS.naskh, 700); y += 82; T(ctx, d.closing, 500, y, {size:s, fam:FONTS.naskh, w:700, color:th.primary}); }
  if(y > H - 226) env.OVER = true;
  sign(ctx, 500, H - 188, d.signer, S.director, th, 1.35);
  hair(ctx, 100, 900, H - 92, th.accent, 1.2);
  const ft = footerText(S);
  if(ft){ const fs = fitLine(ctx, ft, 820, 20, 12, FONTS.sans, 600); T(ctx, ft, 500, H - 52, {size:fs, fam:FONTS.sans, w:600, color:th.muted}); }
}
