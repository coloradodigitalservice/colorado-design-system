// Tags documentation page. The page previews the seven colors; long and
// right-to-left labels and the in-context state are covered in
// storybook-tags.spec.ts.
import { test, expect, expectAccessible } from './fixtures.js';

const colors = {
  default: ['rgb(27, 27, 27)', 'rgb(196, 197, 201)'],
  blue: ['rgb(0, 16, 73)', 'rgb(170, 205, 236)'],
  green: ['rgb(7, 49, 22)', 'rgb(180, 209, 184)'],
  red: ['rgb(111, 1, 1)', 'rgb(255, 171, 171)'],
  yellow: ['rgb(27, 27, 27)', 'rgb(255, 236, 135)'],
  plum: ['rgb(60, 6, 42)', 'rgb(218, 195, 211)'],
  teal: ['rgb(26, 50, 63)', 'rgb(174, 206, 212)'],
} as const;

test('tags page follows the outline and previews each token color', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/tags/');
  const main = page.locator('main');
  expect(await main.locator('h2').allTextContents()).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  expect(await main.locator('h3').allTextContents()).toEqual([
    'When to use',
    'Accessibility for tags',
    'Colors',
    'Variable settings',
    'Limitations',
  ]);
  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(7);
  for (const [state, [foreground, background]] of Object.entries(colors)) {
    const tag = page.locator(
      `[data-cods-docs-preview-state="${state}"] .cods-tags`,
    );
    await expect(tag).toHaveCSS('color', foreground);
    await expect(tag).toHaveCSS('background-color', background);
  }

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('Manual accessibility review is pending');
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 Tags' }),
  ).toBeVisible();
  // The public page omits localization guidance and the examples catalogue.
  await expect(main).not.toContainText(/right-to-left|localization/i);
  await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(0);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo);
});
