import { routeBuiltFiles } from './built-files.js';
import { AxeBuilder } from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const story =
  '/iframe.html?id=components-site-alert--all-states&viewMode=story&globals=a11y.manual:!true';
const fixture = readFileSync(
  'packages/colorado-design-system/src/components/site-alert/site-alert.fixture.html',
  'utf8',
);

test('package and Storybook preserve the canonical fixture and token styles', async ({
  page,
}, testInfo) => {
  expect(
    readFileSync(
      'packages/colorado-design-system/dist/fixtures/site-alert.html',
      'utf8',
    ),
  ).toBe(fixture);
  await page.goto(story);
  const root = page.locator('#storybook-root');
  await expect(root.locator('.cods-site-alert')).toHaveCount(9);
  const equivalent = await root.evaluate((element, html) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    const normalize = (node: ParentNode) => {
      node = node.cloneNode(true) as ParentNode;
      node
        .querySelectorAll('[data-cods-site-alert-dismiss]')
        .forEach((button) => button.removeAttribute('hidden'));
      return [...node.querySelectorAll('.cods-site-alert')].map(
        (alert) => alert.outerHTML,
      );
    };
    return (
      JSON.stringify(normalize(element)) ===
      JSON.stringify(normalize(template.content))
    );
  }, fixture);
  expect(equivalent).toBe(true);
  const defaultSurface = root.locator('.cods-site-alert__surface').first();
  await expect(defaultSurface).toHaveCSS(
    'background-color',
    'rgb(217, 232, 246)',
  );
  await expect(defaultSurface).toHaveCSS(
    'border-top-color',
    'rgb(37, 81, 163)',
  );
  await expect(
    root
      .locator('.cods-site-alert--emergency .cods-site-alert__surface')
      .first(),
  ).toHaveCSS('border-top-color', 'rgb(181, 9, 9)');
  await expect(root.locator('.cods-site-alert__body').first()).toHaveCSS(
    'background-color',
    'rgb(217, 232, 246)',
  );
  await expect(
    root.locator('.cods-site-alert--emergency .cods-site-alert__body').first(),
  ).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('keyboard links have visible focus without moving focus to the notice', async ({
  page,
  browserName,
}) => {
  await page.goto(story);
  await expect(page.locator('.cods-site-alert').first()).toBeVisible();
  await page.keyboard.press(
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab',
  );
  const link = page.locator('.cods-site-alert__link').first();
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS('outline-style', 'solid');
  await expect(link).toHaveCSS('outline-width', '4px');
  await page.keyboard.press('Tab');
  await expect(page.locator('.cods-site-alert__link').nth(1)).toBeFocused();
});

test('320px reflow, localization, reduced motion, and forced colors', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto(story);
  await expect(page.locator('.cods-site-alert')).toHaveCount(9);
  for (const alert of await page.locator('.cods-site-alert').all()) {
    await expect(alert).toBeVisible();
    expect(
      await alert.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
  }
  await expect(page.locator('[dir=rtl] .cods-site-alert__surface')).toHaveCSS(
    'border-top-width',
    '4px',
  );
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('public customization wins without selector escalation', async ({
  page,
}) => {
  await page.goto(story);
  await expect(page.locator('.cods-site-alert').first()).toBeVisible();
  await page
    .locator('.cods-site-alert')
    .first()
    .evaluate((element) => {
      (element as HTMLElement).style.setProperty(
        '--cods-site-alert-padding',
        '48px',
      );
    });
  await expect(page.locator('.cods-site-alert__body').first()).toHaveCSS(
    'padding-right',
    '48px',
  );
});

test('layered USWDS preserves the existing Colorado button theme', async ({
  page,
}) => {
  await page.goto(story);
  await expect(page.locator('.cods-site-alert').first()).toBeVisible();
  await page.locator('#storybook-root').evaluate((element) => {
    const button = document.createElement('button');
    button.className = 'usa-button';
    button.textContent = 'Theme regression';
    element.append(button);
  });
  const button = page.getByRole('button', { name: 'Theme regression' });
  await expect(button).toHaveCSS('background-color', 'rgb(0, 25, 112)');
  await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  await button.hover();
  await expect(button).toHaveCSS('background-color', 'rgb(0, 16, 73)');
});

test('all fixture landmarks have distinct accessible names', async ({
  page,
}, testInfo) => {
  await page.goto(story);
  await expect(page.locator('.cods-site-alert')).toHaveCount(9);
  // This best-practice rule is not covered by the shared WCAG tag filter.
  const results = await new AxeBuilder({ page })
    .include('#storybook-root')
    .withRules(['landmark-unique'])
    .analyze();
  await testInfo.attach('landmark-unique-results', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });
  expect(results.violations).toEqual([]);
});

test('translated sections leave English fixture labels in the page language', async ({
  page,
}) => {
  await page.goto(story);
  for (const [state, language] of [
    ['localization', 'es'],
    ['rtl', 'ar'],
  ] as const) {
    const block = page.locator(`[data-cods-site-alert-fixture="${state}"]`);
    await expect(block.locator('section')).toHaveAttribute('lang', language);
    expect(
      await block
        .locator('h2')
        .evaluate((element) => element.closest('[lang]')?.getAttribute('lang')),
    ).toBe('en');
  }
});

for (const [id, state] of [
  ['informational', 'informational'],
  ['emergency', 'emergency'],
  ['long-content', 'long-content'],
  ['spanish', 'localization'],
  ['arabic-rtl', 'rtl'],
  ['focus-visible', 'focus-visible'],
  ['informational-dismissible', 'informational-dismissible'],
  ['emergency-dismissible', 'emergency-dismissible'],
] as const) {
  test(`isolated story reuses canonical state: ${state}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=components-site-alert--${id}&viewMode=story&globals=a11y.manual:!true`,
    );
    await expect(page.locator('.cods-site-alert')).toHaveCount(1);
    await expect(
      page.locator(`[data-cods-site-alert-fixture="${state}"]`),
    ).toBeVisible();
    const equivalent = await page.locator('.cods-site-alert').evaluate(
      (element, { html, state }) => {
        const template = document.createElement('template');
        template.innerHTML = html;
        element = element.cloneNode(true) as typeof element;
        element
          .querySelectorAll('[data-cods-site-alert-dismiss]')
          .forEach((button) => button.removeAttribute('hidden'));
        template.content
          .querySelectorAll('[data-cods-site-alert-dismiss]')
          .forEach((button) => button.removeAttribute('hidden'));
        return (
          element.outerHTML ===
          template.content.querySelector(
            `[data-cods-site-alert-fixture="${state}"] .cods-site-alert`,
          )?.outerHTML
        );
      },
      { html: fixture, state },
    );
    expect(equivalent).toBe(true);
  });
}

