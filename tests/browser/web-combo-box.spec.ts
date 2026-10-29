import { test, expect, expectAccessible } from './fixtures.js';

test('documented combo box supports keyboard and pointer selection', async ({
  page,
}, testInfo) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-fixture-state="default"]');
  const input = root.getByRole('combobox');
  await input.fill('2025');
  await input.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(root.locator('select')).toHaveValue('2025');
  await input.click();
  await root.getByRole('option', { name: '2024' }).click();
  await expect(root.locator('select')).toHaveValue('2024');
  await expectAccessible(page, testInfo, 'article');
});

test('groups, validation and reset work on the documentation page', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  const group = page.locator('[data-cods-fixture-state="grouped"]');
  const groupInput = group.getByRole('combobox');
  await groupInput.click();
  await expect(
    group.getByRole('option', {
      name: 'Renew or replace: Renew license or ID',
    }),
  ).toBeVisible();
  await groupInput.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(group.locator('select')).toHaveValue('replace');
  const required = page.locator('[data-cods-fixture-state="error"]');
  const input = required.getByRole('combobox');
  await input.click();
  await required.getByRole('option', { name: '2025' }).click();
  await input.fill('2026');
  expect(
    await input.evaluate((element: HTMLInputElement) => element.validity.valid),
  ).toBe(false);
  await required
    .locator('form')
    .evaluate((form: HTMLFormElement) => form.reset());
  await expect(input).toHaveValue('');
  await expect(required.locator('select')).toHaveValue('');
});

test('reflows at 320px and keeps focus visible in forced colors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/combo-box/');
  const input = page
    .locator('[data-cods-fixture-state="default"]')
    .getByRole('combobox');
  await input.focus();
  await input.click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(input).toBeFocused();
  await expect(input).toHaveCSS('outline-style', 'solid');
});
