import { test, expect, expectAccessible } from './fixtures.js';

const story =
  '/iframe.html?id=components-language-selector--all-states&viewMode=story&globals=a11y.manual:!true';

test('opens languages and returns focus on Escape', async ({
  page,
}, testInfo) => {
  await page.goto(story);
  const root = page.locator('[data-cods-fixture-state="multiple-languages"]');
  const button = root.getByRole('button', { name: 'Languages' });
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  const spanish = root.getByRole('link', { name: 'Español' });
  await expect(spanish).toHaveAttribute('hreflang', 'es');
  await spanish.focus();
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('language links remain available without enhancement', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=components-language-selector--without-java-script&viewMode=story&globals=a11y.manual:!true',
  );
  await expect(
    page
      .locator('[data-cods-fixture-state="multiple-languages"]')
      .getByRole('link', { name: 'Español' }),
  ).toBeVisible();
});
