import { test } from './fixtures.js';
import { expectPackageAssets } from './package-assets.js';

test('Storybook loads packaged fonts and Phosphor accordion icons', async ({
  page,
}) => {
  await expectPackageAssets(
    page,
    '/iframe.html?id=components-accordion--default&viewMode=story&globals=a11y.manual:!true',
  );
});
