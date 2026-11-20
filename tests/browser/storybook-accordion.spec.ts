import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const fixture = readFileSync(
  'packages/colorado-design-system/src/components/accordion/accordion.fixture.html',
  'utf8',
);

const story = (id: string) =>
  `/iframe.html?id=components-accordion--${id}&viewMode=story&globals=a11y.manual:!true`;
const state = (name: string) =>
  `#storybook-root [data-cods-fixture-state="${name}"]`;

test('multiple-open and disabled states across the full fixture', async ({
  page,
}, testInfo) => {
  await page.goto(story('all-states'));
  const multiple = page.locator(`${state('multiple')} [data-cods-accordion]`);
  await expect(multiple).toHaveAttribute('data-cods-accordion-enhanced', '');
  const visible = multiple.locator('[data-cods-accordion-panel]:visible');
  await expect(visible).toHaveCount(2);
  await multiple.getByRole('button').first().click();
  await expect(visible).toHaveCount(1);
  await expect(
    page.locator(state('disabled')).getByRole('button'),
  ).toBeDisabled();
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('320px reflow, reduced motion, and forced colors for every state', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto(story('all-states'));
  const first = page.locator(`${state('default')} button`).first();
  await expect(
    page.locator(`${state('default')} [data-cods-accordion]`),
  ).toHaveAttribute('data-cods-accordion-enhanced', '');
  await first.focus();
  // Includes long-content, Spanish, and right-to-left fixture states.
  const roots = await page
    .locator('#storybook-root [data-cods-accordion]')
    .evaluateAll((roots) =>
      roots.map((root) => ({
        width: root.getBoundingClientRect().width,
        scrollWidth: root.scrollWidth,
      })),
    );
  expect(roots.length).toBeGreaterThanOrEqual(8);
  expect(
    roots.every(({ width, scrollWidth }) => scrollWidth <= Math.ceil(width)),
  ).toBe(true);
  expect(
    await first.evaluate((button) => getComputedStyle(button).outlineStyle),
  ).toBe('solid');
  await expectAccessible(page, testInfo, '#storybook-root');
  await testInfo.attach('accordion-narrow-forced-colors', {
    body: await page.locator('#storybook-root').screenshot(),
    contentType: 'image/png',
  });
});

test('unenhanced Storybook story uses the complete package fixture', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=components-accordion--without-java-script&viewMode=story&globals=a11y.manual:!true',
  );
  const root = page.locator('#storybook-root');
  await expect(root).not.toBeEmpty();
  const expectedIds = Array.from(
    fixture.matchAll(/id="(accordion-[^"]+)"/g),
    (match) => match[1],
  );
  expect(
    await root
      .locator('[data-cods-accordion-panel]')
      .evaluateAll((panels) => panels.map((panel) => panel.id)),
  ).toEqual(expectedIds);
  await expect(root.locator('[data-cods-accordion-panel]:visible')).toHaveCount(
    10,
  );
  await expect(root.locator('[data-cods-accordion-enhanced]')).toHaveCount(0);
});

const defaultStory = story('default');

for (const [story, expanded] of [
  ['expanded', ['true', 'true']],
  ['mixed', ['true', 'false']],
  ['collapsed', ['false', 'false']],
] as const) {
  test(`${story} story exposes the documented panel states`, async ({
    page,
  }, testInfo) => {
    await page.goto(
      `/iframe.html?id=components-accordion--${story}&viewMode=story&globals=a11y.manual:!true`,
    );
    const root = page.locator('#storybook-root [data-cods-accordion]');
    await expect(root).toHaveAttribute('data-cods-accordion-enhanced', '');
    for (const [index, value] of expanded.entries()) {
      const trigger = root.getByRole('button').nth(index);
      await expect(trigger).toHaveAttribute('aria-expanded', value);
      const panel = root.locator(
        `[id="${await trigger.getAttribute('aria-controls')}"]`,
      );
      if (value === 'true') await expect(panel).toBeVisible();
      else await expect(panel).toBeHidden();
    }
    await expectAccessible(page, testInfo, '#storybook-root');
  });
}

test('approved typography and spacing tokens can be customized at runtime', async ({
  page,
}) => {
  await page.goto(defaultStory);
  const root = page.locator('#storybook-root [data-cods-accordion]');
  const trigger = root.getByRole('button').first();
  const panel = root.locator('[data-cods-accordion-panel]').first();
  await expect(trigger).toHaveCSS('font-size', '18px');
  await expect(trigger).toHaveCSS('font-weight', '600');
  await expect(trigger).toHaveCSS('padding-top', '16px');
  await expect(panel).toHaveCSS('padding-top', '16px');
  await expect(panel).toHaveCSS('font-size', '16px');
  await root.evaluate((element) => {
    element.style.setProperty('--cods-space-md', '20px');
    element.style.setProperty('--cods-font-size-desktop-h6', '22px');
  });
  await expect(trigger).toHaveCSS('font-size', '22px');
  await expect(trigger).toHaveCSS('padding-top', '20px');
  await expect(panel).toHaveCSS('padding-top', '20px');
});

