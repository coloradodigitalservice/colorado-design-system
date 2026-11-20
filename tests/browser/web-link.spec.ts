import { readFileSync } from 'node:fs';
import { expectSharedIcons } from './link-checks.js';
import { test, expect, expectAccessible } from './fixtures.js';

const scope = 'main [data-cods-docs-preview]';
const preview = (state: string) =>
  `${scope} [data-cods-docs-preview-state="${state}"]`;
const focusShadow =
  'rgb(255, 255, 255) 0px 0px 0px 2px, rgb(23, 59, 179) 0px 0px 0px 4px';
const states = [
  'default',
  'standalone',
  'inline-small',
  'inline-large',
  'standalone-small',
  'more-link',
  'prefix-icon',
  'external',
  'disabled',
];

test('link page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/link/');
  const main = page.locator('main');
  expect(await main.locator('h2').allTextContents()).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  const subheadings = await main.locator('h3').allTextContents();
  for (const heading of [
    'When to use',
    'Writing for links',
    'Accessibility for links',
    'Variants and elements',
    'Adding icons',
    'New-tab and download links',
    'Disabled links',
  ])
    expect(subheadings).toContain(heading);

  expect(
    await page
      .locator('[data-cods-docs-preview-state]')
      .evaluateAll((figures) =>
        figures.map((figure) =>
          figure.getAttribute('data-cods-docs-preview-state'),
        ),
      ),
  ).toEqual(states);

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('Manual accessibility review');
  await expect(status).toContainText('is pending');
  await expect(status).not.toContainText(/passed WCAG|conforms/i);
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 Link' }),
  ).toBeVisible();
  await expect(
    status.getByRole('link', { name: 'Accessibility evidence' }),
  ).toHaveAttribute('href', /\/link\/accessibility\/link\.evidence\.md$/);
  // The public page omits localization guidance and the examples catalogue.
  await expect(main).not.toContainText(/right-to-left|localization|:dir\(/i);
  await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(0);

  for (const figure of await page
    .locator('[data-cods-docs-preview-state]')
    .all())
    expect(
      await figure.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo);
});

test('preview variants use Figma typography, names, and shared icons', async ({
  page,
}) => {
  await page.goto('/link/');
  for (const link of await page.locator(`${scope} .cods-link`).all())
    await expect(link).toHaveCSS('font-family', /^"?Open Sans"?, sans-serif$/);
  const inline = page.locator(`${preview('default')} a`);
  await expect(inline).toHaveCSS('font-weight', '400');
  await expect(inline).toHaveCSS('text-decoration-line', 'underline');
  await expect(inline).toHaveCSS('text-decoration-thickness', '2px');
  await expect(inline).toHaveCSS('text-underline-offset', '2px');
  const standalone = page.locator(`${preview('standalone')} a`);
  await expect(standalone).toHaveCSS('font-weight', '600');
  await expect(standalone).toHaveCSS('text-decoration-line', 'none');
  await expect(standalone).toHaveCSS('color', 'rgb(0, 25, 112)');
  for (const [state, size] of [
    ['inline-small', '14px'],
    ['inline-large', '22px'],
    ['standalone-small', '14px'],
  ] as const) {
    const link = page.locator(`${preview(state)} a`);
    await expect(link).toHaveCSS('font-size', size);
    if (state === 'inline-small')
      await expect(link).toHaveCSS('text-decoration-thickness', '1px');
  }
  const external = page.locator(`${preview('external')} a`);
  // The new-tab notice is text, so it reaches the accessible name.
  await expect(external).toHaveAccessibleName(
    'U.S. Web Design System (opens in a new tab)',
  );
  // Ignore the SVG's ink inset: compare its 16px slot with the text box.
  const suffixGap = await external.evaluate((el) => {
    const text = [...el.childNodes].find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    )!;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, (text.textContent ?? '').trimEnd().length);
    return (
      el.querySelector('.cods-link__icon')!.getBoundingClientRect().left -
      range.getBoundingClientRect().right
    );
  });
  expect(suffixGap).toBeCloseTo(4, 1);
  await expectSharedIcons(page.locator(`${scope} .cods-link__icon`));
});

test('disabled variants keep their decoration without navigation or a tab stop', async ({
  page,
}) => {
  await page.goto('/link/');
  const links = page.locator(`${preview('disabled')} a`);
  await expect(links).toHaveCount(5);
  const originalURL = page.url();
  const variants = [
    ['16px', '400', 'underline', '2px'],
    ['16px', '600', 'none', '2px'],
    ['14px', '400', 'underline', '1px'],
    ['22px', '400', 'underline', '2px'],
    ['14px', '600', 'none', '2px'],
  ];
  for (const [index, link] of (await links.all()).entries()) {
    await expect(link).toHaveRole('link');
    await expect(link).toHaveAccessibleName('Installation guide');
    const [size, weight, decoration, thickness] = variants[index]!;
    for (const action of [
      async () => {},
      async () => link.hover(),
      async () => page.mouse.down(),
    ]) {
      await action();
      await expect(link).toHaveCSS('color', 'rgb(86, 92, 101)');
      await expect(link).toHaveCSS('font-size', size!);
      await expect(link).toHaveCSS('font-weight', weight!);
      await expect(link).toHaveCSS('text-decoration-line', decoration!);
      if (decoration === 'underline')
        await expect(link).toHaveCSS('text-decoration-thickness', thickness!);
    }
    await page.mouse.up();
    await link.click({ force: true });
    await link.evaluate((element) => (element as HTMLElement).focus());
    await expect(link).not.toBeFocused();
    expect(page.url()).toBe(originalURL);
  }
  await page.emulateMedia({ forcedColors: 'active' });
  const gray = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'GrayText';
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  for (const link of await links.all())
    await expect(link).toHaveCSS('color', gray);
});

