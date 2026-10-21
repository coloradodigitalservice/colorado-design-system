import { readFileSync } from 'node:fs';
import { test, expect } from './fixtures.js';

const css = readFileSync(
  'packages/colorado-design-tokens/generated/tokens.css',
  'utf8',
);

test('component aliases follow semantic customization without changing palette values', async ({
  page,
}) => {
  await page.setContent(`<!doctype html><html lang="en"><head><title>Token catalog consumer</title><style>${css}</style></head><body>
    <span id="teal" style="background-color:var(--cods-component-tag-teal-background);color:var(--cods-component-tag-teal-text)">Teal tag</span>
    <span id="blue" style="background-color:var(--cods-component-tag-blue-background)">Blue tag</span>
    <span id="palette" style="background-color:var(--cods-color-co-teal-20)">Palette</span>
  </body></html>`);
  const teal = page.locator('#teal');
  await expect(teal).toHaveCSS('background-color', 'rgb(174, 206, 212)');
  await expect(teal).toHaveCSS('color', 'rgb(26, 50, 63)');
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      '--cods-color-surface-tag-teal',
      '#123456',
    ),
  );
  await expect(teal).toHaveCSS('background-color', 'rgb(18, 52, 86)');
  await expect(page.locator('#blue')).toHaveCSS(
    'background-color',
    'rgb(170, 205, 236)',
  );
  await expect(page.locator('#palette')).toHaveCSS(
    'background-color',
    'rgb(174, 206, 212)',
  );
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      '--cods-component-tag-teal-background',
      '#654321',
    ),
  );
  await expect(teal).toHaveCSS('background-color', 'rgb(101, 67, 33)');
});

test('gray and yellow tags follow the shared default text role through both aliases', async ({
  page,
}) => {
  await page.setContent(`<!doctype html><html lang="en"><head><title>Shared text role</title><style>${css}</style></head><body>
    <span id="body" style="color:var(--cods-color-text-primary)">Body</span>
    <span id="gray" style="color:var(--cods-component-tag-gray-text)">Gray tag</span>
    <span id="yellow" style="color:var(--cods-component-tag-yellow-text)">Yellow tag</span>
    <span id="blue" style="color:var(--cods-component-tag-blue-text)">Blue tag</span>
    <span id="palette" style="color:var(--cods-color-co-gray-90)">Palette</span>
  </body></html>`);
  for (const id of ['body', 'gray', 'yellow'])
    await expect(page.locator(`#${id}`)).toHaveCSS('color', 'rgb(27, 27, 27)');
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      '--cods-color-text-primary',
      '#123456',
    ),
  );
  for (const id of ['body', 'gray', 'yellow'])
    await expect(page.locator(`#${id}`)).toHaveCSS('color', 'rgb(18, 52, 86)');
  await expect(page.locator('#blue')).toHaveCSS('color', 'rgb(0, 16, 73)');
  await expect(page.locator('#palette')).toHaveCSS('color', 'rgb(27, 27, 27)');
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      '--cods-component-tag-gray-text',
      '#654321',
    ),
  );
  await expect(page.locator('#gray')).toHaveCSS('color', 'rgb(101, 67, 33)');
  await expect(page.locator('#yellow')).toHaveCSS('color', 'rgb(18, 52, 86)');
});
