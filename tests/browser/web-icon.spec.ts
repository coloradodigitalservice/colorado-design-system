import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const { icons } = JSON.parse(
  readFileSync(
    'packages/colorado-design-system/generated/icons/catalog.json',
    'utf8',
  ),
) as { icons: { id: string; phosphorCategories: string[] }[] };
const categories = [
  ...new Set(icons.flatMap((icon) => icon.phosphorCategories)),
];

test('icon catalog contains the approved set and reflows without horizontal overflow', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/icon/');
  const displayedIconCount = icons.reduce(
    (count, icon) => count + icon.phosphorCategories.length,
    0,
  );
  await expect(page.locator('.cods-icon-catalog > li')).toHaveCount(
    displayedIconCount,
  );
  const sizeTable = page.locator('table');
  await expect(sizeTable.getByText('16 × 16', { exact: true })).toBeVisible();
  await expect(sizeTable.getByText('24 × 24', { exact: true })).toBeVisible();
  await expect(
    page.locator('.cods-icon-catalog svg[aria-hidden="true"]'),
  ).toHaveCount(displayedIconCount);
  const dimensions = await page
    .locator('.cods-icon-catalog svg[aria-hidden="true"]')
    .evaluateAll((catalogIcons) =>
      catalogIcons.map((icon) => [
        icon.getAttribute('width'),
        icon.getAttribute('height'),
      ]),
    );
  expect(dimensions).toHaveLength(displayedIconCount);
  expect(
    dimensions.every(([width, height]) => width === '24' && height === '24'),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo, 'main');
});

test('catalog groups icons by Phosphor taxonomy only', async ({ page }) => {
  await page.goto('/icon/');
  const headings = page.locator('.cods-icon-catalog-group > h3');
  await expect(headings).toHaveCount(categories.length);
  const expected = Object.fromEntries(
    categories.map((category) => [
      category,
      icons
        .filter((icon) => icon.phosphorCategories.includes(category))
        .map(({ id }) => id),
    ]),
  );
  for (const [category, ids] of Object.entries(expected)) {
    const label = category.charAt(0).toUpperCase() + category.slice(1);
    const group = page.locator('.cods-icon-catalog-group', {
      has: page.getByRole('heading', {
        name: `Phosphor category: ${label} (${ids.length})`,
        level: 3,
      }),
    });
    const actualIds = await group
      .locator('li > code:first-of-type')
      .allTextContents();
    expect([...actualIds].sort()).toEqual([...ids].sort());
  }
  const catalog = JSON.parse(
    readFileSync(
      'packages/colorado-design-system/generated/icons/catalog.json',
      'utf8',
    ),
  );
  expect(catalog.categoryMetadata.phosphorCategories).toBe('Phosphor taxonomy');
  for (const icon of catalog.icons)
    expect(icon).not.toHaveProperty('phosphorFigmaCategory');
});

