import { readdirSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const paths = readdirSync('apps/web/dist', { recursive: true })
  .filter(
    (file): file is string =>
      typeof file === 'string' && file.endsWith('.html'),
  )
  .map((file) => '/' + file.replace(/index\.html$/, ''));

if (!paths.length)
  throw new Error('Build the documentation site before testing');

for (const path of paths) {
  test(`documentation smoke and accessibility: ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('main')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.locator('a[href="#main-content"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('preview returns 404 for a missing page', async ({ request }) => {
  const response = await request.get('/__cods_missing_page__/');
  expect(response.status()).toBe(404);
});
