import { test, expect, expectAccessible } from './fixtures.js';

test('search variants expose named forms and submit the entered query', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/search/');
  const forms = page.locator('.search-examples [data-cods-fixture-state] form');
  await expect(
    page.getByRole('heading', { name: 'Default', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Compact', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Slim', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'These examples demonstrate the form layout. They do not return search results.',
    ),
  ).toBeVisible();
  await expect(forms).toHaveCount(3);
  for (const form of await forms.all()) {
    await expect(form).toHaveAttribute('role', 'search');
    await expect(form.locator('input')).toHaveAccessibleName(/search/i);
    await expect(form.locator('button')).toHaveAccessibleName('Search');
    expect(await form.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
  }
  const first = forms.first();
  await first.locator('input').fill('license');
  await expect(first).toHaveAttribute('method', 'get');
  await expect(first.locator('input')).toHaveAttribute('name', 'q');
  await expectAccessible(page, testInfo, 'article');
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
  const sections = page.locator('.search-examples > section');
  const compact = sections.nth(1);
  const slim = sections.nth(2);
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
