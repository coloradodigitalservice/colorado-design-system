import { expect, expectAccessible, test } from './fixtures.js';

test('tooltip documentation renders working examples and canonical markup', async ({
  page,
}, testInfo) => {
  await page.goto('/tooltip/');
  await expect(
    page.getByRole('heading', { name: 'Tooltip', exact: true, level: 1 }),
  ).toBeVisible();
  expect(await page.locator('main h2').allTextContents()).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(5);
  await expect(page.locator('[data-cods-docs-preview-code]')).toBeVisible();
  await expect(page.locator('[data-cods-docs-status]')).toContainText(
    'manual accessibility review is pending',
  );
  const trigger = page
    .locator('[data-cods-docs-preview-state="left"]')
    .getByRole('button', { name: 'Left' });
  await trigger.focus();
  await expect(trigger.locator('..').locator('[role="tooltip"]')).toBeVisible();
  await expectAccessible(page, testInfo, 'main');
});
