import { test, expect, expectAccessible } from './fixtures.js';

test('Tags story renders each variant with accessible text', async ({
  page,
}, testInfo) => {
  await page.goto('/iframe.html?id=components-tags--all-states&viewMode=story');
  const tags = page.locator('#storybook-root .cods-tags');
  await expect(tags).toHaveCount(9);
  for (const tag of await tags.all()) await expect(tag).not.toHaveText('');
  await expectAccessible(page, testInfo, '#storybook-root');
});
