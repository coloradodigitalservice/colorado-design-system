import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';
import {
  checkComponentAssets,
  loadComponents,
  packageRoot,
} from './component-fixtures.mjs';

export const output = fileURLToPath(
  new URL('../examples/static-html/dist/', import.meta.url),
);
export function exampleHTML() {
  const escape = (text) =>
    text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CoDS package examples</title><link rel="stylesheet" href="assets/colorado-design-system.css"></head>
<body><main><h1>CoDS package examples</h1>${loadComponents()
    .map((component) => {
      const metadata = JSON.parse(
        readFileSync(
          resolve(packageRoot, 'dist/metadata', `${component.name}.json`),
          'utf8',
        ),
      );
      const fixture = readFileSync(
        resolve(packageRoot, 'dist/fixtures', `${component.name}.html`),
        'utf8',
      );
      return `<article><h2>${escape(metadata.displayName)} (${metadata.maturity})</h2>${fixture}</article>`;
    })
    .join(
      '',
    )}</main><script type="module">import { initAllAccordions } from './assets/colorado-design-system.mjs'; initAllAccordions();</script></body></html>\n`;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  checkComponentAssets();
  if (process.argv.includes('--check')) {
    if (readFileSync(resolve(output, 'index.html'), 'utf8') !== exampleHTML())
      throw new Error('Static package example drift; rebuild');
  } else {
    mkdirSync(output, { recursive: true });
    cpSync(resolve(packageRoot, 'dist'), resolve(output, 'assets'), {
      recursive: true,
    });
    writeFileSync(resolve(output, 'index.html'), exampleHTML());
  }
}
