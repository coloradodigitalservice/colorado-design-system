import { test, expect, expectAccessible } from './fixtures.js';

test('cards expose links without nested controls', async ({
  page,
}, testInfo) => {
  await page.goto('/iframe.html?id=components-card--all-states&viewMode=story');
  const card = page.locator(
    '[data-cods-card-fixture="default"] .cods-card__link',
  );
  await expect(card).toHaveAccessibleName(/Find Colorado services/);
  await card.focus();
  await expect(card).toBeFocused();
  await expect(
    page.locator('.cods-card__link a, .cods-card__link button'),
  ).toHaveCount(0);
  await expect(
    page.locator('[data-cods-card-fixture="internal-links"] a'),
  ).toHaveCount(2);
  await expectAccessible(page, testInfo);
});
