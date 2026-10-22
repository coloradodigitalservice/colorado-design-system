import { test, expect, expectAccessible } from './fixtures.js';
import { routeBuiltFiles } from './built-files.js';
import { expectCheckboxAssets } from './checkbox-assets.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/checkbox/');
});

test('native label, keyboard, disabled, group, validation, and mixed semantics', async ({
  page,
  browserName,
}, testInfo) => {
  const input = page.locator('#checkbox-default');
  await page.locator('label[for="checkbox-default"]').click();
  await expect(input).toBeChecked();
  await input.focus();
  await page.keyboard.press('Space');
  await expect(input).not.toBeChecked();
  await expect(input).toBeFocused();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.locator('#checkbox-checked')).toBeFocused();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.locator('#checkbox-indeterminate')).toBeFocused();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.locator('#checkbox-error')).toBeFocused();
  await expect(page.locator('#checkbox-disabled')).toBeDisabled();
  await expect(page.locator('#checkbox-disabled-checked')).toBeDisabled();
  await expect(page.locator('#checkbox-disabled-checked')).toBeChecked();
  await expect(
    page.getByRole('group', { name: 'How should we contact you?' }),
  ).toContainText('Postal mail');
  await expect(page.locator('#checkbox-error')).toHaveAccessibleDescription(
    'Error: Agree to the terms before continuing.',
  );
  await expect(page.locator('#checkbox-error')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  const mixed = page.locator('#checkbox-indeterminate');
  await expect(mixed).toHaveJSProperty('indeterminate', true);
  await mixed.focus();
  await page.keyboard.press('Space');
  await expect(mixed).toHaveJSProperty('indeterminate', false);
  await expectAccessible(page, testInfo);
});

test('focus, token defaults, reflow, RTL, and reduced motion', async ({
  page,
}) => {
  const input = page.locator('#checkbox-default');
  await input.focus();
  await page.keyboard.press('Space');
  const label = page.locator('label[for="checkbox-default"]');
  const visual = await label.evaluate((el) => {
    const text = getComputedStyle(el);
    const box = getComputedStyle(el, '::before');
    return {
      size: text.fontSize,
      weight: text.fontWeight,
      height: text.lineHeight,
      outline: box.outlineStyle,
      width: box.outlineWidth,
      image: box.backgroundImage,
    };
  });
  expect(visual).toMatchObject({
    size: '16px',
    weight: '400',
    height: '24px',
    outline: 'solid',
    width: '2px',
  });
  expect(visual.image).not.toBe('none');
  await page.setViewportSize({ width: 320, height: 900 });
  for (const state of ['long-content', 'localization', 'rtl']) {
    const block = page.locator(`[data-cods-fixture-state="${state}"]`);
    expect(await block.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
  }
  const rtl = page.locator('label[for="checkbox-rtl"]');
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

test('forced colors uses visible native checked, mixed, and disabled controls', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const input = page.locator('#checkbox-default');
  await input.focus();
  await page.keyboard.press('Space');
  await expect(input).toBeChecked();
  await expect(input).toBeInViewport();
  const style = await input.evaluate((el) => {
    const control = getComputedStyle(el);
    const decoration = getComputedStyle(el.nextElementSibling!, '::before');
    const box = el.getBoundingClientRect();
    return {
      appearance: control.appearance,
      position: control.position,
      outline: control.outlineStyle,
      outlineWidth: control.outlineWidth,
      width: box.width,
      height: box.height,
      decoration: decoration.display,
    };
  });
  expect(style).toMatchObject({
    appearance: 'auto',
    position: 'static',
    outline: 'solid',
    outlineWidth: '4px',
    width: 16,
    height: 16,
    decoration: 'none',
  });
  const mixed = page.locator('#checkbox-indeterminate');
  await expect(mixed).toBeChecked({ indeterminate: true });
  await mixed.scrollIntoViewIfNeeded();
  await expect(mixed).toBeInViewport();
  await mixed.focus();
  await page.keyboard.press('Space');
  await expect(mixed).not.toBeChecked({ indeterminate: true });
  const disabled = page.locator('#checkbox-disabled-checked');
  await disabled.scrollIntoViewIfNeeded();
  await expect(disabled).toBeInViewport();
  await expect(disabled).toBeDisabled();
  await expect(disabled).toBeChecked();
  await page.locator('label[for="checkbox-default"]').click();
  await expect(input).not.toBeChecked();
});

for (const withoutStyles of [false, true]) {
  test(`works without JavaScript${withoutStyles ? ' or CSS' : ''}`, async ({
    browser,
  }) => {
    // Separate contexts avoid Firefox restoring checked state on reload.
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      if (process.env.CODS_BUILT_FILES === '1')
        await routeBuiltFiles(page, 'web');
      if (withoutStyles) await page.route('**/*.css', (route) => route.abort());
      await page.goto('http://127.0.0.1:4321/checkbox/');
      const input = page.locator('#checkbox-default');
      if (withoutStyles) await expect(input).toBeVisible();
      await expect(input).not.toBeChecked();
      await page.locator('label[for="checkbox-default"]').click();
      await expect(input).toBeChecked();
      await expect(page.locator('#checkbox-indeterminate')).not.toBeChecked({
        indeterminate: true,
      });
    } finally {
      await context.close();
    }
  });
}

test('shared Phosphor checked and mixed glyphs contrast on selected and disabled surfaces', async ({
  page,
}) => {
  await expectCheckboxAssets(page, '/checkbox/', 'none', { cods: true });
});

test('Figma control geometry, label gap and card selection remain native', async ({
  page,
}) => {
  const label = page.locator('label[for=checkbox-default]');
  await expect(label).toHaveCSS('padding-inline-start', '36px');
  const control = await label.evaluate((el) => {
    const style = getComputedStyle(el, '::before');
    return {
      width: style.width,
      border: style.borderWidth,
      radius: style.borderRadius,
      inset: style.marginInlineStart,
    };
  });
  expect(control).toEqual({
    width: '20px',
    border: '2px',
    radius: '2px',
    inset: '8px',
  });
  await page.keyboard.press('Tab');
  await page.locator('#checkbox-default').focus();
  expect(
    await label.evaluate((el) => getComputedStyle(el, '::before').boxShadow),
  ).toBe(
    'rgb(255, 255, 255) 0px 0px 0px 2px, rgb(23, 59, 179) 0px 0px 0px 4px',
  );
  const card = page.locator('label[for=checkbox-card]');
  await expect(card).toHaveCSS('padding-block-start', '12px');
  await expect(page.locator('.cods-checkbox--card').first()).toHaveCSS(
    'width',
    '240px',
  );
  await expect(card).toHaveCSS('padding-inline-start', '44px');
  await card.click();
  await expect(page.locator('#checkbox-card')).toBeChecked();
  await expect(card).toHaveCSS('background-color', 'rgb(217, 232, 246)');
  await page.locator('#checkbox-card').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#checkbox-card')).not.toBeChecked();
  await page.keyboard.press('Tab');
  await page.locator('#checkbox-card').focus();
  await expect(card).toHaveCSS(
    'box-shadow',
    'rgb(196, 197, 201) 0px 0px 0px 2px inset, rgb(255, 255, 255) 0px 0px 0px 2px, rgb(23, 59, 179) 0px 0px 0px 4px',
  );
  await expect(page.locator('#checkbox-card-disabled')).toBeDisabled();
});
