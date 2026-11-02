import { test, expect, expectAccessible } from './fixtures.js';

test('native input states, labels, descriptions, focus, and reflow', async ({
  page,
}, testInfo) => {
  await page.goto('/input/');
  for (const heading of [
    'Examples',
    'Summary',
    'When to use',
    'Anatomy and markup',
    'States and behavior',
    'Keyboard and progressive enhancement',
    'Assets and accessibility',
  ]) {
    await expect(
      page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible();
  }
  const states = page.locator('[data-cods-fixture-state]');
  await expect(states).toHaveCount(13);
  for (const state of await states.all()) {
    const input = state.locator('input');
    await expect(input).toHaveCount(1);
    const id = await input.getAttribute('id');
    await expect(state.locator('label')).toHaveAttribute('for', id!);
  }
  const input = page.locator('#input-default');
  await expect(input).toHaveAccessibleName('Full name');
  await expect(input).toHaveAttribute('autocomplete', 'name');
  await expect(input).toHaveAccessibleDescription(
    'Enter your name as it appears on your documents.',
  );
  await input.focus();
  const focusStyles = await input.evaluate((el) => {
    const field = el as HTMLElement;
    field.parentElement!.style.backgroundColor =
      getComputedStyle(field).outlineColor;
    const shadow = getComputedStyle(field).boxShadow;
    const outline = getComputedStyle(field).outlineStyle;
    field.parentElement!.style.backgroundColor = 'var(--cods-color-focus-gap)';
    const gapColor = getComputedStyle(field.parentElement!).backgroundColor;
    field.parentElement!.style.removeProperty('background-color');
    return { shadow, outline, gapColor };
  });
  expect(focusStyles.shadow).toContain(focusStyles.gapColor);
  expect(focusStyles.outline).not.toBe('none');
  await page.keyboard.type('Alex');
  await expect(input).toHaveValue('Alex');
  await expect(page.locator('#input-disabled')).toBeDisabled();
  const readonly = page.locator('#input-readonly');
  await expect(readonly).toHaveAttribute('readonly', '');
  await readonly.focus();
  await page.keyboard.type('9');
  await expect(readonly).toHaveValue('123456');
  const error = page.locator('#input-error');
  await expect(error).toHaveAttribute('aria-invalid', 'true');
  await expect(error).toHaveAttribute('autocomplete', 'email');
  await expect(page.locator('#input-success')).toHaveAttribute(
    'autocomplete',
    'email',
  );
  await expect(error).toHaveAccessibleDescription(
    'Enter an address such as name@example.com. Error: Enter a valid email address.',
  );
  const required = page.locator('#input-required');
  await expect(required).toHaveAttribute('required', '');
  expect(
    await required.evaluate((el: HTMLInputElement) => el.validity.valueMissing),
  ).toBe(true);
  await required.fill('Alex');
  expect(
    await required.evaluate((el: HTMLInputElement) => el.validity.valid),
  ).toBe(true);
  const email = page.locator('#input-email');
  await email.fill('not-an-email');
  expect(
    await email.evaluate((el: HTMLInputElement) => el.validity.typeMismatch),
  ).toBe(true);
  await page.locator('#input-focus-visible').focus();
  await page.keyboard.press('Tab');
  await expect(readonly).toBeFocused();
  await expect(page.locator('#input-number')).toHaveAttribute('type', 'number');
  const icons = page.locator('[data-cods-fixture-state="icons"] svg');
  await expect(icons).toHaveCount(2);
  for (const icon of await icons.all())
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
  const group = page.locator('.cods-input__group');
  await group.evaluate((el) => {
    el.setAttribute('dir', 'rtl');
  });
  const iconPositions = await group.evaluate((el) => {
    const prefix = el
      .querySelector('.cods-input__icon--prefix')!
      .getBoundingClientRect();
    const suffix = el
      .querySelector('.cods-input__icon--suffix')!
      .getBoundingClientRect();
    return { prefix: prefix.x, suffix: suffix.x };
  });
  expect(iconPositions.prefix).toBeGreaterThan(iconPositions.suffix);
  await expectAccessible(page, testInfo);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.emulateMedia({ forcedColors: 'active' });
  await input.focus();
  await expect(input).toBeFocused();
  expect(
    await input.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).not.toBe('none');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('native input remains usable', async ({ page }) => {
    await page.goto('/input/');
    const input = page.locator('#input-default');
    await input.fill('Alex');
    await expect(input).toHaveValue('Alex');
    await expect(input).toHaveAccessibleName('Full name');
  });
});
