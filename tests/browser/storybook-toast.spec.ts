import { test, expect, expectAccessible } from './fixtures.js';
import {
  expectConstrainedStackClickable,
  expectFocusClearOfToast,
} from './toast-focus-checks.js';

test('toast story announces and dismisses supplemental feedback', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-toast-snackbar--default&viewMode=story',
  );
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
  await page.goto(
    '/iframe.html?id=components-toast-snackbar--default&viewMode=story',
  );
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.clock.fastForward(50);
  const toast = page.locator('.cods-toast__item');
  const dismiss = toast.getByRole('button', { name: 'Dismiss' });
  await page.clock.fastForward(4950);
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
  await page.goto(
    '/iframe.html?id=components-toast-snackbar--default&viewMode=story',
  );
  await page.getByRole('button', { name: 'Save changes' }).click();
  const list = page.locator('.cods-toast__list');
  await expect(list).toHaveCSS('position', 'fixed');
  await expect(list.locator('.cods-toast__item')).toHaveCSS(
    'animation-name',
    'none',
  );
});

test('action remains available in context', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=components-toast-snackbar--action&viewMode=story',
  );
  await page
    .getByRole('button', { name: 'Update contact information' })
    .click();
  const toast = page.locator('.cods-toast__item');
  await toast.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.locator('[data-cods-toast-demo-status]')).toHaveText(
    'Contact information update undone.',
  );
  await expect(
    page.getByRole('button', { name: 'Undo contact information update' }),
  ).toBeVisible();
});

test('a toast does not obscure keyboard focus at narrow reflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto(
    '/iframe.html?id=components-toast-snackbar--action&viewMode=story',
  );
  const trigger = page.getByRole('button', {
    name: 'Update contact information',
  });
  const contextAction = page.getByRole('button', {
    name: 'Undo contact information update',
  });
  const list = page.locator('.cods-toast__list');
  await trigger.click();
  await expect(list.locator('.cods-toast__item')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expectFocusClearOfToast(contextAction, list);
  await page.keyboard.press('Shift+Tab');
  await expectFocusClearOfToast(trigger, list);
  await page.keyboard.press('Tab');
  await expectFocusClearOfToast(contextAction, list);
  await page.keyboard.press('Tab');
  const toastAction = list.getByRole('button', { name: 'Undo', exact: true });
  await expect(toastAction).toBeFocused();
  await expect(toastAction).toBeInViewport({ ratio: 1 });
  await page.keyboard.press('Enter');
  await expect(list.locator('.cods-toast__item')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('a stack avoids focused content and remains keyboard accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto(
    '/iframe.html?id=components-toast-snackbar--action&viewMode=story',
  );
  const trigger = page.getByRole('button', {
    name: 'Update contact information',
  });
  const contextAction = page.getByRole('button', {
    name: 'Undo contact information update',
  });
  const list = page.locator('.cods-toast__list');
  await trigger.focus();
  for (let index = 0; index < 3; index++) {
    await page.keyboard.press('Enter');
  }
  const items = list.locator('.cods-toast__item');
  await expect(items).toHaveCount(3);
  await expectFocusClearOfToast(trigger, list);
  await page.keyboard.press('Tab');
  await expectFocusClearOfToast(contextAction, list);
  await expect
    .poll(() =>
      list.evaluate((element) => element.scrollHeight > element.clientHeight),
    )
    .toBe(true);
  for (let index = 0; index < 3; index++) {
    for (const name of ['Undo', 'Dismiss']) {
      await page.keyboard.press('Tab');
      const control = items
        .nth(index)
        .getByRole('button', { name, exact: true });
      await expect(control).toBeFocused();
      await expect(control).toBeInViewport({ ratio: 1 });
    }
  }
});

test('a constrained toast stack remains usable with a pointer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto(
    '/iframe.html?id=components-toast-snackbar--action&viewMode=story',
  );
  const trigger = page.getByRole('button', {
    name: 'Update contact information',
  });
  const list = page.locator('.cods-toast__list');
  await expectConstrainedStackClickable(page, trigger, list);
});

test('a toast adjusts when the focused control moves on resize or scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(
    '/iframe.html?id=components-toast-snackbar--action&viewMode=story',
  );
  const trigger = page.getByRole('button', {
    name: 'Update contact information',
  });
  const contextAction = page.getByRole('button', {
    name: 'Undo contact information update',
  });
  const list = page.locator('.cods-toast__list');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await contextAction.focus();
  await expectFocusClearOfToast(contextAction, list);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );

  await page.setViewportSize({ width: 320, height: 256 });
  await expectFocusClearOfToast(contextAction, list);
  await page.evaluate(() => {
    document.body.style.paddingBottom = '400px';
    window.scrollTo(0, 120);
  });
  await expectFocusClearOfToast(contextAction, list);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expectFocusClearOfToast(contextAction, list);
});

const luminance = (rgb: string) => {
  const [r = 0, g = 0, b = 0] = (rgb.match(/[\d.]+/g) ?? [])
    .slice(0, 3)
    .map((value) => {
      const channel = Number(value) / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [light = 0, dark = 0] = [luminance(a), luminance(b)].sort(
    (x, y) => y - x,
  );
  return (light + 0.05) / (dark + 0.05);
};

test('toast matches the basic design and focus has 3:1 contrast', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(
    '/iframe.html?id=components-toast-snackbar--action&viewMode=story',
  );
  await page
    .getByRole('button', { name: 'Update contact information' })
    .click();
  const toast = page.locator('.cods-toast__item');
  await expect(toast).toHaveCSS('padding', '12px');
  await expect(toast).toHaveCSS('font-weight', '600');
  await expect(toast).toHaveCSS('box-shadow', /0\.12\)? 0px 16px 32px 0px$/);
  expect((await toast.boundingBox())?.width).toBe(320);
  const background = await toast.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  for (const name of ['Undo', 'Dismiss']) {
    const control = toast.getByRole('button', { name, exact: true });
    await control.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(control).toBeFocused();
    const outline = await control.evaluate(
      (element) => getComputedStyle(element).outlineColor,
    );
    expect(contrast(outline, background)).toBeGreaterThanOrEqual(3);
  }
});
