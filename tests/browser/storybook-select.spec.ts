import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const fixture = readFileSync(
  'packages/colorado-design-system/src/components/select/select.fixture.html',
  'utf8',
);

test('Storybook Select uses the canonical fixture and native input', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-select--all-states&viewMode=story&globals=a11y.manual:!true',
  );
  const root = page.locator('#storybook-root');
  await expect(root.getByRole('combobox')).toHaveCount(9);
  const expected = Array.from(
    fixture.matchAll(/<select[^>]*\bid="([^"]+)"/g),
    (match) => match[1],
  );
  expect(
    await root
      .locator('select')
      .evaluateAll((controls) => controls.map((control) => control.id)),
  ).toEqual(expected);
  const control = root.locator('#select-default');
  await control.selectOption('denver');
  await expect(control).toHaveValue('denver');
  await control.focus();
  await expect(control).toHaveCSS('outline-color', 'rgb(23, 59, 179)');
  await expectAccessible(page, testInfo, '#storybook-root');
  await page.evaluate(() => document.fonts.ready);
  await testInfo.attach('select-all-states', {
    body: await root.screenshot(),
    contentType: 'image/png',
  });
});
