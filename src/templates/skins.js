/* Template identities ("skins"): paper, frame, background, font pairing and signature ornaments.
 *   luxe     — فاخر: gold khatam band, rosette corners, faint khatam field, gold award badge (default)
 *   modern   — عصري: hairline gold frame with stepped corners, white space, line medallion watermark, gold seal
 *   heritage — عُماني تراثي: ivory paper, door-stud band, fort crenellations, girih field, scalloped arch
 *   joy      — مبهج: rounded colourful frame, confetti of stars, friendly display type (younger grades)
 *   official — رسمي: security-print guilloche border with guilloche rosettes, faint school-logo watermark, gold badge
 *   executive — تنفيذي: coloured side panel with a gold geometric pattern and medallion, fine frame, gold seal
 *   filigree — نقش ذهبي: ivory paper, double gold frame, gold scroll corners, school-logo watermark, laurel badge
 * page() draws the background and frame and returns the content box, which already respects the 10 mm safe margin. */
import { env, headingOverride } from '../render/env.js';
import { FONTS } from '../schema/themes.js';
import { rr, paper } from '../render/shapes.js';
import { pattern } from '../ornaments/patterns.js';
import { frame, fineFrame, guillocheFrame, cornerFrame, girihBand } from '../ornaments/frames.js';
import { rosette, medallion, starPoly } from '../ornaments/stars.js';
import { crenellation, archFrame, archRise } from '../ornaments/oman.js';
import { ornDivider, seal, awardBadge } from '../ornaments/awards.js';
import { cornerSash, laurelBadge, archOrnament, fleuronRule, cornerRosette } from '../ornaments/royal.js';
import { goldGradient } from '../ornaments/core.js';
import { guillocheRosette, guillocheBorder, filigreeCorner } from '../ornaments/prestige.js';
import { mark } from '../render/layout.js';

/** Safe margin (10 mm from trim) in page units. */
export const safe = (W, H) => W > H ? 34 : 48;
const acc = th => env.gold ? 'gold' : th.accent;
/** The document's frame style (luxe identity). */
export const FRAME_STYLES = [['girih', 'إطار المخطوطات'], ['band', 'شريط النجوم'], ['guilloche', 'خطوط دقيقة'], ['corner', 'زوايا رفيعة']];  // first = default (owner's choice)
const frameStyle = () => { const d = env.state.docs[env.state.type]; return d && FRAME_STYLES.some(f => f[0] === d.frame) ? d.frame : FRAME_STYLES[0][0]; };
const O = (th, extra) => Object.assign({color:th.primary, accent:acc(th), ink:env.ink}, extra);
/** Playful but print-safe colours for the joy identity. */
export const JOY = ['#E39B2D', '#23897F', '#D9475E', '#3A72C4'];

function fonts(title, name, body, bodyB, label){
  return {title, name, body, bodyB, label};
}
const F = (k, w) => ({fam:FONTS[k], w});

