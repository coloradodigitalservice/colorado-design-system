import { expectPhosphorMask } from './icon-mask.js';
import { routeBuiltFiles } from './built-files.js';
import { test, expect, expectAccessible } from './fixtures.js';

test.use({ javaScriptEnabled: false });

test('static notice remains named and readable without CSS or JavaScript', async ({
  page,
}) => {
  await page.route('**/*.css', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  );
  await page.goto('/site-alert/');
  await expect(page.locator('.cods-site-alert')).toHaveCount(9);
  await expect(
    page
      .getByRole('region', { name: 'Emergency: service interruption' })
      .first(),
  ).toBeVisible();
  await expect(page.locator('.cods-site-alert__link').first()).toHaveAttribute(
    'href',
    'https://www.colorado.gov/',
  );
  await expect(page.locator('.cods-site-alert [role=alert]')).toHaveCount(0);
});

test('early example and copyable source retain the canonical structure at 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/site-alert/');
  const example = page.locator('.cods-site-alert').first();
  await expect(example).toBeVisible();
  const beforeUsage = await example.evaluate((element) => {
    const usage = [...document.querySelectorAll('h2')].find(
      (heading) => heading.textContent === 'Use the package',
    );
    return Boolean(
      usage &&
      element.compareDocumentPosition(usage) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
  expect(beforeUsage).toBe(true);
  await page.getByText('View and copy HTML', { exact: true }).click();
  const source = page.getByRole('region', { name: 'Default Site Alert HTML' });
  await expect(source).toBeVisible();
  const equivalent = await source.evaluate((element) => {
    const template = document.createElement('template');
    template.innerHTML = element.textContent ?? '';
    return (
      template.content.querySelector('.cods-site-alert')?.outerHTML ===
      document.querySelector('.cods-site-alert')?.outerHTML
    );
  });
  expect(equivalent).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test.beforeEach(async ({ page }) => {
  await routeBuiltFiles(page, 'web');
});

test('without JavaScript both optional dismissal controls stay hidden and notices remain readable', async ({
  page,
}) => {
  await page.goto('/site-alert/');
  for (const state of ['informational', 'emergency']) {
    const root = page.locator(
      `[data-cods-fixture-state="${state}-dismissible"] .cods-site-alert`,
    );
    await expect(root).toBeVisible();
    await expect(root.locator('button')).toBeHidden();
    await expect(root.getByRole('link')).toBeVisible();
  }
});

test.describe('enhanced site alert', () => {
  test.use({ javaScriptEnabled: true });
  test('dismissal preserves focus and both surfaces pass axe', async ({
    page,
  }, testInfo) => {
    await page.goto('/site-alert/');
    await expectAccessible(page, testInfo);
    await page
      .getByRole('button', { name: 'Dismiss emergency site notice' })
      .click();
    await expect(
      page.locator(
        '[data-cods-fixture-state="emergency-dismissible"] .cods-site-alert',
      ),
    ).toBeHidden();
    await expect(
      page.locator('#site-alert-emergency-dismissible-destination'),
    ).toBeFocused();
    await expect(
      page.locator(
        '[data-cods-fixture-state="informational-dismissible"] .cods-site-alert',
      ),
    ).toBeVisible();
  });
  test('narrow RTL and forced colors keep both severity icons and content', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({
      forcedColors: 'active',
      reducedMotion: 'reduce',
    });
    await page.goto('/site-alert/');
    const body = page.locator('[dir="rtl"] .cods-site-alert__body');
    expect(
      await body.evaluate((el) => getComputedStyle(el, '::before').right),
    ).toBe('32px');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const alert of await page.locator('.cods-site-alert').all()) {
      expect(
        await alert.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
    }
    await expectAccessible(page, testInfo);
  });
});

test.describe('Phosphor asset inspection', () => {
  test.use({ javaScriptEnabled: true });
  test('shared Phosphor severity masks preserve real surface contrast and alignment', async ({
    page,
  }) => {
    await page.goto('/site-alert/');
    for (const [state, icon, color] of [
      ['informational', 'info', 'rgb(27, 27, 27)'],
      ['emergency', 'x-circle', 'rgb(255, 255, 255)'],
    ] as const) {
      await expectPhosphorMask(
        page.locator(
          `[data-cods-fixture-state="${state}"] .cods-site-alert__body`,
        ),
        icon!,
        { size: 32, inset: 32, top: 18, color },
      );
    }
    await page.emulateMedia({ forcedColors: 'active' });
    for (const [state, icon] of [
      ['informational', 'info'],
      ['emergency', 'x-circle'],
    ]) {
      await expectPhosphorMask(
        page.locator(
          `[data-cods-fixture-state="${state}"] .cods-site-alert__body`,
        ),
        icon!,
        { size: 32, inset: 32, top: 18 },
      );
    }
  });
});
