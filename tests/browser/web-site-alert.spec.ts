// Site Alert documentation page. These tests run against the curated preview
// (Informational, Warning, Emergency) in Chromium, Firefox, and WebKit. States
// the page no longer shows (long content, Spanish, RTL, focus-visible,
// placement) are covered in storybook-site-alert.spec.ts.
import { expectPhosphorMask } from './icon-mask.js';
import { routeBuiltFiles } from './built-files.js';
import { test, expect, expectAccessible } from './fixtures.js';

const preview = (state: string) => `[data-cods-docs-preview-state="${state}"]`;
const textOnly = ['default', 'warning'];

test.beforeEach(async ({ page }) => {
  await routeBuiltFiles(page, 'web');
});

test('site alert page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/site-alert/');
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
    'Writing for site alerts',
    'Accessibility for site alerts',
    'Variants and elements',
    'Placing the notice',
    'Variable settings',
    'Limitations',
  ])
    expect(subheadings).toContain(heading);

  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(3);
  for (const state of ['default', 'warning', 'emergency'])
    await expect(
      page.locator(`${preview(state)} .cods-site-alert`),
    ).toHaveCount(1);
  const code = page.locator('[data-cods-docs-preview-code]');
  await expect(code).toContainText('cods-site-alert--warning');
  await expect(code).toContainText('cods-site-alert--emergency');

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('Site Alert maturity is experimental');
  await expect(status).toContainText('Manual accessibility review is pending');
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 Site Alert' }),
  ).toBeVisible();
  await expect(
    status.getByRole('link', { name: 'Accessibility evidence' }),
  ).toHaveAttribute(
    'href',
    /\/site-alert\/accessibility\/site-alert\.evidence\.md$/,
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

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('static notice remains named and readable without CSS or JavaScript', async ({
    page,
  }) => {
    await page.route('**/*.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: '' }),
    );
    await page.goto('/site-alert/');
    await expect(page.locator('.cods-site-alert')).toHaveCount(3);
    await expect(
      page.getByRole('region', { name: 'Emergency: service interruption' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Offices closing early:' }),
    ).toBeVisible();
    await expect(
      page.locator('.cods-site-alert__link').first(),
    ).toHaveAttribute('href', 'https://www.colorado.gov/');
    await expect(page.locator('.cods-site-alert [role=alert]')).toHaveCount(0);
    await expect(page.locator('.cods-site-alert button')).toHaveCount(0);
  });
});

test('keyboard links have visible focus without moving focus to the notice', async ({
  page,
  browserName,
}) => {
  await page.goto('/site-alert/');
  const links = page.locator('[data-cods-docs-preview] .cods-site-alert__link');
  await expect(links).toHaveCount(3);
  await expect(page.locator('.cods-site-alert[tabindex]')).toHaveCount(0);
  const tab =
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab';
  await links.first().focus();
  await expect(links.first()).toBeFocused();
  // Each preview notice has one link, so Tab moves straight to the next one.
  for (const [index, color] of [
    [1, null],
    [2, 'rgb(255, 255, 255)'],
  ] as const) {
    await page.keyboard.press(tab);
    const link = links.nth(index);
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS('outline-style', 'solid');
    await expect(link).toHaveCSS('outline-width', '4px');
    if (color) await expect(link).toHaveCSS('outline-color', color);
  }
});

test('narrow forced colors keep content readable', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({
    forcedColors: 'active',
    reducedMotion: 'reduce',
  });
  await page.goto('/site-alert/');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const alerts = page.locator('[data-cods-docs-preview] .cods-site-alert');
  await expect(alerts).toHaveCount(3);
  for (const alert of await alerts.all()) {
    expect(await alert.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
    await expect(alert.locator('.cods-site-alert__surface')).toHaveCSS(
      'border-top-width',
      '4px',
    );
    await expect(alert.locator('.cods-site-alert__body')).toHaveCSS(
      'padding-inline-start',
      (await alert.evaluate((el) =>
        el.classList.contains('cods-site-alert--emergency'),
      ))
        ? '64px'
        : '16px',
    );
  }
  await expectAccessible(page, testInfo);
});

// Includes the check moved from web-in-page-alert.spec.ts that guards the past
// defect where a shared error severity mapping change added icons to
// text-only Site Alerts.
test('shared Phosphor severity masks preserve real surface contrast and alignment', async ({
  page,
}) => {
  await page.goto('/site-alert/');
  await expect(page.locator('.cods-site-alert')).toHaveCount(3);
  const plain = page.locator(
    '.cods-site-alert:not(.cods-site-alert--emergency)',
  );
  await expect(plain).toHaveCount(2);
  for (const alert of await plain.all())
    expect(
      await alert
        .locator('.cods-site-alert__body')
        .evaluate((el) => getComputedStyle(el, '::before').display),
    ).toBe('none');
  const emergency = page.locator(
    `${preview('emergency')} .cods-site-alert__body`,
  );
  await expectPhosphorMask(emergency, 'warning', {
    size: 32,
    inset: 32,
    top: 18,
    color: 'rgb(255, 255, 255)',
  });
  await page.emulateMedia({ forcedColors: 'active' });
  for (const state of textOnly) {
    const body = page.locator(`${preview(state)} .cods-site-alert__body`);
    expect(
      await body.evaluate((el) => getComputedStyle(el, '::before').display),
    ).toBe('none');
  }
  await expectPhosphorMask(emergency, 'warning', {
    size: 32,
    inset: 32,
    top: 18,
  });
});

test('text-only notices and emergency spacing adapt to desktop and mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/site-alert/');
  const emergency = page.locator(
    `${preview('emergency')} .cods-site-alert__body`,
  );
  await expect(emergency).toHaveCSS('max-width', '1280px');
  await expect(emergency).toHaveCSS('padding-inline-start', '80px');
  await expect(emergency.locator('.cods-site-alert__heading')).toHaveCSS(
    'margin-bottom',
    '16px',
  );
  await expect(
    page.locator(`${preview('emergency')} .cods-site-alert__surface`),
  ).toHaveCSS('border-top-width', '0px');
  for (const state of textOnly) {
    const body = page.locator(`${preview(state)} .cods-site-alert__body`);
    await expect(body).toHaveCSS('padding-inline-start', '32px');
    const lead = body.locator('p > strong');
    await expect(lead).toBeVisible();
    await expect(lead).toHaveCSS('display', 'inline');
    const id = await lead.getAttribute('id');
    await expect(body.locator('xpath=ancestor::section[1]')).toHaveAttribute(
      'aria-labelledby',
      id!,
    );
    expect(
      await body.evaluate((el) => getComputedStyle(el, '::before').display),
    ).toBe('none');
  }
  await expect(
    page.locator(`${preview('warning')} .cods-site-alert__surface`),
  ).toHaveCSS('background-color', 'rgb(255, 209, 0)');
  await page.setViewportSize({ width: 402, height: 900 });
  await expect(emergency).toHaveCSS('padding-inline-start', '64px');
  await expect(emergency).toHaveCSS('padding-inline-end', '16px');
  for (const state of textOnly) {
    const body = page.locator(`${preview(state)} .cods-site-alert__body`);
    await expect(body).toHaveCSS('padding-inline-start', '16px');
    expect(
      await body.evaluate((el) => getComputedStyle(el, '::before').display),
    ).toBe('none');
  }
  await expectPhosphorMask(emergency, 'warning', {
    size: 32,
    inset: 16,
    top: 18,
    color: 'rgb(255, 255, 255)',
  });
});
