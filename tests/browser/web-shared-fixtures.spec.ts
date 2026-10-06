import { loadComponents } from '../../scripts/component-fixtures.mjs';
import { test, expect } from './fixtures.js';

for (const component of loadComponents()) {
  test(`${component.name} docs use current metadata and every generated code sample`, async ({
    page,
  }) => {
    await page.goto(`/${component.name}/`);
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