for (const [variant, border, color] of [
  ['default', '4px', 'rgb(235, 236, 237)'],
  ['white', '1px', 'rgb(196, 197, 201)'],
] as const) {
  test(`${variant} matches Figma panel borders and header geometry`, async ({
    page,
  }, testInfo) => {
    await page.goto(
      `/iframe.html?id=components-accordion--${variant}&viewMode=story&globals=a11y.manual:!true`,
    );
    const root = page.locator('#storybook-root [data-cods-accordion]');
    const trigger = root.getByRole('button').first();
    const panel = root.locator('[data-cods-accordion-panel]').first();
    await expect(panel).toBeVisible();
    const geometry = await root.evaluate((el) => {
      const button = el.querySelector('button')!;
      const panel = el.querySelector('[data-cods-accordion-panel]')!;
      const text = panel.querySelector('p')!;
      return {
        headerHeight: button.getBoundingClientRect().height,
        textInset:
          text.getBoundingClientRect().left -
          panel.getBoundingClientRect().left,
      };
    });
    expect(geometry.headerHeight).toBe(56);
    // Figma item separation: 12px between headings, none before the first.
    const headings = root.locator(':scope > .cods-accordion__heading');
    await expect(headings.first()).toHaveCSS('margin-block-start', '0px');
    for (const heading of (await headings.all()).slice(1))
      await expect(heading).toHaveCSS('margin-block-start', '12px');
    expect(geometry.textInset).toBe(16);
    await expect(panel).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(panel).toHaveCSS('border-left-width', border);
    await expect(panel).toHaveCSS('border-right-width', border);
    await expect(panel).toHaveCSS('border-bottom-width', border);
    await expect(panel).toHaveCSS('border-top-width', '0px');
    await expect(panel).toHaveCSS('border-bottom-color', color);
    if (variant === 'white') {
      await expect(trigger).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      await expect(trigger).toHaveCSS('border-top-color', color);
      await expect(trigger).toHaveCSS('border-top-width', '1px');
    }
    const expanded = await trigger.evaluate((el) => {
      const icon = getComputedStyle(el, '::after');
      return { width: icon.width, height: icon.height, mask: icon.maskImage };
    });
    expect(expanded.width).toBe('24px');
    expect(expanded.height).toBe('24px');
    expect(expanded.mask).not.toBe('none');
    await trigger.click();
    await expect(panel).toBeHidden();
    const collapsed = await trigger.evaluate(
      (el) => getComputedStyle(el, '::after').maskImage,
    );
    expect(collapsed).not.toBe(expanded.mask);
    await expectAccessible(page, testInfo, '#storybook-root');
  });
}

test('borderless panel reveals the page background', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=components-accordion--borderless&viewMode=story&globals=a11y.manual:!true',
  );
  const root = page.locator('#storybook-root [data-cods-accordion]');
  await root.evaluate((element) => {
    element.style.backgroundColor = 'rgb(210, 210, 210)';
  });
  const panel = root.locator('[data-cods-accordion-panel]');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(panel).toHaveCSS('border-left-width', '0px');
  await expect(panel).toHaveCSS('border-bottom-width', '0px');
});

test('chevrons use shared Phosphor artwork and retain forced-color visibility', async ({
  page,
}) => {
  await page.goto(defaultStory);
  const trigger = page.locator('#storybook-root button').first();
  for (const [expanded, direction] of [
    [true, 'up'],
    [false, 'down'],
  ] as const) {
    if (!expanded) await trigger.click();
    const renderedSvg = await trigger.evaluate(async (el) => {
      const url = getComputedStyle(el, '::after').maskImage.slice(5, -2);
      return (await fetch(url)).text();
    });
    const source = readFileSync(
      `packages/colorado-design-system/dist/icons/caret-${direction}.svg`,
      'utf8',
    );
    const same = await page.evaluate(
      ({ renderedSvg, source }) => {
        const parser = new DOMParser();
        const a = parser.parseFromString(renderedSvg, 'image/svg+xml');
        const b = parser.parseFromString(source, 'image/svg+xml');
        return (
          a.documentElement.getAttribute('viewBox') ===
            b.documentElement.getAttribute('viewBox') &&
          a.querySelector('path')?.getAttribute('d') ===
            b.querySelector('path')?.getAttribute('d')
        );
      },
      { renderedSvg, source },
    );
    expect(same).toBe(true);
  }
  await page.emulateMedia({ forcedColors: 'active' });
  expect(
    await trigger.evaluate(
      (el) => getComputedStyle(el, '::after').forcedColorAdjust,
    ),
  ).toBe('none');
  expect(
    await trigger.evaluate(
      (el) => getComputedStyle(el, '::after').backgroundColor,
    ),
  ).not.toBe('rgba(0, 0, 0, 0)');
});
