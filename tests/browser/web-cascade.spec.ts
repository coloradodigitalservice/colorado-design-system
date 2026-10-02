import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures.js';

const dist = resolve('packages/colorado-design-system/dist');
const fixtureHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Cascade fixture</title>
    <link rel="stylesheet" href="/__cods_dist__/colorado-design-system.css" />
    <style>
      @layer cods.components {
        :where(.cods-cascade-probe) { background-color: rgb(1, 2, 3); }
      }
    </style>
  </head>
  <body>
    <button type="button" id="probe" class="usa-button cods-cascade-probe">Probe</button>
    <button type="button" id="plain" class="usa-button">Plain</button>
    <div id="token" style="background-color: var(--cods-color-bg-action-primary)"></div>
  </body>
</html>`;

test.beforeEach(async ({ page }) => {
  await page.route('**/__cods_cascade_fixture__/', (route) =>
    route.fulfill({ contentType: 'text/html', body: fixtureHtml }),
  );
  await page.route('**/__cods_dist__/**', (route) => {
    const file = resolve(
      dist,
      decodeURIComponent(new URL(route.request().url()).pathname).replace(
        /^\/__cods_dist__\//,
        '',
      ),
    );
    if (!file.startsWith(dist + sep)) return route.fulfill({ status: 403 });
    return route.fulfill({ path: file });
  });
  const response = await page.goto('/__cods_cascade_fixture__/');
  expect(response?.ok()).toBe(true);
});

const background = (page: Page, id: string) =>
  page
    .locator(`#${id}`)
    .evaluate((element) => getComputedStyle(element).backgroundColor);

test('built stylesheet declares the layer order before any layered rule', () => {
  const css = readFileSync(`${dist}/colorado-design-system.css`, 'utf8');
  const withoutCharset = css.replace(/^@charset "[^"]+";/, '');
  expect(withoutCharset).toMatch(
    /^@layer uswds, ?cods\.reset, ?cods\.base, ?cods\.components, ?cods\.utilities;/,
  );
});

test('a low-specificity cods.components rule overrides USWDS', async ({
  page,
}) => {
  expect(await background(page, 'probe')).toBe('rgb(1, 2, 3)');
});

test('a consumer unlayered rule overrides cods.components', async ({
  page,
}) => {
  await page.addStyleTag({
    content: '.cods-cascade-probe { background-color: rgb(4, 5, 6); }',
  });
  expect(await background(page, 'probe')).toBe('rgb(4, 5, 6)');
});

test('cods.base color overrides still win over USWDS', async ({ page }) => {
  expect(await background(page, 'plain')).toBe(await background(page, 'token'));
});

test('self-hosted USWDS fonts still load from the uswds layer', async ({
  page,
}) => {
  const loaded = await page.evaluate(async () => {
    const faces = await document.fonts.load('400 16px "Open Sans"');
    return faces.length > 0 && faces.every((face) => face.status === 'loaded');
  });
  expect(loaded).toBe(true);
});
