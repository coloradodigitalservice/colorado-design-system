import { test, expect, expectAccessible } from './fixtures.js';

const state = (name: string) => `[data-cods-docs-preview-state="${name}"]`;

test('Button documents the supported examples with accessible names and rendered icons', async ({
  page,
}, testInfo) => {
  await page.goto('/button/');
  expect(await page.locator('main h2').allTextContents()).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(7);
  await expect(
    page.locator(state('icon-only')).getByRole('button'),
  ).toHaveAccessibleName('Add application');
  await expect(
    page.locator(state('primary-medium-icon-both')).getByRole('button'),
  ).toHaveAccessibleName('Upload');
  await expect(page.locator(state('link')).getByRole('link')).toHaveAttribute(
    'href',
    /(?:^|\/)getting-started\/$/,
  );
  for (const icon of await page.locator('[data-cods-docs-preview] svg').all()) {
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(icon).toHaveAttribute('focusable', 'false');
    await expect(icon).toHaveCSS('width', '16px');
    await expect(icon).toHaveCSS('height', '16px');
    expect(
      await icon.evaluate((element: SVGGraphicsElement) => {
        const box = element.getBBox();
        return (
          box.width > 0 &&
          box.height > 0 &&
          getComputedStyle(element).fill === getComputedStyle(element).color
        );
      }),
    ).toBe(true);
  }
  await expectAccessible(page, testInfo);
});

test('Button preview supports native keyboard activation and visible focus', async ({
  page,
  browserName,
}) => {
  await page.goto('/button/');
  const primary = page.locator(state('default')).getByRole('button');
  await primary.evaluate((element) => {
    let count = 0;
    element.addEventListener('click', () =>
      element.setAttribute('data-clicks', String(++count)),
    );
  });
  await primary.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(primary).toHaveAttribute('data-clicks', '2');
  await expect(primary).toHaveCSS('outline-width', '4px');
  await expect(primary).toHaveCSS('outline-offset', '2px');
  await page.keyboard.press(
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab',
  );
  await expect(
    page.locator(state('secondary')).getByRole('button'),
  ).toBeFocused();
});

test('preview controls use the real hover and active palettes', async ({
  page,
}) => {
  await page.goto('/button/');
  for (const name of ['danger', 'icon-only', 'link']) {
    const control = page.locator(state(name)).locator('.cods-button');
    const background = () =>
      control.evaluate((element) => getComputedStyle(element).backgroundColor);
    const initial = await background();
    await control.hover();
    const hover = await background();
    expect(hover).not.toBe(initial);
    await page.mouse.down();
    expect(await background()).not.toBe(hover);
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
});

test('preview variants fit at 320px and stay visible in forced colors', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/button/');
  const slim = page.locator(state('slim')).getByRole('button');
  const iconOnly = page.locator(state('icon-only')).getByRole('button');
  await expect(slim).toHaveCSS('height', '32px');
  await expect(iconOnly).toHaveCSS('height', '40px');
  await expect(iconOnly).toHaveCSS('width', '40px');
  const buttons = page.locator('[data-cods-docs-preview] .cods-button');
  for (const button of await buttons.all()) {
    expect(
      await button.evaluate(
        (element) =>
          element.scrollWidth <= element.clientWidth &&
          element.scrollHeight <= element.clientHeight,
      ),
    ).toBe(true);
    await expect(button).toHaveCSS('animation-name', 'none');
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo);
  await page.emulateMedia({ forcedColors: 'active' });
  for (const button of await buttons.all()) {
    await expect(button).toHaveCSS('border-top-style', 'solid');
    await expect(button).toBeVisible();
  }
  await expect(slim).toHaveCSS('height', '32px');
});

test.describe('without enhancement', () => {
  test.use({ javaScriptEnabled: false });
  test('native markup and its source work without CSS or JavaScript', async ({
    page,
  }) => {
    await page.route('**/*.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: '' }),
    );
    await page.goto('/button/');
    const button = page.locator(state('default')).getByRole('button');
    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Button preview HTML' }),
    ).toContainText('usa-button cods-button');
    await page.locator(state('link')).getByRole('link').focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/getting-started\/$/);
  });
});
