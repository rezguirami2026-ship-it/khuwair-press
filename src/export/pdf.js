/* PDF export: one A4 page per record, each a JPEG (q 0.9) at 2800 px (landscape) / 2000 px (portrait) wide. */
import { jsPDF } from 'jspdf';
import { TYPES } from '../schema/types.js';
import { records } from '../schema/parse.js';
import { renderTo } from '../render/draw.js';

const tick = () => new Promise(r => setTimeout(r, 0));

/** onProgress(i, n) is called before each page. Resolves to a PDF Blob. */
export async function buildPdf(st, logos, onProgress){
  const land = TYPES[st.type].orient === 'landscape';
  const recs = st.type === 'cert' ? records(st) : [null];
  const pdf = new jsPDF({orientation:land ? 'landscape' : 'portrait', unit:'mm', format:'a4', compress:true});
  const px = land ? 2800 : 2000;
  for(let i = 0; i < recs.length; i++){
    if(onProgress) onProgress(i, recs.length);
    await tick();
    const c = renderTo(st, logos, px, i);
    if(i) pdf.addPage();
    pdf.addImage(c.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, land ? 297 : 210, land ? 210 : 297, undefined, 'FAST');
  }
  return pdf.output('blob');
}
