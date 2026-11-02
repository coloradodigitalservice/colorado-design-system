import { test, expect, expectAccessible } from './fixtures.js';

test('Hero examples expose accessible content and reflow on mobile', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/hero/');
  const examples = page.locator('.cods-hero');
  await expect(examples).toHaveCount(5);
  const image = examples.locator('.cods-hero__image');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute(
    'alt',
    'Downtown Denver skyline above tree-lined streets',
  );
  expect(
    await image.evaluate((element: HTMLImageElement) => element.naturalWidth),
  ).toBeGreaterThan(0);
  for (const example of await examples.all()) {
    expect(
      await example.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    expect(
      await example.locator('.cods-hero__action').count(),
    ).toBeLessThanOrEqual(1);
  }
  await expect(
    page.locator('[data-cods-fixture-state="without-cta"] .cods-hero__action'),
  ).toHaveCount(0);
  await expectAccessible(page, testInfo, 'article');
});

test('Hero changes layout and breadcrumb presentation at the design breakpoints', async ({
  page,
}) => {
  await page.goto('/hero/');
  const imageHero = page.locator(
    '[data-cods-fixture-state="with-image"] .cods-hero',
  );
  const image = imageHero.locator('.cods-hero__image');
  const banner = page.locator(
    '[data-cods-fixture-state="dark-banner"] .cods-hero',
  );
  const trail = banner.getByRole('navigation', { name: 'Breadcrumb' });
  for (const width of [767, 768, 1279, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await imageHero.evaluate((element: HTMLElement) => {
      element.style.width = '100vw';
      element.style.maxWidth = 'none';
    });
    await banner.evaluate((element: HTMLElement) => {
      element.style.width = '100vw';
      element.style.maxWidth = 'none';
    });
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
  const imageHero = page.locator(
    '[data-cods-fixture-state="with-image"] .cods-hero',
  );
  const banner = page.locator(
    '[data-cods-fixture-state="dark-banner"] .cods-hero',
  );
  for (const width of [1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const hero of [imageHero, banner])
      await hero.evaluate((el: HTMLElement) => {
        el.style.width = '100vw';
        el.style.maxWidth = 'none';
      });
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
  const dark = page.locator(
    '[data-cods-fixture-state="dark-banner"] .cods-hero__action',
  );
  const light = page.locator(
    '[data-cods-fixture-state="default"] .cods-hero__action',
  );
  await expect(dark).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(dark).toHaveCSS('color', 'rgb(0, 25, 112)');
  await expect(light).toHaveCSS('background-color', 'rgb(0, 25, 112)');
  await expect(light).toHaveCSS('color', 'rgb(255, 255, 255)');
  await dark.hover();
  await expect(dark).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await dark.focus();
  await expect(dark).toBeFocused();
});
