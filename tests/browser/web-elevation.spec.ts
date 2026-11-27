import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const tokens = JSON.parse(
  readFileSync('packages/colorado-design-tokens/generated/tokens.json', 'utf8'),
) as Record<string, string>;

test('Elevation page documents and renders the shipped shadow levels', async ({
  page,
}, testInfo) => {
  await page.goto('/elevation/');
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: 'Elevation', level: 1 }),
  ).toBeVisible();
  for (const heading of [
    'Guidelines',
    'Accessibility and dark backgrounds',
    'Use the tokens',
    'Elevation examples',
  ]) {
    await expect(
      main.getByRole('heading', { name: heading, level: 2 }),
    ).toBeVisible();
  }
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Elevation' }),
  ).toHaveAttribute('aria-current', 'page');
  const examples = main
    .getByRole('list', { name: 'Elevation token examples' })
    .locator('li');
  await expect(examples).toHaveCount(4);
  for (const [index, level] of ['flat', 'low', 'mid', 'high'].entries()) {
    const example = examples.nth(index);
    await expect(example).toContainText(`elevation-${level}`);
    for (const dimension of ['x', 'y', 'blur', 'spread']) {
      const value = tokens[`elevation-${level}-${dimension}`];
      if (!value)
        throw new Error(`Missing token: elevation-${level}-${dimension}`);
      await expect(example).toContainText(`${dimension}: ${value}`);
    }
    const shadow = await example
      .locator('.elevation-example')
      .evaluate((el) => getComputedStyle(el).boxShadow);
    for (const dimension of ['x', 'y', 'blur', 'spread'])
      expect(shadow).toContain(tokens[`elevation-${level}-${dimension}`]);
  }
  await expectAccessible(page, testInfo, 'main');
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await expect(examples.nth(3)).toContainText('elevation-high');
  await expect(examples.nth(3).locator('.elevation-example')).not.toHaveCSS(
    'border-style',
    'none',
  );
});
