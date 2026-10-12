/* Text primitives: digit conversion, RTL drawing, Arabic word wrap and auto-fit.
 * Arabic is always drawn as whole strings (never glyph by glyph, never with letterSpacing) to keep letters joined. */
import { env } from './env.js';
import { FONTS } from '../schema/themes.js';

const AR = '٠١٢٣٤٥٦٧٨٩';
/** Always converts to Arabic-Indic digits (UI labels). */
export const arNum = n => String(n).replace(/[0-9]/g, d => AR[d]);
/** A class code such as «1/6» (two short numbers around a slash) is shown in typing order read right to left
 *  (1 on the right), as Arabic readers expect. Right-to-left marks around the slash stop the bidi algorithm from
 *  turning it into one left-to-right number. Longer forms (dates such as 13/10/2026) are left as they are. */
const RLM = '‏';
export const classOrder = s => s.replace(/(^|[^0-9٠-٩\/])([0-9٠-٩]{1,2})\/([0-9٠-٩]{1,2})(?![0-9٠-٩\/])/g, (m, a, x, y) => a + x + RLM + '/' + RLM + y);
/** Converts digits only when the digits toggle is on (everything drawn on the page); applies classOrder always. */
export const toAr = s => { const t = classOrder(String(s == null ? '' : s)); return env.DIG ? t.replace(/[0-9]/g, d => AR[d]) : t; };
export const plural = (n, one, two, few, many) => n === 1 ? one : n === 2 ? two : (n >= 3 && n <= 10) ? few : many;

export function setF(ctx, size, fam, w){ ctx.font = (w || 400) + ' ' + size + 'px ' + fam; }

export function T(ctx, s, x, y, o){
  o = o || {};
  setF(ctx, o.size || 20, o.fam || FONTS.sans, o.w || 400);
  ctx.fillStyle = o.color || '#000';
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.base || 'alphabetic';
  ctx.direction = 'rtl';
  ctx.fillText(toAr(s), x, y);
  ctx.textBaseline = 'alphabetic';
}
export function wrap(ctx, s, maxW){
  const out = [];
  for(const p of String(s || '').split('\n')){
    const words = p.trim().split(/\s+/).filter(Boolean);
    let line = '';
    for(const w of words){
      const t = line ? line + ' ' + w : w;
      if(!line || ctx.measureText(toAr(t)).width <= maxW) line = t;
      else { out.push(line); line = w; }
    }
    if(line) out.push(line);
  }
  return out;
}
/** Draws wrapped text and returns the baseline of its last line. */
export function para(ctx, s, x, y, maxW, o){
  setF(ctx, o.size, o.fam, o.w);
  const ls = wrap(ctx, s, maxW), lh = o.lh || o.size * 1.7;
  ls.forEach((l, i) => T(ctx, l, x, y + i * lh, o));
  return ls.length ? y + (ls.length - 1) * lh : y;
}
/** Largest size (≥ min) at which s wraps into maxLines; flags overflow when even min is too big. */
export function fitPara(ctx, s, maxW, maxLines, size, min, fam, w){
  let sz = size;
  for(; sz > min; sz--){ setF(ctx, sz, fam, w); if(wrap(ctx, s, maxW).length <= maxLines) break; }
  if(sz <= min){ setF(ctx, min, fam, w); if(wrap(ctx, s, maxW).length > maxLines) env.OVER = true; }
  return sz;
}
/** Largest size (≥ min) at which s fits on one line of maxW. */
export function fitLine(ctx, s, maxW, size, min, fam, w){
  let sz = size; setF(ctx, sz, fam, w);
  while(sz > min && ctx.measureText(toAr(s)).width > maxW){ sz -= 0.5; setF(ctx, sz, fam, w); }
  return sz;
}
