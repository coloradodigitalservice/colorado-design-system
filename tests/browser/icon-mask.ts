import { readFileSync } from 'node:fs';
import type { Locator } from '@playwright/test';
import { expect } from './fixtures.js';

// Check the actual packaged artwork, box, placement, and foreground/surface pair.
export async function expectPhosphorMask(
  body: Locator,
  id: string,
  expected: { size: number; inset: number; top: number; color?: string },
) {
  const style = await body.evaluate((element) => {
    const icon = getComputedStyle(element, '::before');
    const surface = getComputedStyle(element);
    const luminance = (rgb: string) => {
      const channels = rgb
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number);
      const linear = channels.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
    };
    const pair = [
      luminance(icon.backgroundColor),
      luminance(surface.backgroundColor),
    ].sort((a, b) => b - a);
    return {
      mask: icon.maskImage,
      // USWDS adds a transparent gradient mask layer for WebKit support.
      size: icon.maskSize.split(',')[0]!.trim(),
      width: icon.width,
      height: icon.height,
      inset: icon.insetInlineStart,
      top: icon.top,
      color: icon.backgroundColor,
      contrast: (pair[0]! + 0.05) / (pair[1]! + 0.05),
    };
  });
  expect(style).toMatchObject({
    width: `${expected.size}px`,
    height: `${expected.size}px`,
    size: 'contain',
    inset: `${expected.inset}px`,
    top: `${expected.top}px`,
    ...(expected.color ? { color: expected.color } : {}),
  });
  expect(
    style.contrast,
    `${id} foreground against its actual surface`,
  ).toBeGreaterThanOrEqual(3);
  const url = style.mask.match(/url\(["']?(.*?)["']?\)/)?.[1];
  expect(url).toBeTruthy();
  const expectedSvg = readFileSync(
    `packages/colorado-design-system/dist/icons/${id}.svg`,
    'utf8',
  );
  const matches = await body.page().evaluate(
    async ({ url, expectedSvg }) => {
      const response = await fetch(url!);
      if (!response.ok) return false;
      const identity = (source: string) => {
        const document = new DOMParser().parseFromString(
          source,
          'image/svg+xml',
        );
        if (document.querySelector('parsererror'))
          throw new Error('Invalid icon SVG');
        return {
          viewBox: document.documentElement.getAttribute('viewBox'),
          paths: [...document.querySelectorAll('path')].map((path) =>
            path.getAttribute('d'),
          ),
        };
      };
      return (
        JSON.stringify(identity(await response.text())) ===
        JSON.stringify(identity(expectedSvg))
      );
    },
    { url, expectedSvg },
  );
  expect(matches, `${id} uses the shared Phosphor Regular artwork`).toBe(true);
}
