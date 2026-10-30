import { test, expect, expectAccessible } from './fixtures.js';

test('long trail shows its immediate parent at narrow widths', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(
    '/iframe.html?id=components-breadcrumbs--long-content&viewMode=story&globals=a11y.manual:!true',
  );
  const nav = page.getByRole('navigation', { name: 'Long trail' });
  await expect(nav.getByRole('link')).toHaveCount(1);
  await expect(nav.getByRole('link')).toHaveAccessibleName(
    'Previous level: DocumentationForAnUnusuallyLongUnbrokenServiceName',
  );
  await expect(nav.locator('[aria-current="page"]')).toBeHidden();
  expect(await nav.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await expectAccessible(page, testInfo, '#storybook-root');
});
