/* Paper sizes and export resolution. All A-series sizes share the √2 ratio, so a design is laid out once
 * (1000 units wide) and only its physical size changes: A5 for invitations, A3 for posters. */
import { TYPES } from '../schema/types.js';

/** Portrait width × height in millimetres. */
export const PAPERS = {A4:[210, 297], A5:[148, 210], A3:[297, 420]};
/** Paper choices per content type (first = default). */
export const PAPER_CHOICES = {cert:['A4'], notice:['A4', 'A5'], poster:['A4', 'A3'], invite:['A4', 'A5']};
/** Export qualities: dpi, JPEG quality inside PDFs. */
export const QUALITIES = {print:{dpi:300, jpeg:0.92, label:'للطباعة ٣٠٠ نقطة/بوصة'}, light:{dpi:150, jpeg:0.82, label:'ملف أخف'}};

export const paperOf = st => { const p = st.docs[st.type].paper; return PAPER_CHOICES[st.type].includes(p) ? p : PAPER_CHOICES[st.type][0]; };
/** Page size in mm for the state's type, orientation and paper: [w, h]. */
export function pageMM(st){
  const [a, b] = PAPERS[paperOf(st)];
  return TYPES[st.type].orient === 'landscape' ? [b, a] : [a, b];
}
/** Pixel width of an exported page at the given quality. */
export const pagePx = (st, quality) => Math.round(pageMM(st)[0] / 25.4 * (QUALITIES[quality] || QUALITIES.print).dpi);