test('links inherit surrounding leading and wrapped hover underlines clear the next line', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/link/');
  const leading = await page
    .locator(`${scope} .cods-link`)
    .evaluateAll((links) =>
      links.map((link) => {
        const parent = link.parentElement!;
        parent.style.lineHeight = '1.8';
        const style = getComputedStyle(link);
        const result = {
          actual: parseFloat(style.lineHeight),
          expected: parseFloat(style.fontSize) * 1.8,
        };
        parent.style.removeProperty('line-height');
        return result;
      }),
    );
  for (const { actual, expected } of leading)
    expect(actual).toBeCloseTo(expected, 1);
  // A long standalone label wraps at 320px with the page's own leading.
  const long = page.locator(`${preview('standalone')} a`);
  await long.evaluate((link) => {
    link.textContent =
      'Read the complete installation and configuration guide for Colorado public service websites and applications';
  });
  await long.hover();
  const lines = await long.evaluate((link) => {
    const text = link.firstChild!;
    const range = document.createRange();
    range.selectNodeContents(text);
    // WebKit can split one line into multiple adjacent text fragments.
    const rects = [...range.getClientRects()].filter(
      (rect, index, fragments) =>
        index === 0 || rect.top !== fragments[index - 1]!.top,
    );
    const style = getComputedStyle(link);
    const context = document.createElement('canvas').getContext('2d')!;
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const descent = context.measureText(
      text.textContent!,
    ).fontBoundingBoxDescent;
    return rects.slice(0, -1).map((rect, i) => ({
      underlineBottom:
        rect.bottom -
        descent +
        parseFloat(style.textUnderlineOffset) +
        parseFloat(style.textDecorationThickness),
      nextLineTop: rects[i + 1]!.top,
    }));
  });
  expect(lines.length).toBeGreaterThan(0);
  for (const line of lines)
    expect(line.underlineBottom).toBeLessThan(line.nextLineTop);
});

test('pointer states match the separate inline and standalone treatments', async ({
  page,
}) => {
  await page.goto('/link/');
  for (const [state, defaultColor, hoverColor, offset] of [
    ['default', 'rgb(23, 59, 179)', 'rgb(0, 25, 112)', '2px'],
    ['standalone', 'rgb(0, 25, 112)', 'rgb(37, 81, 163)', '3px'],
    ['inline-small', 'rgb(23, 59, 179)', 'rgb(0, 25, 112)', '2px'],
    ['standalone-small', 'rgb(0, 25, 112)', 'rgb(37, 81, 163)', '3px'],
  ] as const) {
    const link = page.locator(`${preview(state)} a`);
    await expect(link).toHaveCSS('color', defaultColor);
    await link.hover();
    await expect(link).toHaveCSS('color', hoverColor);
    await expect(link).toHaveCSS('text-decoration-line', 'underline');
    await expect(link).toHaveCSS(
      'text-decoration-thickness',
      state.includes('small') ? '3px' : '4px',
    );
    await expect(link).toHaveCSS('text-underline-offset', offset);
    // Release on the same link without navigation; moving away first can
    // leave WebKit's active pseudo-class latched after drag cancellation.
    await link.evaluate((el) =>
      el.addEventListener('click', (event) => event.preventDefault(), {
        once: true,
      }),
    );
    await page.mouse.down();
    await expect(link).toHaveCSS('color', 'rgb(0, 16, 73)');
    await expect(link).toHaveCSS(
      'text-decoration-line',
      state.startsWith('standalone') ? 'none' : 'underline',
    );
    if (!state.startsWith('standalone'))
      await expect(link).toHaveCSS(
        'text-decoration-thickness',
        state.includes('small') ? '1px' : '2px',
      );
    await page.mouse.up();
    await expect(link).toHaveCSS('color', hoverColor);
    await page.mouse.move(0, 0);
  }
});

