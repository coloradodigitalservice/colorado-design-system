import { test as base, expect } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

export const test = base.extend<{ consoleErrors: void }>({
  consoleErrors: [
    async ({ page }, use, testInfo) => {
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
