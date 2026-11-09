import { fileURLToPath } from 'node:url';
import config from '../playwright.config.js';

// Verify compiled assets through request routing; no local server is started.
export default {
  ...config,
  testDir: fileURLToPath(new URL('../tests/browser', import.meta.url)),
  outputDir: fileURLToPath(new URL('../test-results', import.meta.url)),
  webServer: undefined,
  projects: config.projects?.map((project) => ({
    ...project,
    testMatch:
      project.name === 'storybook'
        ? '**/storybook-site-alert.spec.ts'
        : '**/web-site-alert.spec.ts',
  })),
};
