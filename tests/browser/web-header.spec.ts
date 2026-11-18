import { test, expect, expectAccessible } from './fixtures.js';

test('the documentation preview opens the drawer on narrow screens', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/header/');
  const preview = page.locator('[data-cods-docs-preview="header"]');
  const menu = preview.locator('.cods-header__menu-button');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(
    preview.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
      name: 'News',
    }),
  ).toBeVisible();
  await expect(
    preview.getByRole('button', { name: 'Close menu' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expectAccessible(page, testInfo, '[data-cods-docs-preview="header"]');
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
