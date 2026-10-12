/* Bundled fonts (no network at runtime). Every face we draw with must be loaded before drawing or exporting. */
import './fonts.css';

const SAMPLE = 'شهادة تقدير ١٢٣ 123';
export const FONT_SPECS = ['400 30px "Amiri"', '700 30px "Amiri"', '400 30px "Aref Ruqaa"', '700 30px "Aref Ruqaa"',
  '500 30px "Reem Kufi"', '600 30px "Reem Kufi"', '700 30px "Reem Kufi"',
  '400 30px "Tajawal"', '500 30px "Tajawal"', '700 30px "Tajawal"', '800 30px "Tajawal"'];

let ready = null;
/** Resolves once every face in FONT_SPECS is loaded (Arabic and Latin subsets). */
export function fontsReady(){
  if(!ready){
    ready = (document.fonts && document.fonts.load)
      ? Promise.all(FONT_SPECS.map(f => document.fonts.load(f, SAMPLE).catch(() => null))).then(() => document.fonts.ready)
      : Promise.resolve();
  }
  return ready;
}
/** True when every spec is usable now (guards export against fallback fonts). */
export const fontsLoaded = () => !document.fonts || FONT_SPECS.every(f => document.fonts.check(f, SAMPLE));
