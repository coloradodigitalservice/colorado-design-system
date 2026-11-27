import { expect, expectAccessible, test } from './fixtures.js';

test('tooltip documentation renders working examples and canonical markup', async ({
  page,
}, testInfo) => {
  await page.goto('/tooltip/');
  await expect(
    page.getByRole('heading', { name: 'Tooltip', exact: true, level: 1 }),
  ).toBeVisible();
  for (const position of ['top', 'bottom', 'left', 'right']) {
    await expect(
      page.locator(`[data-cods-example="${position}"] code`),
    ).toBeAttached();
  }
  const trigger = page
    .locator('[data-cods-fixture-state="left"]')
    .getByRole('button', { name: 'Left' });
  await trigger.focus();
  await expect(trigger.locator('..').locator('[role="tooltip"]')).toBeVisible();
  await expectAccessible(page, testInfo, 'main');
});
