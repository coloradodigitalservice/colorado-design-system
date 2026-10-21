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

test('early example and copyable source retain the canonical structure at 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/site-alert/');
  const example = page.locator('.cods-site-alert').first();
  await expect(example).toBeVisible();
  const beforeUsage = await example.evaluate((element) => {
    const usage = [...document.querySelectorAll('h2')].find(
      (heading) => heading.textContent === 'Use the package',
    );
    return Boolean(
      usage &&
      element.compareDocumentPosition(usage) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
  expect(beforeUsage).toBe(true);
  await page.getByText('View and copy HTML', { exact: true }).click();
  const source = page.getByRole('region', { name: 'Default Site Alert HTML' });
  await expect(source).toBeVisible();
  const equivalent = await source.evaluate((element) => {
    const template = document.createElement('template');
    template.innerHTML = element.textContent ?? '';
    return (
      template.content.querySelector('.cods-site-alert')?.outerHTML ===
      document.querySelector('.cods-site-alert')?.outerHTML
    );
  });
  expect(equivalent).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
