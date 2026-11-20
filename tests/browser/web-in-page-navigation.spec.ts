// In-Page Navigation documentation page. Keyboard, hover, current-section, and
// no-JS behavior run here so all three browser engines cover them; scroll-
// geometry edge cases stay in storybook-in-page-navigation.spec.ts.
import { test, expect, expectAccessible } from './fixtures.js';

const nav = '[data-cods-docs-preview] [data-cods-in-page-navigation]';

test('in-page navigation page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/in-page-navigation/');
  const main = page.locator('main');
  // The preview's own section headings are demonstration content.
  expect(
    await main
      .locator('h2')
      .evaluateAll((headings) =>
        headings
          .filter((heading) => !heading.closest('figure'))
          .map((heading) => heading.textContent),
      ),
  ).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  const subheadings = await main.locator('h3').allTextContents();
  for (const heading of [
    'When to use',
    'Writing for in-page navigation',
    'Accessibility for in-page navigation',
    'Classes and attributes',
    'Linking to sections',
    'Responsive placement',
    'Initializing the controller',
    'Limitations',
  ])
    expect(subheadings).toContain(heading);

  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(1);
  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('Manual accessibility review');
  await expect(status).toContainText('is pending');
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 In-Page Navigation' }),
  ).toBeVisible();
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

test('the preview highlights the current section as the page scrolls', async ({
  page,
}) => {
  await page.goto('/in-page-navigation/');
  const links = page.locator(nav).getByRole('link');
  await expect(links.first()).toHaveAttribute('aria-current', 'location');
  await page
    .locator('[data-cods-docs-preview] section')
    .evaluateAll((sections) => {
      sections.forEach((section) => {
        (section as HTMLElement).style.minHeight = '100vh';
      });
    });
  await page.locator('#payment-amounts').evaluate((section) => {
    window.scrollTo(
      0,
      window.scrollY + section.getBoundingClientRect().top + 300,
    );
  });
  await expect(links.nth(1)).toHaveAttribute('aria-current', 'location');
  await expect(links.first()).not.toHaveAttribute('aria-current');
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await expect(links.nth(2)).toHaveAttribute('aria-current', 'location');
});

test('keyboard order, exit, and link activation', async ({
  page,
  browserName,
}) => {
  // macOS WebKit only tabs to links with Option held, like Safari's default.
  const tab =
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab';
  const shiftTab = tab === 'Alt+Tab' ? 'Alt+Shift+Tab' : 'Shift+Tab';
  await page.goto('/in-page-navigation/');
  const root = page.locator(nav);
  const links = root.getByRole('link');
  await expect(links).toHaveCount(3);
  await root.evaluate((element) => {
    const before = document.createElement('button');
    before.textContent = 'Before navigation';
    const after = document.createElement('button');
    after.textContent = 'After navigation';
    element.before(before);
    element.after(after);
  });
  const before = page.getByRole('button', { name: 'Before navigation' });
  const after = page.getByRole('button', { name: 'After navigation' });
  await before.focus();
  for (let index = 0; index < 3; index += 1) {
    await page.keyboard.press(tab);
    await expect(links.nth(index)).toBeFocused();
  }
  await page.keyboard.press(tab);
  await expect(after).toBeFocused();
  for (let index = 2; index >= 0; index -= 1) {
    await page.keyboard.press(shiftTab);
    await expect(links.nth(index)).toBeFocused();
  }
  await page.keyboard.press(shiftTab);
  await expect(before).toBeFocused();
  for (let index = 0; index < 3; index += 1) {
    await before.focus();
    for (let step = 0; step <= index; step += 1) await page.keyboard.press(tab);
    const link = links.nth(index);
    await expect(link).toBeFocused();
    const href = await link.getAttribute('href');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  }
});

test('hover uses the desktop colors and leaves mobile links unchanged', async ({
  page,
}) => {
  await page.goto('/in-page-navigation/');
  const link = page.locator(nav).getByRole('link').nth(1);
  const colors = () =>
    link.evaluate((node) => {
      const style = getComputedStyle(node);
      return { color: style.color, background: style.backgroundColor };
    });
  const normal = await colors();
  await link.hover();
  const hovered = await colors();
  expect(hovered).not.toEqual(normal);
  await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page.setViewportSize({ width: 375, height: 720 });
  await link.hover();
  expect(await colors()).toEqual(normal);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the preview links still navigate to their sections', async ({
    page,
  }) => {
    await page.goto('/in-page-navigation/');
    await expect(page.locator(`${nav} [aria-current]`)).toHaveCount(0);
    const link = page
      .locator(nav)
      .getByRole('link', { name: 'Payment amounts' });
    await link.click();
    await expect(page).toHaveURL(/#payment-amounts$/);
    await expect(page.locator('#payment-amounts')).toBeInViewport();
  });
});
