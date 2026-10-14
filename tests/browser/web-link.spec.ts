import { linkChecks } from './link-checks.js';
import { test, expect } from './fixtures.js';
linkChecks('/link/', 'main');

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('Enter follows the native destination', async ({ page }) => {
    await page.goto('/link/');
    await page.locator('main .cods-link').first().focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/getting-started\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Getting started' }),
    ).toBeVisible();
  });
});

test('new-tab notice remains visible and links usable without CSS', async ({
  page,
}) => {
  await page.goto('/link/');
  await page.evaluate(() => {
    document
      .querySelectorAll('link[rel="stylesheet"], style')
      .forEach((el) => el.remove());
  });
  await expect(page.locator('main .cods-link__new-tab')).toBeVisible();
  await expect(page.locator('main .cods-link').first()).toHaveAttribute(
    'href',
    '/getting-started/',
  );
});

test('new-tab link opens a separate page and preserves the documentation page', async ({
  page,
  context,
}) => {
  await context.route('https://designsystem.digital.gov/', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<h1>External destination</h1>',
    }),
  );
  await page.goto('/link/');
  const popupPromise = page.waitForEvent('popup');
  await page.locator('main [data-cods-fixture-state="external"] a').click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL('https://designsystem.digital.gov/');
  await expect(page).toHaveURL(/\/link\/$/);
  await popup.close();
});
