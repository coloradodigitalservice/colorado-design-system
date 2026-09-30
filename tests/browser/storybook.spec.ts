import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test('all story fixtures render and pass axe', async ({ page, request }) => {
  const response = await request.get('/index.json');
  expect(response.ok()).toBe(true);
  const index = await response.json();
  const stories = Object.values(index.entries).filter(
    (entry): entry is { id: string; type: string } =>
      typeof entry === 'object' &&
      entry !== null &&
      'type' in entry &&
      entry.type === 'story',
  );
  expect(stories.length).toBeGreaterThan(0);
  for (const story of stories) {
    await page.goto(
      `/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`,
    );
    await expect(page.locator('#storybook-root')).not.toBeEmpty();
    await expect(page.locator('.sb-errordisplay')).not.toBeVisible();
    const results = await new AxeBuilder({ page })
      .include('#storybook-root')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, story.id).toEqual([]);
  }
});
