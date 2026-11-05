import { test, expect, expectAccessible } from './fixtures.js';

test('Input story applies the public border tokens', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-input--large-icons&viewMode=story&globals=a11y.manual:!true',
  );
  const root = page.locator('#storybook-root');
  const wrapper = root.locator('.cods-input');
  const input = root.locator('#input-large-icons');
  await expect(input).toHaveCSS('border-width', '2px');
  await wrapper.evaluate((el) => {
    el.style.setProperty('--cods-border-input-width', '3px');
    el.style.setProperty('--cods-border-input-validation-width', '5px');
  });
  await expect(input).toHaveCSS('border-width', '5px');
  await input.evaluate((el) =>
    el.classList.remove('cods-input__control--success'),
  );
  await expect(input).toHaveCSS('border-width', '3px');
  await expectAccessible(page, testInfo, '#storybook-root');
});
