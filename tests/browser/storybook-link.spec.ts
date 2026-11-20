import { readFileSync } from 'node:fs';
import { expectSharedIcons } from './link-checks.js';
import { test, expect, expectAccessible } from './fixtures.js';

// The docs page previews the common variants in all three browsers. These
// cover the fixture states it does not show, in Storybook Chromium.
const allStates =
  '/iframe.html?id=components-link--all-states&viewMode=story&globals=a11y.manual:!true';
const scope = '#storybook-root';
const state = (name: string) => `${scope} [data-cods-fixture-state="${name}"]`;

test('long, Spanish, Arabic, phone, and download states reflow at 320px', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(allStates);
  for (const name of [
    'long-content',
    'localization',
    'rtl',
    'phone',
    'download',
  ])
    expect(
      await page
        .locator(state(name))
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
      name,
    ).toBe(true);
  await expectAccessible(page, testInfo, scope);
});

test('phone and download icons use shared artwork and the download saves the icon index', async ({
  page,
}) => {
  await page.goto(allStates);
  await expectSharedIcons(
    page.locator(
      `${state('phone')} .cods-link__icon, ${state('download')} .cods-link__icon`,
    ),
  );
  const link = page.locator(`${state('download')} a`);
  await expect(link).toHaveAccessibleName('Icon index (JSON)');
  const expected = readFileSync(
    'packages/colorado-design-system/dist/icons/catalog.json',
  );
  const bytes = await link.evaluate(async (element) => {
    const response = await fetch((element as HTMLAnchorElement).href);
    if (!response.ok)
      throw new Error(`Download file returned ${response.status}`);
    return [...new Uint8Array(await response.arrayBuffer())];
  });
  expect(Buffer.compare(Buffer.from(bytes), expected)).toBe(0);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    link.click(),
  ]);
  expect(download.suggestedFilename()).toBe('cods-icon-index.json');
  // Intercepted built files validate bytes and download intent, but Chromium
  // cannot finish native downloads through route.fulfill(). The normal
  // preview suite also verifies the saved file end to end.
  if (process.env.CODS_BUILT_FILES !== '1')
    expect(
      Buffer.compare(readFileSync((await download.path())!), expected),
    ).toBe(0);
});
