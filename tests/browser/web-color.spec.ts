import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';
const tokens = JSON.parse(
  readFileSync('packages/colorado-design-tokens/generated/tokens.json', 'utf8'),
) as Record<string, string>;

test('Color page shows the shipped palette and semantic colors', async ({
  page,
}, testInfo) => {
  await page.goto('/color/');
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: 'Color', level: 1 }),
  ).toBeVisible();
  for (const name of [
    'Core color ramps',
    'Semantic tokens',
    'Contrast and accessibility',
    'Color examples',
  ])
    await expect(main.getByRole('heading', { name, level: 2 })).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Color', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  for (const group of [
    'blue',
    'plum',
    'red',
    'green',
    'teal',
    'yellow',
    'gray',
  ]) {
    const region = main.getByRole('region', {
      name: `Colorado ${group} colors`,
    });
    const names = Object.keys(tokens).filter(
      (name) =>
        name.startsWith(`color-co-${group}-`) && !name.includes('alpha'),
    );
    const rows = region.locator('li');
    await expect(rows).toHaveCount(names.length);
    for (const [index, name] of names.entries()) {
      await expect(rows.nth(index)).toContainText(`--cods-${name}`);
      await expect(rows.nth(index)).toContainText(tokens[name]!);
      const rendered = await rows
        .nth(index)
        .locator('.color-swatch')
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      const expected = tokens[name]!.match(/[\da-f]{2}/gi)!.map((part) =>
        parseInt(part, 16),
      );
      expect(rendered).toBe(`rgb(${expected.join(', ')})`);
    }
  }
  await expect(
    main.getByRole('list', { name: 'Semantic color examples' }).locator('li'),
  ).toHaveCount(3);
  const semantic = main
    .getByRole('list', { name: 'Semantic color examples' })
    .locator('li');
  for (const [index, name] of [
    'color-bg-action-primary',
    'color-text-primary',
    'color-border-form-default',
  ].entries()) {
    await expect(semantic.nth(index)).toContainText(`--cods-${name}`);
    await expect(semantic.nth(index)).toContainText(tokens[name]!);
    const rendered = await semantic
      .nth(index)
      .locator('.color-swatch')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const expected = tokens[name]!.match(/[\da-f]{2}/gi)!.map((part) =>
      parseInt(part, 16),
    );
    expect(rendered).toBe(`rgb(${expected.join(', ')})`);
  }
  await expectAccessible(page, testInfo, 'main');
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
