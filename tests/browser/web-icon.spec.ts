import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const fixture = '[data-cods-icon-fixture="default"]';
const index = JSON.parse(
  readFileSync(
    'packages/colorado-design-system/generated/icons/catalog.json',
    'utf8',
  ),
) as { icons: string[] };

test('icon guidance links to Phosphor without rendering a catalog', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/icon/');
  await expect(
    page.getByRole('link', { name: 'Phosphor Icons' }),
  ).toHaveAttribute('href', 'https://phosphoricons.com/');
  await expect(page.locator('.cods-icon-catalog')).toHaveCount(0);
  await expect(page.locator(`${fixture} svg`)).toHaveCount(3);
  await expect(page.getByText('16 × 16', { exact: true })).toBeVisible();
  await expect(page.getByText('24 × 24', { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo, 'main');
});

test('rendered icons share one locally served subset with their required IDs', async ({
  page,
}) => {
  const responses: string[] = [];
  page.on('response', (response) => {
    if (/\/cods-sprite[.-][^/]+\.svg$/.test(new URL(response.url()).pathname))
      responses.push(response.url());
  });
  await page.goto('/icon/');
  await expect.poll(() => responses.length).toBe(1);
  const hrefs = await page
    .locator(`${fixture} use`)
    .evaluateAll((uses) => uses.map((use) => use.getAttribute('href') ?? ''));
  const urls = hrefs.map((href) => new URL(href, page.url()));
  expect(new Set(urls.map((url) => `${url.origin}${url.pathname}`)).size).toBe(
    1,
  );
  expect(urls.every((url) => url.origin === new URL(page.url()).origin)).toBe(
    true,
  );
  const response = await page.request.get(responses[0]!);
  expect(response.ok()).toBe(true);
  const sprite = await response.text();
  const symbols = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(
    (match) => match[1],
  );
  expect(symbols.length).toBeLessThan(index.icons.length);
  expect(Buffer.byteLength(sprite)).toBeLessThan(16_384);
  expect(sprite).toContain('Copyright (c) 2023 Phosphor Icons');
  for (const url of urls) expect(symbols).toContain(url.hash.slice(1));
  await expect
    .poll(async () =>
      page.locator(`${fixture} svg`).evaluateAll((icons) =>
        icons.every((icon) => {
          const box = (icon as SVGSVGElement).getBBox();
          return box.width > 0 && box.height > 0;
        }),
      ),
    )
    .toBe(true);
  await expect(
    page.locator(fixture).getByRole('img', { name: 'Search' }),
  ).toHaveCount(1);
});

test('icons retain geometry, inherited color, and reflow in forced colors and RTL', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/icon/');
  expect(
    await page.evaluate(
      () =>
        matchMedia('(prefers-reduced-motion: reduce)').matches &&
        matchMedia('(forced-colors: active)').matches,
    ),
  ).toBe(true);
  await expect
    .poll(async () =>
      page.locator(`${fixture} svg`).evaluateAll((icons) => {
        const channels = (color: string) => {
          const values = color.match(/[\d.]+/g)?.map(Number);
          if (!values || values.length < 3) return;
          return {
            rgb: values.slice(0, 3),
            alpha: values.length > 3 ? values[3]! : 1,
          };
        };
        const luminance = (rgb: number[]) => {
          const linear = rgb.map((channel) => {
            const value = channel / 255;
            return value <= 0.04045
              ? value / 12.92
              : ((value + 0.055) / 1.055) ** 2.4;
          });
          return (
            0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!
          );
        };
        return icons.every((icon) => {
          const box = (icon as SVGSVGElement).getBBox();
          const style = getComputedStyle(icon);
          const foreground = channels(style.color);
          let ancestor: Element | null = icon;
          let background: ReturnType<typeof channels>;
          while (ancestor && (!background || background.alpha < 1)) {
            background = channels(getComputedStyle(ancestor).backgroundColor);
            ancestor = ancestor.parentElement;
          }
          if (
            !foreground ||
            foreground.alpha !== 1 ||
            !background ||
            background.alpha !== 1
          )
            return false;
          const values = [
            luminance(foreground.rgb),
            luminance(background.rgb),
          ].sort((a, b) => b - a);
          const contrast = (values[0]! + 0.05) / (values[1]! + 0.05);
          return (
            box.width > 0 &&
            box.height > 0 &&
            style.fill === style.color &&
            contrast >= 3
          );
        });
      }),
    )
    .toBe(true);
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
  });
  await expect(page.locator(`${fixture} .cods-icon--mirror-in-rtl`)).toHaveCSS(
    'transform',
    'matrix(-1, 0, 0, 1, 0, 0)',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
