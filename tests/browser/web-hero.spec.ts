// Hero documentation page and the full-width preview. States the curated
// preview does not show (without a call to action, long right-to-left content)
// are covered in storybook-hero.spec.ts.
import type { Page } from '@playwright/test';
import { test, expect, expectAccessible } from './fixtures.js';

const hero = (page: Page, state: string) =>
  page.locator(`[data-cods-docs-preview-state="${state}"] .cods-hero`);

/** Let a documentation-column Hero span the viewport to reach its breakpoints. */
const fullWidth = (page: Page, ...states: string[]) =>
  Promise.all(
    states.map((state) =>
      hero(page, state).evaluate((element: HTMLElement) => {
        element.style.width = '100vw';
        element.style.maxWidth = 'none';
      }),
    ),
  );

test('hero page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/hero/');
  const main = page.locator('main');
  // The previewed Heroes use h2 titles; read only the page's own outline.
  expect(
    await main
      .locator('h2')
      .evaluateAll((headings) =>
        headings
          .filter((heading) => !heading.closest('.cods-hero'))
          .map((heading) => heading.textContent),
      ),
  ).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  const subheadings = await main.locator('h3').allTextContents();
  for (const heading of [
    'When to use',
    'Writing for Heroes',
    'Accessibility for Heroes',
    'Variants and elements',
    'Images',
    'Responsive behavior',
    'Limitations',
  ])
    expect(subheadings).toContain(heading);

  const states = ['with-image', 'dark-image', 'default', 'dark-banner'];
  expect(
    await page
      .locator('[data-cods-docs-preview-state]')
      .evaluateAll((figures) =>
        figures.map((figure) =>
          figure.getAttribute('data-cods-docs-preview-state'),
        ),
      ),
  ).toEqual(states);
  const image = hero(page, 'with-image').getByRole('img', {
    name: 'Downtown Denver skyline above tree-lined streets',
  });
  await expect(image).toBeVisible();
  expect(
    await image.evaluate((element: HTMLImageElement) => element.naturalWidth),
  ).toBeGreaterThan(0);
  for (const state of states)
    expect(
      await hero(page, state).evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('Manual accessibility review is pending');
  await expect(status).toContainText('CoDS-authored; USWDS has no equivalent');
  await expect(
    status.getByRole('link', { name: 'Accessibility evidence' }),
  ).toHaveAttribute('href', /\/hero\/accessibility\/hero\.evidence\.md$/);
  // The public page omits localization guidance and the examples catalogue.
  await expect(main).not.toContainText(/right-to-left|localization/i);
  await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(0);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo, 'article');
});

