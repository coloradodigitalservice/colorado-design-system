import { loadComponents } from '../../scripts/component-fixtures.mjs';
import {
  componentMarkup,
  previewCode,
} from '../../apps/web/src/lib/preview-markup.mjs';
import { test, expect } from './fixtures.js';

for (const component of loadComponents()) {
  test(`${component.name} docs use current metadata and every generated code sample`, async ({
    page,
  }) => {
    await page.goto(`/${component.name}/`);
    const previewCodeBlock = page.locator('[data-cods-docs-preview-code] code');
    if (await previewCodeBlock.count()) {
      // Hardened pages show a curated preview instead of every fixture state.
      // Each previewed state and the code block must match the fixture exactly.
      await expect(page.locator('[data-cods-docs-status]')).toContainText(
        `${component.metadata.displayName} maturity is ${component.metadata.maturity}`,
      );
      const figures = await page
        .locator('[data-cods-docs-preview-state]')
        .evaluateAll((elements) =>
          elements.map((element) => ({
            state: element.getAttribute('data-cods-docs-preview-state')!,
            label: element.getAttribute('data-cods-docs-preview-label')!,
          })),
        );
      expect(figures.length).toBeGreaterThan(0);
      const spriteUrl = await page
        .locator('[data-cods-docs-preview]')
        .getAttribute('data-cods-docs-preview-sprite');
      const items = figures.map(({ state, label }) => {
        const example = component.examples.examples.find(
          (candidate) => candidate.state === state,
        );
        expect(
          example,
          `${component.name} preview state ${state}`,
        ).toBeDefined();
        return {
          label,
          markup: componentMarkup(example!.code, spriteUrl ?? undefined),
        };
      });
      expect(await previewCodeBlock.textContent()).toBe(previewCode(items));
      return;
    }
    await expect(
      page
        .getByText(
          `${component.metadata.displayName} maturity: ${component.metadata.maturity}.`,
          { exact: true },
        )
        .first(),
    ).toBeVisible();
    for (const example of component.examples.examples) {
      const sample = page.locator(`[data-cods-example="${example.state}"]`);
      expect(await sample.locator('code').textContent()).toBe(example.code);
      if (example.status === 'review-required')
        await expect(sample.locator('p')).toHaveText(
          `Review required: ${example.instructions}`,
        );
    }
  });
}
