import { test, expect, expectAccessible } from './fixtures.js';

test('Focus States page demonstrates the button focus indicator', async ({
  page,
  browserName,
}, testInfo) => {
  await page.goto('/focus-states/');
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: 'Focus States', level: 1 }),
  ).toBeVisible();
  for (const heading of ['When to use it', 'Focus styles', 'Try it']) {
    await expect(
      main.getByRole('heading', { name: heading, level: 2 }),
    ).toBeVisible();
  }
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Focus States' }),
  ).toHaveAttribute('aria-current', 'page');
  const button = main.getByRole('button', { name: 'Example button' });
  await button.focus();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await page.keyboard.press(
    browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab',
  );
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-style', 'solid');
  await expect(button).toHaveCSS('outline-width', '4px');
  await expect(button).toHaveCSS('outline-offset', '2px');
  const contrast = await button.evaluate((el) => {
    const color = getComputedStyle(el)
      .outlineColor.match(/\d+/g)
      ?.slice(0, 3)
      .map(Number);
    if (!color || color.length !== 3) throw new Error('Missing outline color');
    const linear = color.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    return (
      1.05 /
      (0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]! + 0.05)
    );
  });
  expect(contrast).toBeGreaterThanOrEqual(3);
  await expectAccessible(page, testInfo, 'main');
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ forcedColors: 'active' });
  await button.focus();
  await expect(button).toHaveCSS('outline-style', 'solid');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  const unclipped = await button.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const parent = el.parentElement!.getBoundingClientRect();
    return (
      rect.left - parent.left >= 6 &&
      parent.right - rect.right >= 6 &&
      rect.top - parent.top >= 6 &&
      parent.bottom - rect.bottom >= 6
    );
  });
  expect(unclipped).toBe(true);
});
