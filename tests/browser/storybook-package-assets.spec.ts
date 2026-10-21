import { test } from './fixtures.js';
import { expectPackageAssets } from './package-assets.js';
import { expectCheckboxAssets } from './checkbox-assets.js';

test('Storybook checkbox integration preserves checked and mixed glyph colors', async ({
  page,
}) => {
  await expectCheckboxAssets(
    page,
    '/iframe.html?id=components-accordion--default&viewMode=story&globals=a11y.manual:!true',
  );
});

test('Storybook Chromium forced-colors uses the dark checkbox asset variants', async ({
  page,
}) => {
  await expectCheckboxAssets(
    page,
    '/iframe.html?id=components-accordion--default&viewMode=story&globals=a11y.manual:!true',
    'active',
  );
});

test('Storybook loads packaged fonts and Phosphor accordion icons', async ({
  page,
}) => {
  await expectPackageAssets(
    page,
    '/iframe.html?id=components-accordion--default&viewMode=story&globals=a11y.manual:!true',
  );
});
