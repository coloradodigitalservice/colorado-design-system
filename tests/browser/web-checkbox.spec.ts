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
    width: '4px',
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
    '32px',
  );
  expect(await rtl.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe(
    '0px',
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
