import { test, expect, expectAccessible } from './fixtures.js';

test('video stories expose native and embedded players', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-videos--all-states&viewMode=story',
  );
  await expect(page.locator('video')).toHaveCount(2);
  await expect(page.locator('iframe[title]')).toHaveCount(1);
  await expectAccessible(page, testInfo, 'body');
});
