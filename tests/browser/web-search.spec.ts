import { test, expect, expectAccessible } from './fixtures.js';

const preview = (state: string) => `[data-cods-docs-preview-state="${state}"]`;

test('search page follows the component page outline and submits the entered query', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/search/');
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
    'Accessibility for search',
    'Variant classes',
    'Connecting your search endpoint',
    'Adding the search icon',
  ])
    expect(subheadings).toContain(heading);
  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('Search maturity is experimental');
  await expect(status).toContainText('Manual accessibility review');
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 Search' }),
  ).toBeVisible();
  // The public page omits localization guidance and the examples catalogue.
  await expect(main).not.toContainText(/right-to-left|localization/i);
  await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(0);

  const forms = page.locator('[data-cods-docs-preview-state] form');
  await expect(forms).toHaveCount(3);
  for (const form of await forms.all()) {
    await expect(form).toHaveAttribute('role', 'search');
    await expect(form.locator('input')).toHaveAccessibleName(/search/i);
    await expect(form.locator('button')).toHaveAccessibleName('Search');
    expect(await form.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
  }
  // The slim icon resolves to the built sprite, not the fixture's placeholder.
  await expect(page.locator(`${preview('slim')} use`)).not.toHaveAttribute(
    'href',
    '/icons/sprite.svg#magnifying-glass',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const first = forms.first();
  await first.locator('input').fill('license');
  await expect(first).toHaveAttribute('method', 'get');
  await expect(first.locator('input')).toHaveAttribute('name', 'q');
  await expectAccessible(page, testInfo);
  const submitted = page.waitForRequest(
    (request) => new URL(request.url()).searchParams.get('q') === 'license',
  );
  await first.locator('button').click();
  expect((await submitted).method()).toBe('GET');
});

test('search examples and joined controls keep keyboard focus visible', async ({
  page,
}) => {
  await page.goto('/search/');
  const compact = page.locator(preview('compact'));
  const slim = page.locator(preview('slim'));
  const compactBox = await compact.boundingBox();
  const slimBox = await slim.boundingBox();
  expect(
    slimBox!.y - (compactBox!.y + compactBox!.height),
  ).toBeGreaterThanOrEqual(8);
  for (const section of [compact, slim]) {
    const input = section.locator('input');
    const button = section.locator('button');
    await input.focus();
    await expect(input).toBeFocused();
    await expect(input).toHaveCSS('z-index', '1');
    await expect(input).toHaveCSS('outline-style', 'solid');
    expect(
      parseFloat(
        await input.evaluate((el) => getComputedStyle(el).outlineWidth),
      ),
    ).toBeGreaterThan(0);
    await button.focus();
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS('z-index', '1');
  }
});

test('focused controls remain visible in forced colors and right-to-left layout', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/search/');
  const compact = page.locator('.cods-search--compact');
  await compact.evaluate((el) => {
    el.setAttribute('dir', 'rtl');
    el.querySelector('button')!.textContent = 'البحث في الخدمات';
  });
  const input = compact.locator('input');
  await input.focus();
  await expect(input).toHaveCSS('outline-style', 'solid');
  expect(
    parseFloat(await input.evaluate((el) => getComputedStyle(el).outlineWidth)),
  ).toBeGreaterThan(0);
  await expect(input).toHaveCSS('z-index', '1');
  const controls = compact.locator('.cods-search__controls');
  const bounds = await controls.boundingBox();
  for (const control of [input, compact.locator('button')]) {
    const box = await control.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(bounds!.x - 1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(
      bounds!.x + bounds!.width + 1,
    );
  }
  expect(
    await compact
      .locator('button')
      .evaluate((el) => getComputedStyle(el, '::before').content),
  ).toBe('none');
});

test('compact and slim search reflow in a right-to-left document without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/search/');
  await page.evaluate(() => {
    document.documentElement.setAttribute('dir', 'rtl');
  });
  for (const state of ['compact', 'slim']) {
    const section = page.locator(preview(state));
    const label = section.locator('label');
    const input = section.locator('input');
    await expect(label).toHaveCount(1);
    await expect(input).toHaveAccessibleName(/search/i);
    await expect(section.locator('button')).toHaveAccessibleName('Search');
    // The label stays in the accessibility tree but is clipped, not parked
    // off-canvas, so it cannot widen the document in either direction.
    const labelBox = await label.boundingBox();
    expect(labelBox!.width).toBeLessThanOrEqual(1);
    expect(labelBox!.height).toBeLessThanOrEqual(1);
    expect(
      await section.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
  }
  const document_ = await page.evaluate(() => ({
    dir: window.getComputedStyle(window.document.body).direction,
    scrollWidth: window.document.documentElement.scrollWidth,
    clientWidth: window.document.documentElement.clientWidth,
  }));
  expect(document_.dir).toBe('rtl');
  expect(document_.scrollWidth).toBeLessThanOrEqual(document_.clientWidth);
});
