import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Checks the first item of each Icon List against its token-based layout:
 * 16px icons below 768px and 24px from 768px, a 12px icon-to-text gap on the
 * reading side, text starting on the icon's line, and the icon centered on
 * that first line of text. A supporting paragraph after a lead sits 8px below
 * it at body size.
 */
export async function expectIconListLayout(page: Page, lists: Locator[]) {
  for (const width of [320, 767, 768]) {
    await page.setViewportSize({ width, height: 800 });
    for (const list of lists) {
      const measurements = await list
        .locator('li')
        .first()
        .evaluate((item) => {
          const icon = item.querySelector('svg')!.getBoundingClientRect();
          const content = item.querySelector('.cods-icon-list__content')!;
          const contentRect = content.getBoundingClientRect();
          const text =
            content.querySelector('p, strong')?.firstChild ??
            content.firstChild!;
          const range = document.createRange();
          range.selectNodeContents(text);
          const textRect = range.getBoundingClientRect();
          const rtl = getComputedStyle(item).direction === 'rtl';
          return {
            size: icon.width,
            gap: rtl
              ? icon.left - contentRect.right
              : contentRect.left - icon.right,
            textOffset: textRect.top - contentRect.top,
            alignment: Math.abs(
              icon.top + icon.height / 2 - (textRect.top + textRect.height / 2),
            ),
          };
        });
      expect(measurements.size).toBe(width < 768 ? 16 : 24);
      expect(measurements.gap).toBeCloseTo(12, 1);
      // A first paragraph must start on the same line as direct or bold text.
      expect(measurements.textOffset).toBeLessThan(5);
      expect(measurements.alignment).toBeLessThan(3);
    }
  }
}

export async function expectSupportingText(supporting: Locator) {
  await expect(supporting).toHaveCSS('margin-top', '8px');
  await expect(supporting).toHaveCSS('font-size', '16px');
  await expect(supporting).toHaveCSS('line-height', '24px');
}
