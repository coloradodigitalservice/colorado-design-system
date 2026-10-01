import { defineConfig } from '@playwright/test';

const servers = {
  web: {
    name: 'web',
    command:
      'pnpm exec vite preview --config config/vite.preview.ts --outDir apps/web/dist --host 127.0.0.1 --port 4321 --strictPort',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: false,
    timeout: 60_000,
  },
  storybook: {
    name: 'storybook',
    command:
      'pnpm exec vite preview --config config/vite.preview.ts --outDir apps/storybook/storybook-static --host 127.0.0.1 --port 6006 --strictPort',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: false,
    timeout: 60_000,
  },
};
const target = process.env.CODS_BROWSER_TARGET;
if (target !== undefined && target !== 'web' && target !== 'storybook') {
  throw new Error('CODS_BROWSER_TARGET must be web or storybook');
}

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: { animations: 'disabled', maxDiffPixels: 0 },
  },
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : 2,
  outputDir: 'test-results',
  snapshotPathTemplate:
    '{testDir}/__screenshots__/{testFilePath}/{projectName}-{platform}/{arg}{ext}',
  use: {
    browserName: 'chromium',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezoneId: 'America/Denver',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  reporter: [[process.env.CI ? 'github' : 'list'], ['html', { open: 'never' }]],
  webServer: target ? [servers[target]] : Object.values(servers),
  projects: [
    ...(['chromium', 'firefox', 'webkit'] as const).map((browserName) => ({
      name: browserName === 'chromium' ? 'web' : `web-${browserName}`,
      testMatch: '**/web*.spec.ts',
      use: { browserName, baseURL: servers.web.url },
    })),
    {
      name: 'storybook',
      testMatch: '**/storybook*.spec.ts',
      use: { baseURL: servers.storybook.url },
    },
  ].filter((project) => !target || project.name.startsWith(target)),
});
