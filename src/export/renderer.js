/* Page renderer for exports. Prefers a Web Worker with OffscreenCanvas (the UI never freezes, even for 60+
 * certificates); falls back to drawing on the page, yielding between pages, where workers cannot draw text. */
import RenderWorker from './render.worker.js?worker&inline';
import { renderTo } from '../render/draw.js';

let worker = null, ready = null, seq = 0;

/** All @font-face rules of the page as FontFace constructor arguments (the worker has no stylesheets). */
function fontFaces(){
  const out = [];
  for(const sheet of document.styleSheets){
    let rules; try{ rules = sheet.cssRules; }catch(e){ continue; }
    for(const r of rules){
      if(!(r instanceof CSSFontFaceRule)) continue;
      const s = r.style, fam = s.getPropertyValue('font-family').replace(/["']/g, '').trim();
      const src = s.getPropertyValue('src');
      if(!fam || !src) continue;
      // relative URLs must become absolute for the worker
      const abs = src.replace(/url\((['"]?)(?!data:)([^'")]+)\1\)/g, (m, q, u) => `url("${new URL(u, sheet.href || location.href).href}")`);
      out.push({family:fam, src:abs, descriptors:{weight:s.getPropertyValue('font-weight') || '400', style:s.getPropertyValue('font-style') || 'normal',
        unicodeRange:s.getPropertyValue('unicode-range') || 'U+0-10FFFF', display:'block'}});
    }
  }
  return out;
}

/** Starts the worker once and loads every font into it. Resolves to the worker, or null (→ fallback). */
function getWorker(){
  if(ready) return ready;
  ready = new Promise(resolve => {
    if(typeof OffscreenCanvas === 'undefined' || typeof Worker === 'undefined' || /[?&]noworker\b/.test(location.search)) return resolve(null);
    try{
      const w = new RenderWorker();
      const t = setTimeout(() => { w.terminate(); resolve(null); }, 20000);
      w.onmessage = ({data}) => { if(data.type === 'fontsReady'){ clearTimeout(t); resolve(data.ok ? (worker = w) : (w.terminate(), null)); } };
      w.onerror = () => { clearTimeout(t); resolve(null); };
      // OffscreenCanvas must support 2D text in this browser
      const probe = new OffscreenCanvas(4, 4).getContext('2d');
      if(!probe || typeof probe.fillText !== 'function'){ clearTimeout(t); w.terminate(); return resolve(null); }
      w.postMessage({type:'fonts', faces:fontFaces()});
    }catch(e){ resolve(null); }
  });
  return ready;
}
/** Warm the worker up in the background (fonts take a moment to load). */
export const warmUp = () => getWorker();

const plain = st => JSON.parse(JSON.stringify(Object.assign({}, st, {logos:{}})));
async function bitmaps(logos){
  const out = {};
  for(const [k, img] of Object.entries(logos)) if(img && (img.naturalWidth || img.width)) out[k] = await createImageBitmap(img);
  return out;
}

/** Renders pages `indices` to encoded images. onPage(i, Uint8Array) is called in order; returns 'worker' | 'main'.
 *  signal.cancelled = true stops early. */
export async function renderPages(st, logos, indices, {px, mime = 'image/jpeg', quality = 0.92, onPage, signal = {}}){
  const w = await getWorker();
  if(w){
    const id = ++seq, imgs = await bitmaps(logos);
    await new Promise((resolve, reject) => {
      const onMsg = ({data}) => {
        if(data.id !== id) return;
        if(data.type === 'page'){ onPage(data.i, data.bytes); if(signal.cancelled) w.postMessage({type:'cancel', id}); }
        else if(data.type === 'done'){ w.removeEventListener('message', onMsg); resolve(); }
        else if(data.type === 'error'){ w.removeEventListener('message', onMsg); reject(new Error(data.message)); }
      };
      w.addEventListener('message', onMsg);
      w.postMessage({type:'job', id, state:plain(st), logos:imgs, px, indices, mime, quality}, Object.values(imgs));
    });
    return 'worker';
  }
  for(const i of indices){
    if(signal.cancelled) break;
    await new Promise(r => setTimeout(r, 0));
    const c = renderTo(st, logos, px, i);
    const blob = await new Promise(r => c.toBlob(r, mime, quality));
    onPage(i, new Uint8Array(await blob.arrayBuffer()));
  }
  return 'main';
}
