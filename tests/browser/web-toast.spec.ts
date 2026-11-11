import { test, expect, expectAccessible } from './fixtures.js';

test('supplemental notification preserves context and returns focus', async ({
  page,
}, testInfo) => {
  await page.goto('/toast/');
  const trigger = page.getByRole('button', { name: 'Save changes' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const notification = page.locator('.cods-toast__item');
  await expect(notification).toContainText('Changes saved.');
  await expect(trigger).toBeFocused();
  await expect(page.locator('[data-cods-toast-demo-status]')).toHaveText(
    'Changes saved.',
  );
  await expectAccessible(page, testInfo, 'body');
  const dismiss = notification.getByRole('button', { name: 'Dismiss' });
  await dismiss.focus();
  await page.keyboard.press('Enter');
  await expect(notification).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
