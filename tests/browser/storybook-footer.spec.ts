// Footer surface tokens across both canonical variants. Behavior, keyboard,
// forced colors, and reflow run on the docs page in web-footer.spec.ts.
import { test, expect } from './fixtures.js';

const story =
  '/iframe.html?id=components-footer--all-states&viewMode=story&globals=a11y.manual:!true';

test('both footer variants use the Figma surface tokens', async ({ page }) => {
  await page.goto(story);
  for (const footer of await page
    .locator('#storybook-root .cods-footer')
    .all()) {
    await expect(footer.locator('.cods-footer__primary-section')).toHaveCSS(
      'background-color',
      'rgb(251, 252, 253)',
    );
    await expect(footer.locator('.cods-footer__secondary-section')).toHaveCSS(
      'background-color',
      'rgb(244, 245, 246)',
    );
  }
  await expect(page.locator('.cods-footer__social-link').first()).toHaveCSS(
    'background-color',
    'rgb(235, 236, 237)',
  );
});
