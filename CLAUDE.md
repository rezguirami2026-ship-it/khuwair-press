# Khuwair Press (مطبعة الخوير) — project memory

## What this is
An Arabic, right-to-left web app that lets a teacher design school print material and export print-ready A4 files:
- **Certificates** (شهادات), generated in batch: one page per student from a pasted list.
- **Parent notices** (إعلانات).
- **Posters** (ملصقات): guidelines/awareness posters and an honor board (لوحة الشرف).
- **Invitations** (دعوات).

Owner: أ. رامي الرزقي, a math teacher at مدرسة الخوير للبنين (٥-٩), Bawshar, Muscat, Oman. He signs his work «إعداد أ. رامي الرزقي».
He may sell the tool to other schools, so school data must stay configurable. Defaults are only defaults.

## Decision of 2026-10-13 (overrides older notes)
- The owner asked that his name not appear anywhere in the app or its sample content. This includes «عن الأداة», even though PROMPT.md asked for «إعداد أ. رامي الرزقي».
- Sample content is generic: «اسم المدرسة», «أ. اسم المدير», «أ. اسم المعلم», and common first names without family names.
- Do not reintroduce real people's names into defaults. The product name «مطبعة الخوير» stays.
- Certificates have no teacher signer by default (an optional extra signer exists). The date sits bottom right, labelled «التاريخ». The stamp area is a clear «مكان الختم» circle.
- The default frame of the «فاخر» identity is «إطار المخطوطات» (`girih`), chosen by the owner. Other frames stay selectable under «شكل الإطار».
- Fifth identity «ملكي» (`royal`), modelled on a reference the owner sent:
  - Ivory paper, double gold frame, curved sashes in two corners (`ornaments/royal.js`), and a laurel badge at top left on certificates (`skin.cornerAward`).
  - Arch ornaments at the top and bottom centre.
  - Boxes named `~…` are decoration keep-out zones: text may not enter them, but they may touch the edge.
- Class codes like 1/6 are drawn in typed order, read right to left (`classOrder` in `src/render/text.js`).

## Working with the owner
- Reply in Arabic. Be concise and practical, and give step-by-step instructions.
- After any visual change, render the affected pages to PNG, look at them yourself, and show him the screenshots.
- Work in phases. Commit after each completed step with a clear message.

## Current state (v2, phase 1 done — keep feature parity with v1)
- v1 (single file) is kept as `legacy/v1.html`. It is the visual reference for `tests/parity.spec.js`.
- v2 is a Vite project (vanilla JS, ES modules):
  - `src/schema`: `TYPES`, `THEMES`, `FONTS`, `defaults`, parsing.
  - `src/state`: store and `migrate.js`.
  - `src/render`: `env`, `text`, `shapes`, `blocks`, `draw`.
  - `src/ornaments`.
  - `src/templates/<type>/<layout>.js`.
  - `src/ui`.
  - `src/export`.
  - `src/fonts`.
- Phase 2 added the ornament engine in `src/ornaments/`:
  - Stars and tabaq rosettes, interlace weaving, Hankin patterns, frame bands, Omani elements, and awards.
  - Every ornament takes the standard opts `{density, lw, color|'gold', accent, bg, rot, alpha, ink}`.
  - `gallery.html` is a dev page, built by `--mode gallery`. It is never shipped.
- Phase 3 added templates:
  - Layout engine (`src/render/layout.js`):
    - `stack()` measures all blocks, then shrinks a common scale. Each block has its own min, and `rigid` headlines shrink more slowly.
    - Centred text gets balanced lines.
    - Free space goes to gaps and margins.
    - The overflow flag is raised only below the floor, and the stack is then clipped to its box.
    - `mark()` records boxes. The tests use them to assert no overlap and the 10 mm safe margin.
  - Identities (`src/templates/skins.js`): `luxe` (default, chosen by the owner), `modern`, `heritage`, `joy`. Each has its own fonts, frame, emblem, divider, and award.
  - `src/templates/compose.js` builds cert, notice, poster (`kind`: guide | honor), and invite for any skin. `templates/<type>/<id>.js` are thin wrappers.
  - The v1 layouts are kept unchanged (pixel parity) under «قوالب الإصدار الأول». In the poster, v1 is the layout id `v1` plus `kind`.
  - State v2 adds `gold`, `ink`, `tfont:'auto'`, and `logos.signature` and `logos.stamp` (transparent PNG uploads).
