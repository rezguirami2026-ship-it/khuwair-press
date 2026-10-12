/* Finishing touches: light/dark appearance, «عن الأداة», keyboard support, offline app (service worker). */
import { $, $$ } from './dom.js';

/* ---- appearance: auto (follows the device) → light → dark ---- */
const THEME_KEY = 'khuwair-press-ui-theme';
const THEME_LABEL = {auto:'المظهر: تلقائي', light:'المظهر: فاتح', dark:'المظهر: داكن'};
const THEME_ICON = {auto:'◐', light:'☀', dark:'☾'};
function currentTheme(){ try{ const t = localStorage.getItem(THEME_KEY); return t === 'light' || t === 'dark' ? t : 'auto'; }catch(e){ return 'auto'; } }
function setTheme(t){
  if(t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
  try{ t === 'auto' ? localStorage.removeItem(THEME_KEY) : localStorage.setItem(THEME_KEY, t); }catch(e){}
  const b = $('#themeBtn'); b.textContent = THEME_ICON[t]; b.setAttribute('aria-label', THEME_LABEL[t]); b.title = THEME_LABEL[t];
}

/** Roving arrow-key navigation inside a group of buttons (RTL: ← moves forward). */
function arrows(container, selector, activate){
  container.addEventListener('keydown', e => {
    if(!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const items = [...container.querySelectorAll(selector)].filter(el => !el.hidden && el.offsetParent !== null);
    const i = items.indexOf(document.activeElement); if(i < 0) return;
    e.preventDefault();
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === 'ArrowLeft' ? 1 : -1) + items.length) % items.length;
    items[n].focus();
    if(activate) items[n].click();
  });
}

export function bindPolish({onPdf}){
  setTheme(currentTheme());
  $('#themeBtn').addEventListener('click', () => { const order = ['auto', 'light', 'dark'], t = currentTheme(); setTheme(order[(order.indexOf(t) + 1) % 3]); });

  const about = $('#aboutDlg');
  $('#ver').textContent = import.meta.env.APP_VERSION || '';
  if(import.meta.env.MODE === 'site') about.querySelector('.standalone').hidden = false;
  const open = () => about.showModal();
  $('#aboutBtn').addEventListener('click', open);
  $$('[data-about]').forEach(b => b.addEventListener('click', open));
  about.querySelector('[data-close]').addEventListener('click', () => about.close());

  // tabs: proper tablist semantics + arrows; templates and chips: arrows move focus
  const tabs = $('.tabs');
  $$('.tab').forEach(t => { t.id = 'tab-' + t.dataset.type; t.setAttribute('aria-controls', 'fields'); });
  const syncTabs = () => $$('.tab').forEach(t => t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1);
  new MutationObserver(syncTabs).observe(tabs, {attributes:true, subtree:true, attributeFilter:['aria-selected']}); syncTabs();
  arrows(tabs, '.tab', true);
  arrows($('#layouts'), '.tpl', false);
  arrows($('#layoutsV1'), '.tpl', false);
  arrows($('#swatches'), '.sw', false);
  arrows($('#fonts'), '.chip', false);

  // preview: focusable; ←/→ move between certificates of a batch
  const desk = $('#desk');
  desk.tabIndex = 0; desk.setAttribute('aria-label', 'المعاينة — استخدم الأسهم للتنقل بين الشهادات');
  desk.addEventListener('keydown', e => {
    if(e.key === 'ArrowLeft' && !$('#next').disabled && !$('#pager').hidden){ e.preventDefault(); $('#next').click(); }
    if(e.key === 'ArrowRight' && !$('#prev').disabled && !$('#pager').hidden){ e.preventDefault(); $('#prev').click(); }
  });
  // Ctrl+S: download PDF (instead of saving the web page)
  document.addEventListener('keydown', e => {
    if((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 's'){ e.preventDefault(); onPdf(); }
  });
}

/** Offline app: the site build registers a service worker (the single-file build is already self-contained). */
export function registerSW(){
  if(import.meta.env.MODE !== 'site' || !('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  // when a new version takes over (after an update was published), reload once so the user sees it at once
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if(hadController && !reloaded){ reloaded = true; location.reload(); } });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(r => r.update()).catch(() => {});
  });
}
