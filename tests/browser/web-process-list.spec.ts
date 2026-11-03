import { test, expect, expectAccessible } from './fixtures.js';

test('process lists preserve step order, numbering, and reflow', async ({
  page,
}, testInfo) => {
  await page.goto('/process-list/');
  for (const heading of [
    'Summary',
    'When to use',
    'Anatomy and markup',
    'Writing guidance',
    'Responsive behavior',
    'Assets and progressive enhancement',
    'Accessibility and review status',
    'Examples',
  ]) {
    await expect(
      page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible();
  }
  for (const [state, count] of [
    ['default', 2],
    ['three-steps', 3],
    ['four-steps', 4],
    ['five-steps', 5],
    ['long-content', 6],
    ['rtl', 2],
  ] as const) {
    const list = page.locator(`[data-cods-fixture-state="${state}"] ol`);
    await expect(list).toHaveAttribute('role', 'list');
    const items = list.locator(':scope > li');
    await expect(items).toHaveCount(count);
    for (const [index, name] of ['one', 'two', 'three', 'four', 'five', 'six']
      .slice(0, count)
      .entries()) {
      const item = items.nth(index);
      await expect(item.locator('h3')).toHaveCount(1);
      await expect(item.locator('svg')).toHaveAttribute('aria-hidden', 'true');
      await expect(item.locator('use')).toHaveAttribute(
        'href',
        new RegExp(`#number-circle-${name}$`),
      );
    }
  }
  await expect(
    page
      .locator('[data-cods-fixture-state="long-content"] ol > li')
      .first()
      .locator('ul > li'),
  ).toHaveCount(2);
  await expectAccessible(page, testInfo);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const state of ['default', 'rtl']) {
    const item = page
      .locator(`[data-cods-fixture-state="${state}"] li`)
      .first();
    const geometry = await item.evaluate((element) => {
      const icon = element.querySelector('svg')!.getBoundingClientRect();
      const content = element
        .querySelector('.cods-process-list__content')!
        .getBoundingClientRect();
      return {
        size: icon.width,
        gap:
          getComputedStyle(element).direction === 'rtl'
            ? icon.left - content.right
            : content.left - icon.right,
      };
    });
    expect(geometry.size).toBe(32);
    expect(geometry.gap).toBeCloseTo(8, 1);
  }
});
