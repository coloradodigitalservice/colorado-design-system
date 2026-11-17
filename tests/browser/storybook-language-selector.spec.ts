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

test('trigger focus ring and menu match the Figma specification', async ({
  page,
}) => {
  await page.goto(story);
  const root = page.locator('[data-cods-fixture-state="multiple-languages"]');
  const button = root.getByRole('button', { name: 'Languages' });
  await button.focus();
  await page.keyboard.press('Enter');
  const ring = await button.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.outlineWidth, style.outlineOffset, style.boxShadow];
  });
  expect(ring.slice(0, 2)).toEqual(['4px', '2px']);
  expect(ring[2]).toContain('0px 0px 0px 2px');
  const menu = await root
    .locator('[data-cods-language-selector-panel]')
    .evaluate((element) => ({
      width: element.getBoundingClientRect().width,
      radius: getComputedStyle(element).borderTopLeftRadius,
      separators: [...element.children].map(
        (item) => getComputedStyle(item).borderTopWidth,
      ),
    }));
  expect(menu.width).toBe(200);
  expect(menu.radius).not.toBe('0px');
  expect(new Set(menu.separators)).toEqual(new Set(['0px']));
});

test('globe stays visible in forced colors', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'forced-colors emulation');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto(story);
  const [globe, background] = await page
    .locator('[data-cods-fixture-state="multiple-languages"] button')
    .evaluate((element) => [
      getComputedStyle(element, '::before').backgroundColor,
      getComputedStyle(element).backgroundColor,
    ]);
  expect(globe).not.toBe(background);
});
