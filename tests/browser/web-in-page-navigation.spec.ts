import { test, expect, expectAccessible } from './fixtures.js';

test('the documentation example highlights the current section', async ({
  page,
}, testInfo) => {
  await page.goto('/in-page-navigation/');
  const nav = page.locator('[data-cods-in-page-navigation]');
  const links = nav.getByRole('link');
  await expect(links.first()).toHaveAttribute('aria-current', 'location');
  await page
    .locator('[data-cods-fixture-state="default"] section')
    .evaluateAll((sections) => {
      sections.forEach((section) => {
        (section as HTMLElement).style.minHeight = '100vh';
      });
    });
  await page.locator('#payment-amounts').evaluate((section) => {
    window.scrollTo(
      0,
      window.scrollY + section.getBoundingClientRect().top + 300,
    );
  });
  await expect(links.nth(1)).toHaveAttribute('aria-current', 'location');
  await expectAccessible(page, testInfo, '[data-cods-in-page-navigation]');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the documentation links still navigate to their sections', async ({
    page,
  }) => {
    await page.goto('/in-page-navigation/');
    const link = page
      .locator('[data-cods-in-page-navigation]')
      .getByRole('link', { name: 'Payment amounts' });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/#payment-amounts$/);
    await expect(page.locator('#payment-amounts')).toBeVisible();
  });
});
