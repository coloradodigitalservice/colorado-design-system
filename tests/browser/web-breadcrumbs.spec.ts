import { routeBuiltFiles } from './built-files.js';
import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const preview = (name: string) => `[data-cods-docs-preview-state="${name}"]`;

test('decorative separators load the shared Phosphor caret at the original size', async ({
  page,
}) => {
  await page.goto('/breadcrumbs/');
  const separator = page.locator('.cods-breadcrumbs__item').first();
  const rendered = await separator.evaluate((element) => {
    const style = getComputedStyle(element, '::after');
    return {
      mask: style.maskImage,
      size: style.maskSize,
      width: style.width,
      height: style.height,
      content: style.content,
      color: style.backgroundColor,
    };
  });
  expect(rendered).toMatchObject({
    width: '16px',
    size: 'contain',
    content: '""',
    color: 'rgb(27, 27, 27)',
  });
  const url = rendered.mask.match(/url\(["']?(.*?)["']?\)/)?.[1];
  expect(url).toBeTruthy();
  const expected = readFileSync(
    'packages/colorado-design-system/dist/icons/caret-right.svg',
    'utf8',
  );
  const matches = await page.evaluate(
    async ({ url, expected }) => {
      const response = await fetch(url!);
      if (!response.ok) throw new Error('Separator asset failed to load');
      const identity = (svg: string) => {
        const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
        return {
          viewBox: document.documentElement.getAttribute('viewBox'),
          paths: [...document.querySelectorAll('path')].map((path) =>
            path.getAttribute('d'),
          ),
        };
      };
      return (
        JSON.stringify(identity(await response.text())) ===
        JSON.stringify(identity(expected))
      );
    },
    { url, expected },
  );
  expect(matches).toBe(true);
});

test('breadcrumbs page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.goto('/breadcrumbs/');
  const main = page.locator('main');
  expect(await main.locator('h2').allTextContents()).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  const subheadings = await main.locator('h3').allTextContents();
  for (const heading of [
    'When to use',
    'Accessibility for breadcrumbs',
    'Variants and elements',
    'Narrow screens and long trails',
    'Variable settings',
  ])
    expect(subheadings).toContain(heading);
  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(3);
  // Every previewed trail is a named list ending in an unlinked current page.
  const trails = page.locator('[data-cods-docs-preview] .cods-breadcrumbs');
  await expect(trails).toHaveCount(3);
  for (const trail of await trails.all()) {
    await expect(trail).toHaveAccessibleName(/.+/);
    await expect(trail.locator('ol')).toHaveCount(1);
    const current = trail.locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current.locator('a')).toHaveCount(0);
    await expect(trail.locator('li').last()).toHaveAttribute(
      'aria-current',
      'page',
    );
  }
  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('experimental');
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 Breadcrumbs' }),
  ).toBeVisible();
  await expect(main).not.toContainText(/right-to-left|localization/i);
  await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(0);
  await expectAccessible(page, testInfo);
});

test('mobile shows the immediate parent with a localized name and mirrored caret', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/breadcrumbs/');
  const trail = page.locator(`${preview('default')} .cods-breadcrumbs`);
  const parent = trail.getByRole('link');
  await expect(parent).toHaveCount(1);
  await expect(parent).toHaveAccessibleName('Previous level: Services');
  await expect(parent).toHaveAttribute(
    'href',
    'https://www.colorado.gov/services/',
  );
  await expect(trail.locator('[aria-current="page"]')).toBeHidden();
  await parent.focus();
  await expect(parent).toBeFocused();
  await page.emulateMedia({ forcedColors: 'active' });
  const mobileCaret = await trail
    .locator('li:nth-last-child(2)')
    .evaluate((el) => {
      const style = getComputedStyle(el, '::before');
      return {
        mask: style.maskImage,
        separator: getComputedStyle(el, '::after').maskImage,
        color: style.backgroundColor,
      };
    });
  expect(mobileCaret.mask).not.toBe('none');
  expect(mobileCaret.mask).toBe(mobileCaret.separator);
  expect(mobileCaret.color).not.toBe('rgba(0, 0, 0, 0)');
  await page.emulateMedia({ forcedColors: 'none' });
  // Right-to-left mirroring and single-level trails: storybook-breadcrumbs.
  expect(
    await trail
      .locator('li:nth-last-child(2)')
      .evaluate((el) => getComputedStyle(el, '::before').transform),
  ).toBe('matrix(-1, 0, 0, 1, 0, 0)');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const long = page.getByRole('navigation', { name: 'Long trail' });
  await expect(long.getByRole('link')).toHaveCount(1);
  await expect(long.getByRole('link')).toHaveAccessibleName(
    'Previous level: DocumentationForAnUnusuallyLongUnbrokenServiceName',
  );
  await expect(long.locator('[aria-current="page"]')).toBeHidden();
  expect(await long.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(trail.getByRole('link')).toHaveCount(2);
  await expect(trail.getByRole('link').last()).toHaveAccessibleName('Services');
  await expect(trail.locator('[aria-current="page"]')).toBeVisible();
});

