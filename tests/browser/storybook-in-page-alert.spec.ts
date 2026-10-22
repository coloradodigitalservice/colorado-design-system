import { readFileSync } from 'node:fs';
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
  ['error', 'error'],
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
