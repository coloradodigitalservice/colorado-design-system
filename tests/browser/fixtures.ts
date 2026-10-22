import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test as base, expect } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { routeBuiltFiles } from './built-files.js';

export const test = base.extend<{ consoleErrors: void }>({
  launchOptions: [
    async ({ browserName, launchOptions }, use) => {
      if (process.platform !== 'darwin' || browserName !== 'firefox') {
        await use(launchOptions);
        return;
      }
      // Firefox 157 still looks up the real Firefox app-data directory on macOS
      // 27, where TCC can deny access even with a fresh Playwright profile.
      // https://github.com/microsoft/playwright/issues/42768
      const firefoxDataHome = await mkdtemp(
        join(tmpdir(), 'cods-firefox-data-'),
      );
      try {
        // Pre-create standard home folders so macOS does not add deny-delete
        // ACLs when native file dialogs and services first resolve them.
        await Promise.all(
          [
            'Library/Application Support',
            'Library/Caches',
            'Desktop',
            'Documents',
            'Downloads',
            'Movies',
            'Music',
            'Pictures',
            'Public',
          ].map((directory) =>
            mkdir(join(firefoxDataHome, directory), { recursive: true }),
          ),
        );
        await use({
          ...launchOptions,
          env: {
            ...process.env,
            ...launchOptions.env,
            CFFIXED_USER_HOME: firefoxDataHome,
          },
        });
      } finally {
        // Browser teardown runs first; native helpers can still finish writes.
        await rm(firefoxDataHome, {
          recursive: true,
          force: true,
          maxRetries: 5,
          retryDelay: 100,
        });
      }
    },
    { scope: 'worker' },
  ],
  consoleErrors: [
    async ({ page }, use, testInfo) => {
      if (process.env.CODS_BUILT_FILES === '1')
        await routeBuiltFiles(
          page,
          testInfo.project.name === 'storybook' ? 'storybook' : 'web',
        );
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      await use();
      if (errors.length) {
        await testInfo.attach('browser-errors', {
          body: errors.join('\n'),
          contentType: 'text/plain',
        });
      }
      expect(errors, 'Browser console errors and uncaught exceptions').toEqual(
        [],
      );
    },
    { auto: true },
  ],
});

export { expect };

export async function expectAccessible(
  page: Page,
  testInfo: TestInfo,
  include?: string,
) {
  const builder = new AxeBuilder({ page }).withTags([
    'wcag2a',
    'wcag2aa',
    'wcag21aa',
    'wcag22aa',
  ]);
  if (include) builder.include(include);
  const results = await builder.analyze();
  await testInfo.attach('axe-results', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });
  const violations = results.violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      failureSummary: node.failureSummary,
    })),
  }));
  expect(violations, `Accessibility violations at ${page.url()}`).toEqual([]);
}