- Phase 4 added editor features:
  - `schema/gender.js`: `toGender()` swaps whole-word pairs (fields flagged `g:true`). It also has the `{الاسم} {الصف} {المادة} {المركز}` placeholders, which `draw()` fills per record.
  - `schema/presets.js`: texts for 9 occasions × 4 types.
  - Name lines may be «الاسم - الصف» or «الاسم | الصف | المادة | المركز», or tab-separated.
  - `ui/importer.js`: SheetJS from cdn.sheetjs.com, lazy-loaded. Windows-1256 CSV is supported.
  - `ui/history.js` handles undo and redo.
  - `ui/school.js` handles the settings file (`format: khuwair-press/school`) and the first-run dialog. Tests must add `&firstrun` to see that dialog.
  - Size factors live in `doc.sz[fieldKey]` (0.6–1.6) and are read with `K()` in `compose.js`. They apply to the new templates only.
  - Template thumbnails are drawn by `thumbs()` in `ui/panel.js`.
  - Tests pin the clock (`FIXED_NOW` in `tests/helpers.js`) because the default texts contain today's date.
- Phase 5 changed export:
  - `export/renderer.js` draws pages in an inline Web Worker (`render.worker.js`) on an OffscreenCanvas.
    - Fonts are passed to the worker as FontFace sources taken from the page's `@font-face` rules. Logos are passed as ImageBitmaps.
    - Fallback: drawing on the page, yielding between pages. Force it with `?noworker`.
  - Quality: `state.quality` is `print` (300 dpi, JPEG 0.92) or `light` (150 dpi, 0.82).
  - Paper: `doc.paper` is A4, A5 (notice/invite), or A3 (poster). See `export/paper.js`. The same 1000-unit layout is reused, only the pixel/mm size changes.
  - ZIP of PNGs uses fflate.
  - Measured: 60 certificates at 300 dpi take about 9 s, and the main thread's longest task is about 0.26 s.
- Phase 6 polished the app:
  - Light/dark/auto appearance, stored under the localStorage key `khuwair-press-ui-theme`.
  - The «عن الأداة» dialog (privacy, shortcuts, licenses).
  - Keyboard: arrow keys on tabs, templates, and the preview; Ctrl+S downloads the PDF; a skip link.
  - On phones, the download bar is fixed at the bottom of the screen.
  - The site build is a PWA: a manifest, icons from `pwa/` (made by `scripts/make-icons.mjs`), and a generated `sw.js` that precaches every built file.
  - `dist/site/khuwair-press.html` is a copy of the standalone file, offered in «عن الأداة».
- Render environment: templates read the school, logos, the digits setting and `OVER` from `env` (`src/render/env.js`), which `draw(ctx, state, logos, px, recIdx)` fills. They never import the UI.
- Fonts are bundled locally from `@fontsource`, Arabic and Latin subsets, woff2 only.
  - `src/fonts/fonts.css` is generated by `node scripts/gen-fonts.mjs`.
  - jsPDF 2.5.1 is an npm dependency. Its optional dependencies are aliased to a stub.
- `npm run build` produces two outputs:
  - `dist/site/`: GitHub Pages site with relative paths.
  - `dist/single/khuwair-press.html`: self-contained, about 2.8 MB (also copied into `dist/site/`).
- Storage key `khuwair-press-v2`. It migrates from `khuwair-press-v1`, which is never deleted.
- Test hook: `window.__kp` exists only when the URL has `?test`.
- Tests: run `npm run build` first, then `npm test`.
  - `parity`: v2 compared with v1, pixel for pixel.
  - `visual`: snapshots under `tests/__snapshots__`. Update them with `npm run test:update`, and only after a reviewed visual change.
  - `app`: offline, migration, PDF page count, UI screenshots.
  - Rendered PNGs are written to `tests/__output__/`, which git ignores.

### v1 architecture (still accurate for the rendering code)
- Originally one file (~1100 lines): HTML, CSS, and a single IIFE `<script>`.
  - Google Fonts: Amiri, Aref Ruqaa, Reem Kufi, Tajawal, IBM Plex Sans Arabic.
  - jsPDF 2.5.1, loaded from cdnjs.
