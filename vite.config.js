import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const stub = fileURLToPath(new URL('./src/export/stub.js', import.meta.url));
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

/** Site build only: web app manifest, icons, and a service worker that precaches every built file
 *  (cache-first, versioned by a hash of the build), so the installed app works without internet. */
function pwa(){
  return {
    name:'khuwair-pwa',
    transformIndexHtml(html){
      return html.replace('<!--pwa-->', '<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-192.png">');
    },
    generateBundle(_, bundle){
      for(const f of ['icon-192.png', 'icon-512.png', 'maskable-512.png'])
        this.emitFile({type:'asset', fileName:f, source:readFileSync(new URL('./pwa/' + f, import.meta.url))});
      // school links (?school=<id>): each schools/<id>.json is published next to the page
      for(const f of readdirSync(new URL('./schools/', import.meta.url)).filter(f => /^[a-z0-9-]+\.json$/.test(f)))
        this.emitFile({type:'asset', fileName:'schools/' + f, source:readFileSync(new URL('./schools/' + f, import.meta.url))});
      this.emitFile({type:'asset', fileName:'manifest.webmanifest', source:JSON.stringify({
        name:'مطبعة الخوير', short_name:'مطبعة الخوير', description:'صمّم مطبوعات المدرسة ونزّلها جاهزة للطباعة',
        lang:'ar', dir:'rtl', start_url:'./', scope:'./', display:'standalone', background_color:'#ECEFEA', theme_color:'#1E5B47',
        icons:[{src:'icon-192.png', sizes:'192x192', type:'image/png'}, {src:'icon-512.png', sizes:'512x512', type:'image/png'},
          {src:'maskable-512.png', sizes:'512x512', type:'image/png', purpose:'maskable'}]
      }, null, 1)});
      // every built file once (cache.addAll rejects duplicates); the page itself as ./ and index.html
      const files = [...new Set(['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'maskable-512.png', ...Object.keys(bundle)])];
      const version = createHash('sha256').update(files.join('|') + Object.values(bundle).map(b => b.code || b.source || '').join('')).digest('hex').slice(0, 12);
      this.emitFile({type:'asset', fileName:'sw.js', source:SW(version, files)});
    }
  };
}
const SW = (version, files) => `/* Generated at build time. Offline cache for مطبعة الخوير. */
const CACHE = 'khuwair-press-${version}';
const FILES = ${JSON.stringify(files)};
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('khuwair-press-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, {ignoreSearch:req.mode === 'navigate'}).then(hit => hit || fetch(req).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error())));
});
`;

// `--mode site`    → dist/site: static site for GitHub Pages (relative paths, works under /<repo>/), installable, offline.
// `--mode gallery` → dist/gallery: the internal ornament gallery (tests only).
// `--mode single`  → dist/single/khuwair-press.html: one self-contained file (fonts, jsPDF, code inlined) for offline use.
export default defineConfig(({ mode }) => {
  const single = mode === 'single', gallery = mode === 'gallery', site = mode === 'site';
  return {
    base: './',
    define: { 'import.meta.env.APP_VERSION': JSON.stringify(pkg.version) },
    resolve: {
      // jsPDF's optional deps (HTML/SVG rendering) are never used: keep them out of the bundle.
      alias: { html2canvas: stub, dompurify: stub, canvg: stub }
    },
    plugins: single ? [viteSingleFile({ removeViteModuleLoader: true })] : site ? [pwa()] : [],
    build: {
      outDir: single ? 'dist/single' : gallery ? 'dist/gallery' : 'dist/site',
      // The ornament gallery is a development page: built separately (for tests), never shipped with the site.
      rollupOptions: { input: gallery ? 'gallery.html' : 'index.html' },
      emptyOutDir: true,
      target: 'es2020',
      assetsInlineLimit: single ? 100_000_000 : 4096,
      chunkSizeWarningLimit: 1500,
      reportCompressedSize: false
    }
  };
});
