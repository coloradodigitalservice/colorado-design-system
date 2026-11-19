import { test, expect, expectAccessible } from './fixtures.js';

test('documented language selector opens and closes with the keyboard', async ({
  page,
}, testInfo) => {
  await page.goto('/language-selector/');
  const root = page.locator('[data-cods-fixture-state="multiple-languages"]');
  const button = root.getByRole('button', { name: 'Languages' });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(root.getByRole('link', { name: 'Español' })).toBeVisible();
  await expectAccessible(page, testInfo, 'article');
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});
