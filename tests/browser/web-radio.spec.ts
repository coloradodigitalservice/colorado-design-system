import { routeBuiltFiles } from './built-files.js';
import { test, expect, expectAccessible } from './fixtures.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/radio/');
});

test('native grouping, labels, keyboard, disabled options and validation', async ({
  page,
  browserName,
}, testInfo) => {
  const group = page.getByRole('group', { name: 'How should we contact you?' });
  const email = group.getByRole('radio', { name: 'Email', exact: true });
  const phone = group.getByRole('radio', { name: 'Phone', exact: true });
  await group.getByText('Email', { exact: true }).click();
  await expect(email).toBeChecked();
  await email.focus();
  await page.keyboard.press('ArrowDown');
  await expect(phone).toBeFocused();
  await expect(phone).toBeChecked();
  await expect(email).not.toBeChecked();
  await page.keyboard.press('ArrowUp');
  await expect(email).toBeChecked();
  await page.keyboard.press('Space');
  await expect(email).toBeChecked();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.locator('#radio-selected-1')).toBeFocused();
  // A different name isolates the selected example from the first group.
  await expect(page.locator('#radio-selected-1')).toBeChecked();
  await expect(email).toBeChecked();
  await page.locator('#radio-disabled-1').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#radio-disabled-3')).toBeFocused();
  await expect(page.locator('#radio-disabled-3')).toBeChecked();
  await expect(page.locator('#radio-disabled-2')).toBeDisabled();
  for (const id of ['radio-disabled-group-1', 'radio-disabled-group-2']) {
    await expect(page.locator(`#${id}`)).toBeDisabled();
  }
  await expect(page.locator('#radio-disabled-group-1')).toBeChecked();
  const error = page.getByRole('group', { name: 'Choose an application type' });
  await expect(error).toHaveAccessibleDescription(
    'Error: Select an application type before continuing.',
  );
  expect(
    await error
      .locator('input')
      .first()
      .evaluate((el) => (el as HTMLInputElement).validity.valueMissing),
  ).toBe(true);
  await error.getByText('Renewal', { exact: true }).click();
  expect(
    await error
      .locator('input')
      .first()
      .evaluate((el) => (el as HTMLInputElement).validity.valueMissing),
  ).toBe(false);
  await expectAccessible(page, testInfo);
});

for (const selected of [false, true]) {
  test(`invalid ${selected ? 'selected' : 'unselected'} radio keeps its error border on hover`, async ({
    page,
  }) => {
    const input = page.locator('#radio-error-1');
    const label = page.locator('label[for="radio-error-1"]');
    await label.scrollIntoViewIfNeeded();
    if (selected) await label.click();
    await page.mouse.move(0, 0);
    const before = await label.evaluate(
      (el) => getComputedStyle(el, '::before').borderColor,
    );
    expect(before).toContain('rgb(181, 9, 9)');
    await label.hover();
    expect(await input.evaluate((el) => el.matches(':hover'))).toBe(true);
    expect(
      await label.evaluate(
        (el) => getComputedStyle(el, '::before').borderColor,
      ),
    ).toBe(before);
    await expect(input).toBeChecked({ checked: selected });
  });
}

test('visible selection, focus, body typography, RTL, reflow and reduced motion', async ({
  page,
}) => {
  const input = page.locator('#radio-default-1');
  await input.focus();
  await page.keyboard.press('Space');
  const label = page.locator('label[for="radio-default-1"]');
  const style = await label.evaluate((el) => {
    const text = getComputedStyle(el);
    const circle = getComputedStyle(el, '::before');
    return {
      size: text.fontSize,
      weight: text.fontWeight,
      height: text.lineHeight,
      radius: circle.borderRadius,
      outline: circle.outlineStyle,
      width: circle.outlineWidth,
      shadow: circle.boxShadow,
      background: circle.backgroundColor,
    };
  });
  expect(style).toMatchObject({
    size: '16px',
    weight: '400',
    height: '24px',
    radius: '50%',
    outline: 'solid',
    width: '2px',
    background: 'rgb(0, 25, 112)',
  });
  expect(style.shadow).toContain('inset');
  await page.setViewportSize({ width: 320, height: 900 });
  for (const state of [
    'default',
    'error',
    'long-content',
    'localization',
    'rtl',
  ]) {
    const block = page.locator(`[data-cods-fixture-state="${state}"]`);
    expect(await block.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
  }
  const rtl = page.locator('label[for="radio-rtl-1"]');
  expect(await rtl.evaluate((el) => getComputedStyle(el).paddingRight)).toBe(
    '36px',
  );
  expect(await rtl.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe(
    '8px',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await label.evaluate(
      (el) => getComputedStyle(el, '::before').animationName,
    ),
  ).toBe('none');
});

test('forced colors reveals native selected and disabled controls', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const input = page.locator('#radio-default-1');
  await input.focus();
  await page.keyboard.press('Space');
  await expect(input).toBeChecked();
  await expect(input).toBeInViewport();
  expect(
    await input.evaluate((el) => {
      const css = getComputedStyle(el);
      return {
        position: css.position,
        appearance: css.appearance,
        width: el.getBoundingClientRect().width,
        outline: css.outlineStyle,
        decoration: getComputedStyle(el.nextElementSibling!, '::before')
          .display,
      };
    }),
  ).toEqual({
    position: 'static',
    appearance: 'auto',
    width: 16,
    outline: 'solid',
    decoration: 'none',
  });
  await expect(page.locator('#radio-disabled-group-1')).toBeDisabled();
  await expect(page.locator('#radio-disabled-group-1')).toBeChecked();
});

for (const withoutStyles of [false, true]) {
  test(`works without JavaScript${withoutStyles ? ' or CSS' : ''}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      if (process.env.CODS_BUILT_FILES === '1')
        await routeBuiltFiles(page, 'web');
      if (withoutStyles) await page.route('**/*.css', (route) => route.abort());
      await page.goto('http://127.0.0.1:4321/radio/');
      const email = page.locator('#radio-default-1');
      if (withoutStyles) await expect(email).toBeVisible();
      await page.locator('label[for="radio-default-1"]').click();
      await expect(email).toBeChecked();
      await email.focus();
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('#radio-default-2')).toBeChecked();
      await expect(email).not.toBeChecked();
    } finally {
      await context.close();
    }
  });
}

test('Figma radio geometry and tile labels preserve native group selection', async ({
  page,
}) => {
  const label = page.locator('label[for=radio-default-1]');
  await expect(label).toHaveCSS('padding-inline-start', '36px');
  expect(
    await label.evaluate((el) => {
      const style = getComputedStyle(el, '::before');
      return {
        width: style.width,
        border: style.borderWidth,
        inset: style.marginInlineStart,
      };
    }),
  ).toEqual({ width: '20px', border: '2px', inset: '8px' });
  const tile = page.locator('label[for=radio-tile-post]');
  await expect(tile).toHaveCSS('padding-block-start', '12px');
  await expect(page.locator('.cods-radio--tile').first()).toHaveCSS(
    'width',
    '240px',
  );
  await expect(tile).toHaveCSS('padding-inline-start', '44px');
  await tile.click();
  await expect(page.locator('#radio-tile-post')).toBeChecked();
  await expect(page.locator('#radio-tile-email')).not.toBeChecked();
  await expect(tile).toHaveCSS('background-color', 'rgb(217, 232, 246)');
  await page.locator('#radio-tile-post').focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#radio-tile-email')).toBeChecked();
  await expect(page.locator('#radio-tile-phone')).toBeDisabled();
});
