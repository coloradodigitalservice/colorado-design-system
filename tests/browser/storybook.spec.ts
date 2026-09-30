import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const index: { entries: Record<string, { id: string; type: string }> } =
  JSON.parse(
    readFileSync('apps/storybook/storybook-static/index.json', 'utf8'),
  );
const stories = Object.values(index.entries).filter(
  (entry) => entry.type === 'story',
);
if (!stories.length) throw new Error('The Storybook build contains no stories');

for (const story of stories) {
  test(`story smoke and accessibility: ${story.id}`, async ({ page }) => {
    const response = await page.goto(
      `/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`,
    );
    expect(response?.ok()).toBe(true);
    await expect(page.locator('#storybook-root')).not.toBeEmpty();
    await expect(page.locator('.sb-errordisplay')).not.toBeVisible();
    const results = await new AxeBuilder({ page })
      .include('#storybook-root')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations, story.id).toEqual([]);
  });
}
