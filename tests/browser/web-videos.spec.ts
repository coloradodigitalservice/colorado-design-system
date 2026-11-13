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
  const providerEmbed = page.locator(
    '[data-cods-fixture-state="embed"] iframe',
  );
  await expect(providerEmbed).toHaveAttribute('title', /\S/);
  await expect(providerEmbed).toHaveAttribute(
    'src',
    /^https:\/\/player\.vimeo\.com\/video\/\d+\?.*\bdnt=1\b/,
  );
  await providerEmbed.scrollIntoViewIfNeeded();
  await expect(
    page.frameLocator('[data-cods-fixture-state="embed"] iframe').locator('p'),
  ).toHaveText('Mock video player');
  const standIn = page.locator(
    '[data-cods-fixture-state="embed-local-stand-in"] iframe',
  );
  await expect(standIn).toHaveAttribute('title', /stand-in/i);
  for (const wrapper of [providerEmbed, standIn]) {
    const box = wrapper.locator('xpath=..');
    expect(await box.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
  }
  const fourThree = page.locator(
    '[data-cods-fixture-state="four-three"] .cods-videos',
  );
  await expect(fourThree).toHaveCSS('aspect-ratio', '4 / 3');
  await standIn.scrollIntoViewIfNeeded();
  const embedded = page.frameLocator(
    '[data-cods-fixture-state="embed-local-stand-in"] iframe',
  );
  await expect(
    embedded.locator('video[controls] track[kind="captions"]'),
  ).toHaveCount(1);
  await expectAccessible(page, testInfo, 'article');
});
