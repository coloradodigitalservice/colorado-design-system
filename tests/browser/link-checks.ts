import { readFileSync } from 'node:fs';
import type { Locator } from '@playwright/test';
import { expect } from './fixtures.js';

const iconIds = {
  'cods-link__icon--arrow': 'arrow-right',
  'cods-link__icon--external': 'arrow-square-out',
  'cods-link__icon--globe': 'globe',
  'cods-link__icon--phone': 'phone',
  'cods-link__icon--download': 'download',
} as const;

/** Each icon fills a 16px slot with the shared Phosphor artwork as its mask. */
export async function expectSharedIcons(icons: Locator) {
  expect(await icons.count()).toBeGreaterThan(0);
  for (const icon of await icons.all()) {
    await expect(icon).toHaveCSS('width', '16px');
    await expect(icon).toHaveCSS('height', '16px');
    const modifier = await icon.evaluate(
      (element, modifiers) =>
        modifiers.find((name) => element.classList.contains(name)),
      Object.keys(iconIds),
    );
    const id = iconIds[modifier as keyof typeof iconIds];
    const expected = readFileSync(
      `packages/colorado-design-system/dist/icons/${id}.svg`,
      'utf8',
    );
    const matches = await icon.evaluate(async (element, expected) => {
      const url = getComputedStyle(element).maskImage.match(
        /url\(["']?(.*?)["']?\)/,
      )?.[1];
      if (!url) return false;
      const response = await fetch(url);
      if (!response.ok) return false;
      const shape = (svg: string) => {
        const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
        return (
          document.documentElement.getAttribute('viewBox') +
          [...document.querySelectorAll('path')]
            .map((path) => path.getAttribute('d'))
            .join('|')
        );
      };
      return shape(await response.text()) === shape(expected);
    }, expected);
    expect(matches, `${id} uses the shared icon`).toBe(true);
  }
}
