import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';

const stub = fileURLToPath(new URL('./src/export/stub.js', import.meta.url));

// `--mode site`   → dist/site: static site for GitHub Pages (relative paths, works under /<repo>/).
// `--mode single` → dist/single/khuwair-press.html: one self-contained file (fonts, jsPDF, code inlined) for offline use.
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    resolve: {
      // jsPDF's optional deps (HTML/SVG rendering) are never used: keep them out of the bundle.
      alias: { html2canvas: stub, dompurify: stub, canvg: stub }
    },
    plugins: single ? [viteSingleFile({ removeViteModuleLoader: true })] : [],
    build: {
      outDir: single ? 'dist/single' : 'dist/site',
      emptyOutDir: true,
      target: 'es2020',
      assetsInlineLimit: single ? 100_000_000 : 4096,
      reportCompressedSize: false
    }
  };
});
