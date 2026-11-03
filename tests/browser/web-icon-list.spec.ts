import { test, expect, expectAccessible } from './fixtures.js';

test('icon lists retain their semantics, decorative icons and responsive layout', async ({
  page,
}, testInfo) => {
  await page.goto('/icon-list/');
  for (const name of [
    'Examples',
    'Summary',
    'When to use',
    'Anatomy and markup',
    'Sizes and layout',
    'Assets and progressive enhancement',
    'Accessibility and review status',
  ]) {
    await expect(
      page.getByRole('heading', { name, exact: true }),
    ).toBeVisible();
  }
  const examples = page.locator('[data-cods-fixture-state]');
  await expect(examples).toHaveCount(3);
  for (const example of await examples.all()) {
    await expect(example.locator('ul')).toHaveCount(1);
    await expect(example.locator('ul')).toHaveAttribute('role', 'list');
    for (const icon of await example.locator('li svg').all()) {
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
      await expect(icon).toHaveAttribute('focusable', 'false');
    }
  }
  await expect(
    page.locator('[data-cods-fixture-state="default"] li'),
  ).toHaveCount(3);
  for (const width of [320, 767, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const state of ['default', 'long-content', 'rtl']) {
      const measurements = await page
        .locator(`[data-cods-fixture-state="${state}"] li`)
        .first()
        .evaluate((item) => {
          const icon = item.querySelector('svg')!.getBoundingClientRect();
          const content = item.querySelector('.cods-icon-list__content')!;
          const contentRect = content.getBoundingClientRect();
          const text =
            content.querySelector('p, strong')?.firstChild ??
            content.firstChild!;
          const range = document.createRange();
          range.selectNodeContents(text);
          const textRect = range.getBoundingClientRect();
          const rtl = getComputedStyle(item).direction === 'rtl';
          return {
            size: icon.width,
            gap: rtl
              ? icon.left - contentRect.right
              : contentRect.left - icon.right,
            textOffset: textRect.top - contentRect.top,
            alignment: Math.abs(
              icon.top + icon.height / 2 - (textRect.top + textRect.height / 2),
            ),
          };
        });
      expect(measurements.size).toBe(width < 768 ? 16 : 24);
      expect(measurements.gap).toBeCloseTo(8, 1);
      // A first paragraph must start on the same line as direct or bold text.
      expect(measurements.textOffset).toBeLessThan(5);
      expect(measurements.alignment).toBeLessThan(3);
    }
    const supporting = page
      .locator('[data-cods-fixture-state="long-content"] p')
      .first();
    await expect(supporting).toHaveCSS('margin-top', '8px');
    await expect(supporting).toHaveCSS('font-size', '16px');
    await expect(supporting).toHaveCSS('line-height', '24px');
  }
  await expectAccessible(page, testInfo);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