test('hover changes the light link and removes underlines on both surfaces', async ({
  page,
}) => {
  await page.goto('/breadcrumbs/');
  for (const state of ['default', 'inverse']) {
    const link = page.locator(`${preview(state)} a`).first();
    await link.hover();
    await expect(link).toHaveCSS('text-decoration-line', 'none');
    await expect(link).toHaveCSS(
      'color',
      state === 'inverse' ? 'rgb(255, 255, 255)' : 'rgb(37, 81, 163)',
    );
  }
});

test('keyboard order, focus tokens, and link activation work without a controller', async ({
  page,
  browserName,
}) => {
  await page.goto('/breadcrumbs/');
  const links = page.locator('.cods-breadcrumbs').first().getByRole('link');
  const next =
    process.platform === 'darwin' && browserName === 'webkit'
      ? 'Alt+Tab'
      : 'Tab';
  const previous =
    process.platform === 'darwin' && browserName === 'webkit'
      ? 'Alt+Shift+Tab'
      : 'Shift+Tab';
  await links.first().focus();
  await page.keyboard.press(next);
  await expect(links.nth(1)).toBeFocused();
  await page.keyboard.press(previous);
  await expect(links.first()).toBeFocused();
  expect(
    await links.first().evaluate((el) => {
      const s = getComputedStyle(el);
      const token = getComputedStyle(document.documentElement)
        .getPropertyValue('--cods-focus-ring-offset')
        .trim();
      return s.outlineStyle === 'solid' && s.outlineWidth === token;
    }),
  ).toBe(true);
  await page.keyboard.press(next);
  await page.keyboard.press(next);
  await expect(links.nth(1)).not.toBeFocused();
  await page.route('https://www.colorado.gov/', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<h1>Ancestor destination</h1>',
    }),
  );
  await links.first().focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('https://www.colorado.gov/');
});

test('forced colors keep focus and decorative separators visible without motion', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/breadcrumbs/');
  const link = page.locator('.cods-breadcrumbs__link').first();
  await link.focus();
  expect(
    await link.evaluate((el) => {
      const s = getComputedStyle(el);
      return (
        s.outlineStyle === 'solid' &&
        parseFloat(s.outlineWidth) > 0 &&
        s.animationName === 'none'
      );
    }),
  ).toBe(true);
  expect(
    await page
      .locator('.cods-breadcrumbs__item')
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el, '::after');
        return (
          s.content === '""' &&
          s.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          s.maskImage !== 'none'
        );
      }),
  ).toBe(true);
});

test('all ancestors and current text remain available without CSS and JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  if (process.env.CODS_BUILT_FILES === '1') await routeBuiltFiles(page, 'web');
  try {
    await page.route('**/*.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: '' }),
    );
    await page.goto('http://127.0.0.1:4321/breadcrumbs/');
    for (const item of await page.locator('.cods-breadcrumbs__item').all())
      await expect(item).toBeVisible();
    await expect(
      page.locator('.cods-breadcrumbs [aria-current="page"]'),
    ).toHaveCount(3);
  } finally {
    await context.close();
  }
});

test('light and dark trails retain readable keyboard focus and inherited line height', async ({
  page,
}, testInfo) => {
  await page.goto('/breadcrumbs/');
  const light = page.locator(`${preview('default')} .cods-breadcrumbs`);
  const dark = page.locator(`${preview('inverse')} .cods-breadcrumbs`);
  expect(await light.evaluate((el) => getComputedStyle(el).lineHeight)).toBe(
    await light.evaluate(
      (el) => getComputedStyle(el.parentElement!).lineHeight,
    ),
  );
  await expect(light.locator('a').first()).toHaveCSS(
    'text-decoration-thickness',
    '1px',
  );
  await page.keyboard.press('Tab');
  await light.locator('a').first().focus();
  await expect(light.locator('a').first()).toHaveCSS(
    'color',
    'rgb(23, 59, 179)',
  );
  await expectAccessible(page, testInfo);
  await dark.locator('a').first().focus();
  await expect(dark.locator('a').first()).toHaveCSS(
    'color',
    'rgb(255, 255, 255)',
  );
  await expect(dark).toHaveCSS('background-color', 'rgb(0, 25, 112)');
  await expectAccessible(page, testInfo);
});
