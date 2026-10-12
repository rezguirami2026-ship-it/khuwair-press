/* Ornaments built from the khatam star. Phase 2 grows this into the full ornament engine. */
import { starPath } from '../render/shapes.js';

/** Low-opacity field of outlined stars on a half-drop grid, clipped to the box. */
export function starField(ctx, x, y, w, h, step, r, color, alpha){
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = Math.max(0.8, r * 0.11);
  const rows = Math.ceil(h / step) + 2, cols = Math.ceil(w / step) + 2;
  for(let i = -1; i < rows; i++){
    const off = (i & 1) ? step / 2 : 0;
    for(let j = -1; j < cols; j++){ starPath(ctx, x + j * step + off, y + i * step, r); ctx.stroke(); }
  }
  ctx.restore();
}
/** Line — star — line, with dot terminals. */
export function divider(ctx, cx, y, half, th){
  ctx.save(); ctx.strokeStyle = th.accent; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(cx - half, y); ctx.lineTo(cx - 16, y); ctx.moveTo(cx + 16, y); ctx.lineTo(cx + half, y); ctx.stroke();
  ctx.fillStyle = th.accent; starPath(ctx, cx, y, 9); ctx.fill();
  [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(cx + s * (half + 7), y, 2.6, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
}
/** Layered star placed on frame corners. */
export function cornerStar(ctx, x, y, r, th){
  ctx.save();
  ctx.fillStyle = '#FFFFFF'; starPath(ctx, x, y, r + 3); ctx.fill();
  ctx.fillStyle = th.accent; starPath(ctx, x, y, r); ctx.fill();
  ctx.fillStyle = th.primary; starPath(ctx, x, y, r * 0.46, Math.PI / 8); ctx.fill();
  ctx.restore();
}
/** Star medallion used where no logo was uploaded. */
export function emblem(ctx, cx, cy, r, th, dark){
  ctx.save();
  ctx.fillStyle = dark ? th.onDark : th.accent; starPath(ctx, cx, cy, r); ctx.fill();
  ctx.fillStyle = dark ? th.primary : '#FFFFFF'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.56, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = dark ? th.onDark : th.primary; starPath(ctx, cx, cy, r * 0.42, Math.PI / 8); ctx.fill();
  ctx.restore();
}
