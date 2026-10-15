import { test, expect, expectAccessible } from './fixtures.js';

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

test('forced colors preserves boundary, focus, and state glyphs', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.locator('#checkbox-default').focus();
  await page.keyboard.press('Space');
  const style = await page
    .locator('label[for="checkbox-default"]')
    .evaluate((el) => {
      const box = getComputedStyle(el, '::before');
      return {
        border: box.borderTopStyle,
        outline: box.outlineStyle,
        image: box.backgroundImage,
      };
    });
  expect(style.border).toBe('solid');
  expect(style.outline).toBe('solid');
  expect(style.image).not.toBe('none');
});

test('works with JavaScript and CSS disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/checkbox/');
  await page.locator('label[for="checkbox-default"]').click();
  await expect(page.locator('#checkbox-default')).toBeChecked();
  await expect(page.locator('#checkbox-indeterminate')).toHaveJSProperty(
    'indeterminate',
    false,
  );
  await page.route('**/*.css', (route) => route.abort());
  await page.reload();
  await expect(page.locator('#checkbox-default')).toBeVisible();
  await page.locator('label[for="checkbox-default"]').click();
  await expect(page.locator('#checkbox-default')).toBeChecked();
  await context.close();
});
