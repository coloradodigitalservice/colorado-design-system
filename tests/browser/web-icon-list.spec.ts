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
  await expect(examples).toHaveCount(4);
  for (const example of await examples.all()) {
    await expect(example.locator('ul')).toHaveCount(1);
    for (const icon of await example.locator('li svg').all()) {
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
      await expect(icon).toHaveAttribute('focusable', 'false');
    }
  }
  await expect(
    page.locator('[data-cods-fixture-state="default"] li'),
  ).toHaveCount(3);
  await expect(
    page.locator('[data-cods-fixture-state="medium"] .cods-icon--medium'),
  ).toHaveCount(2);
  await expectAccessible(page, testInfo);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
