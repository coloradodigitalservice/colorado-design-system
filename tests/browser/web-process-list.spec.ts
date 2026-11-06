import { test, expect, expectAccessible } from './fixtures.js';

const exampleCounts = [
  ['default', 2],
  ['three-steps', 3],
  ['four-steps', 4],
  ['five-steps', 5],
  ['long-content', 6],
  ['rtl', 2],
  ['with-alert', 2],
] as const;

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
  for (const [state, count] of exampleCounts) {
    const list = page.locator(`[data-cods-fixture-state="${state}"] ol`);
    await expect(list).toHaveAttribute('role', 'list');
    const items = list.locator(':scope > li');
    await expect(items).toHaveCount(count);
    for (const [index, name] of ['one', 'two', 'three', 'four', 'five', 'six']
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
        new RegExp(`#number-circle-${name}$`),
      );
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

test('keeps step numbers visible with a host hidden reset', async ({
  page,
}) => {
  await page.goto('/process-list/');
  await page.addStyleTag({ content: '[hidden] { display: none; }' });
  const list = page.locator('[data-cods-fixture-state="default"] ol');
  const icons = list.locator(':scope > li > .cods-process-list__number');
  await expect(icons).toHaveCount(2);
  for (const icon of await icons.all()) {
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect
      .poll(() =>
        icon.evaluate((element) => {
          const symbol = element.querySelector('use');
          if (!symbol) throw new Error('Missing Process List number symbol');
          return symbol.getBBox().width;
        }),
      )
      .toBeGreaterThan(0);
  }
  await expect(list).toHaveCSS('list-style-type', 'none');
  await page
    .locator('style, link[rel=stylesheet]')
    .evaluateAll((elements) => elements.forEach((element) => element.remove()));
  await expect(icons.first()).toBeHidden();
  await expect(list).toHaveCSS('list-style-type', 'decimal');
  await expect(list.locator(':scope > li').first()).toHaveCSS(
    'display',
    'list-item',
  );
});

test('allows a consumer to restore native numbered markers', async ({
  page,
}) => {
  await page.goto('/process-list/');
  await page.addStyleTag({
    content: `
    .cods-process-list { list-style: decimal; padding-inline-start: 2rem; }
    .cods-process-list__item { display: list-item; }
    .cods-process-list__number { display: none; }
    .cods-process-list__item::after { display: none; }
  `,
  });
  const list = page.locator('[data-cods-fixture-state="default"] ol');
  await expect(list).toHaveCSS('list-style-type', 'decimal');
  for (const item of await list.locator(':scope > li').all()) {
    await expect(item).toHaveCSS('display', 'list-item');
    await expect(item.locator('.cods-process-list__number')).toBeHidden();
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('hides decorative numbers and aligns native markers without styles', async ({
    page,
  }) => {
    await page.goto('/process-list/');
    await page
      .locator('style, link[rel=stylesheet]')
      .evaluateAll((elements) =>
        elements.forEach((element) => element.remove()),
      );
    for (const [state, count] of exampleCounts) {
      const list = page.locator(`[data-cods-fixture-state="${state}"] ol`);
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
});
