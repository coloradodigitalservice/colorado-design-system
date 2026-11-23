import { resolve } from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { test, expect, expectAccessible } from './fixtures.js';
import {
  expectConstrainedStackClickable,
  expectFocusClearOfToast,
} from './toast-focus-checks.js';

test('supplemental notification preserves context and returns focus', async ({
  page,
}, testInfo) => {
  await page.goto('/toast/');
  const trigger = page.getByRole('button', { name: 'Save changes' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const notification = page.locator('.cods-toast__item').first();
  await expect(notification).toContainText('Changes saved.');
  await expect(trigger).toBeFocused();
  await expect(
    page.locator('[data-cods-toast-demo-status]').first(),
  ).toHaveText('Changes saved.');
  await expectAccessible(page, testInfo, 'body');
  const dismiss = notification.getByRole('button', { name: 'Dismiss' });
  await dismiss.focus();
  await page.keyboard.press('Enter');
  await expect(notification).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

async function expectUnclippedToastShadows(page: Page, list: Locator) {
  const bounds = await list
    .locator('.cods-toast__item')
    .evaluateAll((items) => {
      const rectangles = items.map((item) => item.getBoundingClientRect());
      return {
        left: Math.min(...rectangles.map((rect) => rect.left)),
        top: Math.min(...rectangles.map((rect) => rect.top)),
        right: Math.max(...rectangles.map((rect) => rect.right)),
        bottom: Math.max(...rectangles.map((rect) => rect.bottom)),
      };
    });
  const viewport = page.viewportSize()!;
  const left = Math.max(0, Math.floor(bounds.left - 64));
  const top = Math.max(0, Math.floor(bounds.top - 64));
  const clip = {
    x: left,
    y: top,
    width: Math.min(viewport.width, Math.ceil(bounds.right + 64)) - left,
    height: Math.min(viewport.height, Math.ceil(bounds.bottom + 64)) - top,
  };
  const actual = await page.screenshot({ clip, animations: 'disabled' });
  await list.evaluate((element) => {
    element.style.overflow = 'visible';
  });
  const unclipped = await page.screenshot({ clip, animations: 'disabled' });
  await list.evaluate((element) => {
    element.style.removeProperty('overflow');
  });
  expect(actual.equals(unclipped), 'scroll container clips a shadow').toBe(
    true,
  );
}

test('notification shadows are not clipped at either placement', async ({
  page,
}) => {
  for (const { width, direction, customShadow } of [
    { width: 1280, direction: 'ltr', customShadow: false },
    { width: 320, direction: 'ltr', customShadow: false },
    { width: 320, direction: 'rtl', customShadow: false },
    { width: 1280, direction: 'ltr', customShadow: true },
  ]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/toast/');
    await page.evaluate(
      ({ direction, customShadow }) => {
        document.documentElement.style.scrollBehavior = 'auto';
        document.documentElement.dir = direction;
        if (customShadow) {
          document.documentElement.style.setProperty(
            '--cods-elevation-high-x',
            '-4px',
          );
          document.documentElement.style.setProperty(
            '--cods-elevation-high-y',
            '-12px',
          );
          document.documentElement.style.setProperty(
            '--cods-elevation-high-blur',
            '24px',
          );
          document.documentElement.style.setProperty(
            '--cods-elevation-high-spread',
            '6px',
          );
        }
      },
      { direction, customShadow },
    );
    const trigger = page.getByRole('button', { name: 'Save changes' });
    await trigger.click();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
    });
    const list = page.locator('.cods-toast__list');
    const toast = list.locator('.cods-toast__item');
    await expect(toast).toHaveCSS(
      'box-shadow',
      customShadow ? /-4px -12px 24px 6px$/ : /32px/,
    );
    await expect(list).not.toHaveClass(/cods-toast__list--focus-top/);
    expect((await toast.boundingBox())?.width).toBe(Math.min(320, width - 32));
    await expectUnclippedToastShadows(page, list);

    await trigger.evaluate((element) => {
      element.style.position = 'fixed';
      element.style.insetBlockEnd = '16px';
      element.style.insetInlineEnd = '16px';
    });
    await trigger.focus();
    await expect(list).toHaveClass(/cods-toast__list--focus-top/);
    await expectUnclippedToastShadows(page, list);
  }
});

test('stacked notifications retain their individual shadows', async ({
  page,
}) => {
  await page.goto('/toast/');
  const trigger = page.getByRole('button', {
    name: 'Update contact information',
  });
  await trigger.click();
  await trigger.click();
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  });
  const list = page.locator('.cods-toast__list');
  await expect(list.locator('.cods-toast__item')).toHaveCount(2);
  await page.evaluate(() => document.fonts.ready);
  await expectUnclippedToastShadows(page, list);
});

