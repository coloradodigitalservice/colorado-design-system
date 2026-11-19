// Combo Box documentation page. The curated preview shows every fixture
// state, so behavior runs here in Chromium, Firefox, and WebKit. The no-JS
// native fallback stays in storybook-combo-box.spec.ts.
import { test, expect, expectAccessible } from './fixtures.js';

test('combo box page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/combo-box/');
  const main = page.locator('main');
  expect(await main.locator('h2').allTextContents()).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  const subheadings = await main.locator('h3').allTextContents();
  for (const heading of [
    'When to use',
    'Accessibility for combo boxes',
    'Elements',
    'Markup requirements',
    'Initializing the controller',
    'Filtering and validation',
    'Limitations',
  ])
    expect(subheadings).toContain(heading);

  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(4);
  for (const state of ['default', 'grouped', 'error', 'disabled'])
    await expect(
      page.locator(
        `[data-cods-docs-preview-state="${state}"] [data-cods-combo-box]`,
      ),
    ).toHaveAttribute('data-enhanced', 'true');
  await expect(page.locator('[data-cods-docs-preview-code]')).toContainText(
    'cods-combo-box__select',
  );

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('Combo Box maturity is experimental');
  await expect(status).toContainText('Manual keyboard, screen-reader');
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 Combo Box' }),
  ).toBeVisible();
  await expect(
    status.getByRole('link', { name: 'Accessibility evidence' }),
  ).toHaveAttribute(
    'href',
    /\/combo-box\/accessibility\/combo-box\.evidence\.md$/,
  );
  // The public page omits localization guidance and the examples catalogue.
  await expect(main).not.toContainText(/right-to-left|localization/i);
  await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(0);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo);
});

test('filter, clear, and status messages report each change', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="default"]');
  const input = root.getByRole('combobox');
  await input.fill('2025');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(root.getByRole('option')).toHaveCount(1);
  await input.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(root.getByRole('status')).toHaveText('2025 selected.');
  await root.getByRole('button', { name: 'Clear the select contents' }).click();
  await expect(root.locator('select')).toHaveValue('');
  await expect(root.getByRole('status')).toHaveText('Selection cleared.');
  await input.fill('not found');
  await expect(root.getByRole('status')).toHaveText('No results.');
  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('documented combo box supports keyboard and pointer selection', async ({
  page,
}, testInfo) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="default"]');
  const input = root.getByRole('combobox');
  await input.fill('2025');
  await input.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(root.locator('select')).toHaveValue('2025');
  await input.click();
  await root.getByRole('option', { name: '2024' }).click();
  await expect(root.locator('select')).toHaveValue('2024');
  await expectAccessible(page, testInfo, 'article');
});

test('groups, disabled, validation and reset work on the documentation page', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  const group = page.locator('[data-cods-docs-preview-state="grouped"]');
  const groupInput = group.getByRole('combobox');
  await groupInput.click();
  await expect(
    group.getByRole('option', {
      name: 'Renew or replace: Renew license or ID',
    }),
  ).toBeVisible();
  await groupInput.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(group.locator('select')).toHaveValue('replace');
  await groupInput.click();
  await expect(
    group.locator('[data-cods-combo-box-heading]').first(),
  ).toHaveText('Renew or replace');
  await groupInput.press('Escape');
  const disabled = page.locator('[data-cods-docs-preview-state="disabled"]');
  await expect(disabled.getByRole('combobox')).toBeDisabled();
  await expect(disabled.locator('select')).toBeDisabled();
  const required = page.locator('[data-cods-docs-preview-state="error"]');
  const input = required.getByRole('combobox');
  await expect(input).toHaveAttribute('required', '');
  await expect(input).toHaveAttribute('aria-describedby', 'combo-error');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await input.click();
  await required.getByRole('option', { name: '2025' }).click();
  await input.fill('2026');
  expect(
    await input.evaluate((element: HTMLInputElement) => element.validity.valid),
  ).toBe(false);
  await required
    .locator('form')
    .evaluate((form: HTMLFormElement) => form.reset());
  await expect(input).toHaveValue('');
  await expect(required.locator('select')).toHaveValue('');
});

test('reflows at 320px and keeps focus visible in forced colors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/combo-box/');
  const input = page
    .locator('[data-cods-docs-preview-state="default"]')
    .getByRole('combobox');
  await input.focus();
  await input.click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(input).toBeFocused();
  await expect(input).toHaveCSS('outline-style', 'solid');
});

