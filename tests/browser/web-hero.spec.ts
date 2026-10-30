import { test, expect, expectAccessible } from './fixtures.js';

test('Hero documentation renders examples and accessible actions', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/hero/');
  const examples = page.locator('.cods-hero');
  await expect(examples).toHaveCount(4);
  const image = examples.locator('.cods-hero__image');
  await expect(image).toBeVisible();
  expect(
    await image.evaluate((element: HTMLImageElement) => element.naturalWidth),
  ).toBeGreaterThan(0);
  for (const example of await examples.all()) {
    expect(
      await example.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
  }
  await expectAccessible(page, testInfo, 'article');
});

test('desktop image is cropped without forcing the Hero taller, and long text can expand it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/hero/');
  const hero = page.locator('.cods-hero--image');
  await hero.evaluate((element: HTMLElement) => {
    element.style.width = '1440px';
    element.style.maxWidth = 'none';
  });
  await expect(hero).toHaveCSS('height', '323px');
  const image = hero.locator('.cods-hero__image');
  await expect(image).toHaveCSS('height', '323px');
  await hero.locator('.cods-hero__intro').evaluate((element) => {
    element.textContent = 'A longer introduction. '.repeat(100);
  });
  expect((await hero.boundingBox())!.height).toBeGreaterThan(323);
  expect(
    await hero.evaluate(
      (element) => element.scrollHeight <= element.clientHeight,
    ),
  ).toBe(true);
});
