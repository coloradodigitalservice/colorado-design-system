import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';
const tokens = JSON.parse(
  readFileSync('packages/colorado-design-tokens/generated/tokens.json', 'utf8'),
) as Record<string, string>;

test('Typography page documents and renders mobile and desktop token specimens', async ({
  page,
}, testInfo) => {
  await page.goto('/typography/');
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: 'Typography', level: 1 }),
  ).toBeVisible();
  for (const name of [
    'Optional Museo Slab headings',
    'Typography guidance',
    'Type specimens',
  ])
    await expect(main.getByRole('heading', { name, level: 2 })).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Typography' }),
  ).toHaveAttribute('aria-current', 'page');
  const samples = main
    .getByRole('list', { name: 'Typography token specimens' })
    .locator('li');
  const names = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'body-lg',
    'body',
    'body-sm',
    'code',
  ];
  await expect(samples).toHaveCount(names.length);
  for (const [width, variant] of [
    [320, 'mobile'],
    [1280, 'desktop'],
  ] as const) {
    await page.setViewportSize({ width, height: 800 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    for (const [index, name] of names.entries()) {
      const size = tokens[`font-size-${variant}-${name}`];
      const line = tokens[`line-height-${variant}-${name}`];
      if (!size || !line)
        throw new Error(`Missing typography tokens for ${name}`);
      await expect(samples.nth(index).locator('.specimen')).toHaveCSS(
        'font-size',
        size,
      );
      await expect(samples.nth(index).locator('.specimen')).toHaveCSS(
        'line-height',
        line,
      );
    }
  }
  await expectAccessible(page, testInfo, 'main');
});
