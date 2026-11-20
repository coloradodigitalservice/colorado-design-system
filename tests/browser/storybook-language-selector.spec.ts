// The docs page shows only the LTR states; its spec covers keyboard, focus,
// forced colors, and no-JS in all three browsers. The RTL case is not on the
// page, so it runs here in Chromium only.
import { test, expect } from './fixtures.js';

const story =
  '/iframe.html?id=components-language-selector--all-states&viewMode=story&globals=a11y.manual:!true';

test('menu stays within a narrow RTL viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(story);
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
  });
  const root = page.locator('[data-cods-fixture-state="multiple-languages"]');
  await root.getByRole('button', { name: 'Languages' }).click();
  const box = await root
    .locator('[data-cods-language-selector-panel]')
    .evaluate((element) => {
      const { left, right } = element.getBoundingClientRect();
      return { left, right, width: document.documentElement.clientWidth };
    });
  expect(box.left).toBeGreaterThanOrEqual(0);
  expect(box.right).toBeLessThanOrEqual(box.width);
});
