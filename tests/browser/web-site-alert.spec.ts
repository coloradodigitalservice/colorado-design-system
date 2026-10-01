import { test, expect } from './fixtures.js';

test.use({ javaScriptEnabled: false });

test('static notice remains named and readable without CSS or JavaScript', async ({
  page,
}) => {
  await page.route('**/*.css', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  );
  await page.goto('/site-alert/');
  await expect(page.locator('.cods-site-alert')).toHaveCount(7);
  await expect(
    page.getByRole('region', { name: 'Emergency: service interruption' }),
  ).toBeVisible();
  await expect(page.locator('.cods-site-alert__link').first()).toHaveAttribute(
    'href',
    'https://www.colorado.gov/',
  );
  await expect(page.locator('.cods-site-alert [role=alert]')).toHaveCount(0);
});
