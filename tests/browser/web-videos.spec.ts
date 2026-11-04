import { test, expect, expectAccessible } from './fixtures.js';

test('video examples have accessible media markup and fit narrow screens', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/videos/');
  const videos = page.locator('[data-cods-fixture-state] video');
  await expect(videos).toHaveCount(2);
  for (const video of await videos.all()) {
    await expect(video).toHaveAttribute('controls', '');
    await expect(video).not.toHaveAttribute('autoplay');
    await expect(video.locator('track[kind="captions"]')).toHaveCount(1);
  }
  const iframe = page.locator('[data-cods-fixture-state="embed"] iframe');
  await expect(iframe).toHaveAttribute('title', /\S/);
  const wrapper = page.locator(
    '[data-cods-fixture-state="embed"] .cods-videos',
  );
  expect(await wrapper.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  const fourThree = page.locator(
    '[data-cods-fixture-state="four-three"] .cods-videos',
  );
  await expect(fourThree).toHaveCSS('aspect-ratio', '4 / 3');
  await expectAccessible(page, testInfo, 'article');
});
