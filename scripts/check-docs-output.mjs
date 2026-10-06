#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { JSDOM } from 'jsdom';
import { loadComponents, checkComponentAssets } from './component-fixtures.mjs';

const root = resolve(
  fileURLToPath(new URL('../apps/web/dist/', import.meta.url)),
);
const designSystemVersion = JSON.parse(
  readFileSync(
    new URL('../packages/colorado-design-system/package.json', import.meta.url),
    'utf8',
  ),
).version;
const pages = [];
const failures = [];

function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) visit(path);
    else if (entry.name.endsWith('.html')) pages.push(path);
  }
}

checkComponentAssets();
for (const component of loadComponents()) {
  const page = join(root, component.name, 'index.html');
  if (!existsSync(page)) {
    failures.push(`${component.name}: missing documentation page`);
    continue;
  }
  const dom = new JSDOM(readFileSync(page, 'utf8'));
  for (const example of component.examples.examples) {
    const code = dom.window.document.querySelector(
      `[data-cods-example="${example.state}"] code`,
    );
    if (code?.textContent !== example.code)
      failures.push(
        `${component.name}/${example.state}: documentation code drift`,
      );
  }
  dom.window.close();
}
visit(root);
if (!pages.length) failures.push('No static HTML pages were generated');

for (const page of pages) {
  const document = new JSDOM(readFileSync(page, 'utf8')).window.document;
  const label = page.slice(root.length + 1);
  if (document.documentElement.lang !== 'en')
    failures.push(`${label}: missing language`);
  for (const landmark of ['header', 'main', 'footer']) {
    if (document.querySelectorAll(landmark).length !== 1)
      failures.push(`${label}: expected exactly one ${landmark} landmark`);
  }
  if (document.querySelectorAll('nav[aria-label="Documentation"]').length !== 1)
    failures.push(`${label}: missing labeled documentation navigation`);
  if (document.querySelectorAll('h1').length !== 1)
    failures.push(`${label}: expected exactly one h1`);
  const release = document.querySelector('footer [data-cods-release]');
  if (release?.getAttribute('data-cods-release') !== designSystemVersion)
    failures.push(`${label}: footer must show release ${designSystemVersion}`);
  const main = document.querySelector('main[id]');
  if (!main || !document.querySelector(`a[href="#${main.id}"]`))
    failures.push(`${label}: skip link does not target main`);

  for (const anchor of document.querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href');
    if (!href) continue;
    if (!anchor.textContent?.trim()) failures.push(`${label}: empty link text`);
    if (href.startsWith('#')) {
      if (!document.getElementById(href.slice(1)))
        failures.push(`${label}: broken ${href}`);
    } else if (href.startsWith('/')) {
      const target = new URL(href, 'https://docs.example.gov');
      const output = join(root, target.pathname, 'index.html');
      if (!existsSync(output)) failures.push(`${label}: broken ${href}`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) process.stderr.write(`✗ ${failure}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `✓ ${pages.length} static documentation pages: links and structural accessibility checks passed\n`,
  );
}
