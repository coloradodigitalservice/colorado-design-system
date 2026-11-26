import { test, expect } from './fixtures.js';

test('documentation navigation shows only related pages', async ({ page }) => {
  await page.goto('/logos/');
  const nav = page.getByRole('navigation', { name: 'Documentation' });
  await expect(nav.locator('.usa-sidenav')).toHaveCount(1);
  await expect(nav.getByText('Foundations', { exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Logos' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(nav.getByRole('link', { name: 'Logos' })).toHaveClass(
    /usa-current/,
  );
  await expect(nav.getByRole('link', { name: 'Typography' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Accordion' })).toHaveCount(0);

  await page.goto('/accordion/');
  await expect(nav.getByText('Components', { exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Accordion' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(nav.getByRole('link', { name: 'Logos' })).toHaveCount(0);
  const onPage = page.getByRole('navigation', { name: 'On this page' });
  await expect(onPage.getByRole('link', { name: 'Guidance' })).toHaveAttribute(
    'href',
    '#guidance',
  );
  await onPage.getByRole('link', { name: 'Guidance' }).click();
  await expect(page).toHaveURL(/#guidance$/);
});
