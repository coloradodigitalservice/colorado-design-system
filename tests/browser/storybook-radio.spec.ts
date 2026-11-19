import { test, expect, expectAccessible } from './fixtures.js';

test('canonical radio states preserve native selection and accessible groups', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-radio--all-states&viewMode=story',
  );
  const first = page.locator('#radio-default-1');
  await expect(first).toBeAttached();
  await page.locator('label[for="radio-default-1"]').click();
  await expect(first).toBeChecked();
  await first.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#radio-default-2')).toBeChecked();
  await expect(first).not.toBeChecked();
  await expect(page.locator('#radio-selected-1')).toBeChecked();
  await expect(page.locator('#radio-disabled-group-1')).toBeDisabled();
  await expect(
    page.getByRole('group', { name: 'Choose an application type' }),
  ).toHaveAccessibleDescription(
    'Error: Select an application type before continuing.',
  );
  await expectAccessible(page, testInfo);
});

// These states are not in the docs page preview, so they run here (Chromium
// only). Moved from web-radio.spec.ts in CODS-P4-030.
test('long-content, Spanish, RTL and disabled tile states reflow and keep native selection', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(
    '/iframe.html?id=components-radio--all-states&viewMode=story',
  );
  for (const state of ['long-content', 'localization', 'rtl']) {
    const block = page.locator(`[data-cods-fixture-state="${state}"]`);
    expect(await block.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
  }
  const rtl = page.locator('label[for="radio-rtl-1"]');
  expect(await rtl.evaluate((el) => getComputedStyle(el).paddingRight)).toBe(
    '36px',
  );
  expect(await rtl.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe(
    '8px',
  );
  await expect(page.locator('#radio-tile-disabled-1')).toBeDisabled();
  await expect(page.locator('#radio-tile-disabled-1')).toBeChecked();
  await expect(page.locator('#radio-tile-disabled-2')).toBeDisabled();
  for (const state of ['tile-long-content', 'tile-localization', 'tile-rtl']) {
    const block = page.locator(`[data-cods-fixture-state="${state}"]`);
    expect(await block.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
    const options = block.getByRole('radio');
    await expect(options).toHaveCount(2);
    const labels = block.locator('.cods-radio__label');
    await labels.nth(0).click();
    await labels.nth(1).click();
    await expect(options.nth(0)).not.toBeChecked();
    await expect(options.nth(1)).toBeChecked();
  }
});
