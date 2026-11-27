import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';
const catalog = JSON.parse(
  readFileSync(
    'packages/colorado-design-system/generated/icons/catalog.json',
    'utf8',
  ),
) as { icons: string[]; source: { version: string } };

test('Icons page contains the complete categorized Regular catalog', async ({
  page,
}, testInfo) => {
  await page.goto('/icon/');
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: 'Icon', level: 1 }),
  ).toBeVisible();
  await expect(
    main.getByRole('heading', { name: 'Icon catalog', level: 2 }),
  ).toBeVisible();
  const section = main.locator('section[aria-labelledby="icon-catalog"]');
  await expect(section).toContainText(
    `@phosphor-icons/core ${catalog.source.version}`,
  );
  const ids = await section
    .locator('.catalog-icons use')
    .evaluateAll((nodes) =>
      [
        ...new Set(
          nodes.map((node) => node.getAttribute('href')!.split('#')[1]),
        ),
      ].sort(),
    );
  expect(ids).toEqual([...catalog.icons].sort());
  const firstCategory = section.locator('.catalog-category').first();
  await firstCategory.locator('summary').first().click();
  const firstIcon = firstCategory.locator('.catalog-icons details').first();
  await firstIcon.locator('summary').click();
  await expect(firstIcon.locator('code')).toContainText('YOUR_SPRITE_URL#');
  await expect(firstIcon.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await expect
    .poll(() =>
      firstIcon
        .locator('use')
        .evaluate((node) => (node as SVGGraphicsElement).getBBox().width),
    )
    .toBeGreaterThan(0);
  await expectAccessible(page, testInfo, 'main');
});
