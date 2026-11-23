import type { Locator, Page } from '@playwright/test';
import { expect } from './fixtures.js';

export async function expectFocusClearOfToast(control: Locator, list: Locator) {
  await expect(control).toBeFocused();
  await expect(control).toBeInViewport({ ratio: 1 });
  await expect
    .poll(async () => {
      const [focus, toast] = await Promise.all([
        control.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          const outline =
            style.outlineStyle === 'none'
              ? 0
              : Math.max(
                  0,
                  (parseFloat(style.outlineWidth) || 0) +
                    (parseFloat(style.outlineOffset) || 0),
                );
          return {
            left: rect.left - outline,
            right: rect.right + outline,
            top: rect.top - outline,
            bottom: rect.bottom + outline,
          };
        }),
        list.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          };
        }),
      ]);
      return (
        focus.right <= toast.left ||
        focus.left >= toast.right ||
        focus.bottom <= toast.top ||
        focus.top >= toast.bottom
      );
    })
    .toBe(true);
}

export async function expectConstrainedStackClickable(
  page: Page,
  trigger: Locator,
  list: Locator,
) {
  await trigger.evaluate((element) => {
    element.style.position = 'fixed';
    element.style.top = '32px';
    element.style.left = '16px';
  });
  await trigger.focus();
  for (let index = 0; index < 3; index++) {
    await page.keyboard.press('Enter');
  }
  const items = list.locator('.cods-toast__item');
  await expect(items).toHaveCount(3);
  await expectFocusClearOfToast(trigger, list);
  await expect
    .poll(() =>
      list.evaluate((element) => element.scrollHeight > element.clientHeight),
    )
    .toBe(true);
  await expect(list).toHaveCSS('pointer-events', 'auto');
  const box = (await list.boundingBox())!;
  expect(box.y + box.height).toBe(page.viewportSize()!.height);
  await items
    .first()
    .getByRole('button', { name: 'Undo', exact: true })
    .hover();
  await page.mouse.wheel(0, 1000);
  await expect
    .poll(() =>
      list.evaluate(
        (element) =>
          element.scrollHeight - element.clientHeight - element.scrollTop,
      ),
    )
    .toBeLessThanOrEqual(1);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(await list.evaluate((element) => element.scrollTop)).toBeGreaterThan(
    0,
  );
  const dismiss = items.last().getByRole('button', { name: 'Dismiss' });
  await expect(dismiss).toBeInViewport({ ratio: 1 });
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await expect(dismiss).toBeInViewport({ ratio: 1 });
  await dismiss.click();
  await expect(items).toHaveCount(2);
}
