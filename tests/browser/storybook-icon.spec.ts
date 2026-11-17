import { test, expect, expectAccessible } from './fixtures.js';

const story = '/iframe.html?id=components-icon--default&viewMode=story';

test('icon fixture distinguishes decorative and meaningful SVGs', async ({
  page,
}, testInfo) => {
  await page.goto(story);
  const root = page.locator('#storybook-root');
  await expect(root.locator('svg[aria-hidden="true"]')).toHaveCount(2);
  await expect(root.getByRole('img', { name: 'Search' })).toHaveCount(1);
  await expect(root.locator('svg[focusable="false"]')).toHaveCount(3);
  const dimensions = await root
    .locator('svg')
    .evaluateAll((icons) =>
      icons.map((icon) => [
        icon.getAttribute('width'),
        icon.getAttribute('height'),
      ]),
    );
  expect(dimensions).toEqual([
    ['24', '24'],
    ['24', '24'],
    ['24', '24'],
  ]);
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('only opted-in flow icons mirror in right-to-left direction', async ({
  page,
}) => {
  await page.goto(story);
  const root = page.locator('#storybook-root');
  const nextIcon = root.locator('.cods-icon--mirror-in-rtl');
  const nonMirroringIcon = root.getByRole('img', { name: 'Search' });

  await root.evaluate((element) => element.setAttribute('dir', 'rtl'));
  await expect(nextIcon).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)');
  await expect(nonMirroringIcon).toHaveCSS('transform', 'none');
  await nextIcon.evaluate((icon) =>
    icon.parentElement?.setAttribute('dir', 'ltr'),
  );
  await expect(nextIcon).toHaveCSS('transform', 'none');
});

test('icon size variants use the specified token dimensions without stretching', async ({
  page,
}) => {
  await page.goto(story);
  const small = page.locator('.cods-icon--small');
  const medium = page.locator(
    '.cods-icon--medium:not(.cods-icon--mirror-in-rtl)',
  );
  await expect(small).toHaveCSS('width', '16px');
  await expect(small).toHaveCSS('height', '16px');
  await expect(medium).toHaveCSS('width', '24px');
  await expect(medium).toHaveCSS('height', '24px');
  await expect(small).toHaveCSS('aspect-ratio', '1 / 1');
  await expect(medium).toHaveCSS('aspect-ratio', '1 / 1');
});

test('the story renders its icons from one local subset sprite', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('response', (response) => {
    if (/\/cods-sprite[.-][^/]+\.svg$/.test(new URL(response.url()).pathname))
      requests.push(response.url());
  });
  await page.goto(story);
  await expect.poll(() => requests.length).toBe(1);
  const uses = page.locator('#storybook-root svg use');
  await expect(uses).toHaveCount(3);
  const hrefs = await uses.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('href') ?? ''),
  );
  const paths = hrefs.map((href) => new URL(href, page.url()));
  expect(new Set(paths.map((url) => `${url.origin}${url.pathname}`)).size).toBe(
    1,
  );
  expect(paths.every((url) => url.origin === new URL(page.url()).origin)).toBe(
    true,
  );
  const response = await page.request.get(requests[0]!);
  expect(response.ok()).toBe(true);
  const sprite = await response.text();
  expect(Buffer.byteLength(sprite)).toBeLessThan(16_384);
  for (const url of paths)
    expect(sprite).toContain(`id="${url.hash.slice(1)}"`);
  await expect
    .poll(async () =>
      page.locator('#storybook-root svg').evaluateAll((icons) =>
        icons.every((icon) => {
          const box = (icon as SVGSVGElement).getBBox();
          return box.width > 0 && box.height > 0;
        }),
      ),
    )
    .toBe(true);
});
