import { test, expect, expectAccessible } from './fixtures.js';

test('long trail keeps every ancestor visible at narrow widths', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(
    '/iframe.html?id=components-breadcrumbs--long-content&viewMode=story&globals=a11y.manual:!true',
  );
  const nav = page.getByRole('navigation', { name: 'Long trail' });
  await expect(nav.getByRole('link')).toHaveCount(5);
  for (const link of await nav.getByRole('link').all())
    await expect(link).toBeVisible();
  await expect(nav.locator('[aria-current="page"]')).toBeVisible();
  expect(await nav.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await expectAccessible(page, testInfo, '#storybook-root');
});
