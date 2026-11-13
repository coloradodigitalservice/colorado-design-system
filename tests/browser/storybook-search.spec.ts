import { test, expect, expectAccessible } from './fixtures.js';

test('search stories show all named forms', async ({ page }, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-search--all-states&viewMode=story&globals=a11y.manual:!true',
  );
  const forms = page.getByRole('search');
  await expect(forms).toHaveCount(3);
  await expect(
    forms.nth(2).getByRole('button', { name: 'Search' }),
  ).toBeVisible();
  await expectAccessible(page, testInfo, 'body');
});

test('combined search examples leave room for focus outlines', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=components-search--all-states&viewMode=story',
  );
  const forms = page.locator('.cods-search-story-examples > section');
  const previous = await forms.nth(1).boundingBox();
  const next = await forms.nth(2).boundingBox();
  expect(next!.y - (previous!.y + previous!.height)).toBeGreaterThanOrEqual(8);
});
