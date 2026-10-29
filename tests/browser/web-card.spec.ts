import { test, expect, expectAccessible } from './fixtures.js';

test('card links and responsive grid work on the documentation page', async ({
  page,
  browserName,
}, testInfo) => {
  await page.goto('/card/');
  const multi = page.locator('[data-cods-card-fixture="internal-links"]');
  const first = multi.getByRole('link', { name: 'application guide' });
  const second = multi.getByRole('link', { name: 'Get application help' });
  await first.focus();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(second).toBeFocused();
  await expect(
    page.locator('.cods-card__link a, .cods-card__link button'),
  ).toHaveCount(0);
  const mediaCard = page.locator(
    '[data-cods-card-fixture="with-media"] .cods-card__link',
  );
  const heading = mediaCard.locator('.cods-card__header');
  const media = mediaCard.locator('.cods-card__media');
  expect(
    await heading.evaluate((el) =>
      el.nextElementSibling?.classList.contains('cods-card__media'),
    ),
  ).toBe(true);
  expect((await media.boundingBox())!.y).toBeLessThan(
    (await heading.boundingBox())!.y,
  );
  await expectAccessible(page, testInfo);

  const grid = page.locator('[data-cods-card-fixture="grid"] .cods-card');
  await page.setViewportSize({ width: 320, height: 800 });
  const boxes = await grid.evaluateAll((items) =>
    items.map((item) => item.getBoundingClientRect().toJSON()),
  );
  expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
