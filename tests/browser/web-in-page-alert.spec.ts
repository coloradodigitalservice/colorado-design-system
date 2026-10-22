import { expectPhosphorMask } from './icon-mask.js';
import { readFileSync } from 'node:fs';
import { routeBuiltFiles } from './built-files.js';
import { test, expect, expectAccessible } from './fixtures.js';

test.beforeEach(async ({ page }) => routeBuiltFiles(page, 'web'));

test('canonical contextual examples and copyable source ship in the built docs', async ({
  page,
}, testInfo) => {
  await page.goto('/in-page-alert/');
  await expect(page.locator('.cods-in-page-alert')).toHaveCount(20);
  await expect(
    page.getByRole('heading', { name: 'Live regions and dynamic updates' }),
  ).toBeVisible();
  await expect(
    page.locator('[data-cods-fixture-state=error] .cods-in-page-alert'),
  ).not.toHaveAttribute('role');
  await expect(
    page.locator('[data-cods-fixture-state=dynamic-alert] .cods-in-page-alert'),
  ).toHaveAttribute('role', 'alert');
  await expect(
    page.locator(
      '[data-cods-fixture-state=dynamic-status] .cods-in-page-alert',
    ),
  ).toHaveAttribute('role', 'status');
  await page.getByText('View default HTML', { exact: true }).click();
  const source = page.getByRole('region', {
    name: 'Default In-Page Alert HTML',
  });
  await expect(source).toBeVisible();
  expect(
    await source.evaluate((element) => {
      const template = document.createElement('template');
      template.innerHTML = element.textContent ?? '';
      return (
        template.content.querySelector('.cods-in-page-alert')?.outerHTML ===
        document.querySelector('.cods-in-page-alert')?.outerHTML
      );
    }),
  ).toBe(true);
  await expectAccessible(page, testInfo);
});

test('four severity colors, distinct shipped icons, and keyboard focus', async ({
  page,
  browserName,
}) => {
  await page.goto('/in-page-alert/');
  const masks: string[] = [];
  const backgrounds: string[] = [];
  const accents: string[] = [];
  for (const variant of ['info', 'success', 'warning', 'error']) {
    const alert = page.locator(
      `[data-cods-fixture-state=${variant}] .cods-in-page-alert`,
    );
    await expectPhosphorMask(
      alert.locator('.cods-in-page-alert__body'),
      {
        info: 'info',
        success: 'check-circle',
        warning: 'warning',
        error: 'warning-circle',
      }[variant]!,
      { size: 32, inset: 12, top: 16, color: 'rgb(27, 27, 27)' },
    );
    const style = await alert
      .locator('.cods-in-page-alert__body')
      .evaluate((element) => {
        const icon = getComputedStyle(element, '::before');
        const surface = getComputedStyle(element);
        return {
          mask: icon.maskImage,
          width: icon.width,
          color: surface.color,
          bg: surface.backgroundColor,
          margin: getComputedStyle(element.firstElementChild!).marginLeft,
        };
      });
    expect(style.mask).not.toBe('none');
    expect(style.width).toBe('32px');
    expect(style.color).toBe('rgb(27, 27, 27)');
    expect(style.margin).toBe('0px');
    masks.push(style.mask);
    backgrounds.push(style.bg);
    accents.push(
      await alert.evaluate(
        (element) => getComputedStyle(element).borderInlineStartColor,
      ),
    );
    // Actually request the referenced mask to catch asset packaging regressions.
    const url = style.mask.match(/url\(["']?(.*?)["']?\)/)?.[1];
    expect(url).toBeTruthy();
    expect(
      await page.evaluate(async (url) => {
        const response = await fetch(url!);
        return response.ok && (await response.text()).includes('<svg');
      }, url),
    ).toBe(true);
    const link = alert.locator('a');
    await link.focus();
    const modifier =
      browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+' : '';
    await page.keyboard.press(modifier + 'Tab');
    await page.keyboard.press(modifier + 'Shift+Tab');
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS('outline-width', '4px');
  }
  expect(new Set(masks).size).toBe(4);
  expect(new Set(backgrounds).size).toBe(4);
  expect(new Set(accents).size).toBe(4);
});

test('320px reflow, RTL icon placement, forced colors, and reduced motion', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/in-page-alert/');
  for (const alert of await page.locator('.cods-in-page-alert').all()) {
    await expect(alert).toBeVisible();
    expect(
      await alert.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
  }
  for (const [state, icon] of [
    ['info', 'info'],
    ['success', 'check-circle'],
    ['warning', 'warning'],
    ['error', 'warning-circle'],
  ]) {
    await expectPhosphorMask(
      page.locator(
        `[data-cods-fixture-state=${state}] .cods-in-page-alert__body`,
      ),
      icon!,
      { size: 32, inset: 12, top: 16 },
    );
  }
  const rtl = page.locator('[dir=rtl].cods-in-page-alert');
  await expect(rtl).toHaveCSS('border-right-width', '8px');
  expect(
    await rtl
      .locator('.cods-in-page-alert__body')
      .evaluate((element) => getComputedStyle(element, '::before').right),
  ).toBe('12px');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo);
});

test('message remains understandable without styles or JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  // Directly render the shipped semantic fixture, with no stylesheet or controller.
  await page.setContent(
    '<html lang="en"><head><title>Static alerts</title></head><body><main>' +
      readFileSync(
        'packages/colorado-design-system/dist/fixtures/in-page-alert.html',
        'utf8',
      ) +
      '</main></body></html>',
  );
  for (const word of [
    'Information: application guidance',
    'Success: application received',
    'Warning: deadline approaching',
    'Error: application needs attention',
  ])
    await expect(
      page.getByRole('heading', { name: word, exact: true }).first(),
    ).toBeVisible();
  await expect(page.getByRole('link').first()).toHaveAttribute(
    'href',
    'https://www.colorado.gov/',
  );
  await context.close();
});

test('headed, compact and icon-free geometry matches the Figma variants', async ({
  page,
}) => {
  await page.goto('/in-page-alert/');
  const headed = page.locator(
    '[data-cods-fixture-state=info] .cods-in-page-alert__body',
  );
  await expect(headed).toHaveCSS('padding-inline-start', '56px');
  await expect(headed).toHaveCSS('padding-block-start', '16px');
  await expect(headed.locator('.cods-in-page-alert__heading')).toHaveCSS(
    'margin-bottom',
    '8px',
  );
  for (const [state, icon] of [
    ['without-heading', 'info'],
    ['success-compact', 'check-circle'],
    ['warning-compact', 'warning'],
    ['error-compact', 'warning-circle'],
  ]) {
    const body = page.locator(
      `[data-cods-fixture-state=${state}] .cods-in-page-alert__body`,
    );
    await expect(body).toHaveCSS('padding-inline-start', '48px');
    await expect(body).toHaveCSS('padding-block-start', '8px');
    await expectPhosphorMask(body, icon!, { size: 24, inset: 12, top: 8 });
  }
  for (const variant of ['info', 'success', 'warning', 'error']) {
    const body = page.locator(
      `[data-cods-fixture-state=${variant}-no-icon] .cods-in-page-alert__body`,
    );
    await expect(body).toHaveCSS('padding-inline-start', '12px');
    await expect(body).toHaveCSS('padding-block-start', '8px');
    expect(
      await body.evaluate((el) => getComputedStyle(el, '::before').display),
    ).toBe('none');
  }
});
