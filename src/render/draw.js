/* Entry points for rendering a page: draw onto any 2D context, or render offscreen for export. */
import { env } from './env.js';
import { TYPES } from '../schema/types.js';
import { THEMES, PAGE } from '../schema/themes.js';
import { records } from '../schema/parse.js';
import { DRAW } from '../templates/index.js';

export const pageSize = st => PAGE[TYPES[st.type].orient];

/** Draws record recIdx of the current document of st, scaled to px wide. Returns {over}. */
export function draw(ctx, st, logos, px, recIdx){
  const W = pageSize(st)[0];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(px / W, 0, 0, px / W, 0, 0);
  env.state = st; env.logos = logos; env.DIG = st.digits; env.OVER = false;
  const d = st.docs[st.type], th = THEMES[st.theme] || THEMES.maroon;
  const fn = DRAW[st.type][d.layout] || Object.values(DRAW[st.type])[0];
  const recs = records(st);
  fn(ctx, d, recs[Math.min(recIdx || 0, recs.length - 1)], th);
  return {over:env.OVER};
}

/** Renders one page into a new canvas px wide. */
export function renderTo(st, logos, px, recIdx){
  const [W, H] = pageSize(st);
  const c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * H / W);
  draw(c.getContext('2d'), st, logos, px, recIdx); return c;
}
