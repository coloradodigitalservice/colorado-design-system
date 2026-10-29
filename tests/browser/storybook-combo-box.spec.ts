import { test, expect, expectAccessible } from './fixtures.js';

const story =
  '/iframe.html?id=components-combo-box--all-states&viewMode=story&globals=a11y.manual:!true';

test('filter, navigate, select, clear and report no results', async ({
  page,
}, testInfo) => {
  await page.goto(story);
  const root = page.locator('[data-cods-fixture-state="default"]');
  const input = root.getByRole('combobox');
  await input.fill('2025');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(root.getByRole('option')).toHaveCount(1);
  await input.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(root.locator('select')).toHaveValue('2025');
  await expect(root.getByRole('status')).toHaveText('2025 selected.');
  await root.getByRole('button', { name: 'Clear the select contents' }).click();
  await expect(root.locator('select')).toHaveValue('');
  await expect(root.getByRole('status')).toHaveText('Selection cleared.');
  await input.fill('not found');
  await expect(root.getByRole('status')).toHaveText('No results.');
  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('pointer selection and native fallback', async ({ page }) => {
  await page.goto(story);
  const root = page.locator('[data-cods-fixture-state="default"]');
  await root.getByRole('combobox').click();
  await root.getByRole('option', { name: '2024' }).click();
  await expect(root.locator('select')).toHaveValue('2024');
  await page.goto(
    '/iframe.html?id=components-combo-box--without-java-script&viewMode=story&globals=a11y.manual:!true',
  );
  const select = page.locator('[data-cods-fixture-state="default"] select');
  await select.selectOption('2025');
  await expect(select).toHaveValue('2025');
});

test('group labels and validation are preserved', async ({
  page,
}, testInfo) => {
  await page.goto(story);
  const group = page.locator('[data-cods-fixture-state="grouped"]');
  const input = group.getByRole('combobox');
  await input.click();
  await expect(
    group.getByRole('option', {
      name: 'Renew or replace: Renew license or ID',
    }),
  ).toHaveAttribute('data-cods-combo-box-group', 'Renew or replace');
  await input.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(group.locator('select')).toHaveValue('replace');
  const required = page.locator('[data-cods-fixture-state="error"]');
  await expect(required.getByRole('combobox')).toHaveAttribute('required', '');
  await expect(required.getByRole('combobox')).toHaveAttribute(
    'aria-describedby',
    'combo-error',
  );
  await expect(required.getByRole('combobox')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('disabled controls and form reset preserve correct values', async ({
  page,
}) => {
  await page.goto(story);
  const disabled = page.locator('[data-cods-fixture-state="disabled"]');
  await expect(disabled.getByRole('combobox')).toBeDisabled();
  await expect(disabled.locator('select')).toBeDisabled();
  const root = page.locator('[data-cods-fixture-state="error"]');
  const input = root.getByRole('combobox');
  await input.click();
  await root.getByRole('option', { name: '2025' }).click();
  await input.fill('2026');
  expect(
    await input.evaluate((element: HTMLInputElement) => element.validity.valid),
  ).toBe(false);
  await root.locator('form').evaluate((form: HTMLFormElement) => form.reset());
  await expect(input).toHaveValue('');
  await expect(root.locator('select')).toHaveValue('');
});
