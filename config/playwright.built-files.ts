import { fileURLToPath } from 'node:url';
import config from '../playwright.config.js';

// Exercise the same compiled pages and assets without starting preview servers.
process.env.CODS_BUILT_FILES = '1';
export default {
  ...config,
  testDir: fileURLToPath(new URL('../tests/browser', import.meta.url)),
  outputDir: fileURLToPath(new URL('../test-results', import.meta.url)),
  webServer: undefined,
};
