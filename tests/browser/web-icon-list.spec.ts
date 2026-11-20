// Icon List documentation page. The right-to-left state is not on the public
// page; its layout is checked in storybook-icon-list.spec.ts.
import { test, expect, expectAccessible } from './fixtures.js';
import {
  expectIconListLayout,
  expectSupportingText,
} from './icon-list-checks.js';

const preview = (name: string) => `[data-cods-docs-preview-state="${name}"]`;

test('icon list page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/icon-list/');
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
    'Accessibility for icon lists',
    'Elements',
    'Sizes and spacing',
    'Adding icons',
    'Limitations',
  ])
    expect(subheadings).toContain(heading);

  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(2);
  for (const state of ['default', 'long-content']) {
    // List semantics survive the removed markers; icons stay out of the
    // accessibility tree.
    const list = page.locator(preview(state)).getByRole('list');
    await expect(list).toBeVisible();
    await expect(list.getByRole('img')).toHaveCount(0);
  }
  // Preview icons load from the built sprite.
  await expect
    .poll(() =>
      page
        .locator(`${preview('default')} svg use`)
        .first()
        .evaluate((use) => (use as SVGUseElement).getBBox().width),
    )
    .toBeGreaterThan(0);

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText(
    'Automated accessibility checks (axe) pass for every preview state. Manual accessibility review is pending.',
  );
  await expect(status).not.toContainText(/WCAG/);
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 Icon List' }),
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

test('preview icon lists keep their responsive layout', async ({ page }) => {
  await page.goto('/icon-list/');
  await expectIconListLayout(page, [
    page.locator(`${preview('default')} ul`),
    page.locator(`${preview('long-content')} ul`),
  ]);
  await expectSupportingText(
    page.locator(`${preview('long-content')} p`).first(),
  );
});
