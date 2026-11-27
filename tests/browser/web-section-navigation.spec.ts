import { test, expect } from './fixtures.js';

test('foundation and component pages show their own navigation and section links', async ({
  page,
}) => {
  await page.goto('/logos/');
  const sidebar = page.getByRole('navigation', { name: 'Documentation' });
  await expect(sidebar.getByText('Foundations', { exact: true })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: 'Logos' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(sidebar.getByRole('link', { name: 'Accordion' })).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Page sections' }),
  ).toHaveCount(0);

  await page.goto('/accordion/');
  await expect(sidebar.getByText('Components', { exact: true })).toBeVisible();
  await expect(
    sidebar.getByRole('link', { name: 'Accordion' }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(sidebar.getByRole('link', { name: 'Logos' })).toHaveCount(0);
  const toc = page.getByRole('navigation', { name: 'Page sections' });
  const guidance = toc.getByRole('link', { name: 'Guidance' });
  await expect(guidance).toHaveAttribute('href', '#guidance');
  await expect(page.locator('section#guidance > h2')).toHaveText('Guidance');
  await guidance.click();
  await expect(page).toHaveURL(/#guidance$/);
  await expect(guidance).toHaveAttribute('aria-current', 'location');
  await page.setViewportSize({ width: 320, height: 800 });
  const sidebarMenu = sidebar.locator('details');
  await expect(sidebarMenu).not.toHaveAttribute('open', '');
  await sidebar.getByText('Components', { exact: true }).click();
  await expect(sidebar.getByRole('link', { name: 'Accordion' })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

test('in-page links work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  // The fixture provides built-file routing only for its own page.
  const { routeBuiltFiles } = await import('./built-files.js');
  if (process.env.CODS_BUILT_FILES === '1') await routeBuiltFiles(page, 'web');
  await page.goto('http://127.0.0.1:4321/accordion/');
  await page
    .getByRole('navigation', { name: 'Page sections' })
    .getByRole('link', { name: 'Guidance' })
    .click();
  await expect(page).toHaveURL(/#guidance$/);
  await expect(page.locator('h2#guidance')).toBeVisible();
  await context.close();
});

test('the navigation documentation initializes both examples and page links', async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (
      message.type() === 'warning' &&
      message.text().includes('cods-in-page-navigation')
    )
      warnings.push(message.text());
  });
  await page.goto('/in-page-navigation/');
  const toc = page.getByRole('navigation', { name: 'Page sections' });
  await expect(toc.locator('a[aria-current="location"]')).toHaveCount(1);
  expect(warnings).toEqual([]);
});

test('component pages initialize all in-page targets without warnings', async ({
  page,
}) => {
  const { readdirSync } = await import('node:fs');
  const pages = readdirSync('apps/web/src/content/docs')
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.slice(0, -3))
    .filter(
      (name) =>
        !['getting-started', 'icon', 'logos', 'typography'].includes(name),
    );
  for (const slug of pages) {
    const warnings: string[] = [];
    const capture = (message: import('@playwright/test').ConsoleMessage) => {
      if (
        message.type() === 'warning' &&
        message.text().includes('cods-in-page-navigation')
      )
        warnings.push(message.text());
    };
    page.on('console', capture);
    await page.goto(`/${slug}/`);
    const toc = page.getByRole('navigation', { name: 'Page sections' });
    if (await toc.count()) {
      await expect(toc.locator('a[aria-current="location"]')).toHaveCount(1);
      const targets = await toc.locator('a').evaluateAll((links) =>
        links.map((link) => {
          const target = document.getElementById(
            decodeURIComponent((link as HTMLAnchorElement).hash.slice(1)),
          );
          return target?.tagName;
        }),
      );
      expect(
        targets.every((tag) => tag === 'SECTION'),
        slug,
      ).toBe(true);
    }
    expect(warnings, slug).toEqual([]);
    page.off('console', capture);
  }
});
