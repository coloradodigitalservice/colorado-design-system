// Shared by ComponentPreview.astro and scripts/check-docs-output.mjs so the
// rendered preview code and the drift check derive markup identically.

/**
 * Strip a canonical fixture state's demonstration wrapper (a `<section>`, or a
 * `<div>` carrying `data-cods-fixture-state`, and its `<h2>` label) and
 * dedent, leaving only the component markup.
 * @param {string} code Generated example code for one fixture state.
 * @returns {string}
 * @param {string} [spriteUrl] Built shared sprite URL for previews with icons.
 */
export function componentMarkup(code, spriteUrl) {
  const markup = spriteUrl
    ? code.replaceAll('/icons/sprite.svg', () => spriteUrl)
    : code;
  const wrapper =
    markup.match(/^\s*<div\b[^>]*\bdata-cods-fixture-state=/) &&
    /\n\s*<\/div>\s*$/.test(markup)
      ? 'div'
      : 'section';
  const lines = markup
    .replace(new RegExp(`^\\s*<${wrapper}\\b[^>]*>\\s*\\n`), '')
    .replace(new RegExp(`\\n\\s*<\\/${wrapper}>\\s*$`), '')
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

/**
 * Prefix a fixture's root-relative `/images/` URLs (in `src` and `srcset`)
 * with the site's deployment base, so previews load on a project base path.
 * The preview and its code block both use the result.
 * @param {string} markup Component markup from `componentMarkup`.
 * @param {string} [base] Site base path, for example `/colorado-design-system/`.
 * @returns {string}
 */
export function withImageBase(markup, base) {
  if (!base) return markup;
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return markup.replace(/(["\s])\/images\//g, (_, before) => {
    return `${before}${prefix}images/`;
  });
}
