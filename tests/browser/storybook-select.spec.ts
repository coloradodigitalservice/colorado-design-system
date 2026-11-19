import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const fixture = readFileSync(
  'packages/colorado-design-system/src/components/select/select.fixture.html',
  'utf8',
);

test('Storybook Select uses the canonical fixture and native input', async ({
  page,
}, testInfo) => {
  await page.goto(
    '/iframe.html?id=components-select--all-states&viewMode=story&globals=a11y.manual:!true',
  );
  const root = page.locator('#storybook-root');
  await expect(root.getByRole('combobox')).toHaveCount(9);
  const expected = Array.from(
    fixture.matchAll(/<select[^>]*\bid="([^"]+)"/g),
    (match) => match[1],
  );
  expect(
    await root
      .locator('select')
      .evaluateAll((controls) => controls.map((control) => control.id)),
  ).toEqual(expected);
  const control = root.locator('#select-default');
  await control.selectOption('denver');
  await expect(control).toHaveValue('denver');
  await control.focus();
  await expect(control).toHaveCSS(
    'box-shadow',
    'rgb(255, 255, 255) 0px 0px 0px 2px, rgb(23, 59, 179) 0px 0px 0px 4px',
  );
  await expectAccessible(page, testInfo, '#storybook-root');
  await page.evaluate(() => document.fonts.ready);
  await testInfo.attach('select-all-states', {
    body: await root.screenshot(),
    contentType: 'image/png',
  });
});

// Moved from web-select.spec.ts when the docs page switched to a curated
// preview: RTL and long content are not shown on the page, so these checks
// now run in Chromium only.
test('Storybook Select reflows at 320px and moves the arrow for RTL', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(
    '/iframe.html?id=components-select--all-states&viewMode=story&globals=a11y.manual:!true',
  );
  const root = page.locator('#storybook-root');
  await expect(root.locator('#select-long-content')).toBeVisible();
  const overflow = await root
    .locator('.cods-select')
    .evaluateAll((groups) =>
      groups.some(
        (group) =>
          group.scrollWidth > Math.ceil(group.getBoundingClientRect().width),
      ),
    );
  expect(overflow).toBe(false);
  const rtl = root.locator('#select-rtl');
  await expect(rtl).toHaveCSS('direction', 'rtl');
  await expect(rtl).toHaveCSS('background-size', '24px 24px');
  expect(
    await rtl.evaluate((el) => getComputedStyle(el).backgroundPosition),
  ).toContain('8px');
  const source = readFileSync(
    'packages/colorado-design-system/dist/icons/caret-down--1b1b1b.svg',
    'utf8',
  );
  const matches = await rtl.evaluate(async (el, source) => {
    const url = getComputedStyle(el).backgroundImage.slice(5, -2);
    const rendered = await (await fetch(url)).text();
    const parse = (svg: string) =>
      new DOMParser().parseFromString(svg, 'image/svg+xml');
    const a = parse(rendered);
    const b = parse(source);
    return (
      a.documentElement.getAttribute('viewBox') ===
        b.documentElement.getAttribute('viewBox') &&
      a.querySelector('path')?.getAttribute('d') ===
        b.querySelector('path')?.getAttribute('d') &&
      a.documentElement.getAttribute('fill') === '#1b1b1b'
    );
  }, source);
  expect(matches).toBe(true);
  await expectAccessible(page, testInfo, '#storybook-root');
  await testInfo.attach('select-all-states-320', {
    body: await root.screenshot(),
    contentType: 'image/png',
  });
});