test('keyboard traversal preserves the rounded white-gap and blue-band focus', async ({
  page,
  browserName,
}) => {
  await page.goto('/link/');
  const mac = browserName === 'webkit' && process.platform === 'darwin';
  const tab = mac ? 'Alt+Tab' : 'Tab';
  const backTab = mac ? 'Alt+Shift+Tab' : 'Shift+Tab';
  // Every enabled preview link, in order; the disabled block is last.
  const links = page.locator(`${scope} .cods-link[href]`);
  await expect(links).toHaveCount(8);
  await links.first().focus();
  for (let i = 0; i < (await links.count()); i++) {
    if (i) await page.keyboard.press(tab);
    const link = links.nth(i);
    await expect(link).toBeFocused();
    if (
      await link.evaluate((el) =>
        el.classList.contains('cods-link--standalone'),
      )
    )
      await expect(link).toHaveCSS('color', 'rgb(23, 59, 179)');
    await expect(link).toHaveCSS('box-shadow', focusShadow);
    await expect(link).toHaveCSS('border-radius', '2px');
    await expect(link).toHaveCSS('outline-width', '2px');
    await expect(link).toHaveCSS('outline-color', 'rgba(0, 0, 0, 0)');
  }
  // Tab skips the disabled links and leaves the preview.
  await page.keyboard.press(tab);
  expect(
    await page.evaluate(
      () => !document.activeElement?.closest('[data-cods-docs-preview]'),
    ),
  ).toBe(true);
  await links.nth(1).focus();
  await page.keyboard.press(backTab);
  await expect(links.first()).toBeFocused();
});

test('RTL follows resolved direction and mirrors only directional arrows', async ({
  page,
}) => {
  await page.goto('/link/');
  const figure = page.locator(preview('more-link'));
  // Clone preview links into direction contexts; the CSS uses :dir().
  await figure.evaluate((el) => {
    const source = (state: string) =>
      document
        .querySelector(`[data-cods-docs-preview-state="${state}"] a`)!
        .cloneNode(true) as HTMLAnchorElement;
    const add = (
      parent: HTMLElement,
      link: HTMLAnchorElement,
      name: string,
      dir?: string,
    ) => {
      if (dir) link.dir = dir;
      link.setAttribute('data-cods-test-direction', name);
      parent.append(link);
    };
    const arabic = (link: HTMLAnchorElement) => {
      link.firstChild!.textContent = 'دليل التثبيت ';
      return link;
    };
    const rtl = document.createElement('p');
    rtl.dir = 'rtl';
    rtl.lang = 'ar';
    add(rtl, arabic(source('more-link')), 'inherited');
    add(rtl, source('more-link'), 'ltr', 'ltr');
    add(rtl, source('prefix-icon'), 'prefix', 'rtl');
    add(rtl, source('external'), 'external', 'rtl');
    const ltr = document.createElement('p');
    ltr.dir = 'ltr';
    add(ltr, arabic(source('more-link')), 'auto', 'auto');
    el.append(rtl, ltr);
  });
  const icon = (name: string, kind: string) =>
    figure.locator(
      `[data-cods-test-direction="${name}"] .cods-link__icon--${kind}`,
    );
  const mirrored = 'matrix(-1, 0, 0, 1, 0, 0)';
  await expect(icon('inherited', 'arrow')).toHaveCSS('transform', mirrored);
  await expect(icon('auto', 'arrow')).toHaveCSS('transform', mirrored);
  await expect(icon('ltr', 'arrow')).toHaveCSS('transform', 'none');
  await expect(icon('prefix', 'globe')).toHaveCSS('transform', 'none');
  await expect(icon('external', 'external')).toHaveCSS('transform', 'none');
});

test('forced colors preserve focus and icon color without shadows', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/link/');
  expect(
    await page.evaluate(() => matchMedia('(forced-colors: active)').matches),
  ).toBe(true);
  const link = page.locator(`${scope} .cods-link`).first();
  await link.focus();
  await expect(link).toHaveCSS('outline-style', 'solid');
  await expect(link).toHaveCSS('outline-width', '2px');
  expect(
    await link.evaluate((el) => getComputedStyle(el).outlineColor),
  ).not.toBe('rgba(0, 0, 0, 0)');
  for (const icon of await page.locator(`${scope} .cods-link__icon`).all()) {
    expect(
      await icon.evaluate((el) => {
        const style = getComputedStyle(el);
        return (
          style.backgroundColor === style.color &&
          (!CSS.supports('forced-color-adjust', 'none') ||
            style.forcedColorAdjust === 'none')
        );
      }),
    ).toBe(true);
  }
  await expectAccessible(page, testInfo, scope);
});

test('preview and documentation links preserve a deployment prefix', async ({
  page,
}) => {
  const prefix = '/colorado-design-system';
  await page.route(`**${prefix}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname.slice(
      prefix.length,
    );
    if (!['/link/', '/getting-started/', '/icon/'].includes(pathname)) {
      await route.fallback();
      return;
    }
    await route.fulfill({
      contentType: 'text/html',
      body: readFileSync(`apps/web/dist${pathname}index.html`),
    });
  });
  await page.goto(`${prefix}/link/`);
  const links = page.locator(
    'main a[href="../getting-started/"], main a[href="../icon/"]',
  );
  expect(await links.count()).toBeGreaterThan(0);
  for (const link of await links.all()) {
    expect(
      await link.evaluate(
        (el) => new URL((el as HTMLAnchorElement).href).pathname,
      ),
    ).toMatch(/^\/colorado-design-system\/(getting-started|icon)\/$/);
  }
  await page.locator(`${preview('default')} a`).click();
  await expect(page).toHaveURL(/\/colorado-design-system\/getting-started\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Getting started' }),
  ).toBeVisible();
});
