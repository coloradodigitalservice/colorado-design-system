import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const story =
  '/iframe.html?id=components-site-alert--all-states&viewMode=story';
const fixture = readFileSync(
  'packages/colorado-design-system/src/components/site-alert/site-alert.fixture.html',
  'utf8',
);

test('package and Storybook preserve the canonical fixture and token styles', async ({
  page,
}, testInfo) => {
  expect(
    readFileSync(
      'packages/colorado-design-system/dist/fixtures/site-alert.html',
      'utf8',
    ),
  ).toBe(fixture);
  await page.goto(story);
  const root = page.locator('#storybook-root');
  await expect(root.locator('.cods-site-alert')).toHaveCount(7);
  const equivalent = await root.evaluate((element, html) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    const normalize = (node: ParentNode) =>
      [...node.querySelectorAll('.cods-site-alert')].map(
        (alert) => alert.outerHTML,
      );
    return (
      JSON.stringify(normalize(element)) ===
      JSON.stringify(normalize(template.content))
    );
  }, fixture);
  expect(equivalent).toBe(true);
  const defaultSurface = root.locator('.cods-site-alert__surface').first();
  await expect(defaultSurface).toHaveCSS(
    'background-color',
    'rgb(235, 236, 237)',
  );
  await expect(defaultSurface).toHaveCSS(
    'border-left-color',
    'rgb(0, 25, 112)',
  );
  await expect(
    root.locator('.cods-site-alert--emergency .cods-site-alert__surface'),
  ).toHaveCSS('border-left-color', 'rgb(181, 9, 9)');
  await expect(root.locator('.cods-site-alert__body').first()).toHaveCSS(
    'background-color',
    'rgb(235, 236, 237)',
  );
  await expect(
    root.locator('.cods-site-alert--emergency .cods-site-alert__body'),
  ).toHaveCSS('color', 'rgb(27, 27, 27)');
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('keyboard links have visible focus without moving focus to the notice', async ({
  page,
  browserName,
}) => {
  await page.goto(story);
  await expect(page.locator('.cods-site-alert').first()).toBeVisible();
  await page.keyboard.press(
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab',
  );
  const link = page.locator('.cods-site-alert__link').first();
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS('outline-style', 'solid');
  await expect(link).toHaveCSS('outline-width', '4px');
  await page.keyboard.press('Tab');
  await expect(page.locator('.cods-site-alert__link').nth(1)).toBeFocused();
});

test('320px reflow, localization, reduced motion, and forced colors', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto(story);
  await expect(page.locator('.cods-site-alert')).toHaveCount(7);
  for (const alert of await page.locator('.cods-site-alert').all()) {
    await expect(alert).toBeVisible();
    expect(
      await alert.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
  }
  await expect(page.locator('[dir=rtl] .cods-site-alert__surface')).toHaveCSS(
    'border-right-width',
    '8px',
  );
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('public customization wins without selector escalation', async ({
  page,
}) => {
  await page.goto(story);
  await expect(page.locator('.cods-site-alert').first()).toBeVisible();
  await page
    .locator('.cods-site-alert')
    .first()
    .evaluate((element) => {
      (element as HTMLElement).style.setProperty(
        '--cods-site-alert-padding',
        '32px',
      );
    });
  await expect(page.locator('.cods-site-alert__body').first()).toHaveCSS(
    'padding-top',
    '32px',
  );
});

test('layered USWDS preserves the existing Colorado button theme', async ({
  page,
}) => {
  await page.goto(story);
  await expect(page.locator('.cods-site-alert').first()).toBeVisible();
  await page.locator('#storybook-root').evaluate((element) => {
    const button = document.createElement('button');
    button.className = 'usa-button';
    button.textContent = 'Theme regression';
    element.append(button);
  });
  const button = page.getByRole('button', { name: 'Theme regression' });
  await expect(button).toHaveCSS('background-color', 'rgb(0, 25, 112)');
  await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  await button.hover();
  await expect(button).toHaveCSS('background-color', 'rgb(0, 16, 73)');
});
