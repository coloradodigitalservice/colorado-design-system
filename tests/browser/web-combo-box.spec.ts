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
