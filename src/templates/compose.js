/* Page composers shared by the four identities. Each template file picks a skin and options;
 * the composer measures every block with the layout engine before drawing anything. */
import { env } from '../render/env.js';
import { parseNames, lines as splitLines, cleanPoint, detRows } from '../schema/parse.js';
import { setF, wrap, toAr, T } from '../render/text.js';
import { rr, starPath } from '../render/shapes.js';
import { stack, drawStack, line, mark } from '../render/layout.js';
import { font, tone, JOY, safe } from './skins.js';
import { rankText } from '../schema/gender.js';
import { header, signature, signatureH, stamp, footer, detailsBlock, kickerBlock, banner, txt, image, has } from './common.js';

const gfx = (name, h, draw, o) => Object.assign({t:'gfx', name, h, draw}, o);
/** User size factor of a field (أ− / أ+ in the panel), clamped to 60–160 %. */
export const K = (d, key) => Math.max(0.6, Math.min(1.6, (d.sz && d.sz[key]) || 1));

/* ---------------- certificate (1000 × 707) ---------------- */
export function certificate(skin, opt){
  opt = Object.assign({align:'center'}, opt);
  return function(ctx, d, rec, th){
    const W = 1000, H = 707, S = env.state.school;
    const box = skin.page(ctx, W, H, th);
    if(skin.cornerAward){ skin.cornerAward(ctx, W, H, th); mark('award', 72, 72, 112, 136); }
    const hb = header(ctx, skin, th, box, 1, {emblem:!skin.hero});
    // bottom zone — right: an optional extra signer, otherwise the date; centre: the award; left: director + stamp
    const sigImg = !!env.logos.signature, extra = has(d.teacherLabel) || has(d.teacherName);
    const rightLabel = extra ? d.teacherLabel : (has(d.date) ? 'التاريخ' : ''), rightValue = extra ? d.teacherName : d.date;
    const sh = Math.max(signatureH(rightLabel, rightValue), signatureH('مدير المدرسة', S.director, 1, sigImg));
    const bottom = box.y1, sigTop = bottom - sh;
    const xr = box.x1 - (box.sigInset || 150), xl = box.x0 + 150, cx = W / 2;
    signature(ctx, skin, th, xr, sigTop, rightLabel, rightValue, {w:250});
    signature(ctx, skin, th, xl, sigTop, 'مدير المدرسة', S.director, {w:250, sigImage:true});
    stamp(ctx, xl + 128, bottom - 46, 42, th, d.seal);
    const ar = 34, awardTop = bottom - 2.45 * ar - 6;
    skin.award(ctx, cx, bottom - ar - 6, ar, th);
    mark('award', cx - ar * 1.1, awardTop, ar * 2.2, bottom + 4 - awardTop);
    // middle stack
    const name = rec.name || 'اسم الطالب', cls = rec.cls || d.cls;
    const heroW = skin.hero ? 430 : null;
    const blocks = [
      skin.hero ? gfx('archTop', 54, () => {}, {min:0.5, mark:false}) : null,
      txt(skin, th, 'title', d.title, {k:K(d, 'title'), size:56, min:30, lines:1, lh:1.3, gap:0, width:heroW}),
      skin.hero ? null : gfx('divider', 22, (c, x0, x1, top, h) => skin.divider(c, (x0 + x1) / 2, top + h / 2, 160, th), {min:0.6, gap:0.5}),
      txt(skin, th, 'intro', d.intro, {k:K(d, 'intro'), size:22, min:14, lines:2, lh:1.55, gap:0.7, width:heroW || 760}),
      txt(skin, th, 'name', name, {k:K(d, 'names'), size:52, min:24, lines:1, lh:1.32, gap:0.5, width:heroW || 680}),
      skin.hero ? null : gfx('rule', 8, (c, x0, x1, top) => skin.rule(c, (x0 + x1) / 2 - 170, (x0 + x1) / 2 + 170, top + 2, th), {gap:0.1, mark:false}),
      has(rec.rank) ? Object.assign(txt(skin, th, 'strong', rankText(rec.rank), {size:25, min:15, lines:1, lh:1.4, gap:0.5, name:'rank'}), {color:th.primary}) : null,
      has(cls) ? txt(skin, th, 'small', 'الصف: ' + cls, {size:17, min:12, lines:1, lh:1.4, gap:0.5}) : null,
      txt(skin, th, 'reason', d.reason, {k:K(d, 'reason'), size:21, min:13.5, lines:3, lh:1.65, gap:skin.hero ? 1.6 : 0.9, width:660}),
      extra && has(d.date) ? txt(skin, th, 'small', 'التاريخ: ' + d.date, {k:K(d, 'date'), size:14, min:11, lines:1, lh:1.4, gap:0.6, name:'date'}) : null
    ].filter(Boolean);
    const L = stack(ctx, blocks, {x0:box.x0 + 10, x1:box.x1 - 10, top:hb + 10, bottom:Math.min(sigTop, awardTop) - 10, rhythm:18, valign:'center'});
    if(skin.hero){
      const t = L.items.find(i => i.b.name === 'archTop'), n = L.items.find(i => i.b.name === 'name');
      if(t && n) skin.hero(ctx, cx - heroW / 2 - 18, t.top + 4, cx + heroW / 2 + 18, n.top + n.h + 14, th);
    }
    drawStack(ctx, L);
  };
}

