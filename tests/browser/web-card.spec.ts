// Card documentation pages. /card-default/ and /card-icon/ follow the Figma
// Default Card and Icon Card frames; engine-sensitive behavior for the previewed
// states runs here in all three browsers. Long content and RTL states are
// covered in storybook-card.spec.ts.
import { test, expect, expectAccessible } from './fixtures.js';

const preview = (name: string) => `[data-cods-docs-preview-state="${name}"]`;

const pages = [
  {
    path: '/card-default/',
    figma: 'node-id=1624-459',
    subheadings: [
      'When to use',
      'Accessibility for default cards',
      'Variants and elements',
      'Setup and limitations',
    ],
    states: [
      'default',
      'with-media',
      'flag',
      'media-only',
      'internal-links',
      'default-external',
      'grid',
    ],
    codeClass: 'cods-card--flag',
    absentClass: 'cods-card--icon',
  },
  {
    path: '/card-icon/',
    figma: 'node-id=2246-770',
    subheadings: [
      'When to use',
      'Accessibility for icon cards',
      'Variants and elements',
      'Adding icons',
      'Setup and limitations',
    ],
    states: ['icon', 'icon-external'],
    codeClass: 'cods-card--icon',
    absentClass: 'cods-card--flag',
  },
];

for (const card of pages)
  test(`${card.path} follows the component page outline`, async ({
    page,
  }, testInfo) => {
    await page.goto(card.path);
    const main = page.locator('main');
    expect(await main.locator('h2').allTextContents()).toEqual([
      'Component preview',
      'Component code',
      'Component status',
      'Guidance',
      'Specifications',
    ]);
    expect(
      await main.locator('.cods-docs-content > h3').allTextContents(),
    ).toEqual(card.subheadings);
    expect(
      await page
        .locator('[data-cods-docs-preview-state]')
        .evaluateAll((figures) =>
          figures.map((figure) =>
            figure.getAttribute('data-cods-docs-preview-state'),
          ),
        ),
    ).toEqual(card.states);
    const code = page.locator('[data-cods-docs-preview-code]');
    await expect(code).toContainText(card.codeClass);
    await expect(code).not.toContainText(card.absentClass);

    const status = page.locator('[data-cods-docs-status]');
    await expect(status).toContainText('Card maturity is experimental');
    await expect(status).toContainText(
      'Manual accessibility review is pending',
    );
    await expect(
      status.getByRole('link', { name: 'USWDS 3.14.0 Card' }),
    ).toBeVisible();
    await expect(
      status.getByRole('link', { name: 'Accessibility evidence' }),
    ).toHaveAttribute('href', /\/card\/accessibility\/card\.evidence\.md$/);
    const figmaLinks = main.locator('a[href*="figma.com"]');
    expect(await figmaLinks.count()).toBeGreaterThan(0);
    for (const link of await figmaLinks.all())
      await expect(link).toHaveAttribute('href', new RegExp(card.figma));

    // The public page omits localization guidance and the examples catalogue.
    await expect(main).not.toContainText(/right-to-left|localization/i);
    await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(0);
    await expectAccessible(page, testInfo);
  });

test('the card pages link to each other', async ({ page }) => {
  await page.goto('/card-default/');
  await page
    .locator('main')
    .getByRole('link', { name: 'Icon Card', exact: true })
    .click();
  await expect(page).toHaveURL(/\/card-icon\/$/);
  await page
    .locator('main')
    .getByRole('link', { name: 'Default Card', exact: true })
    .click();
  await expect(page).toHaveURL(/\/card-default\/$/);
});

