import { test, expect, expectAccessible } from './fixtures.js';

test('video stories expose native and embedded players', async ({
  page,
}, testInfo) => {
  // Keep the third-party player out of the assertions below.
  await page.route('https://player.vimeo.com/**', (route) => route.abort());
  await page.goto(
    '/iframe.html?id=components-videos--all-states&viewMode=story&globals=a11y.manual:!true',
  );
  await expect(page.locator('video')).toHaveCount(2);
  await expect(page.locator('iframe[title]')).toHaveCount(2);
  await expect(
    page.locator('[data-cods-fixture-state="embed"] iframe'),
  ).toHaveAttribute(
    'src',
    /^https:\/\/player\.vimeo\.com\/video\/\d+\?.*\bdnt=1\b/,
  );
  const embedded = page.frameLocator(
    '[data-cods-fixture-state="embed-local-stand-in"] iframe',
  );
  await expect(
    embedded.locator('video[controls] track[kind="captions"]'),
  ).toHaveCount(1);
  await expectAccessible(page, testInfo, 'body');
});
