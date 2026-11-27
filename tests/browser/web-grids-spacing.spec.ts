import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';
const tokens = JSON.parse(
  readFileSync('packages/colorado-design-tokens/generated/tokens.json', 'utf8'),
) as Record<string, string>;

test('Grids and Spacing documents shipped tokens and reflows in order', async ({
  page,
}, testInfo) => {
  await page.goto('/grids-spacing/');
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: 'Grids & Spacing', level: 1 }),
  ).toBeVisible();
  for (const heading of ['Spacing scale', 'Responsive grids', 'Examples'])
    await expect(
      main.getByRole('heading', { name: heading, level: 2 }),
    ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Grids & Spacing' }),
  ).toHaveAttribute('aria-current', 'page');
  const examples = main
    .getByRole('list', { name: 'Spacing token examples' })
    .locator('li');
  const names = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
  await expect(examples).toHaveCount(names.length);
  for (const [index, name] of names.entries()) {
    const value = tokens[`space-${name}`];
    if (!value) throw new Error(`Missing space-${name}`);
    await expect(examples.nth(index)).toContainText(value);
    await expect(examples.nth(index).locator('.spacing-swatch')).toHaveCSS(
      'width',
      value,
    );
  }
  const items = main
    .getByRole('list', { name: 'Responsive grid example' })
    .locator('li');
  await expect(items).toHaveText(['First item', 'Second item', 'Third item']);
  await expectAccessible(page, testInfo, 'main');
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const positions = await items.evaluateAll((nodes) =>
      nodes.map((node) => {
        const r = node.getBoundingClientRect();
        return { x: r.x, y: r.y };
      }),
    );
    expect(
      positions.every(
        (position, i) =>
          i === 0 ||
          position.y > positions[i - 1]!.y ||
          (position.y === positions[i - 1]!.y &&
            position.x > positions[i - 1]!.x),
      ),
    ).toBe(true);
  }
});
