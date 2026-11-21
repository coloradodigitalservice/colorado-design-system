// Every Hero fixture state, including those the documentation preview omits
// (without a call to action, long right-to-left content). Layout breakpoints
// and image placement are covered in all three browsers by web-hero.spec.ts.
import { test, expect, expectAccessible } from './fixtures.js';

const story = '/iframe.html?id=components-hero--all-states&viewMode=story';

test('every hero state reflows, passes axe, and keeps its desktop height and action order', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(story);
  for (const item of await page.locator('.cods-hero').all()) {
    expect(await item.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
  }
  await expectAccessible(page, testInfo, '#storybook-root');
  await page.setViewportSize({ width: 1440, height: 800 });
  const hero = page.locator(
    '[data-cods-fixture-state="with-image"] .cods-hero',
  );
  expect((await hero.boundingBox())!.height).toBe(323);
  await page.keyboard.press('Tab');
  await expect(page.locator('.cods-hero__actions a').first()).toBeFocused();
});
