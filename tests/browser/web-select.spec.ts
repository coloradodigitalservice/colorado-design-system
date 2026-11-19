// Select documentation page. Select is a native <select> with no controller,
// so these tests cover what CoDS owns: page composition, accessible
// name/description wiring, focus styling, reflow, forced colors, and Figma
// geometry. Native selection, validity, and form submission are browser
// behavior and are not re-tested. The generated code and maturity text are
// checked by web-shared-fixtures.spec.ts and the build's docs output check.
// States the preview does not show (long content, Spanish, RTL) are covered in
// storybook-select.spec.ts.
import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const select = (name: string) =>
  `[data-cods-docs-preview-state="${name}"] select`;

test('select page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/select/');
  const main = page.locator('main');
  expect(await main.locator('h2').allTextContents()).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  expect(
    await page
      .locator('[data-cods-docs-preview-state]')
      .evaluateAll((items) =>
        items.map((item) => item.getAttribute('data-cods-docs-preview-state')),
      ),
  ).toEqual(['default', 'disabled', 'error', 'success']);
  await expect(page.locator('[data-cods-docs-status]')).toContainText(
    'Manual accessibility review',
  );
  // The public page omits localization guidance and the examples catalogue.
  await expect(main).not.toContainText(/right-to-left|localization/i);
  await expect(page.locator('[data-cods-example]')).toHaveCount(0);
  await expectAccessible(page, testInfo);
});

test('select names, descriptions, and validation state', async ({ page }) => {
  await page.goto('/select/');
  await expect(page.locator(select('default'))).toHaveAccessibleName('County');
  await expect(page.locator(select('default'))).toHaveAccessibleDescription(
    'Choose the county where you live.',
  );
  const error = page.locator(select('error'));
  await expect(error).toHaveAccessibleName('County');
  await expect(error).toHaveAccessibleDescription(
    'Choose the county where you live. Please select a county to continue.',
  );
  await expect(error).toHaveAttribute('aria-invalid', 'true');
  const success = page.locator(select('success'));
  await expect(success).toHaveAccessibleDescription(
    'Success: County selection is valid.',
  );
  await expect(success).not.toHaveAttribute('aria-invalid', 'true');
});

test('select keyboard type-ahead, focus ring, and disabled tab skip', async ({
  page,
  browserName,
}) => {
  await page.goto('/select/');
  const control = page.locator(select('default'));
  await control.focus();
  // Type-ahead and Escape are native; this guards against CoDS interfering.
  await page.keyboard.press('b');
  await page.keyboard.press('Enter');
  await expect(control).toHaveValue('boulder');
  await page.keyboard.press('Escape');
  await expect(control).toBeFocused();
  await expect(control).toHaveCSS(
    'box-shadow',
    'rgb(255, 255, 255) 0px 0px 0px 2px, rgb(23, 59, 179) 0px 0px 0px 4px',
  );
  // Disabled sits between Default and Error in the preview; Tab skips it.
  await page.keyboard.press(
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab',
  );
  await expect(page.locator(select('error'))).toBeFocused();
});

test('select 320px reflow and forced colors', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
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
  await page.emulateMedia({ forcedColors: 'active' });
  const control = page.locator(select('default'));
  await control.focus();
  await expect(control).toHaveCSS('background-image', 'none');
  await expect(control).toHaveCSS('appearance', 'auto');
  await expect(control).toHaveCSS('outline-style', 'solid');
});

test('select matches Figma geometry and the shared Phosphor caret', async ({
  page,
}) => {
  await page.goto('/select/');
  const control = page.locator(select('default'));
  const label = page.locator('[data-cods-docs-preview-state="default"] label');
  await expect(label).toHaveCSS('font-weight', '600');
  await expect(label).toHaveCSS('line-height', '16px');
  // Figma paints the 1px stroke inside the 40px frame.
  await expect(control).toHaveCSS('height', '40px');
  await expect(control).toHaveCSS('padding-block-start', '7px');
  await expect(control).toHaveCSS('padding-inline-start', '7px');
  await expect(control).toHaveCSS('background-size', '24px 24px');

  const source = readFileSync(
    'packages/colorado-design-system/dist/icons/caret-down--1b1b1b.svg',
    'utf8',
  );
  const caretMatches = await control.evaluate(async (el, source) => {
    const url = getComputedStyle(el).backgroundImage.slice(5, -2);
    const parse = (svg: string) =>
      new DOMParser().parseFromString(svg, 'image/svg+xml');
    const rendered = parse(await (await fetch(url)).text());
    const expected = parse(source);
    return (
      rendered.documentElement.getAttribute('viewBox') ===
        expected.documentElement.getAttribute('viewBox') &&
      rendered.querySelector('path')?.getAttribute('d') ===
        expected.querySelector('path')?.getAttribute('d') &&
      rendered.documentElement.getAttribute('fill') === '#1b1b1b'
    );
  }, source);
  expect(caretMatches).toBe(true);

  // Measure the label-only pattern shown in the Figma component.
  await page
    .locator('[data-cods-docs-preview-state="default"] .cods-select__hint')
    .evaluate((el) => el.remove());
  const gap = await control.evaluate(
    (el) =>
      el.getBoundingClientRect().top -
      el
        .closest('.cods-select')!
        .querySelector('label')!
        .getBoundingClientRect().bottom,
  );
  expect(gap).toBe(12);
});
