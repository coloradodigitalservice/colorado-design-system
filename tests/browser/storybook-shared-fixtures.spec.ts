import { loadComponents } from '../../scripts/component-fixtures.mjs';
import { test, expect } from './fixtures.js';

const storyNames: Record<string, string> = {
  localization: 'spanish',
  rtl: 'right-to-left',
};
for (const component of loadComponents()) {
  for (const example of component.examples.examples) {
    const story =
      component.name === 'site-alert' && example.state === 'rtl'
        ? 'arabic-rtl'
        : (storyNames[example.state] ?? example.state);
    test(`${component.name}/${example.state} Storybook renders the current canonical content`, async ({
      page,
    }) => {
      await page.goto(
        `/iframe.html?id=components-${component.name}--${story}&viewMode=story`,
      );
      const block = page.locator(
        `#storybook-root [data-cods-fixture-state="${example.fixtureState}"]`,
      );
      await expect(block).toBeVisible();
      const contentMatches = await block.evaluate((element, html) => {
        const template = document.createElement('template');
        template.innerHTML = html;
        const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
        return (
          normalize(element.textContent ?? '') ===
          normalize(template.content.textContent ?? '')
        );
      }, example.html);
      expect(contentMatches).toBe(true);
      if (example.setup === 'expand' || example.setup === 'collapse')
        await expect(block.locator('button').first()).toHaveAttribute(
          'aria-expanded',
          example.setup === 'expand' ? 'true' : 'false',
        );
    });
  }
}