test('shadow space does not block a control behind it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/toast/');
  await page.getByRole('button', { name: 'Save changes' }).click();
  const list = page.locator('.cods-toast__list');
  await expect(list).toHaveCSS('pointer-events', 'none');
  const box = (await list.locator('.cods-toast__item').boundingBox())!;
  await page.evaluate(({ x, y }) => {
    const button = document.createElement('button');
    button.id = 'background-control';
    button.textContent = 'Background control';
    button.style.cssText = `position: fixed; left: ${x - 80}px; top: ${y}px;
      width: 80px; height: 24px; z-index: 999;`;
    button.addEventListener('click', () => {
      button.dataset.clicked = 'true';
    });
    document.body.append(button);
  }, box);
  const control = page.locator('#background-control');
  await control.click({ position: { x: 64, y: 12 } });
  await expect(control).toHaveAttribute('data-clicked', 'true');
});

test('the notification area remains scrollable when its content resizes', async ({
  page,
}) => {
  await page.goto('/toast/');
  await page.getByRole('button', { name: 'Save changes' }).click();
  const list = page.locator('.cods-toast__list');
  const toast = list.locator('.cods-toast__item');
  await expect(list).toHaveCSS('pointer-events', 'none');
  await toast.evaluate((element) => {
    element.style.height = '800px';
  });
  await expect
    .poll(() =>
      list.evaluate((element) => element.scrollHeight > element.clientHeight),
    )
    .toBe(true);
  await expect(list).toHaveCSS('pointer-events', 'auto');
  await toast.evaluate((element) => {
    element.style.removeProperty('height');
  });
  await expect(list).toHaveCSS('pointer-events', 'none');
});

test('live example notifications stack and Undo only clears related messages', async ({
  page,
}) => {
  await page.goto('/toast/');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.getByRole('button', { name: 'Submit response' }).click();
  const trigger = page.getByRole('button', {
    name: 'Update contact information',
  });
  await trigger.click();
  const toasts = page.locator('.cods-toast__item');
  await expect(toasts).toHaveCount(3);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  });
  await expect
    .poll(() =>
      toasts.evaluateAll((items) => {
        const bounds = items.map((item) => {
          const rect = item.getBoundingClientRect();
          const hit = document.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
          );
          return {
            top: rect.top,
            bottom: rect.bottom,
            visible: hit === item || item.contains(hit),
          };
        });
        return bounds.every((box, index) => {
          const previous = bounds[index - 1];
          return box.visible && (!previous || box.top >= previous.bottom);
        });
      }),
    )
    .toBe(true);
  await page.locator('#main-content').focus();
  await page.locator('#main-content').evaluate((main) => {
    const list = document.querySelector<HTMLElement>('[data-cods-toast-list]')!;
    const { top, bottom } = list.getBoundingClientRect();
    window.scrollTo({
      top:
        window.scrollY +
        main.getBoundingClientRect().bottom -
        (top + bottom) / 2,
      behavior: 'instant',
    });
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  for (let index = 0; index < 3; index++) {
    await expect(toasts.nth(index)).toBeInViewport({ ratio: 1 });
  }

  const actionToast = toasts.filter({
    hasText: 'Contact information has been updated.',
  });
  await actionToast.getByRole('button', { name: 'Undo', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
  await expect(toasts).toHaveCount(2);
  await expect(toasts.filter({ hasText: 'Changes saved.' })).toBeVisible();
  await expect(toasts.filter({ hasText: 'Response submitted.' })).toBeVisible();

  await trigger.click();
  await trigger.click();
  await expect(actionToast).toHaveCount(2);
  await actionToast.first().getByRole('button', { name: 'Dismiss' }).click();
  await page
    .getByRole('button', { name: 'Undo contact information update' })
    .click();
  await expect(actionToast).toHaveCount(0);
  await expect(toasts).toHaveCount(2);
  await expect(
    page.locator(
      '[data-cods-fixture-state="action"] [data-cods-toast-demo-status]',
    ),
  ).toHaveText('Contact information update undone.');
});

test('a toast does not obscure its contextual action at narrow reflow', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto('/toast/');
  const example = page.locator('[data-cods-fixture-state="action"]');
  const trigger = example.getByRole('button', {
    name: 'Update contact information',
  });
  const contextAction = example.getByRole('button', {
    name: 'Undo contact information update',
  });
  const list = example.locator('.cods-toast__list');
  const tab =
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab';
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(list.locator('.cods-toast__item')).toHaveCount(1);
  await page.keyboard.press(tab);
  await expectFocusClearOfToast(contextAction, list);
  await page.keyboard.press(tab);
  const toastAction = list.getByRole('button', { name: 'Undo', exact: true });
  await expect(toastAction).toBeFocused();
  await expect(toastAction).toBeInViewport({ ratio: 1 });
});

test('a constrained toast stack remains usable with a pointer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto('/toast/');
  const example = page.locator('[data-cods-fixture-state="action"]');
  await expectConstrainedStackClickable(
    page,
    example.getByRole('button', { name: 'Update contact information' }),
    example.locator('.cods-toast__list'),
  );
});

