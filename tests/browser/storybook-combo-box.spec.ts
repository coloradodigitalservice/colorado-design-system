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
  await root.getByRole('button', { name: 'Clear the select contents' }).click();
  await expect(root.locator('select')).toHaveValue('');
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
