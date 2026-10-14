/* Blocks shared by the new templates. Every element fits itself to its slot and records its box. */
import { env } from '../render/env.js';
import { FONTS } from '../schema/themes.js';
import { setF, toAr, T, wrap } from '../render/text.js';
import { rr, starPath } from '../render/shapes.js';
import { line, mark, fitOne } from '../render/layout.js';
import { ribbon } from '../ornaments/awards.js';
import { font, tone, JOY } from './skins.js';

const has = s => s != null && String(s).trim() !== '';

/** Draws an uploaded image fitted into mw × mh centred on (cx, cy). Returns the drawn box or null. */
export function image(ctx, key, cx, cy, mw, mh, o){
  const img = env.logos[key];
  const iw = img && (img.naturalWidth || img.width), ih = img && (img.naturalHeight || img.height); // <img> or ImageBitmap (worker)
  if(!iw) return null;
  const k = Math.min(mw / iw, mh / ih), w = iw * k, h = ih * k;
  ctx.save();
  if(o && o.alpha) ctx.globalAlpha = o.alpha;
  if(o && o.blend) ctx.globalCompositeOperation = o.blend;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
  if(!(o && o.nomark)) mark(key, cx - w / 2, cy - h / 2, w, h);
  return [cx - w / 2, cy - h / 2, w, h];
}

/** Official header: school lines on the right, side logo or school year on the left, centre logo or the skin's emblem.
 *  Returns the header's bottom edge. */
export function header(ctx, skin, th, box, sc, o){
  o = Object.assign({emblem:true}, o);
  if(env.logos.school || env.logos.side) return logoHeader(ctx, skin, th, box, sc, o);
  const S = env.state.school, W = box.x1 - box.x0, lab = font(skin, 'label');
  const ls = [S.l1, S.l2, S.l3].filter(has);
  const colW = W * 0.33, lh = 22 * sc;
  ls.forEach((l, i) => {
    const last = i === ls.length - 1;
    line(ctx, l, box.x1, box.y0 + (i + 1) * lh, colW, {size:(last ? 16.5 : 15.5) * sc, min:10 * sc, fam:FONTS.sans, w:last ? 800 : 700, color:th.ink, align:'right', name:'header'});
  });
  const cy = box.y0 + 36 * sc, hx0 = box.hx0 == null ? box.x0 : box.hx0;   // a skin may keep the left column clear of a corner ornament
  if(!image(ctx, 'side', hx0 + 50 * sc, cy, 100 * sc, 74 * sc) && has(S.year)){
    // labels print as clearly as the school lines: dark ink, bold
    line(ctx, 'العام الدراسي', hx0, box.y0 + lh, colW * 0.8, {size:15 * sc, min:10 * sc, fam:FONTS.sans, w:700, color:th.ink, align:'left', name:'header'});
    line(ctx, S.year, hx0, box.y0 + 2 * lh, colW * 0.8, {size:15.5 * sc, min:10 * sc, fam:FONTS.sans, w:700, color:th.ink, align:'left', name:'header'});
  }
  const cx = (box.x0 + box.x1) / 2;
  if(!image(ctx, 'center', cx, cy, W * 0.24, 80 * sc) && o.emblem){
    skin.emblem(ctx, cx, cy, 34 * sc, th); mark('emblem', cx - 34 * sc, cy - 34 * sc, 68 * sc, 68 * sc);
  }
  return box.y0 + Math.max(ls.length * lh + 8 * sc, 76 * sc);
}

/** Size of an uploaded image fitted into mw × mh, or null. */
const fitSize = (key, mw, mh) => {
  const img = env.logos[key], iw = img && (img.naturalWidth || img.width), ih = img && (img.naturalHeight || img.height);
  if(!iw) return null;
  const k = Math.min(mw / iw, mh / ih);
  return [iw * k, ih * k];
};
/** Header of logos: school logo on the right (instead of the school lines), the centre logo with the school year
 *  under it, the side logo on the left (e.g. Oman Vision 2040). Logos sit flush with the outer edges. */
