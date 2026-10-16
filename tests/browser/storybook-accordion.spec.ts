import { routeBuiltFiles } from './built-files.js';
import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const fixture = readFileSync(
  'packages/colorado-design-system/src/components/accordion/accordion.fixture.html',
  'utf8',
);

test('canonical accordion fixture supports interactions in Storybook', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-accordion--default&viewMode=story&globals=a11y.manual:!true',
  );
  const root = page.locator('#storybook-root [data-cods-accordion]');
  await expect(root).toHaveAttribute('data-cods-accordion-enhanced', '');
  const trigger = root.getByRole('button').nth(1);
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger).toBeFocused();
  await expect(root.getByRole('link')).toBeVisible();
  await expectAccessible(page, testInfo, '#storybook-root');
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

const defaultStory =
  '/iframe.html?id=components-accordion--default&viewMode=story&globals=a11y.manual:!true';

test('focused accordion trigger shows the Colorado focus ring', async ({
  page,
  browserName,
}) => {
  await page.goto(defaultStory);
  const trigger = page
    .locator('#storybook-root [data-cods-accordion]')
    .getByRole('button')
    .first();
  await expect(trigger).toBeVisible();
  await page.keyboard.press(
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab',
  );
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveCSS('outline-style', 'solid');
  await expect(trigger).toHaveCSS('outline-width', '2px');
  await expect(trigger).toHaveCSS(
    'box-shadow',
    'rgb(255, 255, 255) 0px 0px 0px 2px, rgb(23, 59, 179) 0px 0px 0px 4px',
  );
});

test('focused accordion trigger uses the system highlight in forced colors', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto(defaultStory);
  const trigger = page
    .locator('#storybook-root [data-cods-accordion]')
    .getByRole('button')
    .first();
  await trigger.focus();
  await expect(trigger).toBeFocused();
  const [outline, highlight] = await Promise.all([
    trigger.evaluate((element) => getComputedStyle(element).outlineColor),
    page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.color = 'Highlight';
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    }),
  ]);
  expect(outline).toBe(highlight);
  await expect(trigger).toHaveCSS('outline-style', 'solid');
});

test.beforeEach(async ({ page }) => {
  if (process.env.CODS_BUILT_FILES === '1')
    await routeBuiltFiles(page, 'storybook');
});

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
  ['bordered', '4px', 'rgb(235, 236, 237)'],
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
    expect(geometry.textInset).toBe(16);
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
    expect(expanded.mask).toContain('data:image/svg+xml');
    await trigger.click();
    await expect(panel).toBeHidden();
    const collapsed = await trigger.evaluate(
      (el) => getComputedStyle(el, '::after').maskImage,
    );
    expect(collapsed).not.toBe(expanded.mask);
    await expectAccessible(page, testInfo, '#storybook-root');
  });
}

test('chevrons retain the exported Figma artwork and forced-color visibility', async ({
  page,
}) => {
  await page.goto(defaultStory);
  const trigger = page.locator('#storybook-root button').first();
  for (const [expanded, direction] of [
    [true, 'up'],
    [false, 'down'],
  ] as const) {
    if (!expanded) await trigger.click();
    const renderedSvg = await trigger.evaluate((el) => {
      const url = getComputedStyle(el, '::after').maskImage.slice(5, -2);
      const body = url.slice(url.indexOf(',') + 1);
      return url.includes(';base64,') ? atob(body) : decodeURIComponent(body);
    });
    const source = readFileSync(
      `packages/colorado-design-system/src/components/accordion/assets/icon-medium-chevron-${direction}.svg`,
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
