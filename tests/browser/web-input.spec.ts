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
  await expect(states).toHaveCount(17);
  for (const state of await states.all()) {
    const input = state.locator('input, textarea');
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
  await expect(error).toHaveAttribute('autocomplete', 'cc-number');
  await expect(page.locator('#input-success')).toHaveAttribute(
    'autocomplete',
    'cc-number',
  );
  await expect(error).toHaveAccessibleDescription(
    'Enter the number on your card. Error: Enter a valid card number.',
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
  const group = page.locator(
    '[data-cods-fixture-state="icons"] .cods-input__group',
  );
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
  for (const [id, height] of [
    ['small', 32],
    ['default', 40],
    ['large', 140],
  ] as const) {
    expect(
      await page
        .locator(`#input-${id}`)
        .evaluate((el) => el.getBoundingClientRect().height),
    ).toBe(height);
  }
  for (const id of ['error', 'success', 'icons']) {
    const field = page.locator(`#input-${id}`);
    const feedback = page.locator(
      `#input-${id}-${id === 'icons' ? 'success' : 'feedback'}`,
    );
    expect(
      await field.evaluate(
        (el, feedbackId) =>
          Boolean(
            el.compareDocumentPosition(document.getElementById(feedbackId)!) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ),
        (await feedback.getAttribute('id'))!,
      ),
    ).toBe(true);
    await expect(field).toHaveAttribute(
      'aria-describedby',
      new RegExp((await feedback.getAttribute('id'))!),
    );
  }
  await expect(
    page.locator('[data-cods-fixture-state="error"] .cods-input__icon--prefix'),
  ).toHaveCount(1);
  await expect(
    page.locator('[data-cods-fixture-state="error"] .cods-input__icon--suffix'),
  ).toHaveCount(0);
  await expect(
    page.locator(
      '[data-cods-fixture-state="success"] .cods-input__icon--suffix',
    ),
  ).toHaveCount(1);
  await expect(
    page.locator(
      '[data-cods-fixture-state="success"] .cods-input__icon--prefix',
    ),
  ).toHaveCount(0);
  const hover = page.locator('#input-hover');
  const beforeHover = await hover.evaluate(
    (el) => getComputedStyle(el).borderColor,
  );
  await hover.hover();
  expect(
    await hover.evaluate((el) => getComputedStyle(el).borderColor),
  ).not.toBe(beforeHover);
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

for (const [state, borderColor] of [
  ['error', 'rgb(181, 9, 9)'],
  ['success', 'rgb(2, 111, 40)'],
] as const) {
  test(`${state} input keeps its validation border on hover`, async ({
    page,
  }) => {
    await page.goto('/input/');
    const input = page.locator(`#input-${state}`);
    await page.mouse.move(0, 0);
    await expect(input).toHaveCSS('border-color', borderColor);
    await expect(input).toHaveCSS('border-width', '2px');
    await input.hover();
    await expect(input).toHaveCSS('background-color', 'rgb(251, 252, 253)');
    await expect(input).toHaveCSS('border-color', borderColor);
    await expect(input).toHaveCSS('border-width', '2px');
  });
}

test('validation borders are 2px without resizing controls', async ({
  page,
}) => {
  await page.goto('/input/');
  for (const [state, height] of [
    ['small', 32],
    ['default', 40],
    ['large', 140],
  ] as const) {
    const input = page.locator(`#input-${state}`);
    await expect(input).toHaveCSS('border-width', '1px');
    await input.evaluate((el) => el.setAttribute('aria-invalid', 'true'));
    await expect(input).toHaveCSS('border-width', '2px');
    expect(
      await input.evaluate((el) => el.getBoundingClientRect().height),
    ).toBe(height);
    await input.evaluate((el) => {
      el.removeAttribute('aria-invalid');
      el.classList.add('cods-input__control--success');
    });
    await expect(input).toHaveCSS('border-width', '2px');
    expect(
      await input.evaluate((el) => el.getBoundingClientRect().height),
    ).toBe(height);
    await input.evaluate((el) =>
      el.classList.remove('cods-input__control--success'),
    );
    await expect(input).toHaveCSS('border-width', '1px');
  }

  const disabled = page.locator('#input-disabled');
  await disabled.evaluate((el) => {
    el.setAttribute('aria-invalid', 'true');
    el.classList.add('cods-input__control--success');
  });
  await expect(disabled).toHaveCSS('border-width', '1px');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('#input-error')).toHaveCSS('border-width', '2px');
  await expect(disabled).toHaveCSS('border-width', '1px');
});

test('input border tokens are independent of focus and align large icons', async ({
  page,
}) => {
  await page.goto('/input/');
  const example = page.locator('[data-cods-fixture-state="large-icons"]');
  const wrapper = example.locator('.cods-input');
  const input = example.locator('textarea');
  const expectIconsAligned = async () => {
    const layout = await example.evaluate((el) => {
      const control = el.querySelector('textarea');
      if (!control) throw new Error('Missing input control');
      const style = getComputedStyle(control);
      return {
        expectedInset:
          parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop),
        iconInsets: Array.from(el.querySelectorAll('.cods-input__icon')).map(
          (icon) => parseFloat(getComputedStyle(icon).top),
        ),
      };
    });
    expect(layout.iconInsets).toEqual([
      layout.expectedInset,
      layout.expectedInset,
    ]);
  };

  await wrapper.evaluate((el) =>
    el.style.setProperty('--cods-focus-ring-offset', '12px'),
  );
  await expect(input).toHaveCSS('border-width', '2px');
  await expectIconsAligned();
  await input.evaluate((el) =>
    el.classList.remove('cods-input__control--success'),
  );
  await expect(input).toHaveCSS('border-width', '1px');
  await expectIconsAligned();

  await wrapper.evaluate((el) =>
    el.style.setProperty('--cods-border-input-width', '3px'),
  );
  await expect(input).toHaveCSS('border-width', '3px');
  await expectIconsAligned();
  await input.evaluate((el) => el.setAttribute('aria-invalid', 'true'));
  await expect(input).toHaveCSS('border-width', '2px');
  await expectIconsAligned();

  await wrapper.evaluate((el) =>
    el.style.setProperty('--cods-border-input-validation-width', '5px'),
  );
  await expect(input).toHaveCSS('border-width', '5px');
  await expectIconsAligned();
  await input.evaluate((el) => {
    el.removeAttribute('aria-invalid');
    el.classList.add('cods-input__control--success');
  });
  await expect(input).toHaveCSS('border-width', '5px');
  await expectIconsAligned();
  await input.evaluate((el) => el.setAttribute('disabled', ''));
  await expect(input).toHaveCSS('border-width', '3px');
  await expectIconsAligned();
});