function logoHeader(ctx, skin, th, box, sc, o){
  const S = env.state.school, W = box.x1 - box.x0, hx0 = box.hx0 == null ? box.x0 : box.hx0;
  const L = 112 * sc, top = box.y0 - 6 * sc, cy = top + L / 2, colW = W * 0.3;
  // right: the school logo, or the school lines when only the side logo was given
  const rs = fitSize('school', colW * 0.75, L);
  if(rs) image(ctx, 'school', box.x1 - rs[0] / 2, cy, rs[0], rs[1]);
  else {
    const ls = [S.l1, S.l2, S.l3].filter(has), lh = 22 * sc;
    ls.forEach((l, i) => {
      const last = i === ls.length - 1;
      line(ctx, l, box.x1, box.y0 + (i + 1) * lh, colW, {size:(last ? 16.5 : 15.5) * sc, min:10 * sc, fam:FONTS.sans, w:last ? 800 : 700, color:th.ink, align:'right', name:'header'});
    });
  }
  // left: the side logo, or the school year in its usual place
  // the side logo may grow up to the centre logo's actual edge (wide logos like Oman Vision 2040 need the room)
  const yearMid = !!env.logos.side && has(S.year), cs = fitSize('center', W * 0.24, L - (yearMid ? 24 * sc : 0));
  const cHalf = cs ? cs[0] / 2 : 40 * sc, gapC = 26 * sc;
  const sd = fitSize('side', Math.max(60 * sc, Math.min(colW * 0.9, (box.x0 + W / 2) - cHalf - gapC - hx0)), L * 0.85);
  if(sd) image(ctx, 'side', hx0 + sd[0] / 2, cy, sd[0], sd[1]);
  else if(has(S.year)){
    const lh = 22 * sc;
    line(ctx, 'العام الدراسي', hx0, box.y0 + lh, colW * 0.8, {size:15 * sc, min:10 * sc, fam:FONTS.sans, w:700, color:th.ink, align:'left', name:'header'});
    line(ctx, S.year, hx0, box.y0 + 2 * lh, colW * 0.8, {size:15.5 * sc, min:10 * sc, fam:FONTS.sans, w:700, color:th.ink, align:'left', name:'header'});
  }
  // centre: the centre logo (or the skin's emblem), with the school year under it when the left side holds a logo
  const cx = (box.x0 + box.x1) / 2, yh = yearMid ? 24 * sc : 0, mh = L - yh;
  if(!image(ctx, 'center', cx, top + mh / 2, W * 0.24, mh) && o.emblem){
    const r = Math.min(34 * sc, mh / 2 - 2 * sc);
    skin.emblem(ctx, cx, top + mh / 2, r, th); mark('emblem', cx - r, top + mh / 2 - r, 2 * r, 2 * r);
  }
  if(yearMid) line(ctx, 'العام الدراسي ' + S.year, cx, top + L + 2 * sc, W * 0.3, {size:15 * sc, min:10 * sc, fam:FONTS.sans, w:700, color:th.ink, name:'header'});
  return top + L + (yearMid ? 10 : 6) * sc;
}

/** Signature: label, optional signature image, name — or a dotted line to sign by hand when no name is given.
 *  `top` is the label baseline area top. Returns the bottom edge. */
export function signature(ctx, skin, th, cx, top, label, name, o){
  o = Object.assign({w:250, sc:1, sigImage:false}, o);
  const sc = o.sc, lab = font(skin, 'label'), body = font(skin, 'bodyB');
  let y = top;
  if(has(label)){ y += 18 * sc; line(ctx, label, cx, y, o.w, {size:17.5 * sc, min:11 * sc, fam:FONTS.sans, w:700, color:th.ink, name:'sign'}); }
  if(o.sigImage && env.logos.signature){ image(ctx, 'signature', cx, y + 30 * sc, o.w * 0.75, 50 * sc, {nomark:true}); y += 56 * sc; }
  if(has(name)){ y += 32 * sc; line(ctx, name, cx, y, o.w, {size:21 * sc, min:13 * sc, fam:body.fam, w:body.w, color:th.ink, name:'sign'}); }
  else if(has(label)){
    y += 30 * sc;
    ctx.save(); ctx.setLineDash([2, 5]); ctx.lineCap = 'round'; ctx.strokeStyle = th.muted; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(cx - o.w * 0.36, y); ctx.lineTo(cx + o.w * 0.36, y); ctx.stroke(); ctx.restore();
  }
  return y + 8 * sc;
}
/** Height a signature needs (for reserving the bottom zone). */
export const signatureH = (label, name, sc = 1, sigImage = false) =>
  ((has(label) ? 18 : 0) + (has(name) || has(label) ? 32 : 0) + (sigImage && env.logos.signature ? 56 : 0) + 8) * sc;

