import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const source = 'packages/colorado-design-system/src/assets/logos';
const dist = 'packages/colorado-design-system/dist/logos';

test('the Logos page serves the unmodified packaged artwork and notice', async ({
  page,
}, testInfo) => {
  for (const name of ['cods-logo.svg', 'NOTICE.md']) {
    expect(readFileSync(`${dist}/${name}`)).toEqual(
      readFileSync(`${source}/${name}`),
    );
  }

  await page.goto('/logos/');
  await expect(
    page.getByRole('heading', { name: 'Logos', level: 1 }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Logos' }),
  ).toHaveAttribute('aria-current', 'page');
  const image = page.getByRole('img', { name: 'Colorado Design System home' });
  const link = page.getByRole('link', { name: 'Colorado Design System home' });
  await expect(link).toHaveAttribute('href', '/');
  await expect(image).toBeVisible();
  expect(
    await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0);

  const url = await image.getAttribute('src');
  expect(url).toBeTruthy();
  const response = await page.request.get(new URL(url!, page.url()).href);
  expect(response.ok()).toBe(true);
  expect(await response.body()).toEqual(
    readFileSync(`${source}/cods-logo.svg`),
  );
  await expect(
    page.getByRole('link', { name: 'Download the SVG' }),
  ).toHaveAttribute('href', url!);
  const noticeUrl = await page
    .getByRole('link', { name: 'trademark notice' })
    .getAttribute('href');
  expect(noticeUrl).toBeTruthy();
  const notice = await page.request.get(new URL(noticeUrl!, page.url()).href);
  expect(notice.ok()).toBe(true);
  expect(await notice.body()).toEqual(readFileSync(`${source}/NOTICE.md`));
  await expectAccessible(page, testInfo, 'main');
});

test('the logo remains proportionate, named, and usable at narrow widths and in forced colors', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/logos/');
  const image = page.getByRole('img', { name: 'Colorado Design System home' });
  const dimensions = await image.evaluate(
    (img: HTMLImageElement, svg: string) => {
      const root = new DOMParser().parseFromString(
        svg,
        'image/svg+xml',
      ).documentElement;
      const viewBox = root.getAttribute('viewBox')!.split(/\s+/).map(Number);
      return {
        sourceRatio: viewBox[2]! / viewBox[3]!,
        displayedRatio:
          img.getBoundingClientRect().width /
          img.getBoundingClientRect().height,
        width: img.getBoundingClientRect().width,
      };
    },
    readFileSync(`${source}/cods-logo.svg`, 'utf8'),
  );
  expect(dimensions.width).toBeGreaterThan(0);
  expect(dimensions.displayedRatio).toBeCloseTo(dimensions.sourceRatio, 2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const link = page.getByRole('link', { name: 'Colorado Design System home' });
  await link.focus();
  await expect(link).toBeFocused();
  await expectAccessible(page, testInfo, 'main');
});
