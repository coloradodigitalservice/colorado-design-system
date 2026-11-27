import { test, expect, expectAccessible } from './fixtures.js';

test('the site header is the Header component on every page', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/about/');
  const banner = page.getByRole('banner');
  await expect(banner).toHaveAttribute('data-cods-header-enhanced', '');
  await expect(
    banner.getByRole('link', { name: 'Colorado Design System home' }),
  ).toBeVisible();
  const nav = banner.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  await expectAccessible(page, testInfo, 'header');
});

test('the site header drawer opens and closes on narrow screens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/header/');
  const banner = page.locator('#top');
  const menu = banner.locator('.cods-header__menu-button');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(
    banner.getByRole('button', { name: 'Close menu' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
});

test('the documentation preview frame runs its own Header', async ({
  page,
}) => {
  await page.goto('/header/');
  const frame = page.frameLocator(
    'iframe[title="Header preview, narrow screen"]',
  );
  const menu = frame.locator('.cods-header__menu-button');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(
    frame.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
      name: 'News',
    }),
  ).toBeVisible();
});

test('the full Header preview does not navigate or submit searches', async ({
  page,
}) => {
  await page.goto('/header/preview/full/');
  const url = page.url();
  await page.getByRole('button', { name: 'Services' }).click();
  await page.getByRole('link', { name: 'Taxes' }).click();
  expect(page.url()).toBe(url);
  await page.getByRole('button', { name: 'Languages' }).click();
  await page.getByRole('link', { name: /Español/ }).click();
  expect(page.url()).toBe(url);
  await page.getByRole('searchbox').fill('permits');
  await page.getByRole('searchbox').press('Enter');
  expect(page.url()).toBe(url);
});

test('the documentation follows the component page structure', async ({
  page,
}) => {
  await page.goto('/header/');
  const headings = await page.locator('main h2, main h3').allTextContents();
  for (const heading of [
    'Summary',
    'Guidance',
    'When to use',
    'Writing for headers',
    'Accessibility for headers',
    'Specifications',
    'Classes',
    'Use your own logo',
  ])
    expect(headings).toContain(heading);
});
