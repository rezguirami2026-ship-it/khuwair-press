import './styles.css';
import { fontsReady } from './fonts/index.js';
import { state, load } from './state/store.js';
import { migrate } from './state/migrate.js';
import { records } from './schema/parse.js';
import { draw, renderTo, pageSize } from './render/draw.js';
import { env } from './render/env.js';
import { buildPdf } from './export/pdf.js';
import { logoImg, setLogoImg, refreshLogos, bindLogos } from './ui/logos.js';
import { schedule, changed, restored, renderPreview, bindPreview } from './ui/preview.js';
import { initHistory, undo, redo, canUndo, canRedo } from './ui/history.js';
import { $ } from './ui/dom.js';
import { buildPanel, bindPanel, fillSchool } from './ui/panel.js';
import { bindActions } from './ui/actions.js';

load();
bindPanel();
bindLogos(changed, schedule);
bindPreview();
bindActions();
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
document.addEventListener('click', () => setTimeout(histButtons, 700));

if(document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', schedule);
fontsReady().then(schedule);

/* Test hook (Playwright): only with ?test in the URL. */
if(/[?&]test\b/.test(location.search)){
  window.__kp = {isV2:true, state, logoImg, setLogoImg, migrate, records, renderTo, buildPdf, fontsReady,
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