test('uses the designed input height and error icon treatment', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="error"]');
  const input = root.getByRole('combobox');
  await expect(input).toHaveCSS('height', '40px');
  await input.click();
  await expect(root.getByRole('option', { name: '2026' })).toHaveCSS(
    'height',
    '48px',
  );
  await root.getByRole('option', { name: '2025' }).hover();
  await expect(root.getByRole('option', { name: '2025' })).toHaveCSS(
    'background-color',
    'rgb(170, 205, 236)',
  );
  await expect(
    root.locator('.usa-combo-box__input-button-separator'),
  ).toBeHidden();
  const colors = await root.evaluate((element) => {
    const box = element.querySelector<HTMLElement>('.cods-combo-box')!;
    const required = element.querySelector<HTMLElement>(
      '.cods-combo-box__required',
    )!;
    return {
      icon: getComputedStyle(box, '::before').backgroundColor,
      required: getComputedStyle(required).color,
    };
  });
  expect(colors.icon).toBe(colors.required);
  await page.emulateMedia({ forcedColors: 'active' });
  const forcedColors = await root.evaluate((element) => {
    const box = element.querySelector<HTMLElement>('.cods-combo-box')!;
    const toggle = element.querySelector<HTMLElement>(
      '.cods-combo-box__toggle',
    )!;
    return {
      icon: getComputedStyle(box, '::before').backgroundColor,
      toggle: getComputedStyle(toggle, '::after').backgroundColor,
    };
  });
  expect(forcedColors.icon).toBe(forcedColors.toggle);
});

test('uncommitted text remains invalid after blur and blocks submission', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="error"]');
  const input = root.getByRole('combobox');
  await root.locator('form').evaluate((form: HTMLFormElement) => {
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Submit';
    form.append(button);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.dataset.submitted = 'true';
    });
  });
  await input.click();
  await root.getByRole('option', { name: '2025' }).click();
  await input.fill('2026');
  await input.blur();
  await root.getByRole('button', { name: 'Submit' }).click();
  await expect(input).toHaveValue('2026');
  await expect(root.locator('form')).not.toHaveAttribute('data-submitted');
  expect(
    await root
      .locator('form')
      .evaluate((form: HTMLFormElement) => form.checkValidity()),
  ).toBe(false);
  await input.fill('2025');
  expect(
    await root
      .locator('form')
      .evaluate((form: HTMLFormElement) => form.checkValidity()),
  ).toBe(true);
  await input.blur();
  await root.getByRole('button', { name: 'Submit' }).click();
  await expect(root.locator('form')).toHaveAttribute('data-submitted', 'true');
});

test('no results keeps valid list semantics and clears stale active option', async ({
  page,
}, testInfo) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="default"]');
  const input = root.getByRole('combobox');
  await input.click();
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', /.+/);
  await input.fill('nothing matches');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await expect(
    root.getByRole('option', { name: 'No results found' }),
  ).toHaveAttribute('aria-disabled', 'true');
  await expectAccessible(page, testInfo, 'article');
});

test('typing after arrow navigation filters and Enter selects the matching value', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="default"]');
  const input = root.getByRole('combobox');
  await input.click();
  await input.press('ArrowDown');
  await expect(input).toBeFocused();
  await input.pressSequentially('2025');
  await input.press('Enter');
  await expect(root.locator('select')).toHaveValue('2025');
});

test('clicking a group heading does not select an option', async ({ page }) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="grouped"]');
  await root.getByRole('combobox').click();
  await root.locator('[data-cods-combo-box-heading]').first().click();
  await expect(root.locator('select')).toHaveValue('');
  await expect(root.getByRole('listbox')).toBeVisible();
});

test('Enter cannot restore a previous selection after an uncommitted edit', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="error"]');
  const input = root.getByRole('combobox');
  await root.locator('form').evaluate((form: HTMLFormElement) => {
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Submit';
    form.append(button);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.dataset.submitted = 'true';
    });
  });
  await input.click();
  await root.getByRole('option', { name: '2025' }).click();
  await expect(root.locator('select')).toHaveValue('2025');
  for (const value of ['2099', '2025 ', '']) {
    await input.fill(value);
    await input.press('Enter');
    await expect(input).toHaveValue(value);
    expect(
      await input.evaluate(
        (element: HTMLInputElement) => element.validity.valid,
      ),
    ).toBe(false);
    await root.getByRole('button', { name: 'Submit' }).click();
    await expect(root.locator('form')).not.toHaveAttribute('data-submitted');
    await input.press('Escape');
    await expect(input).toHaveValue('2025');
    expect(
      await input.evaluate(
        (element: HTMLInputElement) => element.validity.valid,
      ),
    ).toBe(true);
  }
});

