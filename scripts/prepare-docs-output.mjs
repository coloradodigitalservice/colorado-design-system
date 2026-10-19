#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { JSDOM } from 'jsdom';

const basePath = (process.env.PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

const root = resolve(
  fileURLToPath(new URL('../apps/web/dist/', import.meta.url)),
);

function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(path);
      continue;
    }
    if (!entry.name.endsWith('.html')) continue;

    const dom = new JSDOM(readFileSync(path, 'utf8'));
    const relativePath = path
      .slice(root.length + 1)
      .split('/')
      .join('/');
    const pageUrl = `https://docs.example.gov/${relativePath}`;
    for (const anchor of dom.window.document.querySelectorAll(
      'article a[href]',
    )) {
      const href = anchor.getAttribute('href');
      if (
        href.startsWith('#') ||
        href.startsWith('//') ||
        /^[a-z][a-z\d+.-]*:/i.test(href)
      )
        continue;
      const target = new URL(href, pageUrl);
      if (target.origin !== 'https://docs.example.gov') continue;
      const targetPath =
        basePath && !target.pathname.startsWith(`${basePath}/`)
          ? `${basePath}${target.pathname}`
          : target.pathname;
      anchor.setAttribute(
        'href',
        `${targetPath}${target.search}${target.hash}`,
      );
    }
    writeFileSync(path, dom.serialize());
    dom.window.close();
  }
}

visit(root);
