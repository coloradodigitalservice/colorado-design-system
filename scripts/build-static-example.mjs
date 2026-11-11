import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';
import {
  checkComponentAssets,
  loadComponents,
  packageRoot,
} from './component-fixtures.mjs';
import {
  collectIconReferences,
  createSubsetSprite,
  readIconLibrary,
} from '../packages/colorado-design-system/src/icons/selection.mjs';

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
      const html = fixture
        .replaceAll('/icons/sprite.svg', './assets/selected/icons/sprite.svg')
        .replaceAll('../icons/catalog.json', './assets/icons/catalog.json');
      return `<article><h2>${escape(metadata.displayName)} (${metadata.maturity})</h2>${html}</article>`;
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
  const html = exampleHTML();
  const library = readIconLibrary(resolve(packageRoot, 'dist/icons'));
  const sprite = createSubsetSprite(
    library,
    collectIconReferences(library, html, 'static example'),
  );
  if (process.argv.includes('--check')) {
    if (readFileSync(resolve(output, 'index.html'), 'utf8') !== html)
      throw new Error('Static package example drift; rebuild');
    if (
      readFileSync(
        resolve(output, 'assets/selected/icons/sprite.svg'),
        'utf8',
      ) !== sprite
    )
      throw new Error('Static package example sprite drift; rebuild');
  } else {
    mkdirSync(output, { recursive: true });
    rmSync(resolve(output, 'assets/icons'), { recursive: true, force: true });
    cpSync(resolve(packageRoot, 'dist'), resolve(output, 'assets'), {
      recursive: true,
    });
    mkdirSync(resolve(output, 'assets/selected/icons'), { recursive: true });
    writeFileSync(resolve(output, 'assets/selected/icons/sprite.svg'), sprite);
    writeFileSync(resolve(output, 'index.html'), html);
  }
}