test('validation changes while hovered take precedence over the hover border', async ({
  page,
}) => {
  await page.goto('/input/');
  const input = page.locator('#input-default');
  await input.hover();
  await expect(input).toHaveCSS('border-color', 'rgb(27, 27, 27)');
  await input.evaluate((el) => el.setAttribute('aria-invalid', 'true'));
  await expect(input).toHaveCSS('border-color', 'rgb(181, 9, 9)');
  await input.evaluate((el) =>
    el.classList.add('cods-input__control--success'),
  );
  await expect(input).toHaveCSS('border-color', 'rgb(181, 9, 9)');
  await input.evaluate((el) => el.removeAttribute('aria-invalid'));
  await expect(input).toHaveCSS('border-color', 'rgb(2, 111, 40)');
  await input.evaluate((el) =>
    el.classList.remove('cods-input__control--success'),
  );
  await expect(input).toHaveCSS('border-color', 'rgb(27, 27, 27)');
});

test('hover does not alter disabled or readonly inputs', async ({ page }) => {
  await page.goto('/input/');
  for (const state of ['disabled', 'readonly']) {
    const input = page.locator(`#input-${state}`);
    await page.mouse.move(0, 0);
    const before = await input.evaluate((el) => {
      const style = getComputedStyle(el);
      return { border: style.borderColor, background: style.backgroundColor };
    });
    await input.hover();
    await expect(input).toHaveCSS('border-color', before.border);
    await expect(input).toHaveCSS('background-color', before.background);
  }
});

