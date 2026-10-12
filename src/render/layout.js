/* Layout engine: measure first, then distribute.
 * A stack is a list of blocks laid out top-to-bottom inside a box. All text is measured at a common scale;
 * the scale drops until everything fits (each block stops at its own minimum size), spacing follows one rhythm
 * unit, and leftover space is shared between the gaps and the margins. Only when the content cannot fit even
 * at the absolute floor is the overflow flag raised — and then the stack is clipped to its box so it can
 * never overlap anything else.
 *
 * Blocks:
 *   {t:'text', text, fam, w, size, min, lines?, lh?, color, align?('center'|'right'|'left'), width?, gap?, name?, rigid?}
 *     rigid: headlines shrink more slowly than body text (scale^0.45), so long body copy gives way first.
 *   {t:'gfx', h, min?, gap?, name?, draw(ctx, x0, x1, top, h)}   — fixed-height graphic (shrinks to h·min)
 * `gap` is the space before the block in rhythm units (default 1). */
import { env } from './env.js';
import { setF, wrap, T, toAr } from './text.js';

const STEP = 0.025, FLOOR = 0.82; // scale step; absolute floor = min × FLOOR

/** Record a drawn box (for the no-overlap tests). */
export function mark(name, x, y, w, h){ if(env.boxes) env.boxes.push({name, x, y, w, h}); }

function measureText(ctx, b, size, x0, x1){
  setF(ctx, size, b.fam, b.w);
  const maxW = b.width ? Math.min(b.width, x1 - x0) : x1 - x0;
  let ls = wrap(ctx, b.text, maxW);
  // balanced lines for centred text: narrow the measure while the line count stays the same
  if(ls.length > 1 && (b.align || 'center') === 'center' && !String(b.text).includes('\n')){
    let lo = maxW * 0.5, hi = maxW, best = ls;
    for(let k = 0; k < 10; k++){ const mid = (lo + hi) / 2, t = wrap(ctx, b.text, mid); if(t.length <= ls.length){ hi = mid; best = t; } else lo = mid; }
    ls = best;
  }
  const lh = (b.lh || 1.5) * size;
  return {size, ls, lh, h:ls.length * lh, maxW};
}

/** Measures blocks at scale s. strictLines: respect each block's preferred max line count. */
function measureAt(ctx, blocks, s, box, strictLines, floor){
  let total = 0, ok = true;
  const items = blocks.map((b, i) => {
    const gap = i === 0 ? 0 : (b.gap == null ? 1 : b.gap) * box.rhythm * Math.max(0.45, s);
    let m;
    if(b.t === 'text'){
      const lo = (b.min || b.size) * (floor ? FLOOR : 1);
      m = measureText(ctx, b, Math.max(lo, b.size * (b.rigid ? Math.pow(s, 0.45) : s)), box.x0, box.x1);
      if(strictLines && b.lines && m.ls.length > b.lines) ok = false;
    } else {
      const h = b.h * Math.max(b.min == null ? 1 : b.min, Math.min(1, s));
      m = {h};
    }
    total += gap + m.h;
    return Object.assign({b, gap}, m);
  });
  return {items, total, ok};
}

/** Lays out the stack in box {x0, x1, top, bottom, rhythm, valign:'center'|'top'|'spread', maxGap}. */
export function stack(ctx, blocks, box){
  box = Object.assign({rhythm:20, valign:'center', maxGap:2.2}, box);
  blocks = blocks.filter(b => b && (b.t !== 'text' || String(b.text || '').trim()));
  const avail = box.bottom - box.top;
  let res = null, over = false;
  // pass 1: preferred line counts; pass 2: any line count; pass 3: below the minimum down to the floor
  outer:
  for(const [strict, floor] of [[true, false], [false, false], [false, true]]){
    for(let s = 1; s >= 0.3 - 1e-9; s -= STEP){
      const m = measureAt(ctx, blocks, s, box, strict, floor);
      if(m.ok && m.total <= avail){ res = m; break outer; }
      res = m;
    }
  }
  if(res.total > avail) over = true;
  // distribute free space: grow gaps up to maxGap × their size, then position per valign
  let free = Math.max(0, avail - res.total);
  const gapSum = res.items.reduce((a, it) => a + it.gap, 0);
  if(gapSum > 0 && box.valign !== 'top'){
    const grow = Math.min(free, gapSum * (box.maxGap - 1)) * (box.valign === 'spread' ? 1 : 0.6);
    res.items.forEach(it => { it.gap += grow * it.gap / gapSum; });
    free -= grow;
  }
  let y = box.top + (box.valign === 'top' ? 0 : free / 2);
  for(const it of res.items){ y += it.gap; it.top = y; y += it.h; }
  return {items:res.items, over, box, bottom:y};
}

