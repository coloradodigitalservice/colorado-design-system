import { buttonChecks } from './button-checks.js';
import { test, expect } from './fixtures.js';
buttonChecks('/button/');

test.describe('without enhancement', () => {
  test.use({ javaScriptEnabled: false });
  test('native markup and copyable source work without CSS or JavaScript', async ({
    page,
  }) => {
    await page.route('**/*.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: '' }),
    );
    await page.goto('/button/');
    const button = page.locator('[data-cods-button-fixture="default"] button');
    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).toBeVisible();
    await page.getByText('View and copy HTML', { exact: true }).first().click();
    await expect(
      page.getByRole('region', { name: 'default Button HTML', exact: true }),
    ).toContainText('usa-button cods-button');
    expect(
      await page
        .getByRole('region', { name: 'default Button HTML', exact: true })
        .evaluate((el) => {
          const template = document.createElement('template');
          template.innerHTML = el.textContent ?? '';
          return (
            template.content.querySelector('button')?.outerHTML ===
            document.querySelector(
              '[data-cods-button-fixture="default"] button',
            )?.outerHTML
          );
        }),
    ).toBe(true);
    await expect(page.locator('.cods-button:disabled')).toHaveCount(7);
    await page.locator('[data-cods-button-fixture="link"] a').focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/getting-started\/$/);
  });
});
