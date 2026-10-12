/* Composite blocks shared by templates: logos, official header, signatures, seal, pill, detail cards. */
import { env } from './env.js';
import { FONTS } from '../schema/themes.js';
import { T, setF, wrap, fitPara, fitLine, toAr } from './text.js';
import { rr } from './shapes.js';

/** Draws an uploaded logo fitted into mw×mh around (cx, cy); returns false when that slot is empty. */
export function logoAt(ctx, key, cx, cy, mw, mh, tile){
  const img = env.logos[key];
  const iw = img && (img.naturalWidth || img.width), ih = img && (img.naturalHeight || img.height); // <img> or ImageBitmap (worker)
  if(!iw) return false;
  const k = Math.min(mw / iw, mh / ih), w = iw * k, h = ih * k;
  if(tile){ ctx.save(); ctx.fillStyle = '#FFFFFF'; rr(ctx, cx - w / 2 - 12, cy - h / 2 - 10, w + 24, h + 20, 12); ctx.fill(); ctx.restore(); }
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  return true;
}
export function sign(ctx, x, y, label, name, th, sc){
  sc = sc || 1;
  if(label && label.trim()) T(ctx, label, x, y, {size:16 * sc, fam:FONTS.sans, w:500, color:th.muted});
  if(name && name.trim()){
    const s = fitLine(ctx, name, 260 * sc, 21 * sc, 13 * sc, FONTS.naskh, 700);
    T(ctx, name, x, y + 32 * sc, {size:s, fam:FONTS.naskh, w:700, color:th.ink});
  }
}
export function seal(ctx, x, y, r, th){
  ctx.save(); ctx.globalAlpha = 0.6; ctx.setLineDash([3, 4]); ctx.strokeStyle = th.muted; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  T(ctx, 'الختم', x, y + 5, {size:13, fam:FONTS.sans, color:th.muted});
  ctx.restore();
}
export function pill(ctx, text, cx, top, h, bg, fg, size){
  setF(ctx, size, FONTS.sans, 800);
  const w = ctx.measureText(toAr(text)).width + h * 1.3;
  ctx.fillStyle = bg; rr(ctx, cx - w / 2, top, w, h, h / 2); ctx.fill();
  T(ctx, text, cx, top + h / 2 + 1, {size, fam:FONTS.sans, w:800, color:fg, base:'middle'});
}
/** School lines on the right, side logo (or school year) on the left, center logo in the middle. */
export function officialHeader(ctx, x0, x1, top, th, sc, dark){
  const S = env.state.school, ink = dark ? '#FFFFFF' : th.ink, mut = dark ? th.onDark : th.muted;
  const ls = [S.l1, S.l2, S.l3].filter(s => s && s.trim());
  const maxW = (x1 - x0) * 0.34;
  ls.forEach((l, i) => {
    const last = i === ls.length - 1, w = last ? 800 : 700;
    const sz = fitLine(ctx, l, maxW, (last ? 17 : 16) * sc, 10 * sc, FONTS.sans, w);
    T(ctx, l, x1, top + (i + 1) * 23 * sc, {size:sz, fam:FONTS.sans, w, color:ink, align:'right'});
  });
  const cy = top + 42 * sc;
  if(!logoAt(ctx, 'side', x0 + 52 * sc, cy, 104 * sc, 80 * sc, dark) && S.year && S.year.trim()){
    T(ctx, 'العام الدراسي', x0, top + 23 * sc, {size:14 * sc, fam:FONTS.sans, w:500, color:mut, align:'left'});
    const ys = fitLine(ctx, S.year, maxW, 16 * sc, 10 * sc, FONTS.sans, 700);
    T(ctx, S.year, x0, top + 46 * sc, {size:ys, fam:FONTS.sans, w:700, color:ink, align:'left'});
  }
  logoAt(ctx, 'center', (x0 + x1) / 2, cy, 130 * sc, 84 * sc, dark);
}
/** Row of tinted cards (label + value), laid out right to left. Returns the bottom edge. */
export function detailCards(ctx, rows, x0, x1, y, h, th){
  const n = rows.length; if(!n) return y;
  const gap = 22, cw = (x1 - x0 - gap * (n - 1)) / n;
  rows.forEach((r, i) => {
    const x = x1 - (i + 1) * cw - i * gap;
    ctx.save(); rr(ctx, x, y, cw, h, 16); ctx.clip();
    ctx.fillStyle = th.tint; ctx.fillRect(x, y, cw, h);
    ctx.fillStyle = th.accent; ctx.fillRect(x, y, cw, 6);
    ctx.restore();
    T(ctx, r[0], x + cw / 2, y + 48, {size:21, fam:FONTS.sans, w:700, color:th.primary});
    const s = fitPara(ctx, r[1], cw - 34, 2, 27, 15, FONTS.sans, 800);
    setF(ctx, s, FONTS.sans, 800);
    const ls = wrap(ctx, r[1], cw - 34), lh = s * 1.3;
    const b0 = y + (64 + h) / 2 + s * 0.35 - (ls.length - 1) * lh / 2;
    ls.forEach((l, j) => T(ctx, l, x + cw / 2, b0 + j * lh, {size:s, fam:FONTS.sans, w:800, color:th.ink}));
  });
  return y + h;
}
/** The footer line «school · ministry» used by portrait templates. */
export const footerText = S => [S.l3, S.l2].filter(x => x && x.trim()).join('   ·   ');
