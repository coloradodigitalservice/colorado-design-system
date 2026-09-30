import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  use: { browserName: 'chromium', trace: 'retain-on-failure' },
  reporter: 'list',
  webServer: [
    {
      command:
        'pnpm exec vite preview --outDir apps/web/dist --host 127.0.0.1 --port 4321',
      url: 'http://127.0.0.1:4321',
      reuseExistingServer: false,
    },
    {
      command:
        'pnpm exec vite preview --outDir apps/storybook/storybook-static --host 127.0.0.1 --port 6006',
      url: 'http://127.0.0.1:6006',
      reuseExistingServer: false,
    },
  ].filter(
    (server) =>
      !process.env.CODS_BROWSER_TARGET ||
      server.url.includes(
        process.env.CODS_BROWSER_TARGET === 'web' ? ':4321' : ':6006',
      ),
  ),
  projects: [
    {
      name: 'web',
      testMatch: 'web.spec.ts',
      use: { baseURL: 'http://127.0.0.1:4321' },
    },
    {
      name: 'storybook',
      testMatch: 'storybook.spec.ts',
      use: { baseURL: 'http://127.0.0.1:6006' },
    },
  ],
});
