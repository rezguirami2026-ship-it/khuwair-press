/* Ornament gallery entries: [id, label, aspect (w/h), draw(ctx, W, H, o)]. Used by gallery.html and the tests. */
import { star, interlacedStar, solomonSeal, khatam, rosette, medallion } from './stars.js';
import { pattern } from './patterns.js';
import { frame, fineFrame, FRAME_MOTIFS } from './frames.js';
import { crenellation, archFrame, omaniDoor } from './oman.js';
import { ornDivider, seal, ribbon, awardBadge } from './awards.js';

const C = (W, H) => [W / 2, H / 2, Math.min(W, H) * 0.42];
const accentOf = o => o.accent;

export const CATALOG = [
  {group:'النجوم والأطباق النجمية', items:[
    ['star8', 'نجمة ٨ رؤوس', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); star(c, x, y, r, 8, 3, Object.assign({}, o, {outline:true, lw:2 * o.lw})); star(c, x, y, r * 0.5, 8, 2, o); }],
    ['rosette8', 'طبق نجمي ٨', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); rosette(c, x, y, r, 8, Object.assign({}, o, {layers:2})); }],
    ['rosette10', 'طبق نجمي ١٠', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); rosette(c, x, y, r, 10, Object.assign({}, o, {layers:2})); }],
    ['rosette12', 'طبق نجمي ١٢', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); rosette(c, x, y, r, 12, Object.assign({}, o, {layers:3, fillMode:'line'})); }],
    ['rosette16', 'طبق نجمي ١٦', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); rosette(c, x, y, r, 16, Object.assign({}, o, {layers:3})); }],
    ['medallion12', 'وردة خطية ١٢', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); medallion(c, x, y, r, 12, o); }],
    ['medallion16', 'وردة خطية ١٦', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); medallion(c, x, y, r, 16, o); }],
    ['solomon', 'خاتم سليمان', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); solomonSeal(c, x, y, r, o); }],
    ['khatam', 'الخاتم المضفور', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); khatam(c, x, y, r, o); }],
    ['weave10', 'نجمة ١٠ مضفورة', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); interlacedStar(c, x, y, r, 10, 3, o); }]
  ]},
  {group:'الخلفيات الهندسية', items:[
    ['bg-khatam', 'خاتم ثماني (4.8.8)', 1.4, (c, W, H, o) => pattern(c, '4.8.8', 0, 0, W, H, Object.assign({size:120}, o))],
    ['bg-girih', 'جيرة ١٢ (3.12.12)', 1.4, (c, W, H, o) => pattern(c, '3.12.12', 0, 0, W, H, Object.assign({size:200}, o))],
    ['bg-hex', 'سداسي', 1.4, (c, W, H, o) => pattern(c, 'hex', 0, 0, W, H, Object.assign({size:110}, o))],
    ['bg-square', 'شبكة رباعية', 1.4, (c, W, H, o) => pattern(c, 'square', 0, 0, W, H, Object.assign({size:70}, o))],
    ['bg-starcross', 'نجمة وصليب', 1.4, (c, W, H, o) => pattern(c, 'star-cross', 0, 0, W, H, Object.assign({size:80}, o))],
    ['bg-band', 'شريط مضفور (4.8.8)', 1.4, (c, W, H, o) => pattern(c, '4.8.8', 0, 0, W, H, Object.assign({size:140, band:7}, o))]
  ]},
  {group:'أشرطة الإطار', items:[
    ...FRAME_MOTIFS.map((m, i) => [`frame-${m}`, 'إطار: ' + ({khatam:'خاتم', interlace:'ضفيرة', merlons:'شُرَف', arcade:'أقواس', studs:'مسامير الباب', pearls:'لآلئ', steps:'درجات'}[m] || m), 1.4,
      (c, W, H, o) => frame(c, 14, 14, W - 28, H - 28, Object.assign({}, o, {band:Math.min(W, H) * 0.12, motif:m, corner:['rosette', 'khatam', 'stepped', 'star', 'block', 'star', 'stepped'][i] || 'rosette'}))]),
    ['frame-fine', 'إطار عصري دقيق', 1.4, (c, W, H, o) => fineFrame(c, 16, 16, W - 32, H - 32, Object.assign({}, o, {notch:34, gap:9}))]
  ]},
  {group:'العمارة العُمانية', items:[
    ['crenel', 'شُرَف القلاع', 2.4, (c, W, H, o) => crenellation(c, 10, H * 0.25, W - 20, H * 0.55, o)],
    ['arch-pointed', 'قوس مدبّب', 0.75, (c, W, H, o) => archFrame(c, W * 0.15, H * 0.12, W * 0.7, H * 0.8, Object.assign({}, o, {kind:'pointed'}))],
    ['arch-scalloped', 'قوس مفصّص', 0.75, (c, W, H, o) => archFrame(c, W * 0.15, H * 0.12, W * 0.7, H * 0.8, Object.assign({}, o, {kind:'scalloped'}))],
    ['arch-ogee', 'قوس منحني', 0.75, (c, W, H, o) => archFrame(c, W * 0.15, H * 0.12, W * 0.7, H * 0.8, Object.assign({}, o, {kind:'ogee'}))],
    ['door', 'الباب العُماني', 0.62, (c, W, H, o) => omaniDoor(c, W * 0.14, H * 0.05, W * 0.72, H * 0.9, Object.assign({}, o, {accent:o.color === 'gold' ? 'gold' : '#C9A24A', studColor:'gold'}))]
  ]},
  {group:'عناصر الشهادات', items:[
    ['dividers', 'الفواصل', 2.4, (c, W, H, o) => ['taper', 'star', 'rosette', 'diamonds', 'knot'].forEach((s, i) => ornDivider(c, W / 2, H * (0.12 + i * 0.19), W * 0.4, Object.assign({}, o, {style:s, size:H * 0.045})))],
    ['seal', 'ختم دائري', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); seal(c, x, y, r, o); }],
    ['seal-label', 'ختم بمساحة نص', 1, (c, W, H, o) => { const [x, y, r] = C(W, H); seal(c, x, y, r, Object.assign({}, o, {label:true})); }],
    ['ribbon', 'شريط العنوان', 2.4, (c, W, H, o) => ribbon(c, W / 2, H / 2, W * 0.58, H * 0.3, o)],
    ['badge', 'شارة التكريم', 0.8, (c, W, H, o) => awardBadge(c, W / 2, H * 0.36, Math.min(W, H) * 0.3, Object.assign({}, o, {color:o.gold ? 'gold' : o.accent, accent:o.color === 'gold' ? '#7A1F2B' : o.color}))]
  ]}
];
export { accentOf };
