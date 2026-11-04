import { test, expect, expectAccessible } from './fixtures.js';

test('Process List stories render their canonical examples', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-process-list--all-states&viewMode=story',
  );
  await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(7);
  await expect(
    page.locator('[data-cods-fixture-state="long-content"] ol > li'),
  ).toHaveCount(6);
  await expect(
    page.locator('[data-cods-fixture-state="with-alert"] .cods-in-page-alert'),
  ).toHaveCount(1);
  await page.waitForLoadState('networkidle');
  await expectAccessible(page, testInfo, '#storybook-root');
});