test('decorative icons use their input validation colors', async ({ page }) => {
  await page.goto('/input/');
  for (const [state, count, color] of [
    ['error', 1, 'rgb(181, 9, 9)'],
    ['success', 1, 'rgb(2, 111, 40)'],
    ['icons', 2, 'rgb(2, 111, 40)'],
    ['large-icons', 2, 'rgb(2, 111, 40)'],
  ] as const) {
    const example = page.locator(`[data-cods-fixture-state="${state}"]`);
    const icons = example.locator('.cods-input__icon');
    await expect(icons).toHaveCount(count);
    for (const icon of await icons.all()) {
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
      await expect(icon).toHaveCSS('color', color);
      await expect(icon.locator('svg')).toHaveCSS('fill', color);
    }
    await example.locator('.cods-input__control').hover();
    for (const icon of await icons.all()) {
      await expect(icon.locator('svg')).toHaveCSS('fill', color);
    }
  }
});

test('icon colors update with validation and disabled state', async ({
  page,
}) => {
  await page.goto('/input/');
  const input = page.locator('#input-icons');
  const icons = page.locator(
    '[data-cods-fixture-state="icons"] .cods-input__icon svg',
  );
  await expect(icons).toHaveCount(2);
  const expectColor = async (color: string) => {
    for (const icon of await icons.all()) {
      await expect(icon).toHaveCSS('fill', color);
    }
  };
  await input.hover();
  await expectColor('rgb(2, 111, 40)');
  await input.evaluate((el) => el.setAttribute('aria-invalid', 'true'));
  await expectColor('rgb(181, 9, 9)');
  await input.evaluate((el) => el.setAttribute('disabled', ''));
  await expectColor('rgb(86, 92, 101)');
  await input.evaluate((el) => el.removeAttribute('disabled'));
  await expectColor('rgb(181, 9, 9)');
  await input.evaluate((el) => {
    el.removeAttribute('aria-invalid');
    el.classList.remove('cods-input__control--success');
  });
  await expectColor('rgb(86, 92, 101)');
  await input.evaluate((el) =>
    el.classList.add('cods-input__control--success'),
  );
  await expectColor('rgb(2, 111, 40)');
  await input.evaluate((el) => el.setAttribute('disabled', ''));
  await page.emulateMedia({ forcedColors: 'active' });
  const disabledColor = await input.evaluate(
    (el) => getComputedStyle(el).color,
  );
  await expectColor(disabledColor);
});

