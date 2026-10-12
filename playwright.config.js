import { defineConfig, devices } from '@playwright/test';

// Run `npm run build` first: tests load the built dist/ (and legacy/v1.html for parity).
export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',
  timeout: 120_000,
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  expect: { toMatchSnapshot: { maxDiffPixelRatio: 0.002 } },
  use: {
    baseURL: 'http://localhost:4321',
    ...devices['Desktop Chrome'],
    locale: 'ar-OM',
    timezoneId: 'Asia/Muscat',
    deviceScaleFactor: 1
  },
  webServer: {
    command: 'node tests/server.mjs',
    url: 'http://localhost:4321/package.json',
    reuseExistingServer: true
  }
});
