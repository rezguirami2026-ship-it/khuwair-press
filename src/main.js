import './styles.css';
import { fontsReady } from './fonts/index.js';
import { state, load } from './state/store.js';
import { migrate } from './state/migrate.js';
import { records } from './schema/parse.js';
import { draw, renderTo, pageSize } from './render/draw.js';
import { buildPdf } from './export/pdf.js';
import { logoImg, setLogoImg, refreshLogos, bindLogos } from './ui/logos.js';
import { schedule, changed, renderPreview, bindPreview } from './ui/preview.js';
import { buildPanel, bindPanel, fillSchool } from './ui/panel.js';
import { bindActions } from './ui/actions.js';

load();
bindPanel();
bindLogos(changed, schedule);
bindPreview();
bindActions();
setLogoImg('center', state.logos.center); setLogoImg('side', state.logos.side);
fillSchool();
refreshLogos();
buildPanel();
renderPreview();

if(document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', schedule);
fontsReady().then(schedule);

/* Test hook (Playwright): only with ?test in the URL. */
if(/[?&]test\b/.test(location.search)){
  window.__kp = {state, logoImg, setLogoImg, migrate, records, renderTo, buildPdf, fontsReady,
    render(px, i){
      const [W, H] = pageSize(state), c = document.createElement('canvas');
      c.width = px; c.height = Math.round(px * H / W);
      const {over} = draw(c.getContext('2d'), state, logoImg, px, i);
      return {url:c.toDataURL('image/png'), over};
    },
    refresh(){ fillSchool(); refreshLogos(); buildPanel(); renderPreview(); }};
}
