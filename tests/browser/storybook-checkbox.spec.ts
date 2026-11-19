import { test, expect, expectAccessible } from './fixtures.js';

test('checkbox states are accessible and native mixed state clears on activation', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-checkbox--all-states&viewMode=story&globals=a11y.manual:!true',
  );
  const mixed = page.locator('#checkbox-indeterminate');
  await expect(mixed).toHaveJSProperty('indeterminate', true);
  await expectAccessible(page, testInfo, '#storybook-root');
  await mixed.focus();
  await page.keyboard.press('Space');
  await expect(mixed).toHaveJSProperty('indeterminate', false);
  await expect(mixed).toBeChecked();
});

// Moved from web-checkbox.spec.ts: the docs page preview omits the long,
// Spanish, and RTL fixture states, so this check now runs in Chromium only.
test('long, translated, and RTL labels reflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(
    '/iframe.html?id=components-checkbox--all-states&viewMode=story&globals=a11y.manual:!true',
  );
  for (const state of ['long-content', 'localization', 'rtl']) {
    const block = page.locator(`[data-cods-fixture-state="${state}"]`);
    expect(await block.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
  }
  const rtl = page.locator('label[for="checkbox-rtl"]');
  expect(await rtl.evaluate((el) => getComputedStyle(el).paddingRight)).toBe(
    '36px',
  );
  expect(await rtl.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe(
    '8px',
  );
});
