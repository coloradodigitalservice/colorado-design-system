// Language Selector documentation page. Both fixture states are in the
// curated preview, so engine-sensitive behavior runs here in all three
// browsers. Only the RTL state, which the page does not show, is covered in
// storybook-language-selector.spec.ts.
import type { Page } from '@playwright/test';
import { routeBuiltFiles } from './built-files.js';
import { test, expect, expectAccessible } from './fixtures.js';

const multiple =
  '[data-cods-docs-preview-state="multiple-languages"] [data-cods-language-selector]';

async function openWithKeyboard(page: Page) {
  await page.goto('/language-selector/');
  const root = page.locator(multiple);
  const button = root.getByRole('button', { name: 'Languages' });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  return {
    root,
    button,
    panel: root.locator('[data-cods-language-selector-panel]'),
  };
}

test('language selector page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/language-selector/');
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
    'Writing for language selectors',
    'Accessibility for language selectors',
    'Variants and elements',
    'Initializing the controller',
    'Limitations',
  ])
    expect(subheadings).toContain(heading);

  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(2);
  await expect(page.locator(multiple)).toHaveAttribute(
    'data-cods-language-selector-enhanced',
    '',
  );

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('Manual accessibility review is pending');
  await expect(status).not.toContainText(/WCAG/);
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 Language Selector' }),
  ).toBeVisible();
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

test('disclosure opens with the keyboard and Escape returns focus', async ({
  page,
  browserName,
}, testInfo) => {
  const { root, button } = await openWithKeyboard(page);
  const first = root.getByRole('link').first();
  await expect(root.getByRole('link', { name: /Español/ })).toBeVisible();
  await page.keyboard.press(
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab',
  );
  await expect(first).toBeFocused();
  await expectAccessible(page, testInfo);
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(first).toBeHidden();
});

test('trigger focus ring and open menu match the Figma specification', async ({
  page,
}) => {
  const { button, panel } = await openWithKeyboard(page);
  // Figma: a 2px white gap inside a 4px blue ring.
  await expect(button).toHaveCSS('outline-width', '4px');
  await expect(button).toHaveCSS('outline-offset', '2px');
  expect(
    await button.evaluate((element) => getComputedStyle(element).boxShadow),
  ).toContain('0px 0px 0px 2px');
  const menu = await panel.evaluate((element) => ({
    top: element.getBoundingClientRect().top,
    width: element.getBoundingClientRect().width,
    radius: getComputedStyle(element).borderTopLeftRadius,
    separators: [...element.children].map(
      (item) => getComputedStyle(item).borderTopWidth,
    ),
  }));
  expect(menu.width).toBe(200);
  expect(menu.radius).not.toBe('0px');
  expect(new Set(menu.separators)).toEqual(new Set(['0px']));
  // The menu opens below the full ring (2px gap + 4px ring).
  const ringBottom = await button.evaluate(
    (element) => element.getBoundingClientRect().bottom + 2 + 4,
  );
  expect(menu.top).toBeGreaterThanOrEqual(ringBottom);
});

test('globe stays visible in forced colors', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'forced-colors emulation');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/language-selector/');
  const [globe, background] = await page
    .locator(multiple)
    .getByRole('button')
    .evaluate((element) => [
      getComputedStyle(element, '::before').backgroundColor,
      getComputedStyle(element).backgroundColor,
    ]);
  expect(globe).not.toBe(background);
});

test('language links remain available without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  if (process.env.CODS_BUILT_FILES === '1') await routeBuiltFiles(page, 'web');
  await page.goto('http://127.0.0.1:4321/language-selector/');
  const root = page.locator(multiple);
  await expect(root.getByRole('button')).toBeHidden();
  await expect(root.getByRole('link')).toHaveCount(8);
  for (const link of await root.getByRole('link').all())
    await expect(link).toBeVisible();
  await expect(
    page.locator('[data-cods-language-selector-enhanced]'),
  ).toHaveCount(0);
  await context.close();
});