test('Hero changes layout and breadcrumb presentation at the design breakpoints', async ({
  page,
}) => {
  await page.goto('/hero/');
  const imageHero = hero(page, 'with-image');
  const image = imageHero.locator('.cods-hero__image');
  const banner = hero(page, 'dark-banner');
  const trail = banner.getByRole('navigation', { name: 'Breadcrumb' });
  for (const width of [767, 768, 1279, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await fullWidth(page, 'with-image', 'dark-banner');
    await expect(banner.locator('.cods-hero__intro')).toHaveCSS(
      'font-size',
      width < 768 ? '20px' : '22px',
    );
    await expect(banner.locator('.cods-hero__intro')).toHaveCSS(
      'line-height',
      width < 768 ? '28px' : '32px',
    );
    await expect(trail.getByRole('link', { name: 'Home' })).toBeVisible({
      visible: width >= 768,
    });
    await expect(
      trail.getByRole('link', {
        name: width < 768 ? 'Previous level: Services' : 'Services',
      }),
    ).toBeVisible();
    const imageBox = (await image.boundingBox())!;
    const contentBox = (await imageHero
      .locator('.cods-hero__content')
      .boundingBox())!;
    if (width < 1280)
      expect(imageBox.y + imageBox.height).toBeLessThanOrEqual(
        contentBox.y + 1,
      );
    else expect(imageBox.x).toBeGreaterThan(contentBox.x);
  }
});

test('desktop Heroes align to the centered grid and grow with content', async ({
  page,
}) => {
  await page.goto('/hero/');
  const imageHero = hero(page, 'with-image');
  const banner = hero(page, 'dark-banner');
  for (const width of [1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await fullWidth(page, 'with-image', 'dark-banner');
    const left = await imageHero
      .locator('.cods-hero__heading')
      .evaluate((el) => el.getBoundingClientRect().left);
    const bannerLeft = await banner
      .locator('.cods-hero__heading')
      .evaluate((el) => el.getBoundingClientRect().left);
    expect(left - (await imageHero.boundingBox())!.x).toBeCloseTo(
      (width - 1280) / 2 + 32,
      0,
    );
    expect(left).toBeCloseTo(bannerLeft, 0);
  }
  const initialHeight = (await imageHero.boundingBox())!.height;
  await imageHero.locator('.cods-hero__intro').evaluate((el) => {
    el.textContent = 'A longer introduction. '.repeat(100);
  });
  expect((await imageHero.boundingBox())!.height).toBeGreaterThan(
    initialHeight,
  );
  expect(
    await imageHero.evaluate((el) => el.scrollHeight <= el.clientHeight),
  ).toBe(true);
});

test('dark and light calls to action retain the intended button states', async ({
  page,
}) => {
  await page.goto('/hero/');
  const dark = hero(page, 'dark-banner').locator('.cods-hero__action');
  const light = hero(page, 'default').locator('.cods-hero__action');
  await expect(dark).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(dark).toHaveCSS('color', 'rgb(0, 25, 112)');
  await expect(light).toHaveCSS('background-color', 'rgb(0, 25, 112)');
  await expect(light).toHaveCSS('color', 'rgb(255, 255, 255)');
  await dark.hover();
  await expect(dark).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

test('image Hero remains readable in the documentation column on a wide screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1484, height: 1034 });
  await page.goto('/hero/');
  const imageHero = hero(page, 'with-image');
  const image = (await imageHero.locator('.cods-hero__image').boundingBox())!;
  const heading = (await imageHero
    .locator('.cods-hero__heading')
    .boundingBox())!;
  const content = (await imageHero
    .locator('.cods-hero__content')
    .boundingBox())!;
  expect((await imageHero.boundingBox())!.width).toBeLessThan(1280);
  expect(image.y + image.height).toBeLessThanOrEqual(content.y + 1);
  expect(heading.width).toBeGreaterThan(300);
  expect(heading.height).toBeLessThan(120);
});

test('a narrow Hero in a wide viewport uses the mobile design and retains a one-item breadcrumb', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1484, height: 1034 });
  await page.goto('/hero/');
  await page.locator('main').evaluate((element: HTMLElement) => {
    element.style.maxInlineSize = '40rem';
  });
  const banner = hero(page, 'dark-banner');
  expect((await banner.boundingBox())!.width).toBeLessThanOrEqual(640);
  const trail = banner.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(banner.locator('.cods-hero__heading')).toHaveCSS(
    'font-size',
    '36px',
  );
  await expect(banner.locator('.cods-hero__intro')).toHaveCSS(
    'font-size',
    '20px',
  );
  await expect(trail.getByRole('link', { name: 'Home' })).toBeHidden();
  await expect(
    trail.getByRole('link', { name: 'Previous level: Services' }),
  ).toBeVisible();
  await expect(hero(page, 'with-image').locator('.cods-hero__image')).toHaveCSS(
    'height',
    '145px',
  );
  await trail
    .locator('li:not([aria-current])')
    .evaluateAll((items) => items.forEach((item) => item.remove()));
  await expect(trail.getByText('Page title')).toBeVisible();
});

test('full-width Hero preview shows all four variants at desktop width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/hero-preview/');
  await expect(page.locator('.cods-hero')).toHaveCount(4);
  for (const name of ['default', 'with-image', 'dark-image', 'dark-banner']) {
    const hero = page.locator(`[data-cods-fixture-state="${name}"] .cods-hero`);
    expect((await hero.boundingBox())!.width).toBe(1440);
    if (name.includes('image')) {
      const image = (await hero.locator('.cods-hero__image').boundingBox())!;
      const content = (await hero
        .locator('.cods-hero__content')
        .boundingBox())!;
      expect(image.x).toBeGreaterThan(content.x);
      expect(image.y).toBe(content.y);
    }
  }
});
