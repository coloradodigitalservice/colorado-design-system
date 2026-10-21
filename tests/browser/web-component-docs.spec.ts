import { test, expect, expectAccessible } from './fixtures.js';

const pages = [
  { path: '/site-alert/', name: 'site-alert' },
  { path: '/accordion/', name: 'accordion' },
  { path: '/footer/', name: 'footer' },
];

const requiredHeadings = [
  'Summary',
  'Anatomy',
  'Known limitations and implementation status',
];

for (const { path, name } of pages) {
  test(`${name} page covers the required documentation sections`, async ({
    page,
  }) => {
    await page.goto(path);
    const headings = await page.locator('main h2').allTextContents();
    for (const heading of requiredHeadings) expect(headings).toContain(heading);
    expect(
      headings.some((heading) => /^When to use|^Use the package/.test(heading)),
    ).toBe(true);
    expect(headings.some((heading) => /accessibility/i.test(heading))).toBe(
      true,
    );
    const summary = page.getByRole('region', { name: 'Summary' });
    await expect(summary).toContainText('experimental');
    await expect(
      summary.getByRole('link', { name: 'Evidence file' }),
    ).toHaveAttribute(
      'href',
      new RegExp(`/${name}/accessibility/${name}\\.evidence\\.md$`),
    );
    await expect(
      summary.getByRole('link', { name: 'Component source' }),
    ).toHaveAttribute('href', new RegExp(`/components/${name}$`));
    await expect(
      page.getByRole('link', { name: 'Getting started' }).first(),
    ).toBeVisible();
  });

  test(`${name} page internal links resolve and layout fits 320px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    const hrefs = await page
      .locator('main a[href]')
      .evaluateAll((links) =>
        links
          .map((link) => (link as HTMLAnchorElement).href)
          .filter((href) => new URL(href).origin === location.origin),
      );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of new Set(hrefs)) {
      const target = new URL(href);
      if (target.pathname === new URL(page.url()).pathname && target.hash) {
        await expect(
          page.locator(`[id="${target.hash.slice(1)}"]`),
        ).toHaveCount(1);
      } else {
        const response = await request.get(href);
        expect(response.status(), href).toBe(200);
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('Footer docs page renders and enhances both canonical variants', async ({
  page,
}, testInfo) => {
  await page.goto('/footer/');
  const preview = page.locator('[data-cods-docs-preview="footer"]');
  await expect(
    preview.getByRole('heading', { name: 'Component preview' }),
  ).toBeVisible();
  await expect(
    preview.locator('[data-cods-footer-fixture="full"] .cods-footer'),
  ).toBeVisible();
  await expect(
    preview.locator('[data-cods-footer-fixture="compact"] .cods-footer'),
  ).toBeVisible();
  await expect(
    preview.locator(
      '[data-cods-footer-fixture="full"] button.usa-footer__primary-link',
    ),
  ).toHaveCount(0);

  await page.setViewportSize({ width: 375, height: 800 });
  const full = preview.locator('[data-cods-footer-fixture="full"]');
  await expect(full.getByRole('button', { name: 'Services' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await full.getByRole('button', { name: 'Services' }).click();
  await expect(
    full.getByRole('link', { name: 'Benefits and assistance' }),
  ).toBeVisible();
  await expect(
    preview.locator(
      '[data-cods-footer-fixture="compact"] button.usa-footer__primary-link',
    ),
  ).toHaveCount(0);
  await expectAccessible(page, testInfo, '[data-cods-docs-preview="footer"]');
});

test('getting started documents installation and both style imports', async ({
  page,
}) => {
  await page.goto('/getting-started/');
  const main = page.locator('main');
  await expect(main).toContainText('colorado-design-tokens/tokens.css');
  await expect(main).toContainText('colorado-design-system/styles.css');
  const accordion = main.getByRole('link', { name: 'Accordion' }).first();
  expect(
    await accordion.evaluate((link) => (link as HTMLAnchorElement).href),
  ).toBe(new URL('../accordion/', page.url()).href);
});
