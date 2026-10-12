/* PDF export: one page per record at the chosen paper size, each a JPEG at the chosen resolution
 * (300 dpi for print, 150 dpi for a lighter file). Pages are drawn in the export worker. */
import { jsPDF } from 'jspdf';
import { TYPES } from '../schema/types.js';
import { records } from '../schema/parse.js';
import { renderPages } from './renderer.js';
import { QUALITIES, pageMM, pagePx, paperOf } from './paper.js';

/** opts: {quality:'print'|'light', onProgress(done, total), signal}. Resolves to a Blob, or null if cancelled. */
export async function buildPdf(st, logos, opts = {}){
  const q = QUALITIES[opts.quality] || QUALITIES.print, land = TYPES[st.type].orient === 'landscape';
  const n = st.type === 'cert' ? records(st).length : 1, [wmm, hmm] = pageMM(st);
  const pdf = new jsPDF({orientation:land ? 'landscape' : 'portrait', unit:'mm', format:paperOf(st).toLowerCase(), compress:true});
  let done = 0;
  if(opts.onProgress) opts.onProgress(0, n);
  const pages = new Array(n);
  const engine = await renderPages(st, logos, [...Array(n).keys()], {px:pagePx(st, opts.quality), mime:'image/jpeg', quality:q.jpeg, signal:opts.signal,
    onPage(i, bytes){
      pages[i] = bytes;
      // add pages strictly in order as they arrive
      while(done < n && pages[done]){
        if(done) pdf.addPage();
        pdf.addImage(pages[done], 'JPEG', 0, 0, wmm, hmm, undefined, 'NONE');
        pages[done] = true; done++;
        if(opts.onProgress) opts.onProgress(done, n);
      }
    }});
  if(opts.signal && opts.signal.cancelled) return null;
  if(done !== n) throw new Error('missing pages');
  const blob = pdf.output('blob');
  blob.engine = engine;
  return blob;
}
