// Every Tags fixture state, including the long right-to-left label and the
// in-context heading that the docs page doesn't preview.
import { test, expect, expectAccessible } from './fixtures.js';

test('every tag state fits at 320px without clipping', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/iframe.html?id=components-tags--all-states&viewMode=story');
  const tags = page.locator('#storybook-root .cods-tags');
  await expect(tags).toHaveCount(9);
  for (const tag of await tags.all())
    expect(
      await tag.evaluate(
        (el) =>
          el.scrollWidth <= el.clientWidth &&
          el.getBoundingClientRect().right <= innerWidth,
      ),
    ).toBe(true);
  await expectAccessible(page, testInfo, '#storybook-root');
});
