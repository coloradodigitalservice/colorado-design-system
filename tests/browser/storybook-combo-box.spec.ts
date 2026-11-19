// Combo Box Storybook checks. Enhanced behavior for every fixture state runs
// on the documentation page in web-combo-box.spec.ts (three browsers); this
// file keeps the no-JavaScript native fallback, which has its own story.
import { test, expect, expectAccessible } from './fixtures.js';

test('native select fallback works without JavaScript', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-combo-box--without-java-script&viewMode=story&globals=a11y.manual:!true',
  );
  await expect(
    page.locator('[data-cods-combo-box][data-enhanced]'),
  ).toHaveCount(0);
  const select = page.locator('[data-cods-fixture-state="default"] select');
  await select.selectOption('2025');
  await expect(select).toHaveValue('2025');
  await expectAccessible(page, testInfo, '#storybook-root');
});
