import { readdirSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const paths = readdirSync('apps/web/dist', { recursive: true })
  .filter(
    (file): file is string =>
      typeof file === 'string' && file.endsWith('.html'),
  )
  .map((file) => '/' + file.replace(/index\.html$/, ''));

if (!paths.length)
  throw new Error('Build the documentation site before testing');

for (const path of paths) {
  test(`documentation smoke: ${path}`, async ({ page, browserName }) => {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('main')).toBeVisible();
    // macOS WebKit follows Safari's Option+Tab navigation for links.
    await page.keyboard.press(
      browserName === 'webkit' && process.platform === 'darwin'
        ? 'Alt+Tab'
        : 'Tab',
    );
    await expect(page.locator('a[href="#main-content"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  test(`documentation accessibility: ${path}`, async ({ page }, testInfo) => {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('main')).toBeVisible();
    await expectAccessible(page, testInfo);
  });
}

test('preview returns 404 for a missing page', async ({ request }) => {
  const response = await request.get('/__cods_missing_page__/');
  expect(response.status()).toBe(404);
});