test('icon sprite is served locally and the catalog examples are copyable', async ({
  page,
}) => {
  await page.goto('/icon/');
  const first = page.locator('.cods-icon-catalog li').first();
  const id = (await first.locator('code').first().textContent())!;
  const spriteUrl = await first.locator('use').getAttribute('href');
  expect(spriteUrl).toContain(`#${id}`);
  const response = await page.request.get(new URL(spriteUrl!, page.url()).href);
  expect(response.ok()).toBe(true);
  const symbol = await page.evaluate(
    ({ markup, iconId }) => {
      const document = new DOMParser().parseFromString(markup, 'image/svg+xml');
      const element = document.getElementById(iconId);
      return element && document.documentElement.localName === 'svg'
        ? {
            isSymbol: element.localName === 'symbol',
            viewBox: element.getAttribute('viewBox'),
            hasArtwork: element.children.length > 0,
          }
        : undefined;
    },
    { markup: await response.text(), iconId: id },
  );
  expect(symbol).toBeDefined();
  expect(symbol?.isSymbol).toBe(true);
  expect(symbol?.viewBox).toBeTruthy();
  expect(symbol?.hasArtwork).toBe(true);
  const codeSample = first.locator('.cods-icon-catalog__usage code');
  const usageBlock = first.locator('.cods-icon-catalog__usage');
  await expect(usageBlock).toBeVisible();
  await expect(usageBlock).toHaveCSS('user-select', 'text');
  const example = await codeSample.evaluate((code) => {
    const document = new DOMParser().parseFromString(
      code.textContent ?? '',
      'image/svg+xml',
    );
    const svg = document.documentElement;
    const use = svg.querySelector('use');
    return {
      valid: svg.localName === 'svg' && !document.querySelector('parsererror'),
      classes: [...svg.classList],
      hidden: svg.getAttribute('aria-hidden'),
      focusable: svg.getAttribute('focusable'),
      width: svg.getAttribute('width'),
      height: svg.getAttribute('height'),
      viewBox: svg.getAttribute('viewBox'),
      href: use?.getAttribute('href'),
      hasClosingSvg: code.textContent?.includes('</svg>'),
    };
  });
  expect(example.valid).toBe(true);
  expect(example.classes).toEqual(
    expect.arrayContaining(['cods-icon', 'cods-icon--medium']),
  );
  expect(example.hidden).toBe('true');
  expect(example.focusable).toBe('false');
  expect(example.width).toBe('24');
  expect(example.height).toBe('24');
  expect(example.viewBox).toBe('0 0 256 256');
  expect(example.href).toContain(`#${id}`);
  expect(example.hasClosingSvg).toBe(true);
});

test('catalog remains available in RTL, reduced-motion, and forced-colors modes', async ({
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
  const icons = await page
    .locator('.cods-icon-catalog svg')
    .evaluateAll((svgs) => {
      const rgb = (value: string) => {
        const values = value.match(/[\d.]+/g)?.map(Number);
        if (!values || values.length < 3) return;
        return {
          channels: values.slice(0, 3),
          alpha: values.length > 3 ? values[3]! : 1,
        };
      };
      const luminance = (channels: number[]) => {
        const [r, g, b] = channels.map((channel) => {
          const value = channel / 255;
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
      };
      const colorContrast = (foreground: number[], background: number[]) => {
        const values = [luminance(foreground), luminance(background)].sort(
          (a, b) => b - a,
        );
        return (values[0]! + 0.05) / (values[1]! + 0.05);
      };

      return svgs.map((svg) => {
        if (!(svg instanceof SVGSVGElement))
          throw new Error('Catalog icon is not an SVG element');
        let ancestor: Element | null = svg;
        let background: ReturnType<typeof rgb>;
        while (ancestor && (!background || background.alpha < 1)) {
          background = rgb(getComputedStyle(ancestor).backgroundColor);
          ancestor = ancestor.parentElement;
        }
        const style = getComputedStyle(svg);
        const foreground = rgb(style.color);
        const fill = rgb(style.fill);
        const box = svg.getBBox();
        return {
          width: box.width,
          height: box.height,
          hasSpriteReference: Boolean(
            svg.querySelector('use')?.getAttribute('href'),
          ),
          fillMatchesColor:
            foreground?.alpha === 1 &&
            fill?.alpha === 1 &&
            foreground.channels.join(',') === fill.channels.join(','),
          contrast:
            foreground && background
              ? colorContrast(foreground.channels, background.channels)
              : 0,
        };
      });
    });
  expect(icons.length).toBeGreaterThan(0);
  for (const icon of icons) {
    expect(icon.width).toBeGreaterThan(0);
    expect(icon.height).toBeGreaterThan(0);
    expect(icon.hasSpriteReference).toBe(true);
    expect(icon.fillMatchesColor).toBe(true);
    expect(icon.contrast).toBeGreaterThanOrEqual(3);
  }
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
