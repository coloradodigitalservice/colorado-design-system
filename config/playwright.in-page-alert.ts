import { fileURLToPath } from 'node:url';
import config from '../playwright.config.js';

// These specs route built files directly, so verification starts no server.
export default {
  ...config,
  testDir: fileURLToPath(new URL('../tests/browser', import.meta.url)),
  outputDir: fileURLToPath(new URL('../test-results', import.meta.url)),
  webServer: undefined,
  projects: config.projects?.map((project) => ({
    ...project,
    testMatch:
      project.name === 'storybook'
        ? '**/storybook-in-page-alert.spec.ts'
        : '**/web-in-page-alert.spec.ts',
  })),
};
