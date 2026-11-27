import { test, expect, expectAccessible } from './fixtures.js';

test('Home page assembles the planned sections and image-free highlights', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', {
      name: 'Colorado State Design System',
      level: 1,
    }),
  ).toBeVisible();
  await expect(main.getByRole('heading', { level: 2 })).toHaveText([
    'Sites Built with Colorado Design System',
    'Getting Started',
  ]);
  const cards = main.locator('.cods-card');
  await expect(cards).toHaveCount(3);
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const card of await cards.all())
    expect((await card.boundingBox())!.width).toBeGreaterThan(250);
  for (const [index, title, status] of [
    [0, 'Colorado Department of Revenue', 'Now Live'],
    [1, 'Colorado Tax Division', 'Launching Soon'],
    [2, 'Colorado DMV', 'Launching Soon'],
  ] as const) {
    await expect(cards.nth(index)).toContainText(title);
    await expect(cards.nth(index)).toContainText(status);
    await expect(cards.nth(index).locator('img')).toHaveCount(0);
  }
  await expect(cards.nth(0).getByRole('link')).toHaveAttribute(
    'href',
    'https://cdor.colorado.gov/',
  );
  await expect(cards.nth(1).getByRole('link')).toHaveCount(0);
  await expect(cards.nth(2).getByRole('link')).toHaveCount(0);
  const nav = page
    .getByRole('banner')
    .getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link')).toHaveText([
    'Design System Foundations',
    'Components',
    'About',
  ]);
  await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute(
    'href',
    '/about/',
  );

  await expect(
    main.getByRole('heading', { name: 'For Developers' }),
  ).toBeVisible();
  await expect(
    main.getByRole('heading', { name: 'For Designers' }),
  ).toBeVisible();
  await expect(main.getByRole('link', { name: /Figma Kit/ })).toHaveAttribute(
    'href',
    /figma.com/,
  );
  await expect(main.getByRole('link', { name: /Github/ })).toHaveAttribute(
    'href',
    'https://github.com/coloradodigitalservice/colorado-design-system',
  );
  await expect(
    page.getByRole('link', { name: 'Skip to main content' }),
  ).toHaveAttribute('href', '#main-content');
  await expect(
    page.getByRole('link', { name: /Return to top/ }),
  ).toHaveAttribute('href', '#top');
  await expectAccessible(page, testInfo, 'main');
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
