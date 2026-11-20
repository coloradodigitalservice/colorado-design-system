// Videos documentation page. Videos has no controller, so this covers the
// page outline and the wrapper's geometry for the previewed states in every
// browser. Iframe title and provider-URL rules are enforced at fixture
// generation (tests/component-fixtures.test.ts); every fixture state, including
// the local embed stand-in, is smoke- and axe-tested in Storybook.
import { test, expect, expectAccessible } from './fixtures.js';

const preview = (name: string) => `[data-cods-docs-preview-state="${name}"]`;

test('videos page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/videos/');
  const main = page.locator('main');
  expect(await main.locator('h2').allTextContents()).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  const subheadings = await main.locator('h3').allTextContents();
  for (const heading of [
    'When to use',
    'Accessibility for videos',
    'Variants and elements',
    'Native video',
    'Embedded players',
    'Limitations',
  ])
    expect(subheadings).toContain(heading);

  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(3);
  // Native previews never autoplay, keep controls, and carry captions.
  for (const state of ['default', 'four-three']) {
    const video = page.locator(`${preview(state)} video`);
    await expect(video).toHaveAccessibleName(/\S/);
    expect(
      await video.evaluate(
        (element: HTMLVideoElement) =>
          element.controls &&
          !element.autoplay &&
          Array.from(element.textTracks).some(
            (track) => track.kind === 'captions',
          ),
      ),
    ).toBe(true);
  }
  const embed = page.locator(`${preview('embed')} iframe`);
  await expect(embed).toHaveAccessibleName(/\S/);
  await embed.scrollIntoViewIfNeeded();
  await expect(
    page.frameLocator(`${preview('embed')} iframe`).locator('p'),
  ).toHaveText('Mock video player');

  // The wrapper sets the ratio and its player fills it at 320px.
  for (const [state, ratio] of [
    ['default', 16 / 9],
    ['embed', 16 / 9],
    ['four-three', 4 / 3],
  ] as const) {
    const wrapper = page.locator(`${preview(state)} .cods-videos`);
    const box = (await wrapper.boundingBox())!;
    const player = (await wrapper
      .locator(':scope > video, :scope > iframe')
      .boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(ratio, 1);
    expect(player.width).toBeCloseTo(box.width, 0);
    expect(player.height).toBeCloseTo(box.height, 0);
  }

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('Manual accessibility review');
  await expect(status).toContainText('is pending');
  await expect(status).toContainText('Videos is CoDS-authored');
  // The public page omits localization guidance and the examples catalogue.
  await expect(main).not.toContainText(/right-to-left|localization/i);
  await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(0);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo);
});
