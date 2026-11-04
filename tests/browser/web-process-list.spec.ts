import { test, expect, expectAccessible } from './fixtures.js';

test('process lists preserve step order, numbering, and reflow', async ({
  page,
}, testInfo) => {
  await page.goto('/process-list/');
  for (const heading of [
    'Summary',
    'When to use',
    'Anatomy and markup',
    'Writing guidance',
    'Responsive behavior',
    'Assets and progressive enhancement',
    'Accessibility and review status',
    'Examples',
  ]) {
    await expect(
      page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible();
  }
  for (const [state, count] of [
    ['default', 2],
    ['three-steps', 3],
    ['four-steps', 4],
    ['five-steps', 5],
    ['long-content', 6],
    ['rtl', 2],
    ['with-alert', 2],
  ] as const) {
    const list = page.locator(`[data-cods-fixture-state="${state}"] ol`);
    await expect(list).toHaveAttribute('role', 'list');
    const items = list.locator(':scope > li');
    await expect(items).toHaveCount(count);
    for (const [index, name] of ['one', 'two', 'three', 'four', 'five', 'six']
      .slice(0, count)
      .entries()) {
      const item = items.nth(index);
      await expect(item.locator('h3')).toHaveCount(1);
      await expect(
        item.locator(':scope > .cods-process-list__number svg'),
      ).toHaveAttribute('aria-hidden', 'true');
      await expect(
        item.locator(':scope > .cods-process-list__number svg use'),
      ).toHaveAttribute('href', new RegExp(`#number-circle-${name}$`));
    }
  }
  await expect(
    page
      .locator('[data-cods-fixture-state="long-content"] ol > li')
      .first()
      .locator('ul > li'),
  ).toHaveCount(2);
  await expectAccessible(page, testInfo);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const state of ['default', 'rtl']) {
    const item = page
      .locator(`[data-cods-fixture-state="${state}"] li`)
      .first();
    const geometry = await item.evaluate((element) => {
      const icon = element.querySelector('svg')!.getBoundingClientRect();
      const content = element
        .querySelector('.cods-process-list__content')!
        .getBoundingClientRect();
      return {
        size: icon.width,
        gap:
          getComputedStyle(element).direction === 'rtl'
            ? icon.left - content.right
            : content.left - icon.right,
      };
    });
    expect(geometry.size).toBe(32);
    expect(geometry.gap).toBeCloseTo(8, 1);
  }
});

test('aligns narrow content, keeps the connector visible, and preserves fallback numbering', async ({
  page,
}, testInfo) => {
  await page.goto('/process-list/');
  const example = page.locator('[data-cods-fixture-state="with-alert"]');
  const list = example.locator('ol');
  await list.evaluate((element) => {
    (element as HTMLElement).style.width = '320px';
    (element as HTMLElement).style.maxWidth = '100%';
  });
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    const item = list.locator(':scope > li').first();
    const metrics = await item.evaluate((element) => {
      const heading = element.querySelector('h3')!.getBoundingClientRect();
      const alert = element
        .querySelector('.cods-in-page-alert')!
        .getBoundingClientRect();
      const text = element
        .querySelector('.cods-process-list__content > p')!
        .getBoundingClientRect();
      const itemRect = element.getBoundingClientRect();
      const connector = getComputedStyle(element, '::after');
      return {
        headingLeft: heading.left,
        alertLeft: alert.left,
        textLeft: text.left,
        inset: itemRect.right - text.right,
        gap: alert.top - heading.bottom,
        connectorWidth: connector.width,
      };
    });
    expect(metrics.textLeft).toBeCloseTo(metrics.headingLeft, 1);
    expect(metrics.alertLeft).toBeCloseTo(metrics.headingLeft, 1);
    expect(metrics.inset).toBeGreaterThanOrEqual(11);
    expect(metrics.gap).toBeGreaterThanOrEqual(8);
    expect(metrics.connectorWidth).toBe('5px');
    await expect(example.locator('h3 + .cods-in-page-alert h4')).toHaveCount(1);
    await expectAccessible(
      page,
      testInfo,
      '[data-cods-fixture-state="with-alert"]',
    );
  }
  await page.emulateMedia({ forcedColors: 'active' });
  const color = await list
    .locator(':scope > li')
    .first()
    .evaluate(
      (element) => getComputedStyle(element, '::after').backgroundColor,
    );
  const canvasText = await page.evaluate(() => {
    const el = document.createElement('span');
    el.style.color = 'CanvasText';
    document.body.append(el);
    const value = getComputedStyle(el).color;
    el.remove();
    return value;
  });
  expect(color).toBe(canvasText);
});

test('hides decorative numbers without styles', async ({ page }) => {
  await page.goto('/process-list/');
  await page
    .locator('style, link[rel=stylesheet]')
    .evaluateAll((elements) => elements.forEach((element) => element.remove()));
  const list = page.locator('[data-cods-fixture-state="default"] ol');
  await expect(list.locator(':scope > li')).toHaveCount(2);
  await expect(
    list.locator(':scope > li > .cods-process-list__number').first(),
  ).toBeHidden();
  expect(
    await list
      .locator(':scope > li')
      .first()
      .evaluate((element) => getComputedStyle(element).display),
  ).toBe('list-item');
});