test('hovering an option keeps input focus, typing and Enter on the keyboard choice', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="default"]');
  const input = root.getByRole('combobox');
  await input.fill('202');
  await input.press('ArrowDown');
  await root.getByRole('option', { name: '2024' }).hover();
  await expect(input).toBeFocused();
  await input.press('Enter');
  await expect(root.locator('select')).toHaveValue('2026');
  await input.click();
  await root.getByRole('option', { name: '2023' }).hover();
  await expect(input).toBeFocused();
  await input.press('ControlOrMeta+a');
  await input.pressSequentially('2021');
  await expect(input).toHaveValue('2021');
});

test('arrow navigation survives hovering the last option in a group', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="grouped"]');
  const input = root.getByRole('combobox');
  await input.click();
  await input.press('ArrowDown');
  await root
    .getByRole('option', { name: 'Renew or replace: Replace a license or ID' })
    .hover();
  await expect(input).toBeFocused();
  await input.press('ArrowDown');
  await expect(input).toBeFocused();
  await input.press('Enter');
  await expect(root.locator('select')).toHaveValue('replace');
});

test('Tab leaves the open list without focusing an option', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="default"]');
  const input = root.getByRole('combobox');
  await input.click();
  await input.press('ArrowDown');
  await expect(
    root.locator('.usa-combo-box__list-option--focused'),
  ).toHaveAttribute('tabindex', '-1');
  await input.press('Tab');
  await expect(input).not.toBeFocused();
  await expect(root.locator(':focus')).toHaveCount(0);
  await expect(root.locator('[role="option"]:focus')).toHaveCount(0);
});

test('keyboard-active option follows the designed focus treatment', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  const root = page.locator('[data-cods-docs-preview-state="default"]');
  const input = root.getByRole('combobox');
  await input.click();
  await input.press('ArrowDown');
  const styles = await root.evaluate((element) => {
    const inputElement = element.querySelector<HTMLInputElement>(
      '.usa-combo-box__input',
    )!;
    const focused = element.querySelector<HTMLElement>(
      '.usa-combo-box__list-option--focused',
    )!;
    const inputStyle = getComputedStyle(inputElement);
    const activeStyle = getComputedStyle(focused);
    return {
      inputBackground: inputStyle.backgroundColor,
      activeBackground: activeStyle.backgroundColor,
      outlineStyle: activeStyle.outlineStyle,
      outlineWidth: activeStyle.outlineWidth,
      outlineColor: activeStyle.outlineColor,
    };
  });
  expect(styles.activeBackground).toBe(styles.inputBackground);
  expect(styles.outlineStyle).toBe('solid');
  expect(styles.outlineWidth).not.toBe('0px');
  expect(styles.outlineColor).not.toBe('transparent');
});

test('keyboard-active option stays distinguishable in forced colors', async ({
  page,
}) => {
  await page.goto('/combo-box/');
  await page.emulateMedia({ forcedColors: 'active' });
  const root = page.locator('[data-cods-docs-preview-state="default"]');
  const input = root.getByRole('combobox');
  await input.click();
  await root.getByRole('option', { name: '2025' }).click();
  await expect(root.locator('select')).toHaveValue('2025');
  await input.click();
  await input.press('ArrowUp');
  await input.press('ArrowDown');
  await expect(
    root.locator(
      '[class~="usa-combo-box__list-option--focused"][aria-selected="true"]',
    ),
  ).toHaveCount(1);
  const styles = await root.evaluate((element) => {
    const focused = element.querySelector<HTMLElement>(
      '[class~="usa-combo-box__list-option--focused"]',
    )!;
    const other = Array.from(
      element.querySelectorAll<HTMLElement>('.usa-combo-box__list-option'),
    ).find((option) => option !== focused)!;
    const active = getComputedStyle(focused);
    const rest = getComputedStyle(other);
    return {
      outlineStyle: active.outlineStyle,
      outlineWidth: active.outlineWidth,
      activeBackground: active.backgroundColor,
      restBackground: rest.backgroundColor,
      activeColor: active.color,
      restColor: rest.color,
    };
  });
  expect(styles.outlineStyle).toBe('solid');
  expect(styles.outlineWidth).not.toBe('0px');
  expect(styles.activeBackground).not.toBe(styles.restBackground);
  expect(styles.activeColor).not.toBe(styles.restColor);
});