test('card links and responsive grid work on the documentation page', async ({
  page,
  browserName,
}) => {
  await page.goto('/card-default/');
  const multi = page.locator(preview('internal-links'));
  const first = multi.getByRole('link', { name: 'application guide' });
  const second = multi.getByRole('link', { name: 'Get application help' });
  await first.focus();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(second).toBeFocused();
  await expect(
    page.locator('.cods-card__link a, .cods-card__link button'),
  ).toHaveCount(0);
  await expect(
    page.locator(`${preview('media-only')} .cods-card__link`),
  ).toHaveAccessibleName('Explore Colorado');
  await expect(
    page.locator(`${preview('default-external')} .cods-card__link`),
  ).toHaveAccessibleName(/Visit USA.gov.*external site/);
  const mediaCard = page.locator(`${preview('with-media')} .cods-card__link`);
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

  const grid = page.locator(`${preview('grid')} .cods-card`);
  await page.setViewportSize({ width: 320, height: 800 });
  const boxes = await grid.evaluateAll((items) =>
    items.map((item) => item.getBoundingClientRect().toJSON()),
  );
  expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

test('with-media card content and image stay in place on hover', async ({
  page,
}) => {
  await page.goto('/card-default/');
  const card = page.locator(`${preview('with-media')} .cods-card__link`);
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const elements = card.locator(
    '.cods-card__header, .cods-card__media, .cods-card__body',
  );
  const positions = () =>
    elements.evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { x: rect.x, y: rect.y };
      }),
    );
  const before = await positions();
  await card.hover();
  expect(
    await card.evaluate((el) => getComputedStyle(el, '::after').borderTopWidth),
  ).toBe('2px');
  expect(await positions()).toEqual(before);
});

test('default card changes border color and width on hover', async ({
  page,
}) => {
  await page.goto('/card-default/');
  await page.mouse.move(0, 0);
  const card = page.locator(`${preview('default')} .cods-card__container`);
  await expect(card).toHaveCSS('border-top-width', '1px');
  await expect(card).toHaveCSS('border-top-color', 'rgb(235, 236, 237)');
  await card.hover();
  expect(
    await card.evaluate((el) => getComputedStyle(el, '::after').borderTopWidth),
  ).toBe('2px');
  await expect(card).toHaveCSS('border-top-color', 'rgb(217, 232, 246)');
});

test('icon card keeps its icon and text in place on hover', async ({
  page,
}) => {
  await page.goto('/card-icon/');
  await expect(
    page.locator(`${preview('icon-external')} .cods-card__link`),
  ).toHaveAccessibleName(/Visit USA.gov.*external site/);
  const icon = page.locator(`${preview('icon')} .cods-card__link`);
  // Measure in place: hovering must not scroll the card between readings.
  await icon.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
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
      const rect = range.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    });
  const before = await textPosition();
  const iconBox = await iconArea.boundingBox();
  const glyphBefore = await iconArea.locator('svg').boundingBox();
  expect(before.x - (iconBox!.x + iconBox!.width)).toBe(16);
  await icon.hover();
  expect(
    await icon.evaluate((el) => getComputedStyle(el, '::after').borderTopWidth),
  ).toBe('2px');
  await expect(icon).toHaveCSS('border-top-color', 'rgb(217, 232, 246)');
  expect(await textPosition()).toEqual(before);
  const glyphAfter = await iconArea.locator('svg').boundingBox();
  expect({ x: glyphAfter!.x, y: glyphAfter!.y }).toEqual({
    x: glyphBefore!.x,
    y: glyphBefore!.y,
  });
  await expect(icon.locator('.cods-card__icon')).toHaveCSS(
    'background-color',
    'rgb(217, 232, 246)',
  );
});

test('flag card changes from side-by-side to stacked', async ({ page }) => {
  await page.goto('/card-default/');
  const flag = page.locator(preview('flag'));
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
  const flag = page.locator(`${preview('flag')} .cods-card`);
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
  const photo = (await img.locator('img').boundingBox())!;
  expect(photo.width).toBeCloseTo(mediaBox.width, 0);
  expect(photo.height).toBeCloseTo(mediaBox.height, 0);
});

test('cards with individual links do not show whole-card hover', async ({
  page,
}) => {
  await page.goto('/card-default/');
  const unlinked = page.locator(
    `${preview('internal-links')} .cods-card__container`,
  );
  await expect(unlinked).toHaveCSS('border-top-width', '1px');
  await unlinked.getByRole('link', { name: 'application guide' }).hover();
  await expect(unlinked).toHaveCSS('border-top-width', '1px');
  await expect(unlinked).toHaveCSS('border-top-color', 'rgb(235, 236, 237)');
});
