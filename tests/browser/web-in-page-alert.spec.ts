import { expectPhosphorMask } from './icon-mask.js';
import { readFileSync } from 'node:fs';
import { routeBuiltFiles } from './built-files.js';
import { test, expect, expectAccessible } from './fixtures.js';

test.beforeEach(async ({ page }) => routeBuiltFiles(page, 'web'));

const preview = (state: string) =>
  `[data-cods-docs-preview-state="${state}"] .cods-in-page-alert`;

test('in-page alert page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/in-page-alert/');
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
    'Writing for in-page alerts',
    'Accessibility for in-page alerts',
    'Variants and elements',
    'Announcing dynamic updates',
    'Variable settings',
    'Limitations',
  ])
    expect(subheadings).toContain(heading);

  const states = [
    'info',
    'success',
    'warning',
    'urgent',
    'without-heading',
    'info-no-icon',
  ];
  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(
    states.length,
  );
  // Initial-render notices carry no live-region role.
  for (const state of states)
    await expect(page.locator(preview(state))).not.toHaveAttribute('role');
  await expect(page.locator('[data-cods-docs-preview-code]')).toContainText(
    'cods-in-page-alert--no-icon',
  );

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('In-Page Alert maturity is experimental');
  await expect(status).toContainText('Manual accessibility review');
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 In-Page Alert' }),
  ).toBeVisible();
  await expect(
    status.getByRole('link', { name: 'Accessibility evidence' }),
  ).toHaveAttribute(
    'href',
    /\/in-page-alert\/accessibility\/in-page-alert\.evidence\.md$/,
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

test('four severity colors, distinct shipped icons, and keyboard focus', async ({
  page,
  browserName,
}) => {
  await page.goto('/in-page-alert/');
  const masks: string[] = [];
  const backgrounds: string[] = [];
  const accents: string[] = [];
  for (const variant of ['info', 'success', 'warning', 'urgent']) {
    const alert = page.locator(preview(variant));
    await expectPhosphorMask(
      alert.locator('.cods-in-page-alert__body'),
      {
        info: 'info',
        success: 'check-circle',
        warning: 'warning',
        urgent: 'warning-circle',
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

test('320px reflow, forced colors, and reduced motion', async ({
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
    ['urgent', 'warning-circle'],
  ]) {
    await expectPhosphorMask(
      page.locator(`${preview(state!)} .cods-in-page-alert__body`),
      icon!,
      { size: 32, inset: 12, top: 16 },
    );
  }
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
    'Urgent: service temporarily unavailable',
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
  // Every compact and icon-free severity is also measured in Storybook.
  await page.goto('/in-page-alert/');
  const headed = page.locator(`${preview('info')} .cods-in-page-alert__body`);
  await expect(headed).toHaveCSS('padding-inline-start', '56px');
  await expect(headed).toHaveCSS('padding-block-start', '16px');
  await expect(headed.locator('.cods-in-page-alert__heading')).toHaveCSS(
    'margin-bottom',
    '8px',
  );
  const compact = page.locator(
    `${preview('without-heading')} .cods-in-page-alert__body`,
  );
  await expect(compact).toHaveCSS('padding-inline-start', '48px');
  await expect(compact).toHaveCSS('padding-block-start', '8px');
  await expectPhosphorMask(compact, 'info', { size: 24, inset: 12, top: 8 });
  const noIcon = page.locator(
    `${preview('info-no-icon')} .cods-in-page-alert__body`,
  );
  await expect(noIcon).toHaveCSS('padding-inline-start', '12px');
  await expect(noIcon).toHaveCSS('padding-block-start', '8px');
  expect(
    await noIcon.evaluate((el) => getComputedStyle(el, '::before').display),
  ).toBe('none');
});

test('Site Alert keeps its emergency icon when the shared error mapping changes', async ({
  page,
}) => {
  await page.goto('/site-alert/');
  const alerts = page.locator('.cods-site-alert');
  await expect(alerts).toHaveCount(8);
  const textOnly = page.locator(
    '.cods-site-alert:not(.cods-site-alert--emergency)',
  );
  await expect(textOnly).toHaveCount(7);
  for (const alert of await textOnly.all()) {
    const icon = await alert
      .locator('.cods-site-alert__body')
      .evaluate((element) => getComputedStyle(element, '::before').display);
    expect(icon).toBe('none');
  }
  await expectPhosphorMask(
    page.locator('[data-cods-fixture-state=emergency] .cods-site-alert__body'),
    'warning',
    { size: 32, inset: 32, top: 18 },
  );
});
