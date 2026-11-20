import type { Locator, Page } from '@playwright/test';
import { test, expect } from './fixtures.js';

// The documentation shell keeps <main tabindex="-1"> as the skip-link
// destination. These checks keep the container free of a focus ring while
// proving that skip navigation and descendant focus indicators still work.

const routes = ['/', '/getting-started/', '/accordion/', '/hero-preview/'];

// macOS WebKit follows Safari's Option+Tab navigation for links.
const tabKey = (browserName: string) =>
  browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';

const focusRing = (locator: Locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow,
    };
  });

const expectNoRing = async (locator: Locator) => {
  const ring = await focusRing(locator);
  expect(ring.outlineStyle).toBe('none');
  expect(ring.boxShadow).toBe('none');
};

const expectVisibleRing = async (locator: Locator) => {
  const ring = await focusRing(locator);
  expect(
    (ring.outlineStyle !== 'none' && ring.outlineWidth !== '0px') ||
      ring.boxShadow !== 'none',
    `Expected a visible focus indicator, got ${JSON.stringify(ring)}`,
  ).toBe(true);
};

const skipToMain = async (page: Page, browserName: string) => {
  const skipLink = page.locator('a[href="#main-content"]');
  await page.keyboard.press(tabKey(browserName));
  await expect(skipLink).toBeFocused();
  await expectVisibleRing(skipLink);
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
};

for (const path of routes) {
  test(`main has no focus ring after pointer click: ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    const main = page.locator('main');
    await main.locator('h1').first().click();
    // The click focuses the programmatically focusable landmark; that focus
    // must not paint a ring around the whole container.
    await expect(main).toBeFocused();
    await expectNoRing(main);
  });

  test(`skip link moves focus to main without a ring: ${path}`, async ({
    page,
    browserName,
  }) => {
    await page.goto(path);
    const main = page.locator('main');
    await skipToMain(page, browserName);
    await expectNoRing(main);
    await expect(main).toHaveAttribute('tabindex', '-1');
    await expect(main).toBeInViewport();

    // The next Tab continues inside main instead of restarting in the header,
    // and main itself is not an extra sequential stop.
    await page.keyboard.press(tabKey(browserName));
    const next = await page.evaluate(() => {
      const main = document.querySelector('main')!;
      const active = document.activeElement;
      return {
        isMain: active === main,
        insideMain: !!active && main.contains(active),
      };
    });
    expect(next).toEqual({ isMain: false, insideMain: true });
    await expectVisibleRing(page.locator(':focus'));
  });
}

test('accordion trigger keeps its focus indicator inside main', async ({
  page,
  browserName,
}) => {
  await page.goto('/accordion/');
  await skipToMain(page, browserName);
  const trigger = page.locator('main .cods-accordion__trigger').first();
  for (let i = 0; i < 60; i++) {
    if (await trigger.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press(tabKey(browserName));
  }
  await expect(trigger).toBeFocused();
  await expectVisibleRing(trigger);
  await expectNoRing(page.locator('main'));
});

test('forced colors keeps skip-link focus without a main ring', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Forced-colors emulation is Chromium-only in Playwright.',
  );
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/getting-started/');
  await skipToMain(page, browserName);
  await expectNoRing(page.locator('main'));
  await page.keyboard.press('Tab');
  await expectVisibleRing(page.locator(':focus'));
});