export const SKINS = {
  luxe:{
    id:'luxe', bg:'#FFFFFF',
    fonts:fonts(F('ruqaa', 700), F('ruqaa', 700), F('naskh', 400), F('naskh', 700), F('sans', 500)),
    /** frame styles: band (khatam band) | guilloche | corner (fine rules + corner pieces) | girih (manuscript border) */
    page(ctx, W, H, th){
      const land = W > H, style = frameStyle();
      paper(ctx, W, H);
      if(style === 'corner'){
        const m = land ? 22 : 30;
        rosette(ctx, W / 2, H / 2 + (land ? 18 : 0), land ? 250 : 330, 16, {layers:3, fillMode:'line', color:th.primary, accent:th.primary, alpha:0.06, ring:true});
        cornerFrame(ctx, m, m, W - 2 * m, H - 2 * m, O(th, {gap:land ? 7 : 9}));
        const p = land ? 66 : 84;
        return {x0:p, y0:p, x1:W - p, y1:H - p};
      }
      const m = land ? 18 : 24, bw = land ? (style === 'guilloche' ? 30 : 34) : 40;
      pattern(ctx, '4.8.8', m + bw, m + bw, W - 2 * (m + bw), H - 2 * (m + bw), {size:land ? 90 : 100, color:th.primary, alpha:style === 'band' ? 0.055 : 0.035, lw:0.9});
      if(style === 'guilloche') guillocheFrame(ctx, m, m, W - 2 * m, H - 2 * m, O(th, {band:bw}));
      else if(style === 'girih') girihBand(ctx, m, m, W - 2 * m, H - 2 * m, O(th, {band:bw}));
      else frame(ctx, m, m, W - 2 * m, H - 2 * m, O(th, {band:bw, motif:'khatam', corner:'rosette'}));
      const p = m + bw + (land ? 16 : 26);
      return {x0:p, y0:p, x1:W - p, y1:H - p};
    },
    emblem(ctx, cx, cy, r, th){ rosette(ctx, cx, cy, r, 12, O(th, {layers:2})); },
    divider(ctx, cx, y, half, th){ ornDivider(ctx, cx, y, half, O(th, {style:'rosette', size:9})); },
    award(ctx, cx, cy, r, th){ awardBadge(ctx, cx, cy - r * 0.35, r, {color:acc(th), accent:th.primary, ink:env.ink}); },
    rule(ctx, x0, x1, y, th){ ctx.save(); ctx.fillStyle = env.gold ? goldH(ctx, x0, x1) : th.accent; ctx.fillRect(x0, y, x1 - x0, 1.6); ctx.restore(); },
    tone:{title:'primary', name:'primary'}
  },
  modern:{
    id:'modern', bg:'#FFFFFF',
    fonts:fonts(F('messiri', 700), F('messiri', 600), F('plex', 400), F('plex', 600), F('plex', 500)),
    page(ctx, W, H, th){
      const land = W > H; paper(ctx, W, H);
      ctx.save(); ctx.fillStyle = th.primary; ctx.strokeStyle = th.primary; ctx.lineWidth = 2;
      if(land){ for(const x of [0, W - 12]) env.ink ? ctx.strokeRect(x + 1, 1, 10, H - 2) : ctx.fillRect(x, 0, 12, H); }
      else { for(const y of [0, H - 12]) env.ink ? ctx.strokeRect(1, y + 1, W - 2, 10) : ctx.fillRect(0, y, W, 12); }
      ctx.restore();
      medallion(ctx, land ? W - 30 : W * 0.88, land ? H / 2 : H * 0.52, land ? 330 : 420, 16, {color:th.primary, accent:th.primary, alpha:0.055, lw:1.2});
      const mx = land ? 40 : 46, my = land ? 32 : 44;
      fineFrame(ctx, mx, my, W - 2 * mx, H - 2 * my, O(th, {notch:land ? 30 : 36, gap:7, rules:3, lw:0.9}));
      const p = land ? 74 : 84;
      return {x0:p, y0:land ? 64 : 82, x1:W - p, y1:H - (land ? 64 : 82)};
    },
    emblem(ctx, cx, cy, r, th){ medallion(ctx, cx, cy, r, 12, O(th, {lw:1.4})); },
    divider(ctx, cx, y, half, th){ ornDivider(ctx, cx, y, half * 0.75, {style:'taper', size:8, color:acc(th), accent:acc(th)}); },
    award(ctx, cx, cy, r, th){ seal(ctx, cx, cy, r, {color:acc(th), accent:th.primary, scallops:40, star:12, ink:env.ink}); },
    rule(ctx, x0, x1, y, th){ ctx.save(); ctx.fillStyle = th.primary; ctx.fillRect((x0 + x1) / 2 - 30, y, 60, 3); ctx.restore(); },
    tone:{title:'primary', name:'ink'}
  },
  heritage:{
    id:'heritage', bg:'#FBF6EE',
    fonts:fonts(F('rakkas', 400), F('ruqaa', 700), F('scheherazade', 400), F('scheherazade', 700), F('sans', 500)),
    page(ctx, W, H, th){
      const land = W > H, m = land ? 18 : 24, bw = land ? 30 : 36, bg = this.bg;
      ctx.fillStyle = env.ink ? '#FFFFFF' : bg; ctx.fillRect(0, 0, W, H);
      const pb = env.ink ? '#FFFFFF' : bg;
      pattern(ctx, '3.12.12', m + bw, m + bw, W - 2 * (m + bw), H - 2 * (m + bw), {size:land ? 150 : 170, color:th.accent, alpha:0.1, lw:0.9, bg:pb});
      frame(ctx, m, m, W - 2 * m, H - 2 * m, O(th, {band:bw, motif:'studs', corner:'khatam', bg:pb}));
      const ch = land ? 22 : 26, cx0 = m + bw + 6, cw = W - 2 * (m + bw + 6);
      crenellation(ctx, cx0, m + bw + 4, cw, ch, {color:th.primary, bg:pb, density:land ? 1.25 : 1.1, ink:env.ink});
      ctx.save(); ctx.translate(W, H); ctx.rotate(Math.PI);
      crenellation(ctx, cx0, m + bw + 4, cw, ch, {color:th.primary, bg:pb, density:land ? 1.25 : 1.1, ink:env.ink});
      ctx.restore();
      const p = m + bw + (land ? 20 : 28);
      return {x0:p, y0:m + bw + ch + (land ? 14 : 22), x1:W - p, y1:H - (m + bw + ch + (land ? 14 : 22))};
    },
    emblem(ctx, cx, cy, r, th){ rosette(ctx, cx, cy, r, 8, O(th, {layers:2, bg:env.ink ? '#FFFFFF' : this.bg})); },
    divider(ctx, cx, y, half, th){ ornDivider(ctx, cx, y, half, O(th, {style:'knot', size:9, bg:env.ink ? '#FFFFFF' : this.bg})); },
    award(ctx, cx, cy, r, th){ rosette(ctx, cx, cy, r, 8, O(th, {layers:2, bg:env.ink ? '#FFFFFF' : this.bg})); },
    hero(ctx, x0, y0, x1, y1, th){
      const spring = Math.min(0.5, 120 / (y1 - y0)), rise = archRise(x1 - x0, y1 - y0, 'scalloped', spring);
      archFrame(ctx, x0, y0, x1 - x0, y1 - y0, O(th, {kind:'scalloped', spring, gap:9}));
      mark('~arch', x0, y0 - rise, x1 - x0, rise);   // the lobes rise above the arch's nominal top
    },
    /** room the arch's lobes need above its nominal top, for a hero w wide (spring line 120 below the top) */
    heroRise(w){ return archRise(w, 300, 'scalloped', 0.4); },
    rule(ctx, x0, x1, y, th){ ornDivider(ctx, (x0 + x1) / 2, y + 2, (x1 - x0) / 2, O(th, {style:'diamonds', size:5, bg:env.ink ? '#FFFFFF' : this.bg})); },
    tone:{title:'primary', name:'primary'}
  },
  royal:{
    id:'royal', bg:'#FBF7EE',
    fonts:fonts(F('ruqaa', 700), F('ruqaa', 700), F('naskh', 400), F('naskh', 700), F('sans', 600)),
    /** Ivory paper, fine double gold frame, curved sashes in two opposite corners, rosette corners in the other two. */
    page(ctx, W, H, th){
      const land = W > H, bg = env.ink ? '#FFFFFF' : this.bg, k = land ? 1 : 1.22;
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      // faint star dishes in the side margins
      for(const [x, y] of land ? [[60, H * 0.62], [W - 60, H * 0.38]] : [[50, H * 0.55], [W - 50, H * 0.3]]) rosette(ctx, x, y, 120 * k, 12, {layers:2, fillMode:'line', color:'#B08A3E', accent:'#B08A3E', alpha:0.12, ring:false, bg});
      const m = land ? 26 : 32, G = env.ink ? th.primary : goldH2(ctx, W, H);
      ctx.save(); ctx.strokeStyle = G;
      ctx.lineWidth = 2.4; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
      ctx.lineWidth = 0.9; ctx.strokeRect(m + 8, m + 8, W - 2 * m - 16, H - 2 * m - 16);
      // '|' marks a frame rule: nothing may cross it (tests)
      const fi = m + 8, fw = W - 2 * fi, fh = H - 2 * fi;
      mark('|frame', fi - 1, fi - 1, fw + 2, 2); mark('|frame', fi - 1, H - fi - 1, fw + 2, 2); mark('|frame', fi - 1, fi - 1, 2, fh + 2); mark('|frame', W - fi - 1, fi - 1, 2, fh + 2);
      ctx.restore();
      cornerRosette(ctx, W - m - 4, m + 4, land ? 34 : 40, {color:th.primary, bg, ink:env.ink});
      cornerRosette(ctx, m + 4, H - m - 4, land ? 34 : 40, {color:th.primary, bg, ink:env.ink});
      const a = (land ? 250 : 300), b = (land ? 200 : 330);
      cornerSash(ctx, a, b, {color:th.primary, ink:env.ink});
      // the bottom-right sash stays smaller so the date / signer column beside it stays clear
      ctx.save(); ctx.translate(W, H); ctx.rotate(Math.PI); cornerSash(ctx, a * 0.62, b * 0.62, {color:th.primary, ink:env.ink}); ctx.restore();
      // '~' marks a keep-out zone: text must not enter it, but it may touch the page edge and other ornaments
      mark('~sash', 0, 0, a * 0.42, b * 0.42); mark('~sash', W - a * 0.62 * 0.42, H - b * 0.62 * 0.42, a * 0.62 * 0.42, b * 0.62 * 0.42);
      const p = land ? 60 : 78;
      // the header's left column starts after the top-left sash and badge
      return {x0:p, y0:land ? 56 : 74, x1:W - p, y1:H - (land ? 56 : 92), hx0:land ? 236 : 260, hxLogo:land ? 202 : 260, sigInset:land ? 200 : 190};
    },
    emblem(ctx, cx, cy, r, th){ archOrnament(ctx, cx, cy + r * 0.62, r * 3.4, {size:r * 1.15, color:th.primary, ink:env.ink, bg:env.ink ? '#FFFFFF' : this.bg}); },
    divider(ctx, cx, y, half, th){ fleuronRule(ctx, cx, y, half * 1.25, {color:th.primary, ink:env.ink}); },
    /** the award sits in the top-left corner, over the sash; the bottom centre carries an upside-down arch ornament */
    cornerAward(ctx, W, H, th){ const land = W > H; laurelBadge(ctx, land ? 128 : 150, land ? 128 : 150, land ? 52 : 64, {color:th.primary, ink:env.ink}); },
    /** bottom centre: the arch stands on a rule just above the frame (upward, like the top one), never crossing it */
    award(ctx, cx, cy, r, th){ archOrnament(ctx, cx, cy + r, r * 2.6, {size:r * 1.05, color:th.primary, ink:env.ink, bg:env.ink ? '#FFFFFF' : this.bg}); },
    rule(ctx, x0, x1, y, th){ fleuronRule(ctx, (x0 + x1) / 2, y + 2, (x1 - x0) / 2 - 10, {color:th.primary, ink:env.ink}); },
    tone:{title:'primary', name:'primary'}
  },
  official:{
    id:'official', bg:'#FFFDF8',
    fonts:fonts(F('naskh', 700), F('ruqaa', 700), F('naskh', 400), F('naskh', 700), F('sans', 600)),
    page(ctx, W, H, th){
      const land = W > H, bg = env.ink ? '#FFFFFF' : this.bg, m = land ? 20 : 26, b = land ? 30 : 38;
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const wy = H / 2 + (land ? 30 : 60);
      watermark(ctx, W / 2, wy, land ? 300 : 420, () =>
        guillocheRosette(ctx, W / 2, wy, land ? 210 : 300, {n:18, lines:10, color:th.primary, accent:th.primary, alpha:0.08, disc:false, bg}));
      guillocheBorder(ctx, m, m, W - 2 * m, H - 2 * m, O(th, {band:b, bg}));
      const fi = m + b;   // the band's inner rule: nothing may cross it
      mark('|frame', fi - 1, fi - 1, W - 2 * fi + 2, 2); mark('|frame', fi - 1, H - fi - 1, W - 2 * fi + 2, 2);
      mark('|frame', fi - 1, fi - 1, 2, H - 2 * fi + 2); mark('|frame', W - fi - 1, fi - 1, 2, H - 2 * fi + 2);
      const p = fi + (land ? 22 : 30);
      return {x0:p, y0:p, x1:W - p, y1:H - p};
    },
    emblem(ctx, cx, cy, r, th){ guillocheRosette(ctx, cx, cy, r, O(th, {n:12, lines:7, bg:env.ink ? '#FFFFFF' : this.bg})); },
    divider(ctx, cx, y, half, th){ ornDivider(ctx, cx, y, half, O(th, {style:'diamonds', size:6, bg:env.ink ? '#FFFFFF' : this.bg})); },
    award(ctx, cx, cy, r, th){ awardBadge(ctx, cx, cy - r * 0.35, r, {color:acc(th), accent:th.primary, ink:env.ink, pleats:36, star:12}); },
    rule(ctx, x0, x1, y, th){ ctx.save(); ctx.fillStyle = env.gold ? goldH(ctx, x0, x1) : th.accent; ctx.fillRect(x0, y, x1 - x0, 1.2); ctx.fillRect(x0 + 40, y + 4, x1 - x0 - 80, 0.7); ctx.restore(); },
    tone:{title:'primary', name:'ink'}
  },
  executive:{
    id:'executive', bg:'#FFFFFF',
    fonts:fonts(F('messiri', 700), F('ruqaa', 700), F('naskh', 400), F('naskh', 700), F('sans', 600)),
    /** a coloured panel down the right edge (the start side in Arabic) with a gold pattern and medallion */
    page(ctx, W, H, th){
      const land = W > H, pw = land ? 150 : 120, px = W - pw;
      paper(ctx, W, H);
      ctx.save();
      if(env.ink){ ctx.strokeStyle = th.primary; ctx.lineWidth = 2; ctx.strokeRect(px + 1, 1, pw - 2, H - 2); }
      else { ctx.fillStyle = th.primary; ctx.fillRect(px, 0, pw, H); }
      ctx.restore();
      pattern(ctx, '4.8.8', px, 0, pw, H, {size:land ? 70 : 64, color:env.ink ? th.primary : acc(th), alpha:env.ink ? 0.25 : 0.4, lw:0.9});
      const G = env.ink ? th.primary : goldGradient(ctx, px - 14, 0, 14, H);
      ctx.save(); ctx.fillStyle = G; ctx.fillRect(px - 9, 0, 5, H); ctx.fillRect(px - 2.5, 0, 1.4, H); ctx.restore();
      const mr = pw * 0.36, my = H * (land ? 0.5 : 0.42), pbg = env.ink ? '#FFFFFF' : th.primary;
      ctx.save(); ctx.beginPath(); ctx.arc(px + pw / 2, my, mr * 1.12, 0, Math.PI * 2); ctx.fillStyle = pbg; ctx.fill(); ctx.restore();
      rosette(ctx, px + pw / 2, my, mr, 12, {layers:2, color:acc(th), accent:acc(th), bg:pbg, ink:env.ink});
      mark('~panel', px - 10, 0, pw + 10, H);
      // a fine double frame around the content side
      const m = land ? 24 : 30, fx1 = px - 9 - m * 0.6;
      watermark(ctx, (m + fx1) / 2, H / 2 + (land ? 30 : 60), land ? 280 : 400, () => {});
      ctx.save(); ctx.strokeStyle = env.ink ? th.primary : goldGradient(ctx, 0, 0, px, H);
      ctx.lineWidth = 1.6; ctx.strokeRect(m, m, fx1 - m, H - 2 * m);
      ctx.lineWidth = 0.7; ctx.strokeRect(m + 6, m + 6, fx1 - m - 12, H - 2 * m - 12);
      ctx.restore();
      const p = land ? 58 : 66;
      return {x0:p, y0:land ? 54 : 66, x1:fx1 - (land ? 26 : 30), y1:H - (land ? 54 : 66), sigInset:land ? 130 : 150};
    },
    emblem(ctx, cx, cy, r, th){ rosette(ctx, cx, cy, r, 12, O(th, {layers:2})); },
    divider(ctx, cx, y, half, th){ ornDivider(ctx, cx, y, half * 0.8, {style:'taper', size:8, color:acc(th), accent:acc(th)}); },
    award(ctx, cx, cy, r, th){ seal(ctx, cx, cy, r, {color:acc(th), accent:th.primary, scallops:40, star:12, ink:env.ink}); },
    rule(ctx, x0, x1, y, th){ ctx.save(); ctx.fillStyle = env.gold ? goldH(ctx, x0, x1) : th.accent; ctx.fillRect(x0 + 30, y, x1 - x0 - 60, 1.4); ctx.restore(); },
    tone:{title:'primary', name:'ink'}
  },
  filigree:{
    id:'filigree', bg:'#FDF9F0',
    fonts:fonts(F('ruqaa', 700), F('ruqaa', 700), F('naskh', 400), F('naskh', 700), F('sans', 600)),
    page(ctx, W, H, th){
      const land = W > H, bg = env.ink ? '#FFFFFF' : this.bg, m = land ? 24 : 30;
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const wy = H / 2 + (land ? 30 : 60);
      watermark(ctx, W / 2, wy, land ? 300 : 420, () =>
        rosette(ctx, W / 2, wy, land ? 230 : 320, 16, {layers:3, fillMode:'line', color:'#B08A3E', accent:'#B08A3E', alpha:0.09, ring:true, bg}));
      const G = env.ink ? th.primary : goldH2(ctx, W, H);
      ctx.save(); ctx.strokeStyle = G;
      ctx.lineWidth = 3; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
      ctx.lineWidth = 1; ctx.strokeRect(m + 9, m + 9, W - 2 * m - 18, H - 2 * m - 18);
      ctx.strokeStyle = th.primary; ctx.globalAlpha = 0.5; ctx.lineWidth = 0.7;
      ctx.strokeRect(m + 14, m + 14, W - 2 * m - 28, H - 2 * m - 28);
      ctx.restore();
      const fi = m + 9;
      mark('|frame', fi - 1, fi - 1, W - 2 * fi + 2, 2); mark('|frame', fi - 1, H - fi - 1, W - 2 * fi + 2, 2);
      mark('|frame', fi - 1, fi - 1, 2, H - 2 * fi + 2); mark('|frame', W - fi - 1, fi - 1, 2, H - 2 * fi + 2);
      // corner pieces sit inside the innermost rule
      const s = land ? 150 : 180, c = m + 14, o = {color:env.ink ? th.primary : 'gold', accent:th.primary, bg, ink:env.ink};
      for(const [sx, sy] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]){
        ctx.save(); ctx.translate(sx > 0 ? 0 : W, sy > 0 ? 0 : H); ctx.scale(sx, sy);
        filigreeCorner(ctx, c, c, s, o);
        ctx.restore();
        const z = s * 0.5 + c;
        mark('~corner', sx > 0 ? 0 : W - z, sy > 0 ? 0 : H - z, z, z);
      }
      const p = land ? 70 : 84;
      return {x0:p, y0:land ? 62 : 80, x1:W - p, y1:H - (land ? 62 : 80), hx0:land ? 130 : 150, hx1:W - (land ? 130 : 150), hxLogo:land ? 130 : 150, sigInset:land ? 190 : 200};
    },
    emblem(ctx, cx, cy, r, th){ rosette(ctx, cx, cy, r, 12, O(th, {layers:2, bg:env.ink ? '#FFFFFF' : this.bg})); },
    divider(ctx, cx, y, half, th){ fleuronRule(ctx, cx, y, half * 1.1, {color:th.primary, ink:env.ink}); },
    award(ctx, cx, cy, r, th){ laurelBadge(ctx, cx, cy - r * 0.2, r * 0.95, {color:th.primary, ink:env.ink}); },
    rule(ctx, x0, x1, y, th){ fleuronRule(ctx, (x0 + x1) / 2, y + 2, (x1 - x0) / 2 - 10, {color:th.primary, ink:env.ink}); },
    tone:{title:'primary', name:'primary'}
  },
  joy:{
    id:'joy', bg:'#FFFFFF',
    fonts:fonts(F('lalezar', 400), F('lalezar', 400), F('sans', 500), F('sans', 700), F('sans', 700)),
    page(ctx, W, H, th){
      const land = W > H, m = land ? 20 : 26, r = land ? 30 : 38;
      paper(ctx, W, H);
      // confetti band between the outer frame and the content
      const band = land ? 30 : 40;
      confetti(ctx, m + 8, m + 8, W - 2 * m - 16, H - 2 * m - 16, band, land ? 1 : 1.25);
      ctx.save();
      rr(ctx, m, m, W - 2 * m, H - 2 * m, r); ctx.lineWidth = land ? 7 : 9; ctx.strokeStyle = th.primary; ctx.stroke();
      const i = m + band + 6;
      rr(ctx, i, i, W - 2 * i, H - 2 * i, r * 0.7); ctx.lineWidth = 2; ctx.setLineDash([2, 9]); ctx.lineCap = 'round'; ctx.strokeStyle = JOY[0]; ctx.stroke();
      ctx.restore();
      // corner stars
      [[m + 4, m + 4], [W - m - 4, m + 4], [W - m - 4, H - m - 4], [m + 4, H - m - 4]].forEach(([x, y], k) => {
        starPoly(ctx, x, y, land ? 22 : 28, 8, 3); ctx.fillStyle = JOY[k]; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, land ? 6 : 8, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      });
      const p = i + (land ? 14 : 20);
      return {x0:p, y0:p, x1:W - p, y1:H - p};
    },
    emblem(ctx, cx, cy, r){ for(let k = 0; k < 4; k++){ starPoly(ctx, cx, cy, r * (1 - k * 0.22), 8, 3, k * Math.PI / 8); ctx.fillStyle = JOY[k]; ctx.fill(); } },
    divider(ctx, cx, y, half){
      const n = 7, step = Math.min(26, half * 2 / n);
      for(let i = 0; i < n; i++){ const x = cx + (i - (n - 1) / 2) * step; ctx.beginPath(); ctx.arc(x, y, i === 3 ? 6 : 3.6, 0, Math.PI * 2); ctx.fillStyle = JOY[i % 4]; ctx.fill(); }
    },
    award(ctx, cx, cy, r, th){ awardBadge(ctx, cx, cy - r * 0.35, r, {color:JOY[0], accent:JOY[3], ink:env.ink, pleats:22}); },
    rule(ctx, x0, x1, y){
      ctx.save(); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = JOY[1]; ctx.beginPath();
      const n = Math.max(4, Math.round((x1 - x0) / 26)), st = (x1 - x0) / n;
      ctx.moveTo(x0, y); for(let i = 0; i < n; i++) ctx.quadraticCurveTo(x0 + st * (i + 0.5), y + (i % 2 ? 5 : -5), x0 + st * (i + 1), y);
      ctx.stroke(); ctx.restore();
    },
    tone:{title:'primary', name:'joy'}
  }
};