test('toast controls remain reachable when the focused control fills the viewport', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 320, height: 256 });
  await page.goto('/toast/');
  const example = page.locator('[data-cods-fixture-state="action"]');
  const trigger = example.getByRole('button', {
    name: 'Update contact information',
  });
  const contextAction = example.getByRole('button', {
    name: 'Undo contact information update',
  });
  const list = example.locator('.cods-toast__list');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await contextAction.evaluate((element) => {
    element.style.position = 'fixed';
    element.style.inset = '0';
    element.style.width = '100vw';
    element.style.height = '100dvh';
    element.style.margin = '0';
  });
  await contextAction.focus();
  await expect(list).toBeVisible();
  await expect
    .poll(() =>
      contextAction.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const target = document.elementFromPoint(
          (rect.left + rect.right) / 2,
          rect.bottom - 8,
        );
        return target === element || element.contains(target);
      }),
    )
    .toBe(true);
  const tab =
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab';
  await page.keyboard.press(tab);
  const toastAction = list.getByRole('button', { name: 'Undo', exact: true });
  await expect(toastAction).toBeFocused();
  await expect(toastAction).toBeInViewport({ ratio: 1 });
});

async function openCopiedExample(
  page: Page,
  state: 'default' | 'icon' | 'action',
) {
  await page.goto('/toast/');
  const heading = state === 'default' ? 'examples' : state;
  const script = await page
    .locator(`#${heading}`)
    .locator('xpath=following-sibling::pre[1]/code')
    .textContent();
  const markup = await page
    .locator(`[data-cods-example="${state}"] code`)
    .textContent();
  if (script === null || markup === null)
    throw new Error(`Missing copied ${state} example`);

  const importMap = JSON.stringify({
    imports: {
      '@coloradodigitalservice/colorado-design-system':
        '/__cods-toast-snippet__/package.mjs',
    },
  });
  await page.route('**/__cods-toast-snippet__/package.mjs', (route) =>
    route.fulfill({
      path: resolve(
        'packages/colorado-design-system/dist/colorado-design-system.mjs',
      ),
      contentType: 'text/javascript',
    }),
  );
  await page.route('**/__cods-toast-snippet__/example.mjs', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: script }),
  );
  await page.route('**/icons/sprite.svg', (route) =>
    route.fulfill({
      path: resolve('packages/colorado-design-system/dist/icons/sprite.svg'),
      contentType: 'image/svg+xml',
    }),
  );
  await page.route('**/__cods-toast-snippet__/', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Copied toast example</title>
            <link rel="icon" href="data:,">
            <script type="importmap">${importMap}</script>
            <script type="module" src="/__cods-toast-snippet__/example.mjs"></script>
          </head>
          <body>${markup}</body>
        </html>`,
    }),
  );
  await page.goto('/__cods-toast-snippet__/');
}

test('copied default HTML and JavaScript run together', async ({ page }) => {
  await openCopiedExample(page, 'default');
  const trigger = page.getByRole('button', { name: 'Save changes' });
  await trigger.click();
  await expect(page.locator('[data-cods-toast-demo-status]')).toHaveText(
    'Changes saved.',
  );
  const toast = page.locator('.cods-toast__item');
  await expect(toast).toContainText('Changes saved.');
  await toast.getByRole('button', { name: 'Dismiss' }).focus();
  await page.keyboard.press('Enter');
  await expect(toast).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('copied icon HTML and JavaScript run together', async ({ page }) => {
  await openCopiedExample(page, 'icon');
  const trigger = page.getByRole('button', { name: 'Submit response' });
  await trigger.click();
  await expect(page.locator('[data-cods-toast-demo-status]')).toHaveText(
    'Response submitted.',
  );
  const toast = page.locator('.cods-toast__item');
  await expect(toast).toContainText('Response submitted.');
  await expect(toast.locator('svg use')).toHaveAttribute(
    'href',
    '/icons/sprite.svg#check',
  );
  await toast.getByRole('button', { name: 'Dismiss' }).focus();
  await page.keyboard.press('Enter');
  await expect(toast).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('copied action HTML and JavaScript support both Undo controls', async ({
  page,
}) => {
  await openCopiedExample(page, 'action');
  const trigger = page.getByRole('button', {
    name: 'Update contact information',
  });
  const status = page.locator('[data-cods-toast-demo-status]');
  const toast = page.locator('.cods-toast__item');
  await trigger.click();
  await expect(status).toHaveText('Contact information has been updated.');
  await toast.getByRole('button', { name: 'Undo', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('Contact information update undone.');
  await expect(toast).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page
    .getByRole('button', { name: 'Undo contact information update' })
    .click();
  await expect(status).toHaveText('Contact information update undone.');
  await expect(toast).toHaveCount(0);
});
