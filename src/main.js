import './styles.css';
import { fontsReady } from './fonts/index.js';
import { state, load } from './state/store.js';
import { migrate } from './state/migrate.js';
import { records } from './schema/parse.js';
import { draw, renderTo, pageSize } from './render/draw.js';
import { env } from './render/env.js';
import { buildPdf } from './export/pdf.js';
import { buildPng, buildZip } from './export/png.js';
import { logoImg, setLogoImg, refreshLogos, bindLogos } from './ui/logos.js';
import { schedule, changed, restored, renderPreview, bindPreview } from './ui/preview.js';
import { initHistory, undo, redo, canUndo, canRedo } from './ui/history.js';
import { $ } from './ui/dom.js';
import { exportSettings, importSettings, isFirstRun, showWelcome } from './ui/school.js';
import { buildPanel, bindPanel, fillSchool, thumbs } from './ui/panel.js';
import { onEdit } from './ui/preview.js';
import { bindActions } from './ui/actions.js';
import { bindPolish, registerSW } from './ui/polish.js';

const firstRun = isFirstRun();
load();
bindPanel();
bindLogos(changed, schedule);
bindPreview();
bindActions();
bindPolish({onPdf:() => $('#pdfBtn').click()});
registerSW();
for(const k of Object.keys(logoImg)) setLogoImg(k, state.logos[k]);
fillSchool();
refreshLogos();
buildPanel();
renderPreview();

/* undo / redo: buttons, and Ctrl+Z / Ctrl+Y (inside a text box the browser's own undo keeps working) */
const histButtons = () => { $('#undoBtn').disabled = !canUndo(); $('#redoBtn').disabled = !canRedo(); };
initHistory(() => { fillSchool(); buildPanel(); restored(); }, histButtons);
$('#undoBtn').addEventListener('click', () => { undo(); histButtons(); });
$('#redoBtn').addEventListener('click', () => { redo(); histButtons(); });
document.addEventListener('keydown', e => {
  if(!(e.ctrlKey || e.metaKey) || e.altKey) return;
  const t = e.target, typing = t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && /^(text|search|)$/.test(t.type)));
  if(typing) return;
  const k = e.key.toLowerCase();
  if(k === 'z' && !e.shiftKey){ e.preventDefault(); undo(); histButtons(); }
  else if(k === 'y' || (k === 'z' && e.shiftKey)){ e.preventDefault(); redo(); histButtons(); }
});
document.addEventListener('input', () => setTimeout(histButtons, 700));

/* school settings file, and the welcome screen on first run (tests opt in with ?firstrun) */
const refreshAll = () => { for(const k of Object.keys(logoImg)) setLogoImg(k, state.logos[k]); fillSchool(); refreshLogos(); buildPanel(); changed(); };
$('#exportSchool').addEventListener('click', exportSettings);
$('#importSchool').addEventListener('click', () => importSettings(refreshAll));
if(firstRun && (!/[?&]test\b/.test(location.search) || /[?&]firstrun\b/.test(location.search))) showWelcome(refreshAll);
document.addEventListener('click', () => setTimeout(histButtons, 700));

if(document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', schedule);
fontsReady().then(() => { schedule(); thumbs(0); });
onEdit(() => thumbs());
document.querySelector('#layoutsV1').parentElement.addEventListener('toggle', () => thumbs(0));

/* Test hook (Playwright): only with ?test in the URL. */
if(/[?&]test\b/.test(location.search)){
  window.__kp = {isV2:true, state, logoImg, setLogoImg, migrate, records, renderTo, buildPdf, buildPng, buildZip, fontsReady,
    render(px, i, withBoxes){
      const [W, H] = pageSize(state), c = document.createElement('canvas');
      c.width = px; c.height = Math.round(px * H / W);
      env.boxes = withBoxes ? [] : null;
      const {over} = draw(c.getContext('2d'), state, logoImg, px, i);
      const boxes = env.boxes; env.boxes = null;
      return {url:c.toDataURL('image/png'), over, boxes};
    },
    refresh(){ fillSchool(); refreshLogos(); buildPanel(); renderPreview(); }};
}
