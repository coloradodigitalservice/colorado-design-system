import { test, expect, expectAccessible } from './fixtures.js';

test('divider semantics, token styling, and inset', async ({
  page,
}, testInfo) => {
  await page.goto('/divider/');
  const section = page.locator(
    '[data-cods-fixture-state="default"] .cods-divider',
  );
  const item = page.locator('[data-cods-fixture-state="item"] .cods-divider');
  await expect(page.getByRole('separator')).toHaveCount(1);
  await expect(item).toHaveAttribute('aria-hidden', 'true');
  for (const line of [section, item]) {
    await expect(line).toHaveCSS('border-top-width', '1px');
    await expect(line).toHaveCSS('border-top-color', 'rgb(196, 197, 201)');
  }
  const inset = page.locator('.cods-divider--item');
  await expect(inset).toHaveCSS('padding-left', '16px');
  await expect(inset).toHaveCSS('padding-top', '8px');
  const spacing = await inset.evaluate((wrapper) => {
    const line = wrapper.querySelector('hr')!.getBoundingClientRect();
    const box = wrapper.getBoundingClientRect();
    return { before: line.top - box.top, after: box.bottom - line.bottom };
  });
  expect(spacing).toEqual({ before: 8, after: 8 });
  await expectAccessible(page, testInfo);
});
