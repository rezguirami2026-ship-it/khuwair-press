/* Logo upload slots. Logos come only from user uploads (no bundled emblems); stored as PNG data URLs ≤ 600 px. */
import { state } from '../state/store.js';
import { $$, say } from './dom.js';

/** Decoded images used by the renderer. */
export const logoImg = {center:null, side:null, signature:null, stamp:null};
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
function readLogo(file, key, changed){
  if(!file) return;
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 600, iw = img.naturalWidth || 600, ih = img.naturalHeight || 600, k = Math.min(1, max / Math.max(iw, ih));
      const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(iw * k)); c.height = Math.max(1, Math.round(ih * k));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
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
