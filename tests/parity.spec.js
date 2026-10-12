// Phase 1 gate: the modular v2 build must render every case like legacy v1 (pixel diff + same overflow flag).
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { CASES } from './cases.js';
import { openV1, openV2, renderCase, pngBuffer } from './helpers.js';

const OUT = 'tests/__output__/parity';
mkdirSync(OUT, {recursive:true});

for(const c of CASES){
  test(`parity ${c.name}`, async ({browser}) => {
    const p1 = await (await browser.newContext()).newPage();
    const p2 = await (await browser.newContext()).newPage();
    await openV1(p1);
    const errors = await openV2(p2);
    const [a, b] = await Promise.all([renderCase(p1, c), renderCase(p2, c)]);
    const A = PNG.sync.read(pngBuffer(a.url)), B = PNG.sync.read(pngBuffer(b.url));
    expect([B.width, B.height]).toEqual([A.width, A.height]);
    const diff = new PNG({width:A.width, height:A.height});
    const n = pixelmatch(A.data, B.data, diff.data, A.width, A.height, {threshold:0.1});
    const ratio = n / (A.width * A.height);
    if(n){
      writeFileSync(`${OUT}/${c.name}.v1.png`, pngBuffer(a.url));
      writeFileSync(`${OUT}/${c.name}.v2.png`, pngBuffer(b.url));
      writeFileSync(`${OUT}/${c.name}.diff.png`, PNG.sync.write(diff));
    }
    test.info().annotations.push({type:'diff', description:`${n} px (${(ratio * 100).toFixed(4)}%)`});
    expect(b.over, 'overflow flag matches v1').toBe(a.over);
    expect(ratio, `pixel diff vs v1: ${n} px`).toBeLessThan(0.001);
    expect(errors).toEqual([]);
  });
}