/** Deterministic confetti (stars, dots, small diamonds) inside a band along the edges of a box. */
function confetti(ctx, x, y, w, h, band, k){
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const along = (len, fn) => { const n = Math.round(len / (34 * k)); for(let i = 0; i < n; i++) fn((i + 0.5 + (rnd() - 0.5) * 0.5) * len / n, rnd()); };
  const piece = (px, py, r) => {
    const c = JOY[Math.floor(r * 4) % 4], kind = Math.floor(r * 13) % 3, s = (4 + r * 5) * k;
    ctx.fillStyle = c;
    if(kind === 0){ starPoly(ctx, px, py, s * 1.3, 8, 3, r * 3); ctx.fill(); }
    else if(kind === 1){ ctx.beginPath(); ctx.arc(px, py, s * 0.6, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(px, py - s); ctx.lineTo(px + s * 0.6, py); ctx.lineTo(px, py + s); ctx.lineTo(px - s * 0.6, py); ctx.closePath(); ctx.fill(); }
  };
  ctx.save();
  along(w, (t, r) => { piece(x + t, y + band * (0.3 + rnd() * 0.4), r); piece(x + w - t, y + h - band * (0.3 + rnd() * 0.4), rnd()); });
  along(h - 2 * band, (t, r) => { piece(x + band * (0.3 + rnd() * 0.4), y + band + t, r); piece(x + w - band * (0.3 + rnd() * 0.4), y + band + t, rnd()); });
  ctx.restore();
}
/** Faint watermark of the uploaded school logo centred at (cx, cy), or the fallback ornament when there is none. */
function watermark(ctx, cx, cy, size, fallback){
  const img = env.logos.school, iw = img && (img.naturalWidth || img.width), ih = img && (img.naturalHeight || img.height);
  if(!iw){ fallback(); return; }
  const k = Math.min(size / iw, size / ih);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.drawImage(img, cx - iw * k / 2, cy - ih * k / 2, iw * k, ih * k); ctx.restore();
}
/** Gold for the royal frame rules (one gradient across the page). */
const goldH2 = (ctx, W, H) => goldGradient(ctx, 0, 0, W, H);
function goldH(ctx, x0, x1){
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  [[0, 'rgba(176,138,62,0)'], [0.2, '#B08A3E'], [0.5, '#E3C67A'], [0.8, '#B08A3E'], [1, 'rgba(176,138,62,0)']].forEach(([t, c]) => g.addColorStop(t, c));
  return g;
}

/** Resolved font for a role, honouring the user's heading-font override for title and name. */
export function font(skin, role){
  if(role === 'title' || role === 'name'){ const o = headingOverride(); if(o) return o; }
  return skin.fonts[role];
}
/** Colour for a role in this skin. */
export function tone(skin, role, th){
  const t = skin.tone[role] || 'ink';
  return t === 'joy' ? JOY[3] : th[t] || th.ink;
}
