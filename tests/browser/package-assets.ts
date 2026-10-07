import type { Page } from '@playwright/test';
import { expect } from './fixtures.js';

export async function expectPackageAssets(page: Page, url: string) {
  await page.goto(url);
  const result = await page.evaluate(async () => {
    const families = ['Open Sans', 'Museo Slab', 'Source Code Pro'];
    const faces = Array.from(document.fonts).filter((face) =>
      families.includes(face.family.replace(/["']/g, '')),
    );
    await Promise.all(
      faces.map((face) =>
        document.fonts.load(`${face.style} ${face.weight} 16px ${face.family}`),
      ),
    );
    const icons: string[] = [];
    // Use the real USWDS accordion selectors to exercise both icon states.
    for (const expanded of ['false', 'true']) {
      const button = document.createElement('button');
      button.className = 'usa-accordion__button';
      button.setAttribute('aria-expanded', expanded);
      button.textContent = 'Asset probe';
      document.body.append(button);
      const background = getComputedStyle(button).backgroundImage;
      button.remove();
      const match = background.match(/^url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);
      const url = match?.[1] ?? match?.[2] ?? match?.[3];
      if (!url)
        throw new Error(`Missing accordion icon for expanded=${expanded}`);
      const image = new Image();
      image.src = url;
      await image.decode();
      if (!image.naturalWidth) throw new Error(`Empty icon: ${url}`);
      icons.push(url);
    }
    return {
      families: [
        ...new Set(faces.map((face) => face.family.replace(/["']/g, ''))),
      ].sort(),
      loaded:
        faces.length > 0 && faces.every((face) => face.status === 'loaded'),
      icons,
    };
  });
  expect(result.families).toEqual([
    'Museo Slab',
    'Open Sans',
    'Source Code Pro',
  ]);
  expect(result.loaded).toBe(true);
  expect(new Set(result.icons).size).toBe(2);
}
