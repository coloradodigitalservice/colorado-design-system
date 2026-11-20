// Divider documentation page. Both fixture states are in the curated preview,
// so the component's semantics and styling run here in all three engines.
import { test, expect, expectAccessible } from './fixtures.js';

const preview = (name: string) => `[data-cods-docs-preview-state="${name}"]`;

test('divider page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/divider/');
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
    'Accessibility for dividers',
    'Variants and elements',
    'Variable settings',
    'Meaningful and decorative dividers',
    'Limitations',
  ])
    expect(subheadings).toContain(heading);

  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(2);
  await expect(page.locator('[data-cods-docs-preview-code]')).toContainText(
    'cods-divider--item',
  );

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('Divider maturity is experimental');
  await expect(status).toContainText('Manual accessibility review');
  await expect(status).toContainText(
    'Divider is CoDS-authored; USWDS has no equivalent.',
  );
  await expect(
    status.getByRole('link', { name: 'Figma design' }),
  ).toHaveAttribute('href', /figma\.com/);
  await expect(
    status.getByRole('link', { name: 'Component source' }),
  ).toHaveAttribute('href', /components\/divider$/);
  await expect(
    status.getByRole('link', { name: 'Accessibility evidence' }),
  ).toHaveAttribute('href', /\/divider\/accessibility\/divider\.evidence\.md$/);
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

test('divider semantics, token styling, and inset', async ({
  page,
}, testInfo) => {
  await page.goto('/divider/');
  const section = page.locator(`${preview('default')} .cods-divider`);
  const item = page.locator(`${preview('item')} .cods-divider`);
  // Only the meaningful Section divider is exposed as a separator.
  await expect(page.getByRole('separator')).toHaveCount(1);
  await expect(section).not.toHaveAttribute('aria-hidden');
  await expect(item).toHaveAttribute('aria-hidden', 'true');
  for (const line of [section, item]) {
    await expect(line).toHaveCSS('border-top-width', '1px');
    await expect(line).toHaveCSS('border-top-color', 'rgb(196, 197, 201)');
    // Static separators never become tab stops.
    expect(await line.evaluate((element) => element.tabIndex)).toBe(-1);
  }
  const inset = page.locator(`${preview('item')} .cods-divider--item`);
  await expect(inset).toHaveCSS('padding-left', '16px');
  await expect(inset).toHaveCSS('padding-top', '8px');
  const spacing = await inset.evaluate((wrapper) => {
    const line = wrapper.querySelector('hr')!.getBoundingClientRect();
    const box = wrapper.getBoundingClientRect();
    return { before: line.top - box.top, after: box.bottom - line.bottom };
  });
  expect(spacing).toEqual({ before: 8, after: 8 });
  await expectAccessible(page, testInfo);
});
