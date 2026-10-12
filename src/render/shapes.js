/* Shape primitives. */

/** Rounded rectangle path. */
export function rr(ctx, x, y, w, h, r){
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
/** 8-point khatam star (two overlapping squares): inner radius 0.7654·r. */
export function starPath(ctx, cx, cy, r, rot){
  rot = rot || 0; const ri = r * 0.7654;
  ctx.beginPath();
  for(let i = 0; i < 16; i++){
    const a = rot - Math.PI / 2 + i * Math.PI / 8, rr2 = (i % 2) ? ri : r;
    const px = cx + Math.cos(a) * rr2, py = cy + Math.sin(a) * rr2;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}
/** Horizontal hairline. */
export function hair(ctx, x1, x2, y, color, lw, alpha){
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw || 1; ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.restore();
}
export function paper(ctx, W, H){ ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); }
