/* Download buttons, quality and paper choices, progress and cancel.
 * Exports wait for the bundled fonts and refuse to run on fallback fonts; pages are drawn in the export worker. */
import { state } from '../state/store.js';
import { records } from '../schema/parse.js';
import { arNum, plural } from '../render/text.js';
import { fontsReady, fontsLoaded } from '../fonts/index.js';
import { buildPdf } from '../export/pdf.js';
import { buildPng, buildZip } from '../export/png.js';
import { warmUp } from '../export/renderer.js';
import { PAPER_CHOICES, paperOf } from '../export/paper.js';
import { offerFile, baseName, safePart } from '../export/files.js';
import { logoImg } from './logos.js';
import { busy, isBusy, changed } from './preview.js';
import { $, say } from './dom.js';

async function fontsOk(){
  await fontsReady();
  if(fontsLoaded()) return true;
  say('لم تكتمل الخطوط بعد، أعد المحاولة بعد لحظات.');
  return false;
}
const quality = () => state.quality === 'light' ? 'light' : 'print';
const PAPER_LABEL = {A4:'A4', A5:'A5 (نصف A4)', A3:'A3 (ضعف A4)'};

/** Shows the paper choices of the current type and the ZIP button for certificate batches. */
export function updateExportControls(){
  const choices = PAPER_CHOICES[state.type], sel = $('#paper');
  $('#paperWrap').hidden = choices.length < 2;
  sel.textContent = '';
  for(const p of choices){ const o = document.createElement('option'); o.value = p; o.textContent = PAPER_LABEL[p]; sel.append(o); }
  sel.value = paperOf(state);
  $('#quality').value = quality();
  $('#zipBtn').hidden = !(state.type === 'cert' && records(state).length > 1);
}

/** Runs an export with the progress bar and the cancel button. */
async function run(job){
  if(isBusy()) return;
  busy(true);
  const signal = {cancelled:false}, bar = $('#progress');
  $('#cancelBtn').onclick = () => { signal.cancelled = true; say('جارٍ الإلغاء…'); };
  const progress = (done, total) => {
    bar.hidden = total < 2 && done === 0 ? bar.hidden : false;
    $('#prog').max = total; $('#prog').value = done;
    $('#progTxt').textContent = total > 1 ? arNum(done) + ' من ' + arNum(total) : '';
  };
  try{
    if(!await fontsOk()) return;
    say('جارٍ التجهيز…'); bar.hidden = false; progress(0, 1);
    const out = await job(signal, progress);
    if(!out){ say(signal.cancelled ? 'أُلغي التصدير.' : 'تعذّر إنشاء الملف.'); return; }
    say(''); say(await offerFile(out.blob, out.name));
  }catch(e){ console.warn(e); say('تعذّر إنشاء الملف.'); }
  finally{ bar.hidden = true; busy(false); }
}

export function bindActions(){
  $('#quality').addEventListener('change', e => { state.quality = e.target.value; changed(); });
  $('#paper').addEventListener('change', e => { state.docs[state.type].paper = e.target.value; changed(); });
  $('#pdfBtn').addEventListener('click', () => run(async (signal, onProgress) => {
    const blob = await buildPdf(state, logoImg, {quality:quality(), onProgress, signal});
    return blob && {blob, name:baseName(state) + '.pdf'};
  }));
  $('#pngBtn').addEventListener('click', () => run(async () => {
    const blob = await buildPng(state, logoImg, state.idx, quality());
    let name = baseName(state);
    if(state.type === 'cert'){ const r = records(state)[state.idx]; if(r && r.name) name += ' - ' + safePart(r.name); }
    return blob && {blob, name:name.slice(0, 120) + '.png'};
  }));
  $('#zipBtn').addEventListener('click', () => run(async (signal, onProgress) => {
    const blob = await buildZip(state, logoImg, {quality:quality(), onProgress, signal});
    const n = records(state).length;
    return blob && {blob, name:baseName(state) + ' - ' + arNum(n) + ' ' + plural(n, 'صورة', 'صورتان', 'صور', 'صورة') + '.zip'};
  }));
  // start the export worker early so fonts are ready by the time the user clicks
  const idle = window.requestIdleCallback || (f => setTimeout(f, 1500));
  idle(() => fontsReady().then(warmUp));
}
