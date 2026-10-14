/* Logo upload slots. Logos come only from user uploads (no bundled emblems); stored as PNG data URLs ≤ 600 px. */
import { state } from '../state/store.js';
import { $$, say } from './dom.js';

/** Decoded images used by the renderer. */
export const logoImg = {center:null, side:null, school:null, signature:null, stamp:null};
let onLogo = () => {};

/** Decodes a stored logo and redraws once it can be drawn. */
export function setLogoImg(key, url){
  logoImg[key] = null;
  if(!url) return;
  const im = new Image();
  im.onload = () => { logoImg[key] = im; onLogo(); };
  im.src = url;
}
export function refreshLogos(){
  $$('.logo-slot').forEach(sl => {
    const k = sl.dataset.key, th = sl.querySelector('.thumb');
    th.textContent = '';
    if(state.logos[k]){ const im = new Image(); im.alt = ''; im.src = state.logos[k]; th.append(im); }
    else th.textContent = 'لا يوجد';
    sl.querySelector('.rm').hidden = !state.logos[k];
  });
}
/** Makes the white background that touches the image edge transparent (flood fill, so white inside the logo stays),
 *  feathers its rim, and crops the empty margins. Returns a canvas. */
export function cleanLogo(img, max){
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, k0 = Math.min(1, 2000 / Math.max(iw, ih));
  const w = Math.max(1, Math.round(iw * k0)), h = Math.max(1, Math.round(ih * k0));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d', {willReadFrequently:true}); g.drawImage(img, 0, 0, w, h);
  const id = g.getImageData(0, 0, w, h), p = id.data, bg = new Uint8Array(w * h);
  const white = i => p[i * 4 + 3] < 16 || (Math.min(p[i * 4], p[i * 4 + 1], p[i * 4 + 2]) >= 240 && Math.max(p[i * 4], p[i * 4 + 1], p[i * 4 + 2]) - Math.min(p[i * 4], p[i * 4 + 1], p[i * 4 + 2]) < 24);
  const stack = [];
  for(let x = 0; x < w; x++){ stack.push(x, (h - 1) * w + x); }
  for(let y = 0; y < h; y++){ stack.push(y * w, y * w + w - 1); }
  while(stack.length){
    const i = stack.pop();
    if(bg[i] || !white(i)) continue;
    bg[i] = 1;
    const x = i % w;
    if(x > 0) stack.push(i - 1);
    if(x < w - 1) stack.push(i + 1);
    if(i >= w) stack.push(i - w);
    if(i < w * (h - 1)) stack.push(i + w);
  }
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
    const i = y * w + x;
    if(bg[i]){ p[i * 4 + 3] = 0; continue; }
    // soften the light halo left by JPEG compression next to the removed background
    const edge = (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (y > 0 && bg[i - w]) || (y < h - 1 && bg[i + w]);
    const m = Math.min(p[i * 4], p[i * 4 + 1], p[i * 4 + 2]);
    if(edge && m > 200) p[i * 4 + 3] = Math.round(p[i * 4 + 3] * Math.min(1, (255 - m) / 55));
    if(p[i * 4 + 3] > 16){ if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; }
  }
  g.putImageData(id, 0, 0);
  if(x1 < 0){ x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }
  const pad = 2, cw = x1 - x0 + 1 + pad * 2, ch = y1 - y0 + 1 + pad * 2, k = Math.min(1, max / Math.max(cw, ch));
  const out = document.createElement('canvas'); out.width = Math.max(1, Math.round(cw * k)); out.height = Math.max(1, Math.round(ch * k));
  const og = out.getContext('2d'); og.imageSmoothingQuality = 'high';
  og.drawImage(c, x0 - pad, y0 - pad, cw, ch, 0, 0, out.width, out.height);
  return out;
}
function readLogo(file, key, changed){
  if(!file) return;
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      // header logos are kept large enough for sharp 300 dpi printing
      const c = cleanLogo(img, key === 'signature' || key === 'stamp' ? 700 : 1000);
      state.logos[key] = c.toDataURL('image/png');
      setLogoImg(key, state.logos[key]); refreshLogos(); changed(); say('أُضيف الشعار.');
    };
    img.onerror = () => say('تعذّرت قراءة الصورة. جرّب ملف PNG أو JPG.');
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}
/** Wires the upload/remove buttons; changed() is called after every edit, redraw() when an image finishes decoding. */
export function bindLogos(changed, redraw){
  onLogo = redraw;
  $$('.logo-slot').forEach(sl => {
    const k = sl.dataset.key;
    const inp = sl.querySelector('input[type=file]');
    inp.addEventListener('change', () => { readLogo(inp.files[0], k, changed); inp.value = ''; });
    sl.querySelector('.rm').addEventListener('click', () => { state.logos[k] = null; setLogoImg(k, null); refreshLogos(); changed(); });
  });
}
