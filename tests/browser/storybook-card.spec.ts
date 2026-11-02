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

test('flag and icon cards show their responsive and hover states', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-card--all-states&viewMode=story');
  const icon = page.locator('[data-cods-card-fixture="icon"] .cods-card__link');
  await icon.hover();
  await expect(icon).toHaveCSS('border-top-width', '2px');
  await expect(icon.locator('.cods-card__icon')).toHaveCSS(
    'background-color',
    'rgb(217, 232, 246)',
  );
  const flag = page.locator('[data-cods-card-fixture="flag"]');
  await page.setViewportSize({ width: 1000, height: 800 });
  expect(
    (await flag.locator('.cods-card__media').boundingBox())!.x,
  ).toBeLessThan((await flag.locator('.cods-card__header').boundingBox())!.x);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    (await flag.locator('.cods-card__media').boundingBox())!.y,
  ).toBeLessThan((await flag.locator('.cods-card__header').boundingBox())!.y);
});
