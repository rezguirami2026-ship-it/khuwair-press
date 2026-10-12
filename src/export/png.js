/* PNG export: the current page, or every certificate as PNG files inside one ZIP. */
import { Zip, ZipPassThrough } from 'fflate';
import { records } from '../schema/parse.js';
import { renderPages } from './renderer.js';
import { pagePx } from './paper.js';

/** One page as a PNG Blob. */
export async function buildPng(st, logos, recIdx, quality = 'print'){
  let out = null;
  await renderPages(st, logos, [recIdx || 0], {px:pagePx(st, quality), mime:'image/png', onPage(i, bytes){ out = bytes; }});
  return out && new Blob([out], {type:'image/png'});
}

const safe = s => String(s || '').replace(/[\\/:*?"<>|\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);

/** Every record as «NN - name.png» inside a ZIP (stored: PNGs are already compressed). Resolves to a Blob or null. */
export async function buildZip(st, logos, opts = {}){
  const recs = st.type === 'cert' ? records(st) : [{name:''}], n = recs.length, pad = String(n).length;
  const chunks = [];
  const zip = new Zip((err, chunk) => { if(err) throw err; chunks.push(chunk); });
  let done = 0;
  if(opts.onProgress) opts.onProgress(0, n);
  await renderPages(st, logos, [...Array(n).keys()], {px:pagePx(st, opts.quality), mime:'image/png', signal:opts.signal,
    onPage(i, bytes){
      const name = String(i + 1).padStart(pad, '0') + (safe(recs[i].name) ? ' - ' + safe(recs[i].name) : '') + '.png';
      const f = new ZipPassThrough(name); zip.add(f); f.push(bytes, true);
      done++; if(opts.onProgress) opts.onProgress(done, n);
    }});
  if(opts.signal && opts.signal.cancelled) return null;
  zip.end();
  return new Blob(chunks, {type:'application/zip'});
}
