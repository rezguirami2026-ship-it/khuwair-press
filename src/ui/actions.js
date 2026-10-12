/* Download buttons. Exports wait for the bundled fonts and refuse to run on fallback fonts. */
import { state } from '../state/store.js';
import { records } from '../schema/parse.js';
import { arNum } from '../render/text.js';
import { fontsReady, fontsLoaded } from '../fonts/index.js';
import { buildPdf } from '../export/pdf.js';
import { buildPng } from '../export/png.js';
import { offerFile, baseName, safePart } from '../export/files.js';
import { logoImg } from './logos.js';
import { busy, isBusy } from './preview.js';
import { $, say } from './dom.js';

async function fontsOk(){
  await fontsReady();
  if(fontsLoaded()) return true;
  say('لم تكتمل الخطوط بعد، أعد المحاولة بعد لحظات.');
  return false;
}

export function bindActions(){
  $('#pdfBtn').addEventListener('click', async () => {
    if(isBusy()) return;
    busy(true);
    try{
      if(!await fontsOk()) return;
      const blob = await buildPdf(state, logoImg, (i, n) => say(n > 1 ? 'جارٍ التجهيز… ' + arNum(i + 1) + ' من ' + arNum(n) : 'جارٍ التجهيز…'));
      say('');
      say(await offerFile(blob, baseName(state) + '.pdf'));
    }catch(e){ console.warn(e); say('تعذّر إنشاء ملف PDF.'); }
    finally{ busy(false); }
  });
  $('#pngBtn').addEventListener('click', async () => {
    if(isBusy()) return;
    busy(true); say('جارٍ التجهيز…');
    try{
      if(!await fontsOk()) return;
      const blob = await buildPng(state, logoImg, state.idx);
      let name = baseName(state);
      if(state.type === 'cert'){ const r = records(state)[state.idx]; if(r && r.name) name += ' - ' + safePart(r.name); }
      say('');
      say(blob ? await offerFile(blob, name.slice(0, 120) + '.png') : 'تعذّر إنشاء الصورة.');
    }catch(e){ console.warn(e); say('تعذّر إنشاء الصورة.'); }
    finally{ busy(false); }
  });
}
