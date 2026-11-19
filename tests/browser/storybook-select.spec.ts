// States the docs preview does not show (long content, Spanish, RTL). These
// run in Chromium only; engine-sensitive checks for the previewed states are in
// web-select.spec.ts.
import { test, expect, expectAccessible } from './fixtures.js';

test('Storybook Select states pass axe, reflow at 320px, and mirror for RTL', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(
    '/iframe.html?id=components-select--all-states&viewMode=story&globals=a11y.manual:!true',
  );
  const root = page.locator('#storybook-root');
  await expect(root.getByRole('combobox')).toHaveCount(9);
  await expectAccessible(page, testInfo, '#storybook-root');
  const overflow = await root
    .locator('.cods-select')
    .evaluateAll((groups) =>
      groups.some(
        (group) =>
          group.scrollWidth > Math.ceil(group.getBoundingClientRect().width),
      ),
    );
  expect(overflow).toBe(false);
  const rtl = root.locator('#select-rtl');
  await expect(rtl).toHaveCSS('direction', 'rtl');
  expect(
    await rtl.evaluate((el) => getComputedStyle(el).backgroundPosition),
  ).toContain('8px');
});
