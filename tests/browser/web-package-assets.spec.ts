import { resolve, sep } from 'node:path';
import { test } from './fixtures.js';
import { expectPackageAssets } from './package-assets.js';
import { expectCheckboxAssets } from './checkbox-assets.js';

test('packaged checkbox glyphs preserve their colors on actual state backgrounds', async ({
  page,
}) => {
  await expectCheckboxAssets(page, '/accordion/');
});

test('Astro loads packaged fonts and Phosphor accordion icons', async ({
  page,
}) => {
  await expectPackageAssets(page, '/accordion/');
});

test('static HTML consumer loads fonts and icons relative to its copied stylesheet', async ({
  page,
}) => {
  const output = resolve('examples/static-html/dist');
  // Serve the actual static consumer under a nested mount in the existing
  // preview. This exercises its relative URLs without another server/port.
  await page.route('**/__cods_static__/**', (route) => {
    const pathname = decodeURIComponent(
      new URL(route.request().url()).pathname,
    );
    const path = resolve(
      output,
      pathname.replace(/^\/__cods_static__\//, '') || 'index.html',
    );
    if (!path.startsWith(output + sep)) return route.fulfill({ status: 403 });
    return route.fulfill({ path });
  });
  await expectPackageAssets(page, '/__cods_static__/');
});
