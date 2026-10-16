import { test, expect, expectAccessible } from './fixtures.js';

const state = (name: string) => `[data-cods-select-fixture="${name}"]`;

test('select label, descriptions, validation, native selection and submission', async ({
  page,
}, testInfo) => {
  await page.goto('/select/');
  const control = page
    .locator(state('default'))
    .getByRole('combobox', { name: 'County', exact: true });
  await expect(control).toHaveAccessibleDescription(
    'Choose the county where you live.',
  );
  await expect(control).toHaveCSS('background-size', '24px 24px');
  const success = page.locator(`${state('success')} select`);
  await expect(success).toBeEnabled();
  await expect(success).toHaveAccessibleDescription(
    'Success: County selection is valid.',
  );
  await expect(success).not.toHaveAttribute('aria-invalid', 'true');
  await page.locator(`${state('default')} label`).click();
  await page.keyboard.press('Escape');
  await expect(control).toBeFocused();
  await control.selectOption('denver');
  await expect(control).toHaveValue('denver');
  const disabled = page.locator(`${state('disabled')} select`);
  await expect(disabled).toBeDisabled();
  const invalid = page.locator(`${state('error')} select`);
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAccessibleDescription(
    'Choose the county where you live. Error: Choose a county.',
  );
  expect(
    await invalid.evaluate(
      (el) => (el as HTMLSelectElement).validity.valueMissing,
    ),
  ).toBe(true);
  await invalid.selectOption('boulder');
  expect(
    await invalid.evaluate((el) => (el as HTMLSelectElement).checkValidity()),
  ).toBe(true);
  const placeholder = page.locator(`${state('placeholder')} select`);
  await expect(placeholder).toHaveValue('');
  await placeholder.selectOption('adams');
  await placeholder.selectOption('');
  await expect(placeholder).toHaveValue('');
  const entries = await page.evaluate(() => {
    const form = document.createElement('form');
    for (const control of document.querySelectorAll('select'))
      form.append(control.cloneNode(true));
    return [...new FormData(form).keys()];
  });
  expect(entries).toContain('county-default');
  expect(entries).not.toContain('county-disabled');
  await expectAccessible(page, testInfo);
});

test('native keyboard type-ahead, dismissal, focus ring, and disabled tab skip', async ({
  page,
  browserName,
}) => {
  await page.goto('/select/');
  const control = page.locator(`${state('default')} select`);
  await control.focus();
  await page.keyboard.press('b');
  await page.keyboard.press('Enter');
  await expect(control).toHaveValue('boulder');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  // Popup navigation is owned by the platform; verify Escape leaves focus
  // on the control. Full native popup key review remains a human check.
  await page.keyboard.press('Escape');
  await expect(control).toBeFocused();
  await expect(control).toHaveCSS('outline-style', 'solid');
  await expect(control).toHaveCSS('outline-width', '4px');
  await expect(control).toHaveCSS('outline-color', 'rgb(23, 59, 179)');
  await page.locator(`${state('focus-visible')} select`).focus();
  await page.keyboard.press(
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab',
  );
  await expect(page.locator(`${state('success')} select`)).toBeFocused();
});

test('select 320px reflow, RTL arrow, reduced motion, and forced colors', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/select/');
  const overflow = await page
    .locator('.cods-select')
    .evaluateAll((groups) =>
      groups.some(
        (group) =>
          group.scrollWidth > Math.ceil(group.getBoundingClientRect().width),
      ),
    );
  expect(overflow).toBe(false);
  const rtl = page.locator(`${state('rtl')} select`);
  await expect(rtl).toHaveCSS('direction', 'rtl');
  expect(
    await rtl.evaluate((el) => getComputedStyle(el).backgroundPosition),
  ).toContain('8px');
  await expectAccessible(page, testInfo);
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  const control = page.locator(`${state('default')} select`);
  await control.focus();
  await expect(control).toHaveCSS('background-image', 'none');
  await expect(control).toHaveCSS('appearance', 'auto');
  await expect(control).toHaveCSS('outline-style', 'solid');
  await testInfo.attach('select-narrow-forced-colors', {
    body: await page.locator(state('default')).screenshot(),
    contentType: 'image/png',
  });
});

test('select works without JavaScript and CSS', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:4321/select/');
    await page.evaluate(() =>
      document
        .querySelectorAll('style,link[rel="stylesheet"]')
        .forEach((el) => el.remove()),
    );
    const control = page.locator(`${state('default')} select`);
    await expect(control).toHaveAccessibleName('County');
    await control.selectOption('boulder');
    await expect(control).toHaveValue('boulder');
    await expect(page.locator(`${state('disabled')} select`)).toBeDisabled();
    await testInfo.attach('select-unstyled', {
      body: await page.locator(state('default')).screenshot(),
      contentType: 'image/png',
    });
  } finally {
    await context.close();
  }
});
