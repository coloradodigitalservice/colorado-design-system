import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';

export function contrastRatio(first, second) {
  function luminance(color) {
    if (color.colorSpace !== 'srgb' || color.alpha !== 1)
      throw new Error(
        'Contrast checks require opaque sRGB colors; specify compositing before adding transparent pairs',
      );
    const linear = color.components.map((c) =>
      c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
    );
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  }
  const a = luminance(first),
    b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export async function checkContrast(catalog) {
  const { pairs } = JSON.parse(
    await readFile(
      new URL('../references/contrast-pairs.json', import.meta.url),
      'utf8',
    ),
  );
  return pairs.map((pair) => {
    for (const path of [pair.foreground, pair.background]) {
      if (catalog.tokens.get(path)?.$type !== 'color')
        throw new Error(
          `${pair.name}: contrast token ${path} is missing or not a color`,
        );
    }
    const ratio = contrastRatio(
      catalog.resolved.get(pair.foreground),
      catalog.resolved.get(pair.background),
    );
    if (ratio < pair.minimum)
      throw new Error(
        `${pair.name}: contrast ${ratio.toFixed(2)}:1 is below ${pair.minimum}:1 (${pair.foreground} on ${pair.background}); review the design values, do not silently substitute colors`,
      );
    return { ...pair, ratio };
  });
}
