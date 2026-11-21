// Process List fixture states that the documentation page's curated preview
// does not show. These run in Chromium only; the previewed states (default,
// long-content, with-alert) are covered in all three engines by
// web-process-list.spec.ts.
import { test, expect, expectAccessible } from './fixtures.js';

const story =
  '/iframe.html?id=components-process-list--all-states&viewMode=story';
const state = (name: string) =>
  `#storybook-root [data-cods-fixture-state="${name}"]`;
const unpreviewedCounts = [
  ['three-steps', 3],
  ['four-steps', 4],
  ['five-steps', 5],
  ['rtl', 2],
] as const;

test('Process List stories render their canonical examples', async ({
  page,
}, testInfo) => {
  await page.goto(story);
  await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(7);
  await expect(page.locator(`${state('long-content')} ol > li`)).toHaveCount(6);
  await expect(
    page.locator(`${state('with-alert')} .cods-in-page-alert`),
  ).toHaveCount(1);
  await page.waitForLoadState('networkidle');
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('unpreviewed states preserve step order, numbering, and right-to-left spacing', async ({
  page,
}) => {
  await page.goto(story);
  for (const [name, count] of unpreviewedCounts) {
    const list = page.locator(`${state(name)} ol`);
    await expect(list).toHaveAttribute('role', 'list');
    const items = list.locator(':scope > li');
    await expect(items).toHaveCount(count);
    for (const [index, number] of ['one', 'two', 'three', 'four', 'five']
      .slice(0, count)
      .entries()) {
      const item = items.nth(index);
      const icon = item.locator(':scope > svg.cods-process-list__number');
      await expect(item.locator('h3')).toHaveCount(1);
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
      await expect(icon).toHaveAttribute('focusable', 'false');
      await expect(icon).toHaveAttribute('display', 'none');
      await expect(icon.locator('use')).toHaveAttribute(
        'href',
        new RegExp(`#number-circle-${number}$`),
      );
    }
  }
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const geometry = await page
    .locator(`${state('rtl')} li`)
    .first()
    .evaluate((element) => {
      const icon = element.querySelector('svg')!.getBoundingClientRect();
      const content = element
        .querySelector('.cods-process-list__content')!
        .getBoundingClientRect();
      return {
        direction: getComputedStyle(element).direction,
        size: icon.width,
        gap: icon.left - content.right,
      };
    });
  expect(geometry.direction).toBe('rtl');
  expect(geometry.size).toBe(32);
  expect(geometry.gap).toBeCloseTo(8, 1);
});

test('unpreviewed states fall back to aligned native numbering without styles', async ({
  page,
}) => {
  await page.goto(story);
  await expect(page.locator(`${state('rtl')} ol`)).toBeVisible();
  await page
    .locator('style, link[rel=stylesheet]')
    .evaluateAll((elements) => elements.forEach((element) => element.remove()));
  for (const [name, count] of unpreviewedCounts) {
    const list = page.locator(`${state(name)} ol`);
    const items = list.locator(':scope > li');
    await expect(list).toHaveCSS('list-style-type', 'decimal');
    await expect(items).toHaveCount(count);
    for (const item of await items.all()) {
      await expect(item).toHaveCSS('display', 'list-item');
      await expect(
        item.locator(':scope > svg.cods-process-list__number'),
      ).toBeHidden();
      const headingOffset = await item.evaluate((element) => {
        const heading = element.querySelector('h3');
        if (!heading) throw new Error('Missing Process List step heading');
        return (
          heading.getBoundingClientRect().top -
          element.getBoundingClientRect().top
        );
      });
      expect(Math.abs(headingOffset)).toBeLessThanOrEqual(1);
    }
  }
});
