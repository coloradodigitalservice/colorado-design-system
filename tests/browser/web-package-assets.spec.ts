import { resolve, sep } from 'node:path';
import { test, expect } from './fixtures.js';
import { expectPackageAssets } from './package-assets.js';
import { expectCheckboxAssets } from './checkbox-assets.js';

test('packaged checkbox glyphs preserve their colors on actual state backgrounds', async ({
  page,
}) => {
  await expectCheckboxAssets(page, '/accordion/');
});

test('Astro loads packaged fonts and Phosphor accordion icons', async ({
  page,
}) => {
  await expectPackageAssets(page, '/accordion/');
});

test('h1 uses its existing fallback and accepts a consumer-supplied heading font', async ({
  page,
}) => {
  const fontRequests: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'font') fontRequests.push(request.url());
  });
  await page.goto('/typography/');
  await page.evaluate(() => {
    const prose = document.createElement('div');
    prose.className = 'usa-prose';
    const h1 = document.createElement('h1');
    h1.textContent = 'Consumer heading probe';
    prose.append(h1);
    document.querySelector('main')!.append(prose);
  });
  await page.evaluate(() => document.fonts.ready);
  const heading = page.getByRole('heading', { name: 'Consumer heading probe' });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS('font-weight', '500');
  expect(
    await heading.evaluate((element) =>
      getComputedStyle(element)
        .fontFamily.split(',')
        .map((family) => family.trim().replace(/["']/g, '')),
    ),
  ).toEqual([
    'Museo Slab',
    'Trebuchet MS',
    'Georgia',
    'Times New Roman',
    'serif',
  ]);
  expect(fontRequests.some((url) => /museo/i.test(url))).toBe(false);
  expect(
    await page.evaluate(() =>
      Array.from(document.fonts).some((face) => /Museo Slab/.test(face.family)),
    ),
  ).toBe(false);

  // Use the OFL font as a loading probe, not a copy of the proprietary font.
  await page.route('**/consumer-heading.woff2', (route) =>
    route.fulfill({
      path: resolve(
        'packages/colorado-design-system/src/assets/fonts/open-sans/OpenSans-Medium.woff2',
      ),
      contentType: 'font/woff2',
    }),
  );
  await page.addStyleTag({
    content: `@font-face {
      font-family: 'Museo Slab';
      src: url('/consumer-heading.woff2') format('woff2');
      font-style: normal;
      font-weight: 500;
      font-display: swap;
    }`,
  });
  expect(
    await page.evaluate(async () => {
      const faces = await document.fonts.load('500 16px "Museo Slab"');
      return faces.length === 1 && faces[0]!.status === 'loaded';
    }),
  ).toBe(true);
  expect(
    fontRequests.some((url) => url.endsWith('/consumer-heading.woff2')),
  ).toBe(true);
  await expect(heading).toHaveCSS('font-weight', '500');
});

test('static HTML consumer loads fonts and icons relative to its copied stylesheet', async ({
  page,
}) => {
  const output = resolve('examples/static-html/dist');
  // Serve the actual static consumer under a nested mount in the existing
  // preview. This exercises its relative URLs without another server/port.
  await page.route('**/__cods_static__/**', (route) => {
    const pathname = decodeURIComponent(
      new URL(route.request().url()).pathname,
    );
    const path = resolve(
      output,
      pathname.replace(/^\/__cods_static__\//, '') || 'index.html',
    );
    if (!path.startsWith(output + sep)) return route.fulfill({ status: 403 });
    return route.fulfill({ path });
  });
  await expectPackageAssets(page, '/__cods_static__/');
  const hrefs = await page
    .locator('svg use')
    .evaluateAll((uses) => uses.map((use) => use.getAttribute('href') ?? ''));
  expect(hrefs.length).toBeGreaterThan(0);
  expect(
    hrefs.every((href) =>
      href.startsWith('./assets/selected/icons/sprite.svg#'),
    ),
  ).toBe(true);
  const sprite = await page.evaluate(async () => {
    const response = await fetch('./assets/selected/icons/sprite.svg');
    if (!response.ok)
      throw new Error(`Selected sprite returned ${response.status}`);
    return response.text();
  });
  for (const href of hrefs)
    expect(sprite).toContain(`id="${href.split('#')[1]}"`);
});
