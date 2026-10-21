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
    9,
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
  await expect(trigger).toHaveCSS('outline-width', '4px');
  await expect(trigger).toHaveCSS('outline-color', 'rgb(23, 59, 179)');
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
