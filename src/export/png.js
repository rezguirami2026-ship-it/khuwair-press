/* PNG export of one page: 3000 px wide (landscape) / 2400 px (portrait). */
import { TYPES } from '../schema/types.js';
import { renderTo } from '../render/draw.js';

export function buildPng(st, logos, recIdx){
  const land = TYPES[st.type].orient === 'landscape';
  const c = renderTo(st, logos, land ? 3000 : 2400, recIdx);
  return new Promise(r => c.toBlob(r, 'image/png'));
}
