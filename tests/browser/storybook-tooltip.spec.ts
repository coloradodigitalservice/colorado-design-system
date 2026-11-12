import { expect, expectAccessible, test } from './fixtures.js';

const STORY =
  '/iframe.html?id=components-tooltip--all-states&viewMode=story&globals=a11y.manual:!true';

test('tooltip opens on focus and hover and Escape dismisses without moving focus', async ({
  page,
}, testInfo) => {
  await page.goto(STORY);
  const trigger = page
    .locator('[data-cods-fixture-state="top"]')
    .getByRole('button', { name: 'Top', exact: true });
  await trigger.focus();
  const body = trigger.locator('..').locator('[role="tooltip"]');
  await expect(body).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-describedby', /tooltip-/);
  await expectAccessible(page, testInfo, '#storybook-root');
  await page.keyboard.press('Escape');
  await expect(body).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.blur();
  await trigger.hover();
  await expect(body).toBeVisible();
  await body.hover();
  await expect(body).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(body).toBeHidden();
});

test('all positions avoid the trigger and viewport edges', async ({ page }) => {
  await page.goto(STORY);
  for (const side of ['top', 'bottom', 'left', 'right']) {
    const trigger = page
      .locator(`[data-cods-fixture-state="${side}"]`)
      .getByRole('button', {
        name: side.charAt(0).toUpperCase() + side.slice(1),
        exact: true,
      });
    const root = trigger.locator('xpath=../..');
    await root.evaluate((element) => {
      Object.assign((element as HTMLElement).style, {
        position: 'fixed',
        left: '50%',
        top: '50%',
        zIndex: '999999',
      });
    });
    await trigger.focus();
    const body = trigger.locator('..').locator('[role="tooltip"]');
    await expect(body).toBeVisible();
    await expect(body).toHaveClass(new RegExp(`usa-tooltip__body--${side}`));
    const t = (await trigger.boundingBox())!;
    const b = (await body.boundingBox())!;
    if (side === 'top') expect(b.y + b.height).toBeLessThanOrEqual(t.y);
    if (side === 'bottom') expect(b.y).toBeGreaterThanOrEqual(t.y + t.height);
    if (side === 'left') expect(b.x + b.width).toBeLessThanOrEqual(t.x);
    if (side === 'right') expect(b.x).toBeGreaterThanOrEqual(t.x + t.width);
    await trigger.blur();
    for (const corner of [
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ]) {
      await root.evaluate((element, value) => {
        Object.assign((element as HTMLElement).style, {
          left: value.endsWith('left') ? '0px' : 'auto',
          right: value.endsWith('right') ? '0px' : 'auto',
          top: value.startsWith('top') ? '0px' : 'auto',
          bottom: value.startsWith('bottom') ? '0px' : 'auto',
        });
      }, corner);
      await trigger.focus();
      await expect(body).toBeVisible();
      const edge = (await body.boundingBox())!;
      const viewport = page.viewportSize()!;
      expect(edge.x).toBeGreaterThanOrEqual(-0.5);
      expect(edge.y).toBeGreaterThanOrEqual(-0.5);
      expect(edge.x + edge.width).toBeLessThanOrEqual(viewport.width + 0.5);
      expect(edge.y + edge.height).toBeLessThanOrEqual(viewport.height + 0.5);
      const target = (await trigger.boundingBox())!;
      expect(
        edge.x + edge.width <= target.x ||
          edge.x >= target.x + target.width ||
          edge.y + edge.height <= target.y ||
          edge.y >= target.y + target.height,
      ).toBe(true);
      await trigger.blur();
    }
    await root.evaluate((element) =>
      (element as HTMLElement).removeAttribute('style'),
    );
  }
});

test('an open tooltip repositions when the viewport narrows', async ({
  page,
}) => {
  await page.goto(STORY);
  const trigger = page
    .locator('[data-cods-fixture-state="right"]')
    .getByRole('button', { name: 'Right' });
  const root = trigger.locator('xpath=../..');
  await root.evaluate((element) =>
    Object.assign((element as HTMLElement).style, {
      position: 'fixed',
      left: '600px',
      top: '200px',
    }),
  );
  await trigger.focus();
  const body = trigger.locator('..').locator('[role="tooltip"]');
  await expect(body).toHaveClass(/usa-tooltip__body--right/);
  await page.setViewportSize({ width: 720, height: 720 });
  await expect(body).not.toHaveClass(/usa-tooltip__body--right/);
  await expect(trigger).toBeFocused();
  const box = (await body.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(-0.5);
  expect(box.x + box.width).toBeLessThanOrEqual(720.5);
});

test('positions the tooltip relative to a scaled ancestor', async ({
  page,
}) => {
  await page.goto(STORY);
  const section = page.locator('[data-cods-fixture-state="top"]');
  await section.evaluate((element) =>
    Object.assign((element as HTMLElement).style, {
      transform: 'scale(1.5)',
      transformOrigin: 'top left',
      position: 'fixed',
      left: '300px',
      top: '300px',
    }),
  );
  const trigger = section.getByRole('button', { name: 'Top' });
  await trigger.focus();
  const body = trigger.locator('..').locator('[role="tooltip"]');
  await expect(body).toHaveClass(/usa-tooltip__body--top/);
  const t = (await trigger.boundingBox())!;
  const b = (await body.boundingBox())!;
  expect(b.y + b.height).toBeLessThanOrEqual(t.y);
  expect(Math.abs(b.x + b.width / 2 - (t.x + t.width / 2))).toBeLessThan(2);
});
