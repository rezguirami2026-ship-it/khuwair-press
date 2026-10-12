// The four new identities: layout guarantees + reference snapshots.
//  - no two drawn elements overlap
//  - every text/element stays inside the 10 mm safe margin
//  - the overflow warning appears only for content that cannot fit
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { NEW_CASES } from './cases.js';
import { openV2, renderCase, pngBuffer, overlaps } from './helpers.js';

const OUT = 'tests/__output__/new';
mkdirSync(OUT, {recursive:true});

for(const c of NEW_CASES){
  test(`template ${c.name}`, async ({page}) => {
    const errors = await openV2(page);
    const r = await renderCase(page, c, 1000, true);
    const png = pngBuffer(r.url);
    writeFileSync(`${OUT}/${c.name}.png`, png);
    expect(r.over, 'overflow warning').toBe(c.over);
    if(!c.over){
      expect(overlaps(r.boxes), 'overlapping elements').toEqual([]);
      const W = 1000, H = c.type === 'cert' ? 707 : 1414, m = c.type === 'cert' ? 34 : 48;
      const outside = r.boxes.filter(b => !b.name.startsWith('~') && !b.name.startsWith('|')).filter(b => b.x < m - 0.5 || b.y < m - 0.5 || b.x + b.w > W - m + 0.5 || b.y + b.h > H - m + 0.5).map(b => `${b.name}@${b.x.toFixed(0)},${b.y.toFixed(0)}`);
      expect(outside, 'outside the 10 mm safe margin').toEqual([]);
    }
    expect(png).toMatchSnapshot(`${c.name}.png`, {maxDiffPixelRatio:0.003});
    expect(errors).toEqual([]);
  });
}
