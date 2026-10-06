import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const index: { entries: Record<string, { id: string; type: string }> } =
  JSON.parse(
    readFileSync('apps/storybook/storybook-static/index.json', 'utf8'),
  );
const stories = Object.values(index.entries).filter(
  (entry) => entry.type === 'story',
);
if (!stories.length) throw new Error('The Storybook build contains no stories');

for (const story of stories) {
  test(`story smoke and accessibility: ${story.id}`, async ({
    page,
  }, testInfo) => {
    const response = await page.goto(
      `/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story&globals=a11y.manual:!true`,
    );
    expect(response?.ok()).toBe(true);
    await expect(page.locator('#storybook-root')).not.toBeEmpty();
    await expect(page.locator('.sb-errordisplay')).not.toBeVisible();
    await expectAccessible(page, testInfo, '#storybook-root');
  });
}

test('preview returns 404 for a missing page', async ({ request }) => {
  const response = await request.get('/__cods_missing_page__/');
  expect(response.status()).toBe(404);
});
