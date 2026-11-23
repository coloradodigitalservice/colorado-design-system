// Shared by ComponentPreview.astro and scripts/check-docs-output.mjs so the
// rendered preview code and the drift check derive markup identically.

/**
 * Strip a canonical fixture state's demonstration wrapper (`<section>` and
 * its `<h2>` label) and dedent, leaving only the component markup.
 * @param {string} code Generated example code for one fixture state.
 * @returns {string}
 * @param {string} [spriteUrl] Built shared sprite URL for previews with icons.
 */
export function componentMarkup(code, spriteUrl) {
  const markup = spriteUrl
    ? code.replaceAll('/icons/sprite.svg', () => spriteUrl)
    : code;
  const lines = markup
    .replace(/^\s*<section[^>]*>\s*\n/, '')
    .replace(/\n\s*<\/section>\s*$/, '')
    .replace(/^\s*<h2>[^<]*<\/h2>\s*\n/, '')
    .split('\n');
  const indent = Math.min(
    ...lines
      .filter((line) => line.trim())
      .map((line) => line.match(/^ */)[0].length),
  );
  return lines.map((line) => line.slice(indent)).join('\n');
}

/**
 * The exact code block shown under a component preview.
 * @param {{ label: string, markup: string }[]} items
 * @returns {string}
 */
export function previewCode(items) {
  return items
    .map(({ label, markup }) => `<!-- ${label} -->\n${markup}`)
    .join('\n\n');
}
