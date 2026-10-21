#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { JSDOM } from 'jsdom';
import { loadComponents, checkComponentAssets } from './component-fixtures.mjs';

const root = resolve(
  fileURLToPath(new URL('../apps/web/dist/', import.meta.url)),
);
const basePath = (process.env.PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
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
  const pagePath = relative(root, page).split(sep).join('/');
  const pageUrl = new URL(
    `${basePath}/${pagePath.replace(/index\.html$/, '')}`,
    'https://docs.example.gov',
  );
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
    } else {
      const target = new URL(href, pageUrl);
      if (target.origin !== pageUrl.origin) continue;
      if (basePath && !target.pathname.startsWith(`${basePath}/`)) {
        failures.push(
          `${label}: link is missing the deployment base path: ${href}`,
        );
        continue;
      }
      const targetPath = basePath
        ? target.pathname.slice(basePath.length)
        : target.pathname;
      const output = join(
        root,
        decodeURIComponent(targetPath).replace(/^\/+/, ''),
        targetPath.endsWith('/') ? 'index.html' : '',
      );
      if (!existsSync(output)) failures.push(`${label}: broken ${href}`);
    }
  }

  for (const resource of document.querySelectorAll(
    'link[href], script[src], img[src]',
  )) {
    const attribute = resource.hasAttribute('href') ? 'href' : 'src';
    const href = resource.getAttribute(attribute);
    if (!href) continue;
    const target = new URL(href, pageUrl);
    if (target.origin !== pageUrl.origin) continue;
    if (basePath && !target.pathname.startsWith(`${basePath}/`)) {
      failures.push(
        `${label}: asset is missing the deployment base path: ${href}`,
      );
      continue;
    }
    const targetPath = basePath
      ? target.pathname.slice(basePath.length)
      : target.pathname;
    const output = join(
      root,
      decodeURIComponent(targetPath).replace(/^\/+/, ''),
    );
    if (!existsSync(output)) failures.push(`${label}: missing asset ${href}`);
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
