import { test, expect, expectAccessible } from './fixtures.js';

test('canonical radio states preserve native selection and accessible groups', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-radio--all-states&viewMode=story',
  );
  const first = page.locator('#radio-default-1');
  await expect(first).toBeAttached();
  await page.locator('label[for="radio-default-1"]').click();
  await expect(first).toBeChecked();
  await first.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#radio-default-2')).toBeChecked();
  await expect(first).not.toBeChecked();
  await expect(page.locator('#radio-selected-1')).toBeChecked();
  await expect(page.locator('#radio-disabled-group-1')).toBeDisabled();
  await expect(
    page.getByRole('group', { name: 'Choose an application type' }),
  ).toHaveAccessibleDescription(
    'Error: Select an application type before continuing.',
  );
  await expectAccessible(page, testInfo);
});
