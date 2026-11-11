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

test('timed toast pauses on hover and keyboard focus', async ({ page }) => {
  await page.clock.install();
  await page.goto('/iframe.html?id=components-toast--default&viewMode=story');
  await page.getByRole('button', { name: 'Save changes' }).click();
  const toast = page.locator('.cods-toast__item');
  const dismiss = toast.getByRole('button', { name: 'Dismiss' });
  await page.clock.fastForward(5000);
  await toast.hover();
  await page.clock.fastForward(20000);
  await expect(toast).toBeVisible();
  await dismiss.focus();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(20000);
  await expect(toast).toBeVisible();
  await page.getByRole('button', { name: 'Save changes' }).focus();
  await page.clock.fastForward(5000);
  await expect(toast).toHaveCount(0);
  await expect(page.locator('[data-cods-toast-demo-status]')).toHaveText(
    'Changes saved.',
  );
});

test('toast placement and motion respect user preferences', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/iframe.html?id=components-toast--default&viewMode=story');
  await page.getByRole('button', { name: 'Save changes' }).click();
  const list = page.locator('.cods-toast__list');
  await expect(list).toHaveCSS('position', 'fixed');
  await expect(list.locator('.cods-toast__item')).toHaveCSS(
    'animation-name',
    'none',
  );
});

test('action remains available in context', async ({ page }) => {
  await page.goto('/iframe.html?id=components-toast--action&viewMode=story');
  await page.getByRole('button', { name: 'Save changes' }).click();
  const toast = page.locator('.cods-toast__item');
  await toast.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.locator('[data-cods-toast-demo-status]')).toHaveText(
    'Changes undone.',
  );
  await expect(
    page.getByRole('button', { name: 'Undo changes' }),
  ).toBeVisible();
});
