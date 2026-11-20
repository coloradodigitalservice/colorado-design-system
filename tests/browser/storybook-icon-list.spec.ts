// The right-to-left state is not on the public docs page, so its layout runs
// here (Chromium only). Preview states run in all browsers in web-icon-list.
import { test } from './fixtures.js';
import { expectIconListLayout } from './icon-list-checks.js';

test('right-to-left icon lists mirror the icon gap', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=components-icon-list--right-to-left&viewMode=story&globals=a11y.manual:!true',
  );
  await expectIconListLayout(page, [
    page.locator('[data-cods-fixture-state="rtl"] ul'),
  ]);
});
