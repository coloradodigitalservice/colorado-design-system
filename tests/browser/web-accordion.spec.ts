import { test, expect, expectAccessible } from './fixtures.js';

const state = (name: string) => `[data-cods-fixture-state="${name}"]`;

test('accordion keyboard, exclusive state, focus, and bubbling events', async ({
  page,
  browserName,
}, testInfo) => {
  await page.goto('/accordion/');
  const root = page.locator(`${state('default')} [data-cods-accordion]`);
  const buttons = root.getByRole('button');
  await expect(root).toHaveAttribute('data-cods-accordion-enhanced', '');
  await page.evaluate(() => {
    const events: unknown[] = [];
    document.body.addEventListener('cods-accordion:change', (event) =>
      events.push((event as CustomEvent).detail),
    );
    Object.assign(window, { accordionEvents: events });
  });
  await buttons.nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(buttons.nth(0)).toHaveAttribute('aria-expanded', 'false');
  await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(buttons.nth(1)).toBeFocused();
  await expect(root.getByRole('link')).toBeVisible();
  const tab =
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab';
  await page.keyboard.press(tab);
  await expect(root.getByRole('link')).toBeFocused();
  await page.keyboard.press(tab === 'Alt+Tab' ? 'Alt+Shift+Tab' : 'Shift+Tab');
  await page.keyboard.press('Space');
  await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'false');
  await expect(buttons.nth(1)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(buttons.nth(1)).toBeFocused();
  expect(
    await page.evaluate(
      () =>
        (window as Window & { accordionEvents?: unknown[] }).accordionEvents,
    ),
  ).toEqual([
    { panelId: 'accordion-default-1', expanded: false },
    { panelId: 'accordion-default-2', expanded: true },
    { panelId: 'accordion-default-2', expanded: false },
  ]);
  const outline = await buttons
    .nth(1)
    .evaluate((button) => getComputedStyle(button).outlineStyle);
  expect(outline).toBe('solid');
  await expectAccessible(page, testInfo);
});

test('multiple-open, disabled, and expanded accessibility', async ({
  page,
}, testInfo) => {
  await page.goto('/accordion/');
  const multiple = page.locator(`${state('multiple')} [data-cods-accordion]`);
  await expect(multiple).toHaveAttribute('data-cods-accordion-enhanced', '');
  await expect(
    multiple.locator('[data-cods-accordion-panel]:visible'),
  ).toHaveCount(2);
  await multiple.getByRole('button').first().click();
  await expect(
    multiple.locator('[data-cods-accordion-panel]:visible'),
  ).toHaveCount(1);
  await expect(
    page.locator(state('disabled')).getByRole('button'),
  ).toBeDisabled();
  await expectAccessible(page, testInfo);
});

test('320px reflow, localization, reduced motion, and forced colors', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/accordion/');
  const first = page.locator(`${state('default')} button`).first();
  await expect(
    page.locator(`${state('default')} [data-cods-accordion]`),
  ).toHaveAttribute('data-cods-accordion-enhanced', '');
  await first.focus();
  const states = await page
    .locator('[data-cods-accordion]')
    .evaluateAll((roots) =>
      roots.map((root) => ({
        width: root.getBoundingClientRect().width,
        scrollWidth: root.scrollWidth,
      })),
    );
  expect(
    states.every(({ width, scrollWidth }) => scrollWidth <= Math.ceil(width)),
  ).toBe(true);
  await expect(
    page.locator(`${state('localization')} [data-cods-accordion]`),
  ).toHaveAttribute('lang', 'es');
  await expect(
    page.locator(`${state('rtl')} [data-cods-accordion]`),
  ).toHaveAttribute('dir', 'rtl');
  expect(
    await first.evaluate((button) => getComputedStyle(button).outlineStyle),
  ).toBe('solid');
  await expectAccessible(page, testInfo);
  await testInfo.attach('accordion-narrow-forced-colors', {
    body: await page.locator(state('default')).screenshot(),
    contentType: 'image/png',
  });
});

test('all server-rendered panels remain readable without CSS or JavaScript', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/accordion/');
  await expect(page.locator('[data-cods-accordion-panel]:visible')).toHaveCount(
    9,
  );
  await expect(page.locator('[data-cods-accordion-enhanced]')).toHaveCount(0);
  await page.evaluate(() =>
    document
      .querySelectorAll('style,link[rel="stylesheet"]')
      .forEach((element) => element.remove()),
  );
  await expect(page.locator('[data-cods-accordion-panel]:visible')).toHaveCount(
    9,
  );
  await testInfo.attach('accordion-unenhanced', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await context.close();
});

test('visual review of expanded and collapsed keyboard focus states', async ({
  page,
}, testInfo) => {
  await page.goto('/accordion/');
  await page.evaluate(() => document.fonts.ready);
  const example = page.locator(state('default'));
  const trigger = example.getByRole('button').first();
  await expect(example.locator('[data-cods-accordion]')).toHaveAttribute(
    'data-cods-accordion-enhanced',
    '',
  );
  await trigger.focus();
  await testInfo.attach('accordion-expanded-focus', {
    body: await example.screenshot(),
    contentType: 'image/png',
  });
  await page.keyboard.press('Space');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await testInfo.attach('accordion-collapsed-focus', {
    body: await example.screenshot(),
    contentType: 'image/png',
  });
});