test.beforeEach(async ({ page }) => {
  await routeBuiltFiles(page, 'storybook');
});

test('severity icons load from the shipped package and banner fills its container', async ({
  page,
}) => {
  await page.goto(story);
  for (const [state, icon, background] of [
    ['informational', 'info.svg', 'rgb(217, 232, 246)'],
    ['emergency', 'error.svg', 'rgb(181, 9, 9)'],
  ] as const) {
    const alert = page.locator(
      `[data-cods-fixture-state="${state}"] .cods-site-alert`,
    );
    await expect(alert.locator('.cods-site-alert__surface')).toHaveCSS(
      'background-color',
      background,
    );
    const style = await alert
      .locator('.cods-site-alert__body')
      .evaluate((element) => {
        const pseudo = getComputedStyle(element, '::before');
        return {
          mask: pseudo.maskImage,
          width: pseudo.width,
          height: pseudo.height,
        };
      });
    expect(style.mask).toContain('data:image/svg+xml');
    expect(style.width).toBe('32px');
    expect(style.height).toBe('32px');
    const url = style.mask.match(/url\("([^"]+)"\)/)?.[1];
    expect(url).toBeTruthy();
    const asset = await page.evaluate(async (url) => {
      const response = await fetch(url!);
      return { ok: response.ok, text: await response.text() };
    }, url);
    expect(asset.ok).toBe(true);
    expect(asset.text).toContain('<svg');
    const expectedSvg = readFileSync(
      `packages/colorado-design-system/dist/img/usa-icons/${icon}`,
      'utf8',
    );
    expect(
      await page.evaluate(
        ({ actual, expected }) => {
          const paths = (svg: string) =>
            [
              ...new DOMParser()
                .parseFromString(svg, 'image/svg+xml')
                .querySelectorAll('path'),
            ].map((path) => path.getAttribute('d'));
          return (
            JSON.stringify(paths(actual)) === JSON.stringify(paths(expected))
          );
        },
        { actual: asset.text, expected: expectedSvg },
      ),
    ).toBe(true);
    expect(
      await alert.evaluate(
        (el) => el.clientWidth === el.parentElement!.clientWidth,
      ),
    ).toBe(true);
  }
});

for (const state of ['informational', 'emergency']) {
  test(`${state} optional dismissal handles keyboard, focus, event, and reload`, async ({
    page,
  }, testInfo) => {
    await page.goto(
      `/iframe.html?id=components-site-alert--${state}-dismissible&viewMode=story&globals=a11y.manual:!true`,
    );
    const root = page.locator('.cods-site-alert');
    const button = root.getByRole('button');
    await expect(button).toBeVisible();
    await expectAccessible(page, testInfo, '#storybook-root');
    await page.evaluate(() => {
      document.addEventListener(
        'cods-site-alert:dismiss',
        (event) => {
          document.body.dataset.dismissTarget = (
            event as CustomEvent
          ).detail.focusTargetId;
        },
        { once: true },
      );
    });
    await page.keyboard.press('Tab');
    await expect(root.getByRole('link')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS('outline-width', '4px');
    await page.keyboard.press('Enter');
    await expect(root).toBeHidden();
    const target = `site-alert-${state}-dismissible-destination`;
    await expect(page.locator(`#${target}`)).toBeFocused();
    await expect(page.locator('body')).toHaveAttribute(
      'data-dismiss-target',
      target,
    );
    await page.reload();
    await expect(root).toBeVisible();
    await expect(button).toBeVisible();
    await button.click();
    await expect(root).toBeHidden();
  });
}

test('page placement keeps the skip link first and bypasses notice and header', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-site-alert--page-placement&viewMode=story&globals=a11y.manual:!true',
  );
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeVisible();
  expect(
    await page
      .locator('#storybook-root')
      .evaluate((el) => [...el.children].map((child) => child.tagName)),
  ).toEqual(['A', 'SECTION', 'HEADER', 'MAIN']);
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.locator('.cods-site-alert')).toBeVisible();
  await expectAccessible(page, testInfo, '#storybook-root');
});
