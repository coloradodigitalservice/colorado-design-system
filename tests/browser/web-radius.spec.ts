import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const tokens = JSON.parse(
  readFileSync('packages/colorado-design-tokens/generated/tokens.json', 'utf8'),
) as Record<string, string>;

test('Radius page documents and renders the shipped radius tokens', async ({
  page,
}, testInfo) => {
  await page.goto('/radius/');
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: 'Radius', level: 1 }),
  ).toBeVisible();
  for (const heading of ['Guidelines', 'Use the tokens', 'Radius examples']) {
    await expect(
      main.getByRole('heading', { name: heading, level: 2 }),
    ).toBeVisible();
  }
  const sidebar = page.getByRole('navigation', { name: 'Documentation' });
  await expect(sidebar.getByRole('link', { name: 'Radius' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  const examples = main
    .getByRole('list', { name: 'Radius token examples' })
    .locator('li');
  await expect(examples).toHaveCount(5);
  for (const [index, name] of (
    ['none', 'sm', 'md', 'lg', 'full'] as const
  ).entries()) {
    const example = examples.nth(index);
    const value = tokens[`radius-${name}`];
    if (!value) throw new Error(`Missing radius token: ${name}`);
    await expect(example).toContainText(`--cods-radius-${name}`);
    await expect(example).toContainText(value);
    await expect(example.locator('.radius-example')).toHaveCSS(
      'border-radius',
      value,
    );
  }
  await expectAccessible(page, testInfo, 'main');
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await expect(examples.nth(4)).toContainText('--cods-radius-full');
});