/** School stamp: the uploaded stamp image, or a dashed placeholder circle when requested. */
export function stamp(ctx, cx, cy, r, th, placeholder){
  if(image(ctx, 'stamp', cx, cy, r * 2.1, r * 2.1, {alpha:0.92, blend:'multiply', nomark:true})) return true;
  if(!placeholder) return false;
  // clearly visible: a solid ring, a dashed inner ring and the words «مكان الختم»
  ctx.save(); ctx.strokeStyle = th.primary; ctx.globalAlpha = 0.85;
  ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(cx, cy, r * 0.84, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  T(ctx, 'مكان', cx, cy - 2, {size:r * 0.36, fam:FONTS.sans, w:700, color:th.primary});
  T(ctx, 'الختم', cx, cy + r * 0.4, {size:r * 0.36, fam:FONTS.sans, w:700, color:th.primary});
  ctx.restore();
  return true;
}

/** Footer line «school · ministry». */
export function footer(ctx, skin, th, box, y){
  const S = env.state.school, ft = [S.l3, S.l2].filter(has).join('   ·   ');
  if(!ft) return;
  const lab = font(skin, 'label');
  line(ctx, ft, (box.x0 + box.x1) / 2, y, box.x1 - box.x0, {size:19, min:11, fam:lab.fam, w:600, color:th.muted, name:'footer'});
}

/** Details (date / time / place) as a layout block. style: 'table' (rows) | 'cards' (columns). */
export function detailsBlock(rows, skin, th, style){
  if(!rows.length) return null;
  const lab = font(skin, 'label'), val = font(skin, 'bodyB');
  if(style === 'cards'){
    return {t:'gfx', h:132, min:0.75, gap:1.4, name:'details', mark:false, draw(ctx, x0, x1, top, h){
      const n = rows.length, gap = 20, cw = (x1 - x0 - gap * (n - 1)) / n, k = h / 132;
      rows.forEach((r, i) => {
        const x = x1 - (i + 1) * cw - i * gap;
        ctx.save(); rr(ctx, x, top, cw, h, 14 * k);
        if(env.ink){ ctx.strokeStyle = th.primary; ctx.lineWidth = 1.4; ctx.stroke(); }
        else { ctx.fillStyle = skin.id === 'joy' ? tintOf(JOY[i % 4]) : th.tint; ctx.fill(); ctx.clip(); ctx.fillStyle = skin.id === 'joy' ? JOY[i % 4] : (env.gold ? '#B08A3E' : th.accent); ctx.fillRect(x, top, cw, 5 * k); }
        ctx.restore();
        mark('details', x, top, cw, h);
        line(ctx, r[0], x + cw / 2, top + 42 * k, cw - 30, {size:20 * k, min:12, fam:lab.fam, w:700, color:th.primary, name:'details-in'});
        // value: up to two lines, fitted
        const avail = cw - 30; let s = 27 * k, ls;
        for(; s > 14; s -= 0.5){ setF(ctx, s, val.fam, val.w); ls = wrap(ctx, r[1], avail); if(ls.length <= 2) break; }
        const lh = s * 1.3, b0 = top + (60 * k + h) / 2 + s * 0.35 - (ls.length - 1) * lh / 2;
        ls.slice(0, 2).forEach((l, j) => line(ctx, l, x + cw / 2, b0 + j * lh, avail, {size:s, min:11, fam:val.fam, w:val.w, color:th.ink, name:'details-in'}));
      });
    }};
  }
  // table
  const rh = 66;
  return {t:'gfx', h:rows.length * rh + 14, min:0.72, gap:1.3, name:'details', mark:false, draw(ctx, x0, x1, top, h){
    const k = h / (rows.length * rh + 14), r0 = rh * k, pad = 30;
    ctx.save(); rr(ctx, x0, top, x1 - x0, h, 16 * k);
    if(!env.ink){ ctx.fillStyle = skin.id === 'heritage' ? 'rgba(255,255,255,.65)' : th.tint; ctx.fill(); }
    ctx.strokeStyle = env.gold ? '#B08A3E' : th.accent; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.3; ctx.stroke(); ctx.restore();
    mark('details', x0, top, x1 - x0, h);
    rows.forEach((r, i) => {
      const cy = top + 7 * k + i * r0 + r0 / 2;
      if(i){ ctx.save(); ctx.strokeStyle = th.accent; ctx.globalAlpha = 0.4; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x0 + pad, top + 7 * k + i * r0); ctx.lineTo(x1 - pad, top + 7 * k + i * r0); ctx.stroke(); ctx.restore(); }
      ctx.fillStyle = skin.id === 'joy' ? JOY[i % 4] : (env.gold ? '#B08A3E' : th.accent); starPath(ctx, x1 - pad - 4, cy, 9 * k); ctx.fill();
      const labW = (x1 - x0) * 0.3;
      line(ctx, r[0], x1 - pad - 24, cy + 8 * k, labW, {size:22 * k, min:12, fam:lab.fam, w:700, color:th.primary, align:'right', name:'details-in'});
      line(ctx, r[1], x1 - pad - 24 - labW - 16, cy + 9 * k, (x1 - x0) - labW - 2 * pad - 50, {size:26 * k, min:13, fam:val.fam, w:val.w, color:th.ink, align:'right', name:'details-in'});
    });
  }};
}
function tintOf(hex){ const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0.12)`; }

/** Kicker label as a pill (layout block). */
export function kickerBlock(text, skin, th, k = 1){
  if(!has(text)) return null;
  const lab = font(skin, 'label');
  return {t:'gfx', h:50 * k, min:0.8, gap:0, name:'kicker', mark:false, draw(ctx, x0, x1, top, h){
    const size = 26 * h / 50, cx = (x0 + x1) / 2;
    setF(ctx, size, lab.fam, 800);
    const w = Math.min(x1 - x0, ctx.measureText(toAr(text)).width + h * 1.3);
    ctx.save(); rr(ctx, cx - w / 2, top, w, h, h / 2);
    if(skin.id === 'modern' || env.ink){ ctx.strokeStyle = th.primary; ctx.lineWidth = 1.6; ctx.stroke(); }
    else { ctx.fillStyle = skin.id === 'joy' ? JOY[2] : th.primary; ctx.fill(); }
    ctx.restore();
    const fg = skin.id === 'modern' || env.ink ? th.primary : '#FFFFFF';
    line(ctx, text, cx, top + h / 2 + size * 0.36, w - h * 0.8, {size, min:12, fam:lab.fam, w:800, color:fg, name:'kicker'});
  }};
}

/** Closing banner for posters: ribbon (luxe/heritage), rule + text (modern), coloured pill (joy). */
export function banner(ctx, skin, th, cx, cy, w, h, text, k = 1){
  h = Math.min(h * k, 104);
  if(!has(text)) return;
  const f = font(skin, 'title');
  if(skin.id === 'modern'){
    line(ctx, text, cx, cy + h * 0.18, w, {size:h * 0.5, min:20, fam:f.fam, w:f.w, color:th.primary, name:'banner'});
    ctx.fillStyle = th.primary; ctx.fillRect(cx - 40, cy + h * 0.38, 80, 3);
    return;
  }
  if(skin.id === 'joy'){
    ctx.save(); rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2); ctx.fillStyle = env.ink ? '#FFFFFF' : JOY[1]; ctx.fill();
    if(env.ink){ ctx.strokeStyle = JOY[1]; ctx.lineWidth = 2; ctx.stroke(); } ctx.restore();
    line(ctx, text, cx, cy + h * 0.17, w - h, {size:h * 0.48, min:18, fam:f.fam, w:f.w, color:env.ink ? JOY[1] : '#FFFFFF', name:'banner'});
    return;
  }
  const [tx, , tw] = ribbon(ctx, cx, cy, w - h * 2.9, h, {color:th.primary, accent:env.gold ? 'gold' : th.accent, ink:env.ink});
  line(ctx, text, cx, cy + h * 0.17, tw, {size:h * 0.46, min:18, fam:f.fam, w:f.w, color:env.ink ? th.primary : '#FFFFFF', name:'banner'});
}

/** Text block helper with role-based font and colour. */
export function txt(skin, th, role, text, o){
  const f = font(skin, role === 'intro' || role === 'reason' || role === 'para' ? 'body' : role === 'strong' ? 'bodyB' : role === 'small' ? 'label' : role);
  const color = role === 'title' ? tone(skin, 'title', th) : role === 'name' ? tone(skin, 'name', th) : role === 'small' ? th.muted : th.ink;
  const b = Object.assign({t:'text', text, fam:f.fam, w:f.w, color, name:role, rigid:role === 'title' || role === 'name'}, o);
  // user size factor: scales the preferred size; when shrinking, the minimum follows so the text can really get smaller
  if(b.k && b.k !== 1){ b.size *= b.k; if(b.min) b.min *= Math.min(1, b.k); }
  return b;
}
export { has, fitOne };
