import { test, expect, expectAccessible } from './fixtures.js';

test('Hero examples expose accessible content and reflow on mobile', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/hero/');
  const examples = page.locator('.cods-hero');
  await expect(examples).toHaveCount(6);
  const image = page.locator(
    '[data-cods-fixture-state="with-image"] .cods-hero__image',
  );
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

test('image Hero remains readable in the documentation column on a wide screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1484, height: 1034 });
  await page.goto('/hero/');
  const hero = page.locator(
    '[data-cods-fixture-state="with-image"] .cods-hero',
  );
  const image = (await hero.locator('.cods-hero__image').boundingBox())!;
  const heading = (await hero.locator('.cods-hero__heading').boundingBox())!;
  const content = (await hero.locator('.cods-hero__content').boundingBox())!;
  expect((await hero.boundingBox())!.width).toBeLessThan(1280);
  expect(image.y + image.height).toBeLessThanOrEqual(content.y + 1);
  expect(heading.width).toBeGreaterThan(300);
  expect(heading.height).toBeLessThan(120);
});

test('Hero documentation explains anatomy, variants, and limitations', async ({
  page,
}) => {
  await page.goto('/hero/');
  for (const heading of [
    'Summary',
    'Anatomy',
    'Choosing a Hero',
    'Responsive behavior',
    'Public styling',
    'Known limitations and implementation status',
    'Examples',
  ]) {
    await expect(
      page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible();
  }
  for (const name of [
    'Light banner',
    'Dark banner with breadcrumbs and eyebrow',
    'Light image Hero',
    'Dark image Hero',
  ]) {
    await expect(
      page.getByRole('heading', { name, exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByRole('region', { name: 'Summary' })).toContainText(
    'CoDS-authored',
  );
});

test('a narrow Hero in a wide viewport uses the mobile design and retains a one-item breadcrumb', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1484, height: 1034 });
  await page.goto('/hero/');
  const hero = page.locator(
    '[data-cods-fixture-state="dark-banner"] .cods-hero',
  );
  const trail = hero.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(hero.locator('.cods-hero__heading')).toHaveCSS(
    'font-size',
    '36px',
  );
  await expect(hero.locator('.cods-hero__intro')).toHaveCSS(
    'font-size',
    '20px',
  );
  await expect(trail.getByRole('link', { name: 'Home' })).toBeHidden();
  await expect(
    trail.getByRole('link', { name: 'Previous level: Services' }),
  ).toBeVisible();
  const image = page.locator(
    '[data-cods-fixture-state="with-image"] .cods-hero__image',
  );
  await expect(image).toHaveCSS('height', '145px');
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