/* ---------------- notice (1000 × 1414) ---------------- */
export function notice(skin, opt){
  opt = Object.assign({details:'table'}, opt);
  return function(ctx, d, rec, th){
    const W = 1000, H = 1414, S = env.state.school;
    const box = skin.page(ctx, W, H, th);
    const hb = header(ctx, skin, th, box, 1.3);
    skin.rule(ctx, box.x0, box.x1, hb + 8, th); mark('rule', box.x0, hb + 6, box.x1 - box.x0, 6);
    const footY = box.y1 - 6;
    footer(ctx, skin, th, box, footY);
    const sh = signatureH(d.signer, S.director, 1.35, !!env.logos.signature);
    const sigTop = footY - 36 - sh;
    const sx = box.x0 + 170;
    signature(ctx, skin, th, sx, sigTop, d.signer, S.director, {w:300, sc:1.35, sigImage:true});
    stamp(ctx, sx + 175, sigTop + sh / 2 + 6, 52, th, false);
    const note = has(d.note) ? 'ملاحظة: ' + d.note : '';
    const blocks = [
      kickerBlock(d.kicker, skin, th, K(d, 'kicker')),
      txt(skin, th, 'title', d.title, {k:K(d, 'title'), size:68, min:34, lines:2, lh:1.32, gap:0.8}),
      gfx('divider', 24, (c, x0, x1, top, h) => skin.divider(c, (x0 + x1) / 2, top + h / 2, 180, th), {min:0.6, gap:0.5}),
      txt(skin, th, 'strong', d.greeting, {k:K(d, 'greeting'), size:30, min:18, lines:2, lh:1.5, align:'right', gap:1.1, name:'greeting'}),
      txt(skin, th, 'para', d.body, {k:K(d, 'body'), size:28, min:17, lines:9, lh:1.8, align:'right', gap:0.6, name:'body'}),
      detailsBlock(detRows(d), skin, th, opt.details),
      txt(skin, th, 'small', note, {k:K(d, 'note'), size:23, min:15, lines:3, lh:1.6, align:'right', gap:1, name:'note'}),
      Object.assign(txt(skin, th, 'strong', d.closing, {k:K(d, 'closing'), size:29, min:18, lines:2, lh:1.55, gap:1.1, name:'closing'}), {color:th.primary})
    ].filter(Boolean);
    const L = stack(ctx, blocks, {x0:box.x0 + 30, x1:box.x1 - 30, top:hb + 36, bottom:sigTop - 20, rhythm:26, valign:'center', maxGap:1.8});
    drawStack(ctx, L);
  };
}

