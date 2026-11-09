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