test('icon groups fit small and resizable large controls', async ({ page }) => {
  await page.goto('/input/');
  const small = page.locator('#input-icons');
  const smallGroup = page.locator(
    '[data-cods-fixture-state="icons"] .cods-input__group',
  );
  const expectCenteredIcons = async () => {
    const layout = await smallGroup.evaluate((el) => {
      const control = el.querySelector('.cods-input__control');
      if (!control) throw new Error('Missing input control');
      const rect = control.getBoundingClientRect();
      return {
        controlCenter: (rect.top + rect.bottom) / 2,
        iconCenters: Array.from(
          el.querySelectorAll('.cods-input__icon svg'),
        ).map((icon) => {
          const iconRect = icon.getBoundingClientRect();
          return (iconRect.top + iconRect.bottom) / 2;
        }),
      };
    });
    expect(layout.iconCenters).toHaveLength(2);
    for (const center of layout.iconCenters) {
      expect(Math.abs(center - layout.controlCenter)).toBeLessThanOrEqual(0.5);
    }
  };
  await expect(small).toHaveCSS('border-width', '2px');
  expect(
    await smallGroup.evaluate((el) => el.getBoundingClientRect().height),
  ).toBe(40);
  await expectCenteredIcons();
  await small.evaluate((el) => el.classList.add('cods-input__control--small'));
  expect(await small.evaluate((el) => el.getBoundingClientRect().height)).toBe(
    32,
  );
  expect(
    await smallGroup.evaluate((el) => el.getBoundingClientRect().height),
  ).toBe(32);
  await expectCenteredIcons();

  const example = page.locator('[data-cods-fixture-state="large-icons"]');
  const large = example.locator('textarea');
  await expect(large).toHaveAccessibleName('Additional details with icons');
  await expect(large).toHaveAccessibleDescription(
    'Enter any supporting details. Success: Details saved.',
  );
  await expect(large).toHaveCSS('border-width', '2px');
  await expect(large).toHaveCSS('resize', 'vertical');
  await expect(
    example.locator('.cods-input__icon[aria-hidden="true"]'),
  ).toHaveCount(2);

  for (const state of [
    'default',
    'error',
    'success',
    'disabled',
    'disabled-validation',
  ]) {
    await large.evaluate((el, value) => {
      el.classList.toggle(
        'cods-input__control--success',
        value === 'success' || value === 'disabled-validation',
      );
      if (value === 'error' || value === 'disabled-validation')
        el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
      if (value === 'disabled' || value === 'disabled-validation')
        el.setAttribute('disabled', '');
      else el.removeAttribute('disabled');
    }, state);
    for (const direction of ['ltr', 'rtl']) {
      await example
        .locator('.cods-input__group')
        .evaluate((el, value) => el.setAttribute('dir', value), direction);
      for (const width of [1280, 320]) {
        await page.setViewportSize({ width, height: 800 });
        for (const height of [140, 200]) {
          await large.evaluate((el, size) => {
            if (!(el instanceof HTMLTextAreaElement))
              throw new Error('Expected a textarea');
            if (size === 140) el.style.removeProperty('height');
            else el.style.height = `${size}px`;
          }, height);
          const layout = await example.evaluate((el) => {
            const label = el.querySelector('label');
            const group = el.querySelector('.cods-input__group');
            const control = el.querySelector('textarea');
            const feedback = el.querySelector('.cods-input__feedback');
            if (!label || !group || !control || !feedback)
              throw new Error('Incomplete large input example');
            const labelRect = label.getBoundingClientRect();
            const groupRect = group.getBoundingClientRect();
            const controlRect = control.getBoundingClientRect();
            const feedbackRect = feedback.getBoundingClientRect();
            const controlStyle = getComputedStyle(control);
            return {
              labelBottom: labelRect.bottom,
              groupHeight: groupRect.height,
              controlHeight: controlRect.height,
              controlTop: controlRect.top,
              controlBottom: controlRect.bottom,
              feedbackTop: feedbackRect.top,
              firstLineCenter:
                controlRect.top +
                parseFloat(controlStyle.borderTopWidth) +
                parseFloat(controlStyle.paddingTop) +
                parseFloat(controlStyle.lineHeight) / 2,
              iconCenters: Array.from(
                group.querySelectorAll('.cods-input__icon svg'),
              ).map((icon) => {
                const rect = icon.getBoundingClientRect();
                return (rect.top + rect.bottom) / 2;
              }),
            };
          });
          expect(layout.controlHeight).toBe(height);
          expect(layout.groupHeight).toBe(height);
          expect(layout.controlTop).toBeGreaterThanOrEqual(layout.labelBottom);
          expect(layout.feedbackTop).toBeGreaterThanOrEqual(
            layout.controlBottom,
          );
          expect(layout.iconCenters).toHaveLength(2);
          for (const center of layout.iconCenters) {
            expect(
              Math.abs(center - layout.firstLineCenter),
            ).toBeLessThanOrEqual(0.5);
          }
        }
      }
    }
  }
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
