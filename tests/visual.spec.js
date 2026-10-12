// Reference snapshots of every template × theme and the stress cases, from the v2 build.
// Update deliberately with `npm run test:update` after a reviewed visual change.
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { CASES } from './cases.js';
import { openV2, renderCase, pngBuffer } from './helpers.js';

const OUT = 'tests/__output__/render';
mkdirSync(OUT, {recursive:true});

for(const c of CASES){
  test(`render ${c.name}`, async ({page}) => {
    const errors = await openV2(page);
    const r = await renderCase(page, c);
    const png = pngBuffer(r.url);
    writeFileSync(`${OUT}/${c.name}.png`, png);
    if(c.over !== undefined) expect(r.over, 'overflow warning').toBe(c.over);
    expect(png).toMatchSnapshot(`${c.name}.png`);
    expect(errors).toEqual([]);
  });
}
