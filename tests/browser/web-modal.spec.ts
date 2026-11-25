import { test, expect, expectAccessible } from './fixtures.js';

const dialog = (page: import('@playwright/test').Page, id: string) =>
  page.locator(`#${id}`);

test('page presents the preview, status, guidance and specifications', async ({
  page,
}) => {
  await page.goto('/modal/');
  const headings = await page.locator('main h2').allTextContents();
  expect(headings).toEqual(
    expect.arrayContaining([
      'Component preview',
      'Component code',
      'Component status',
      'Guidance',
      'Specifications',
    ]),
  );
  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(3);
  await expect(
    page
      .getByText('manual accessibility review is pending', { exact: false })
      .first(),
  ).toBeVisible();
});

test('documented modal opens, traps focus and returns focus on close', async ({
  page,
}, testInfo) => {
  await page.goto('/modal/');
  const trigger = page.getByRole('button', { name: 'Delete this record' });
  await trigger.click();
  const wrapper = dialog(page, 'cods-modal-default');
  await expect(wrapper).toHaveClass(/is-visible/);
  await expect(wrapper).toHaveAttribute('aria-modal', 'true');
  await expect(wrapper).toHaveAttribute('role', 'dialog');
  // Focus moved into the dialog.
  expect(
    await page.evaluate(() =>
      document
        .getElementById('cods-modal-default')!
        .contains(document.activeElement),
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo, 'body');
  await page.keyboard.press('Escape');
  await expect(wrapper).not.toHaveClass(/is-visible/);
  await expect(trigger).toBeFocused();
});

test('every documented close path dismisses the default modal', async ({
  page,
}) => {
  await page.goto('/modal/');
  const trigger = page.getByRole('button', { name: 'Delete this record' });
  const wrapper = dialog(page, 'cods-modal-default');

  await trigger.click();
  await wrapper.getByRole('button', { name: 'Close this window' }).click();
  await expect(wrapper).not.toHaveClass(/is-visible/);

  await trigger.click();
  await wrapper.getByRole('button', { name: 'Cancel' }).click();
  await expect(wrapper).not.toHaveClass(/is-visible/);

  // Overlay click: the scrim sits outside the dialog box.
  await trigger.click();
  await expect(wrapper).toHaveClass(/is-visible/);
  await page.mouse.click(5, 5);
  await expect(wrapper).not.toHaveClass(/is-visible/);
});

test('forced-action modal ignores Escape and overlay clicks', async ({
  page,
}) => {
  await page.goto('/modal/');
  const wrapper = dialog(page, 'cods-modal-forced');
  await page.getByRole('button', { name: 'Review session timeout' }).click();
  await expect(wrapper).toHaveClass(/is-visible/);
  await expect(wrapper).toHaveAttribute('data-force-action', 'true');
  // No dismiss affordance is rendered at all.
  await expect(
    wrapper.getByRole('button', { name: 'Close this window' }),
  ).toHaveCount(0);

  await page.keyboard.press('Escape');
  await expect(wrapper).toHaveClass(/is-visible/);
  await page.mouse.click(5, 5);
  await expect(wrapper).toHaveClass(/is-visible/);

  // Only an in-dialog action closes it.
  await wrapper.getByRole('button', { name: 'Yes, stay signed in' }).click();
  await expect(wrapper).not.toHaveClass(/is-visible/);
});

test('an open modal hides the rest of the page from assistive technology', async ({
  page,
}) => {
  await page.goto('/modal/');
  await page.getByRole('button', { name: 'Delete this record' }).click();
  const hidden = await page.evaluate(() =>
    Array.from(document.body.children)
      .filter((child) => !child.classList.contains('usa-modal-wrapper'))
      .every((child) => child.getAttribute('aria-hidden') === 'true'),
  );
  expect(hidden).toBe(true);
  await page.keyboard.press('Escape');
  expect(await page.locator('[data-modal-hidden]').count()).toBe(0);
});

test('the dialog keeps a visible boundary in forced colors', async ({
  page,
}) => {
  await page.goto('/modal/');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.getByRole('button', { name: 'Delete this record' }).click();
  const styles = await page.evaluate(() => {
    const element = document
      .getElementById('cods-modal-default')!
      .querySelector<HTMLElement>('.cods-modal__dialog')!;
    const computed = getComputedStyle(element);
    return {
      borderStyle: computed.borderTopStyle,
      borderWidth: computed.borderTopWidth,
    };
  });
  // The elevation shadow carries no meaning in forced colors and engines
  // disagree on whether they strip it, so the explicit border is what is
  // asserted here.
  expect(styles.borderStyle).toBe('solid');
  expect(styles.borderWidth).not.toBe('0px');
});

test('reflows at 320px without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/modal/');
  await page
    .getByRole('button', { name: 'Read the accessibility statement' })
    .click();
  await expect(dialog(page, 'cods-modal-large')).toHaveClass(/is-visible/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('focus wraps at both ends of the open dialog', async ({ page }) => {
  await page.goto('/modal/');
  await page.getByRole('button', { name: 'Delete this record' }).click();
  const wrapper = dialog(page, 'cods-modal-default');
  const stops = await wrapper.evaluate((element) =>
    Array.from(
      element.querySelectorAll<HTMLElement>('button:not([disabled])'),
    ).map(
      (button) =>
        button.getAttribute('aria-label') ?? button.textContent!.trim(),
    ),
  );
  expect(stops.length).toBeGreaterThan(1);
  const first = stops[0]!;
  const last = stops[stops.length - 1]!;

  // Driven from the tab stops themselves rather than by tabbing through the
  // page: WebKit omits buttons from sequential focus navigation unless macOS
  // full keyboard access is on, so a Tab sweep proves nothing there. This
  // exercises the wrap logic the focus trap actually implements.
  await wrapper.getByRole('button', { name: last }).focus();
  await page.keyboard.press('Tab');
  await expect(wrapper.getByRole('button', { name: first })).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(wrapper.getByRole('button', { name: last })).toBeFocused();
});

const box = async (page: import('@playwright/test').Page, selector: string) =>
  (await page.locator(selector).first().boundingBox())!;

test('matches the Figma desktop spacing', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/modal/');
  for (const [name, id] of [
    ['Delete this record', 'cods-modal-default'],
    ['Review session timeout', 'cods-modal-forced'],
  ] as const) {
    await page.getByRole('button', { name }).click();
    const dialog = await box(page, `#${id} .cods-modal__dialog`);
    const heading = await box(page, `#${id} .cods-modal__heading`);
    const actions = await box(page, `#${id} .cods-modal__actions`);
    expect(dialog.width).toBeCloseTo(480, 1);
    // 40px spacer + 4px content padding, with or without a close button.
    expect(heading.y - dialog.y).toBeCloseTo(44, 1);
    // 32px insets leave a 416px text area.
    expect(heading.x - dialog.x).toBeCloseTo(32, 1);
    expect(heading.width).toBeCloseTo(416, 1);
    expect(dialog.y + dialog.height - (actions.y + actions.height)).toBeCloseTo(
      32,
      1,
    );
    if (id === 'cods-modal-default') {
      const icon = await box(page, `#${id} .cods-modal__close-icon`);
      expect(icon.y - dialog.y).toBeCloseTo(12, 1);
      expect(dialog.x + dialog.width - (icon.x + icon.width)).toBeCloseTo(
        12,
        1,
      );
    }
    await page.getByRole('button', { name: /Cancel|Sign out/ }).click();
  }
});

for (const [viewport, width] of [
  [375, 343],
  [320, 288],
] as const) {
  test(`matches the Figma mobile layout at ${viewport}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport, height: 800 });
    await page.goto('/modal/');
    await page.getByRole('button', { name: 'Review session timeout' }).click();
    const id = '#cods-modal-forced';
    const dialog = await box(page, `${id} .cods-modal__dialog`);
    const heading = await box(page, `${id} .cods-modal__heading`);
    expect(dialog.width).toBeCloseTo(width, 1);
    expect(heading.y - dialog.y).toBeCloseTo(48, 1);
    expect(heading.x - dialog.x).toBeCloseTo(32, 1);
    const buttons = page.locator(`${id} .cods-modal__action .cods-button`);
    await expect(buttons).toHaveCount(2);
    const [first, second] = [
      (await buttons.nth(0).boundingBox())!,
      (await buttons.nth(1).boundingBox())!,
    ];
    // Full-width, equal and stacked.
    expect(first.width).toBeCloseTo(width - 64, 1);
    expect(second.width).toBeCloseTo(first.width, 1);
    expect(second.y).toBeGreaterThan(first.y + first.height - 1);
  });
}
