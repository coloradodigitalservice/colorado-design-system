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

test('separate card guides show their own variants and accessible destinations', async ({
  page,
}) => {
  await page.goto('/card-default/');
  await expect(
    page.locator('[data-cods-card-fixture="default"]'),
  ).toBeVisible();
  await expect(page.locator('[data-cods-card-fixture="icon"]')).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Explore Colorado', exact: true }).last(),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Visit USA.gov.*external site/ }),
  ).toBeVisible();

  const card = page.locator(
    '[data-cods-card-fixture="default"] .cods-card__container',
  );
  await expect(card).toHaveCSS('border-top-width', '1px');
  await expect(card).toHaveCSS('border-top-color', 'rgb(235, 236, 237)');
  await card.hover();
  await expect(card).toHaveCSS('border-top-width', '2px');
  await expect(card).toHaveCSS('border-top-color', 'rgb(217, 232, 246)');

  await page.goto('/card-icon/');
  await expect(page.locator('[data-cods-card-fixture="default"]')).toHaveCount(
    0,
  );
  const icon = page.locator('[data-cods-card-fixture="icon"] .cods-card__link');
  await expect(icon).toHaveAccessibleName('Learn about TABOR refund');
  await expect(icon.locator('.cods-card__icon svg')).toHaveCSS('width', '24px');
  await icon.hover();
  await expect(icon).toHaveCSS('border-top-width', '2px');
  await expect(icon.locator('.cods-card__icon')).toHaveCSS(
    'background-color',
    'rgb(217, 232, 246)',
  );
  await expect(
    page.getByRole('link', { name: /Visit USA.gov.*external site/ }),
  ).toBeVisible();
});

test('flag card changes from side-by-side to stacked', async ({ page }) => {
  await page.goto('/card-default/');
  const flag = page.locator('[data-cods-card-fixture="flag"]');
  const media = flag.locator('.cods-card__media');
  const heading = flag.locator('.cods-card__header');
  await page.setViewportSize({ width: 1200, height: 900 });
  expect((await media.boundingBox())!.x).toBeLessThan(
    (await heading.boundingBox())!.x,
  );
  await page.setViewportSize({ width: 320, height: 900 });
  expect((await media.boundingBox())!.y).toBeLessThan(
    (await heading.boundingBox())!.y,
  );
});
