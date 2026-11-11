import { test, expect, expectAccessible } from './fixtures.js';

test('toast story announces and dismisses supplemental feedback', async ({
  page,
}, testInfo) => {
  await page.goto('/iframe.html?id=components-toast--default&viewMode=story');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('[role=status]')).toHaveText('Changes saved.');
  await expect(page.locator('[data-cods-toast-demo-status]')).toHaveText(
    'Changes saved.',
  );
  await expectAccessible(page, testInfo, '#storybook-root');
  await page
    .locator('.cods-toast__item')
    .getByRole('button', { name: 'Dismiss' })
    .click();
  await expect(page.locator('.cods-toast__item')).toHaveCount(0);
});
