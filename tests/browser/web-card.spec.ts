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
    page.getByRole('heading', { name: 'When not to use' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Default Card design in Figma' }),
  ).toHaveAttribute('href', /node-id=1624-459/);
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
  await page.mouse.move(0, 0);
  await expect(
    page.getByRole('heading', { name: 'When not to use' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Icon Card design in Figma' }),
  ).toHaveAttribute('href', /node-id=2246-770/);
  await expect(page.locator('[data-cods-card-fixture="default"]')).toHaveCount(
    0,
  );
  const icon = page.locator('[data-cods-card-fixture="icon"] .cods-card__link');
  await expect(icon).toHaveAccessibleName('Learn about TABOR refund');
  await expect(icon.locator('.cods-card__icon svg')).toHaveCSS('width', '24px');
  await expect(icon).toHaveCSS('border-top-width', '1px');
  await expect(icon).toHaveCSS('border-top-color', 'rgb(235, 236, 237)');
  const title = icon.locator('.cods-card__icon-title');
  const iconArea = icon.locator('.cods-card__icon');
  const textPosition = () =>
    title.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().x;
    });
  const before = await textPosition();
  const iconBox = await iconArea.boundingBox();
  expect(before - (iconBox!.x + iconBox!.width)).toBe(16);
  await icon.hover();
  await expect(icon).toHaveCSS('border-top-width', '2px');
  await expect(icon).toHaveCSS('border-top-color', 'rgb(217, 232, 246)');
  expect(await textPosition()).toBe(before);
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

test('a flag card responds to its container at desktop viewport width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/card-default/');
  const flag = page.locator('[data-cods-card-fixture="flag"] .cods-card');
  const media = flag.locator('.cods-card__media');
  const img = flag.locator('.cods-card__image');
  const heading = flag.locator('.cods-card__header');
  await flag.evaluate((el: HTMLElement) => {
    el.style.width = '300px';
  });
  expect((await media.boundingBox())!.y).toBeLessThan(
    (await heading.boundingBox())!.y,
  );
  expect((await heading.boundingBox())!.width).toBeGreaterThan(250);
  await flag.evaluate((el: HTMLElement) => {
    el.style.width = '460px';
  });
  const mediaBox = (await media.boundingBox())!;
  const imageBox = (await img.boundingBox())!;
  expect(mediaBox.x).toBeLessThan((await heading.boundingBox())!.x);
  expect(imageBox.width).toBeCloseTo(mediaBox.width, 0);
  expect(imageBox.height).toBeCloseTo(mediaBox.height, 0);
  expect(imageBox.height).toBeGreaterThan(0);
});

test('cards with individual links do not show whole-card hover', async ({
  page,
}) => {
  await page.goto('/card-default/');
  const unlinked = page.locator(
    '[data-cods-card-fixture="internal-links"] .cods-card__container',
  );
  await expect(unlinked).toHaveCSS('border-top-width', '1px');
  await unlinked.getByRole('link', { name: 'application guide' }).hover();
  await expect(unlinked).toHaveCSS('border-top-width', '1px');
  await expect(unlinked).toHaveCSS('border-top-color', 'rgb(235, 236, 237)');
});
