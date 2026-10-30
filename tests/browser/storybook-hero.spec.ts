import { test, expect, expectAccessible } from './fixtures.js';

const story = '/iframe.html?id=components-hero--all-states&viewMode=story';

test('hero preserves image placement, action order, and reflow', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(story);
  const hero = page.locator('.cods-hero--image');
  const image = hero.locator('.cods-hero__image');
  const content = hero.locator('.cods-hero__content');
  await expect(image).toBeVisible();
  expect(
    await image.evaluate((el: HTMLImageElement) => el.naturalWidth),
  ).toBeGreaterThan(0);
  expect((await image.boundingBox())!.y).toBeLessThan(
    (await content.boundingBox())!.y,
  );
  for (const item of await page.locator('.cods-hero').all()) {
    expect(await item.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
  }
  await expectAccessible(page, testInfo, '#storybook-root');
  await page.setViewportSize({ width: 1440, height: 800 });
  expect((await hero.boundingBox())!.height).toBe(323);
  expect((await image.boundingBox())!.x).toBeGreaterThan(
    (await content.boundingBox())!.x,
  );
  await page.keyboard.press('Tab');
  await expect(page.locator('.cods-hero__actions a').first()).toBeFocused();
});
