import { readFileSync } from 'node:fs';
import { expectPhosphorMask } from './icon-mask.js';
import { routeBuiltFiles } from './built-files.js';
import { test, expect, expectAccessible } from './fixtures.js';

test.beforeEach(async ({ page }) => routeBuiltFiles(page, 'storybook'));

for (const [story, role] of [
  ['dynamic-status', 'status'],
  ['dynamic-alert', 'alert'],
] as const) {
  test(`${story} updates an existing live region without stealing focus`, async ({
    page,
  }, testInfo) => {
    await page.goto(
      `/iframe.html?id=components-in-page-alert--${story}&viewMode=story&globals=a11y.manual:!true`,
    );
    const region = page.getByRole(role);
    await expect(region.locator('.cods-in-page-alert__body')).toBeEmpty();
    const button = page.getByRole('button', {
      name: 'Show contextual message',
    });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(region.locator('.cods-in-page-alert__text')).not.toBeEmpty();
    await expect(button).toBeFocused();
    await expectAccessible(page, testInfo, '#storybook-root');
  });
}

test('all canonical states render without accessibility violations', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-in-page-alert--all-states&viewMode=story&globals=a11y.manual:!true',
  );
  await expect(page.locator('.cods-in-page-alert')).toHaveCount(20);
  await expectAccessible(page, testInfo, '#storybook-root');
});

const examples: { examples: { state: string; html: string }[] } = JSON.parse(
  readFileSync(
    'packages/colorado-design-system/dist/examples/in-page-alert.json',
    'utf8',
  ),
);
for (const [story, state] of [
  ['default', 'default'],
  ['info', 'info'],
  ['success', 'success'],
  ['warning', 'warning'],
  ['urgent', 'urgent'],
  ['without-heading', 'without-heading'],
  ['heading-only', 'heading-only'],
  ['long-content', 'long-content'],
  ['spanish', 'localization'],
  ['arabic-rtl', 'rtl'],
  ['focus-visible', 'focus-visible'],
] as const) {
  test(
    'isolated story uses canonical markup: ' + state,
    async ({ page }, testInfo) => {
      await page.goto(
        '/iframe.html?id=components-in-page-alert--' +
          story +
          '&viewMode=story&globals=a11y.manual:!true',
      );
      await expect(page.locator('.cods-in-page-alert')).toHaveCount(1);
      const html = examples.examples.find(
        (example) => example.state === state,
      )!.html;
      expect(
        await page.locator('.cods-in-page-alert').evaluate((element, html) => {
          const template = document.createElement('template');
          template.innerHTML = html;
          return (
            element.outerHTML ===
            template.content.querySelector('.cods-in-page-alert')?.outerHTML
          );
        }, html),
      ).toBe(true);
      await expectAccessible(page, testInfo, '#storybook-root');
    },
  );
}

const allStates =
  '/iframe.html?id=components-in-page-alert--all-states&viewMode=story&globals=a11y.manual:!true';
const state = (name: string) =>
  `[data-cods-fixture-state=${name}] .cods-in-page-alert`;

// The docs page previews only common variants; these states run here
// (Chromium only). The previewed variants also run on the page in all engines.
test('every state reflows at 320px with RTL icon placement and forced colors', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto(allStates);
  const alerts = page.locator('.cods-in-page-alert');
  await expect(alerts).toHaveCount(20);
  for (const alert of await alerts.all()) {
    await expect(alert).toBeVisible();
    expect(
      await alert.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
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
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('compact and icon-free geometry matches Figma for every severity', async ({
  page,
}) => {
  await page.goto(allStates);
  for (const [name, icon] of [
    ['without-heading', 'info'],
    ['success-compact', 'check-circle'],
    ['warning-compact', 'warning'],
    ['urgent-compact', 'warning-circle'],
  ]) {
    const body = page.locator(`${state(name!)} .cods-in-page-alert__body`);
    await expect(body).toHaveCSS('padding-inline-start', '48px');
    await expect(body).toHaveCSS('padding-block-start', '8px');
    await expectPhosphorMask(body, icon!, { size: 24, inset: 12, top: 8 });
  }
  for (const variant of ['info', 'success', 'warning', 'urgent']) {
    const body = page.locator(
      `${state(`${variant}-no-icon`)} .cods-in-page-alert__body`,
    );
    await expect(body).toHaveCSS('padding-inline-start', '12px');
    await expect(body).toHaveCSS('padding-block-start', '8px');
    expect(
      await body.evaluate((el) => getComputedStyle(el, '::before').display),
    ).toBe('none');
  }
});