- **Rendering**: everything is drawn on `<canvas>` with Canvas 2D.
  - Page units are 1000 wide: landscape is 1000×707, portrait is 1000×1414 (A-series √2 ratio).
  - `draw(ctx, px, recIdx)` scales the page by `px/1000`.
  - `renderTo(px, i)` renders offscreen for export.
- **State**: `state = {type, theme, tfont, digits, idx, school:{l1,l2,l3,year,director}, logos:{center,side}, docs:{cert,notice,poster,invite}}`.
  - Logos are PNG data URLs, at most 600 px on the long side.
  - State is persisted to `localStorage` under the key `khuwair-press-v1`. Any new storage format must migrate from it.
- **Schema**: `TYPES[type] = {noun, orient, layouts:[[id,label]], fields:[{k,l,t:'text'|'area'|'list'|'check', half, when, hint, ph, rows}]}`.
  - The side panel UI is generated from this schema (`buildPanel`/`buildFields`).
- **Templates**: `DRAW[type][layout]` holds the eight layout functions:

  | Type | Layouts |
  |---|---|
  | `cert` | `certClassic`, `certBand` |
  | `notice` | `noticeFormal`, `noticeCard` |
  | `poster` | `posterGuide`, `posterHonor` |
  | `invite` | `inviteOrnate`, `inviteBand` |

- **Primitives**:
  - Text: `T` (draws text, applies digit conversion, uses rtl); `wrap`, `para`, `fitPara`, `fitLine` (Arabic word wrap and auto-fit).
  - Shapes: `rr` (rounded rect), `starPath` (8-point khatam star made of two squares, inner radius 0.7654·r).
  - Ornaments: `starField`, `divider`, `cornerStar`, `emblem`.
  - Blocks: `logoAt`, `officialHeader`, `detailCards`, `sign`, `seal`, `pill`.
- **Overflow**: the `OVER` flag is set when content cannot fit, and the UI then shows a warning.
- **Export**:
  - PDF goes through jsPDF: each page is a JPEG at quality 0.9, 2800 px wide (landscape) or 2000 px wide (portrait).
  - PNG goes through `canvas.toBlob`.
  - Delivery uses `window.claude.use('downloads')` when the page runs as a claude.ai artifact, and `<a download>` otherwise.

## Non-negotiables
- **Text direction and shaping**
  - RTL everywhere, and `ctx.direction = 'rtl'` on canvas.
  - Never use `letterSpacing` on Arabic, and never draw Arabic glyph by glyph. Both break letter joining.
- **Digits**: there is an Arabic-Indic digits toggle, on by default. Every drawn string passes through `toAr()`.
- **Fonts**
  - Fonts must be fully loaded before drawing or exporting: call `document.fonts.load(spec, arabicSample)` for each spec.
  - Never export with fallback fonts.
  - Use only fonts under the OFL or another open license.
- **Official wording**: the default header is «سلطنة عمان» / «وزارة التعليم» / «مدرسة الخوير للبنين (٥-٩)». Do not use «وزارة التربية والتعليم». Every line stays editable.
- **Logos**: do not bundle any official emblem. Logos come only from user uploads.
- **Print**
  - A4 at a 300 DPI target. Keep text at least 10 mm from the trim edge.
  - Colors must stay readable when printed on an ordinary school printer.
- **Layout**: text must never overflow, clip, or overlap. Every template auto-fits and reports overflow.
- **Grammar**: Arabic gender agreement matters (الطالب/الطالبة، لتفوّقه/لتفوّقها، له/لها).

## Deployment targets
1. **Static site on GitHub Pages**, under the owner's account `rezguirami2026-ship-it`, like his other projects.
2. **One self-contained HTML file**, with fonts and libraries inlined, for offline use at school.
   If it is also published as a claude.ai artifact:
   - `window.print()` does nothing, and `<a download>` is blocked. Use the downloads capability instead.
   - External scripts may load only from cdnjs, jsdelivr, or unpkg, and stylesheets only from Google Fonts. Inline everything else.

## Testing
- **Playwright visual tests**: render every type × layout × theme to PNG, plus mobile and desktop screenshots of the UI.
- **Stress cases**:
  - names of 40+ characters
  - 60 students in one certificate batch
  - empty fields
  - 24 honor-board names
  - 10 poster points
  - very long notice text
- **Assertions**:
  - no console errors
  - no overflow except in impossible cases
  - the PDF page count equals the number of students
- Look at the screenshots before reporting a task as done.
