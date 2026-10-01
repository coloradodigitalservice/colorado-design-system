import { defineConfig } from '@playwright/test';

const servers = {
  web: {
    name: 'web',
    command:
      'pnpm exec vite preview --config config/vite.preview.ts --outDir apps/web/dist --host 127.0.0.1 --port 4321 --strictPort',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: false,
  },
  storybook: {
    name: 'storybook',
    command:
      'pnpm exec vite preview --config config/vite.preview.ts --outDir apps/storybook/storybook-static --host 127.0.0.1 --port 6006 --strictPort',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: false,
  },
};
const target = process.env.CODS_BROWSER_TARGET;
if (target !== undefined && target !== 'web' && target !== 'storybook') {
  throw new Error('CODS_BROWSER_TARGET must be web or storybook');
}

export default defineConfig({
  testDir: './tests/browser',
  use: { browserName: 'chromium', trace: 'retain-on-failure' },
  reporter: 'list',
  webServer: target ? [servers[target]] : Object.values(servers),
  projects: [
    {
      name: 'web',
      testMatch: 'web.spec.ts',
      use: { baseURL: servers.web.url },
    },
    {
      name: 'storybook',
      testMatch: 'storybook.spec.ts',
      use: { baseURL: servers.storybook.url },
    },
  ].filter((project) => !target || project.name === target),
});
