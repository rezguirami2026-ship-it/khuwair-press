/* Notice — coloured card header (1000 × 1414). */
import { env, tfam, tw } from '../../render/env.js';
import { FONTS } from '../../schema/themes.js';
import { detRows } from '../../schema/parse.js';
import { T, setF, wrap, fitPara, fitLine, toAr } from '../../render/text.js';
import { starPath, hair, paper } from '../../render/shapes.js';
import { starField } from '../../ornaments/index.js';
import { officialHeader, sign, detailCards, footerText } from '../../render/blocks.js';
import { noticeBody, noticeTail } from './shared.js';

export default function noticeCard(ctx, d, rec, th){
  const W = 1000, H = 1414, S = env.state.school, tf = tfam(), w = tw(), bh = 440;
  paper(ctx, W, H);
  ctx.fillStyle = th.primary; ctx.fillRect(0, 0, W, bh);
  starField(ctx, 0, 0, W, bh, 58, 16, '#FFFFFF', 0.08);
  ctx.fillStyle = th.accent; ctx.fillRect(0, bh, W, 7);
  officialHeader(ctx, 70, 930, 46, th, 1.3, true);
  if(d.kicker && d.kicker.trim()){
    setF(ctx, 30, FONTS.sans, 800); const kw = ctx.measureText(toAr(d.kicker)).width;
    T(ctx, d.kicker, 500, 252, {size:30, fam:FONTS.sans, w:800, color:th.onDark});
    ctx.fillStyle = th.onDark; [-1, 1].forEach(sg => { starPath(ctx, 500 + sg * (kw / 2 + 26), 242, 8); ctx.fill(); });
  }
  let s = fitPara(ctx, d.title, 840, 2, 70, 36, tf, w);
  setF(ctx, s, tf, w);
  const tl = wrap(ctx, d.title, 840), lh = s * 1.22;
  const t0 = tl.length > 1 ? 318 : 350;
  tl.forEach((l, i) => T(ctx, l, 500, t0 + i * lh, {size:s, fam:tf, w, color:'#FFFFFF'}));
  let y = noticeBody(ctx, d, th, bh + 84);
  const rows = detRows(d);
  if(rows.length){ y = detailCards(ctx, rows, 100, 900, y + 44, 150, th) - 20; }
  y = noticeTail(ctx, d, th, y);
  sign(ctx, 230, Math.min(1236, y + 130), d.signer, S.director, th, 1.4);
  hair(ctx, 100, 900, H - 92, th.accent, 1.2);
  const ft = footerText(S);
  if(ft){ const fs = fitLine(ctx, ft, 820, 20, 12, FONTS.sans, 600); T(ctx, ft, 500, H - 52, {size:fs, fam:FONTS.sans, w:600, color:th.muted}); }
}