/* ---------------- poster (1000 × 1414): guidelines or honor board ---------------- */
export function poster(skin){
  return function(ctx, d, rec, th){
    const W = 1000, H = 1414;
    const box = skin.page(ctx, W, H, th);
    const hb = header(ctx, skin, th, box, 1.1);
    const honor = d.kind === 'honor';
    const footH = 104, footCy = box.y1 - footH / 2;
    const blocks = honor ? [
      txt(skin, th, 'title', d.hTitle, {k:K(d, 'hTitle'), size:98, min:44, lines:1, lh:1.25, gap:0}),
      txt(skin, th, 'small', d.hSub, {k:K(d, 'hSub'), size:30, min:18, lines:2, lh:1.45, gap:0.4, name:'sub'}),
      gfx('divider', 24, (c, x0, x1, top, h) => skin.divider(c, (x0 + x1) / 2, top + h / 2, 190, th), {min:0.6, gap:0.6})
    ] : [
      has(d.gKicker) ? txt(skin, th, 'small', d.gKicker, {k:K(d, 'gKicker'), size:30, min:18, lines:1, lh:1.3, gap:0, name:'kicker', color:skin.id === 'joy' ? JOY[2] : th.primary, w:800}) : null,
      txt(skin, th, 'title', d.gTitle, {k:K(d, 'gTitle'), size:94, min:44, lines:2, lh:1.22, gap:0.3}),
      txt(skin, th, 'small', d.gSub, {k:K(d, 'gSub'), size:31, min:18, lines:2, lh:1.45, gap:0.4, name:'sub'}),
      gfx('divider', 24, (c, x0, x1, top, h) => skin.divider(c, (x0 + x1) / 2, top + h / 2, 180, th), {min:0.6, gap:0.6})
    ];
    // the heading group takes what it needs (≤ 34% of the page); the list gets the rest
    const topBox = {x0:box.x0 + 20, x1:box.x1 - 20, top:hb + 18, bottom:hb + 18 + H * 0.3, rhythm:22, valign:'top', maxGap:1};
    const L = stack(ctx, blocks.filter(Boolean), topBox);
    drawStack(ctx, L);
    const listTop = L.bottom + 34, listBottom = box.y1 - footH - 26;
    if(honor) honorGrid(ctx, skin, th, parseNames(d.hNames), box.x0 + 10, box.x1 - 10, listTop, listBottom, K(d, 'hNames'));
    else pointsList(ctx, skin, th, splitLines(d.gPoints).map(cleanPoint).filter(Boolean), box.x0 + 10, box.x1 - 10, listTop, listBottom, K(d, 'gPoints'));
    banner(ctx, skin, th, W / 2, footCy, Math.min(820, box.x1 - box.x0), 84, honor ? d.hFooter : d.gFooter, K(d, honor ? 'hFooter' : 'gFooter'));
  };
}

