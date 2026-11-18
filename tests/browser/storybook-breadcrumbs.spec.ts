// Fixture states the docs page preview does not show (single-level, Spanish,
// right-to-left, hover, focus, previous-level). Storybook runs in Chromium only;
// engine-sensitive checks for the previewed variants live in
// web-breadcrumbs.spec.ts, which runs in all three browsers.
import { test, expect, expectAccessible } from './fixtures.js';

const story = (id: string) =>
  `/iframe.html?id=components-breadcrumbs--${id}&viewMode=story&globals=a11y.manual:!true`;
const state = (name: string) =>
  `#storybook-root [data-cods-fixture-state="${name}"]`;

test('every fixture trail is a named list ending in an unlinked current page', async ({
  page,
}, testInfo) => {
  await page.goto(story('all-states'));
  const trails = page.locator('#storybook-root .cods-breadcrumbs');
  await expect(trails).toHaveCount(9);
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
  const single = page.locator(`${state('single-level')} .cods-breadcrumbs`);
  await expect(single.getByRole('link')).toHaveCount(0);
  expect(
    await single
      .locator('li')
      .evaluate((el) => getComputedStyle(el, '::after').content),
  ).toBe('none');
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('narrow widths preserve single-level and right-to-left trails', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(story('all-states'));

  await expect(
    page.locator(`${state('single-level')} [aria-current="page"]`),
  ).toBeVisible();

  const rtl = page.locator(state('rtl'));
  await expect(rtl.getByRole('link')).toHaveAccessibleName(/المستوى السابق/);
  expect(
    await rtl
      .locator('li:nth-last-child(2)')
      .evaluate((el) => getComputedStyle(el, '::before').transform),
  ).toBe('none');

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo, '#storybook-root');
});