/** Draws a laid-out stack. Returns per-block geometry keyed by block name. */
export function drawStack(ctx, L){
  const {box} = L, out = {};
  if(L.over){ env.OVER = true; ctx.save(); ctx.beginPath(); ctx.rect(box.x0 - 40, box.top, box.x1 - box.x0 + 80, box.bottom - box.top); ctx.clip(); }
  for(const it of L.items){
    const b = it.b;
    if(b.t === 'text'){
      const align = b.align || 'center';
      const cx = align === 'center' ? (box.x0 + box.x1) / 2 : align === 'right' ? box.x1 : box.x0;
      let wMax = 0;
      it.ls.forEach((l, i) => {
        const base = it.top + it.lh * i + it.lh / 2 + it.size * 0.34;
        T(ctx, l, cx, base, {size:it.size, fam:b.fam, w:b.w, color:b.color, align});
        setF(ctx, it.size, b.fam, b.w);
        const lw = ctx.measureText(toAr(l)).width; wMax = Math.max(wMax, lw);
        const lx = align === 'center' ? cx - lw / 2 : align === 'right' ? cx - lw : cx;
        mark(b.name || 'text', lx, it.top + it.lh * i, lw, it.lh);
      });
      if(b.name) out[b.name] = {top:it.top, h:it.h, size:it.size, w:wMax, lines:it.ls.length, cx};
    } else {
      b.draw(ctx, box.x0, box.x1, it.top, it.h);
      if(b.name){ out[b.name] = {top:it.top, h:it.h}; if(b.mark !== false) mark(b.name, box.x0, it.top, box.x1 - box.x0, it.h); }
    }
  }
  if(L.over) ctx.restore();
  return out;
}

/** Single line fitted to width: returns the size (≥ min, else flags overflow and clips nothing — caller keeps it short). */
export function fitOne(ctx, s, maxW, size, min, fam, w){
  let sz = size; setF(ctx, sz, fam, w);
  while(sz > min && ctx.measureText(toAr(s)).width > maxW){ sz -= 0.5; setF(ctx, sz, fam, w); }
  return sz;
}
/** Draws a line fitted to maxW and records its box. */
export function line(ctx, s, x, y, maxW, o){
  if(!s || !String(s).trim()) return 0;
  const sz = fitOne(ctx, s, maxW, o.size, o.min || o.size * 0.6, o.fam, o.w);
  setF(ctx, sz, o.fam, o.w);
  let lw = ctx.measureText(toAr(s)).width;
  if(lw > maxW + 0.5){ // cannot fit even at min: squeeze horizontally rather than overflow
    ctx.save(); const k = maxW / lw;
    const ox = o.align === 'right' ? x : o.align === 'left' ? x : x;
    ctx.translate(ox, 0); ctx.scale(k, 1); ctx.translate(-ox, 0);
    T(ctx, s, x, y, Object.assign({}, o, {size:sz})); ctx.restore(); lw = maxW; env.OVER = true;
  } else T(ctx, s, x, y, Object.assign({}, o, {size:sz}));
  const a = o.align || 'center', lx = a === 'center' ? x - lw / 2 : a === 'right' ? x - lw : x;
  mark(o.name || 'line', lx, y - sz * 0.9, lw, sz * 1.24);
  return sz;
}
