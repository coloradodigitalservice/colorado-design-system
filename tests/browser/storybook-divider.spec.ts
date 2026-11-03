import { test, expect, expectAccessible } from './fixtures.js';

test('storybook renders both divider variants', async ({ page }, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-divider--all-states&viewMode=story',
  );
  const root = page.locator('#storybook-root');
  await expect(root.locator('.cods-divider')).toHaveCount(2);
  await expect(root.getByRole('separator')).toHaveCount(1);
  await expect(
    root.locator('.cods-divider--item .cods-divider'),
  ).toHaveAttribute('aria-hidden', 'true');
  await expectAccessible(page, testInfo, '#storybook-root');
});