/** Numbered points: one column while the font stays ≥ 26 (else 2 columns if that is larger); font ≤ 40, floor 18. */
function pointsList(ctx, skin, th, pts, x0, x1, top, bottom, k = 1){
  const body = font(skin, 'bodyB'), avail = bottom - top;
  if(!pts.length){ line(ctx, 'أضف النقاط من لوحة التحكم', (x0 + x1) / 2, top + avail / 2, x1 - x0, {size:26, fam:body.fam, color:th.muted}); return; }
  if(pts.length > 12) env.OVER = true;
  pts = pts.slice(0, 12);
  let best = null;
  for(const cols of pts.length > 5 ? [1, 2] : [1]){
    const colW = (x1 - x0 - (cols - 1) * 40) / cols, textW = colW - 92, perCol = Math.ceil(pts.length / cols);
    for(let fs = 40 * k; fs >= 18 * Math.min(1, k); fs -= 0.5){
      setF(ctx, fs, body.fam, body.w);
      const lh = fs * 1.45, gap = fs * 0.9;
      const items = pts.map(p => { const ls = wrap(ctx, p, textW); return {ls, h:Math.max(ls.length * lh, fs * 1.9)}; });
      let ok = true, tallest = 0;
      for(let c = 0; c < cols; c++){
        const col = items.slice(c * perCol, (c + 1) * perCol), h = col.reduce((a, it) => a + it.h, 0) + gap * Math.max(0, col.length - 1);
        tallest = Math.max(tallest, h); if(h > avail) ok = false;
      }
      if(ok){ if(!best || (best.fs < 26 && fs > best.fs)) best = {fs, cols, items, lh, gap, colW, textW, perCol, tallest}; break; }
    }
  }
  if(!best){ // impossible even at 18: use 2 columns at the floor and clip
    env.OVER = true;
    setF(ctx, 18, body.fam, body.w);
    const colW = (x1 - x0 - 40) / 2, textW = colW - 92;
    best = {fs:18, cols:2, lh:26, gap:16, colW, textW, perCol:Math.ceil(pts.length / 2), items:pts.map(p => { const ls = wrap(ctx, p, textW); return {ls, h:Math.max(ls.length * 26, 34)}; }), tallest:avail};
  }
  const {fs, cols, items, lh, gap, colW, perCol} = best;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, top - 10, x1 - x0 + 40, avail + 20); ctx.clip();
  for(let c = 0; c < cols; c++){
    const col = items.slice(c * perCol, (c + 1) * perCol);
    const h = col.reduce((a, it) => a + it.h, 0) + gap * Math.max(0, col.length - 1);
    let y = top + Math.max(0, avail - (cols > 1 ? best.tallest : h)) * 0.4;
    const xr = x1 - c * (colW + 40);
    col.forEach((it, j) => {
      const i = c * perCol + j, b1 = y + (it.h - it.ls.length * lh) / 2 + lh / 2 + fs * 0.34, cy = b1 - fs * 0.34;
      const r = fs * 0.82, numX = xr - r - 4;
      const color = skin.id === 'joy' ? JOY[i % 4] : th.primary;
      if(skin.id === 'modern' || env.ink){ ctx.beginPath(); ctx.arc(numX, cy, r, 0, Math.PI * 2); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
      else if(skin.id === 'luxe' || skin.id === 'heritage'){ starPath(ctx, numX, cy, r * 1.18, Math.PI / 8); ctx.fillStyle = color; ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(numX, cy, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
      T(ctx, String(i + 1), numX, cy + fs * 0.06, {size:fs * 0.82, fam:font(skin, 'label').fam, w:800, color:skin.id === 'modern' || env.ink ? color : '#FFFFFF', base:'middle'});
      mark('point', numX - r, cy - r, 2 * r, 2 * r);
      it.ls.forEach((l, k) => { line(ctx, l, xr - 2 * r - 22, b1 + k * lh, best.textW, {size:fs, min:fs, fam:body.fam, w:body.w, color:th.ink, align:'right', name:'point'}); });
      if(j < col.length - 1){ ctx.save(); ctx.setLineDash([2, 6]); ctx.strokeStyle = env.gold ? '#B08A3E' : th.accent; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(xr - colW + 20, y + it.h + gap / 2); ctx.lineTo(xr - 10, y + it.h + gap / 2); ctx.stroke(); ctx.restore(); }
      y += it.h + gap;
    });
  }
  ctx.restore();
}

/** Honor board: chooses 1–3 columns to give names the largest readable size; long names may take two lines. */
function honorGrid(ctx, skin, th, list, x0, x1, top, bottom, k = 1){
  const body = font(skin, 'bodyB'), avail = bottom - top;
  if(!list.length){ line(ctx, 'أضف أسماء المتفوّقين من لوحة التحكم', (x0 + x1) / 2, top + avail / 2, x1 - x0, {size:26, fam:body.fam, color:th.muted}); return; }
  const shown = list.slice(0, 30); if(list.length > 30) env.OVER = true;
  const n = shown.length, gapX = 26, gapY = 12;
  let best = null;
  for(const cols of [1, 2, 3]){
    if(cols > n || (cols === 1 && n > 10) || (cols === 3 && n <= 24)) continue;
    const rows = Math.ceil(n / cols), colW = (x1 - x0 - gapX * (cols - 1)) / cols;
    const rowH = Math.min(cols === 1 ? 92 : 84, (avail + gapY) / rows - gapY);
    if(rowH < 34) continue;
    // size of each name: one line up to rowH·0.42, else two lines
    let worst = 99;
    const cells = shown.map(e => {
      const clsW = has(e.cls) ? (setF(ctx, rowH * 0.3, body.fam, 700), ctx.measureText(toAr(e.cls)).width + 22) : 0;
      const tw = colW - 64 - clsW;
      let s = Math.min(rowH * 0.42, 31 * k), ls = [e.name];
      setF(ctx, s, body.fam, body.w);
      while(s > 17 && ctx.measureText(toAr(e.name)).width > tw){ s -= 0.5; setF(ctx, s, body.fam, body.w); }
      if(ctx.measureText(toAr(e.name)).width > tw){
        s = Math.min(rowH * 0.33, 26);
        for(; s > 12; s -= 0.5){ setF(ctx, s, body.fam, body.w); ls = wrap(ctx, e.name, tw); if(ls.length <= 2 && ls.every(l => ctx.measureText(toAr(l)).width <= tw)) break; }
      }
      worst = Math.min(worst, s);
      return {e, s, ls, clsW, tw};
    });
    if(!best || worst > best.worst + 0.5) best = {cols, rows, colW, rowH, cells, worst};
  }
  if(!best){ env.OVER = true; return; }
  const {cols, rows, colW, rowH, cells} = best;
  const totH = rows * (rowH + gapY) - gapY, y0 = top + Math.max(0, avail - totH) * 0.4;
  cells.forEach((c, i) => {
    const col = Math.floor(i / rows), r = i % rows, xr = x1 - col * (colW + gapX), xl = xr - colW, py = y0 + r * (rowH + gapY), cy = py + rowH / 2;
    const color = skin.id === 'joy' ? JOY[i % 4] : th.primary;
    ctx.save(); rr(ctx, xl, py, colW, rowH, Math.min(16, rowH * 0.3));
    if(!env.ink){ ctx.fillStyle = skin.id === 'heritage' ? 'rgba(255,255,255,.7)' : th.tint; ctx.fill(); }
    ctx.strokeStyle = skin.id === 'joy' ? color : (env.gold ? '#B08A3E' : th.accent); ctx.globalAlpha = 0.65; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
    mark('cell', xl, py, colW, rowH);
    starPath(ctx, xr - 26, cy, Math.min(12, rowH * 0.2)); ctx.fillStyle = skin.id === 'joy' ? color : (env.gold ? '#B08A3E' : th.accent); ctx.fill();
    const lh = c.s * 1.3;
    c.ls.forEach((l, k) => {
      const by = cy + c.s * 0.36 + (k - (c.ls.length - 1) / 2) * lh;
      line(ctx, l, xr - 46, by, c.tw, {size:c.s, min:c.s * 0.9, fam:body.fam, w:body.w, color:th.ink, align:'right', name:'cell-in'});
    });
    if(has(c.e.cls)) line(ctx, c.e.cls, xl + 16, cy + rowH * 0.11, c.clsW, {size:rowH * 0.3, min:11, fam:body.fam, w:700, color, align:'left', name:'cell-in'});
  });
}

/* ---------------- invitation (1000 × 1414) ---------------- */
export function invitation(skin, opt){
  opt = Object.assign({details:'cards'}, opt);
  return function(ctx, d, rec, th){
    const W = 1000, H = 1414, S = env.state.school;
    const box = skin.page(ctx, W, H, th);
    const cx = W / 2;
    // top: logo or emblem
    const top = box.y0 + 8;
    let y = top;
    if(!skin.hero){
      if(!image(ctx, 'center', cx, top + 60, 200, 116)){ skin.emblem(ctx, cx, top + 54, 50, th); mark('emblem', cx - 50, top + 4, 100, 100); }
      y = top + 128;
    }
    const footY = box.y1 - 6;
    footer(ctx, skin, th, box, footY);
    const sh = signatureH(d.signer, S.director, 1.35, !!env.logos.signature);
    const sigTop = footY - 40 - sh;
    signature(ctx, skin, th, cx, sigTop, d.signer, S.director, {w:340, sc:1.35, sigImage:true});
    const heroW = skin.hero ? 600 : null;
    const blocks = [
      skin.hero ? gfx('archTop', 120, () => {}, {min:0.55, mark:false}) : null,
      txt(skin, th, 'title', d.heading, {k:K(d, 'heading'), size:124, min:50, lines:1, lh:1.2, gap:0, width:heroW}),
      skin.hero ? null : gfx('divider', 26, (c, x0, x1, t, h) => skin.divider(c, (x0 + x1) / 2, t + h / 2, 180, th), {min:0.6, gap:0.3}),
      txt(skin, th, 'intro', d.lead, {k:K(d, 'lead'), size:32, min:19, lines:3, lh:1.65, gap:1, width:heroW || 780}),
      Object.assign(txt(skin, th, 'name', d.occasion, {k:K(d, 'occasion'), size:66, min:30, lines:2, lh:1.3, gap:0.6, width:heroW || 800, name:'occasion'}), {color:th.primary}),
      Object.assign(txt(skin, th, 'para', d.desc, {k:K(d, 'desc'), size:28, min:17, lines:2, lh:1.55, gap:skin.hero ? 1.6 : 0.5, width:780, name:'desc'}), {color:th.muted}),
      detailsBlock(detRows(d), skin, th, opt.details),
      Object.assign(txt(skin, th, 'strong', d.closing, {k:K(d, 'closing'), size:34, min:18, lines:2, lh:1.5, gap:1.2, name:'closing'}), {color:th.primary})
    ].filter(Boolean);
    const L = stack(ctx, blocks, {x0:box.x0 + 24, x1:box.x1 - 24, top:y + 10, bottom:sigTop - 24, rhythm:28, valign:'center', maxGap:1.9});
    if(skin.hero){
      const t = L.items.find(i => i.b.name === 'archTop'), o = L.items.find(i => i.b.name === 'occasion') || L.items.find(i => i.b.name === 'intro');
      if(t && o) skin.hero(ctx, cx - heroW / 2 - 24, t.top + 6, cx + heroW / 2 + 24, o.top + o.h + 22, th);
      if(t && !image(ctx, 'center', cx, t.top + t.h * 0.62, 120, t.h * 0.5)){ /* the arch keystone carries the ornament */ }
    }
    drawStack(ctx, L);
  };
}
export { safe };
