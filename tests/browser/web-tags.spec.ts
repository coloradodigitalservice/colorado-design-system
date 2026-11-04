import { test, expect, expectAccessible } from './fixtures.js';

test('Tags render all color variants as readable static text', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/tags/');
  const tags = page.locator('[data-cods-fixture-state] .cods-tags');
  await expect(tags).toHaveCount(9);
  const colors = {
    default: ['rgb(27, 27, 27)', 'rgb(196, 197, 201)'],
    blue: ['rgb(0, 16, 73)', 'rgb(170, 205, 236)'],
    green: ['rgb(7, 49, 22)', 'rgb(180, 209, 184)'],
    red: ['rgb(111, 1, 1)', 'rgb(255, 171, 171)'],
    yellow: ['rgb(27, 27, 27)', 'rgb(255, 236, 135)'],
    plum: ['rgb(60, 6, 42)', 'rgb(218, 195, 211)'],
    teal: ['rgb(26, 50, 63)', 'rgb(174, 206, 212)'],
  } as const;
  for (const [state, [foreground, background]] of Object.entries(colors)) {
    const tag = page.locator(`[data-cods-fixture-state="${state}"] .cods-tags`);
    await expect(tag).toHaveCSS('color', foreground);
    await expect(tag).toHaveCSS('background-color', background);
  }
  for (const tag of await tags.all()) {
    await expect(tag).not.toHaveText('');
    await expect(tag).toHaveJSProperty('tagName', 'SPAN');
    expect(await tag.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
  }
  const context = page.locator('[data-cods-fixture-state="in-context"]');
  await expect(context.locator('h4 .usa-tag.cods-tags--blue')).toHaveText(
    'Update',
  );
  await expect(
    page.locator('[data-cods-example="in-context"] code'),
  ).toContainText('Sales tax increases to 2.2%');
  await expect(
    page.locator('[data-cods-example="in-context"] code'),
  ).toContainText('Read about the updated statewide sales tax rate.');
  await expectAccessible(page, testInfo, 'article');
});
