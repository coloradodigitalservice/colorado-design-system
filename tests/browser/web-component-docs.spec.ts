import { test, expect } from './fixtures.js';

const pages = [
  { path: '/site-alert/', name: 'site-alert' },
  { path: '/accordion/', name: 'accordion' },
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
      .locator('main a[href^="/"], main a[href^="#"]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute('href') as string),
      );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of new Set(hrefs)) {
      if (href.startsWith('#')) {
        await expect(page.locator(`[id="${href.slice(1)}"]`)).toHaveCount(1);
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

test('getting started documents installation and both style imports', async ({
  page,
}) => {
  await page.goto('/getting-started/');
  const main = page.locator('main');
  await expect(main).toContainText('colorado-design-tokens/tokens.css');
  await expect(main).toContainText('colorado-design-system/styles');
  await expect(
    main.getByRole('link', { name: 'Accordion' }).first(),
  ).toHaveAttribute('href', '/accordion/');
});
