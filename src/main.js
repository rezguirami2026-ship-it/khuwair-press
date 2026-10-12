import './styles.css';
import { fontsReady } from './fonts/index.js';
import { state, load } from './state/store.js';
import { migrate } from './state/migrate.js';
import { records } from './schema/parse.js';
import { draw, renderTo, pageSize } from './render/draw.js';
import { env } from './render/env.js';
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
for(const k of Object.keys(logoImg)) setLogoImg(k, state.logos[k]);
fillSchool();
refreshLogos();
buildPanel();
renderPreview();

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
