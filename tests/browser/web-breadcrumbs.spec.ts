import { routeBuiltFiles } from './built-files.js';
import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

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
    height: '16px',
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

test('ordered ancestors end with an unlinked current page and copyable canonical markup', async ({
  page,
}, testInfo) => {
  await page.goto('/breadcrumbs/');
  const trails = page.locator('.cods-breadcrumbs');
  await expect(trails).toHaveCount(6);
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
  const single = page.locator(
    '[data-cods-fixture-state="single-level"] .cods-breadcrumbs',
  );
  await expect(single.getByRole('link')).toHaveCount(0);
  expect(
    await single
      .locator('li')
      .evaluate((el) => getComputedStyle(el, '::after').content),
  ).toBe('none');
  await page.getByText('View default HTML', { exact: true }).click();
  const source = page.getByRole('region', { name: 'Default Breadcrumbs HTML' });
  expect(
    await source.evaluate((el) => {
      const template = document.createElement('template');
      template.innerHTML = el.textContent ?? '';
      return (
        template.content.querySelector('.cods-breadcrumbs')?.outerHTML ===
        document.querySelector('.cods-breadcrumbs')?.outerHTML
      );
    }),
  ).toBe(true);
  await expectAccessible(page, testInfo);
});

test('all links and long labels reflow at 320px including RTL', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/breadcrumbs/');
  for (const item of await page.locator('.cods-breadcrumbs__item').all()) {
    await expect(item).toBeVisible();
    expect(
      await item.evaluate((el) => {
        const box = el.getBoundingClientRect();
        return (
          box.left >= 0 &&
          box.right <= innerWidth &&
          el.scrollWidth <= el.clientWidth + 1
        );
      }),
    ).toBe(true);
  }
  const rtl = page.locator('[data-cods-fixture-state="rtl"]');
  await expect(rtl).toHaveAttribute('dir', 'rtl');
  expect(
    await rtl
      .locator('li')
      .first()
      .evaluate((el) => getComputedStyle(el, '::after').transform),
  ).toBe('matrix(-1, 0, 0, 1, 0, 0)');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
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
        .getPropertyValue('--cods-focus-ring-width')
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
    ).toHaveCount(6);
  } finally {
    await context.close();
  }
});
