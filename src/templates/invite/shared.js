/* Parts shared by the invitation templates. */
import { FONTS } from '../../schema/themes.js';
import { T, para, fitPara } from '../../render/text.js';

/** Date / time / place as columns separated by thin rules. Returns the lowest baseline. */
export function inviteDetailsLine(ctx, rows, y, th){
  const n = rows.length; if(!n) return y;
  const x0 = 110, x1 = 890, cw = (x1 - x0) / n;
  let maxLast = y + 48;
  rows.forEach((r, i) => {
    const cx = x1 - cw * (i + 0.5);
    T(ctx, r[0], cx, y, {size:22, fam:FONTS.sans, w:700, color:th.accent});
    const s = fitPara(ctx, r[1], cw - 30, 2, 29, 15, FONTS.sans, 800);
    const last = para(ctx, r[1], cx, y + 48, cw - 30, {size:s, fam:FONTS.sans, w:800, color:th.ink, lh:s * 1.3});
    maxLast = Math.max(maxLast, last);
    if(i) { ctx.save(); ctx.strokeStyle = th.accent; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x1 - cw * i, y - 30); ctx.lineTo(x1 - cw * i, y + 70); ctx.stroke(); ctx.restore(); }
  });
  return maxLast;
}
