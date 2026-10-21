import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from '@playwright/test';
import { expect } from './fixtures.js';

export async function expectCheckboxAssets(
  page: Page,
  url: string,
  forcedColors: 'none' | 'active' = 'none',
  options: { cods?: boolean } = {},
) {
  await page.goto(url);
  await page.evaluate((cods) => {
    const probe = document.createElement('fieldset');
    probe.id = 'checkbox-asset-probe';
    const legend = document.createElement('legend');
    legend.textContent = 'Checkbox asset integration';
    probe.append(legend);
    for (const state of ['checked', 'indeterminate', 'unchecked']) {
      for (const disabled of [false, true]) {
        const container = document.createElement('div');
        container.className = cods
          ? 'usa-checkbox cods-checkbox'
          : 'usa-checkbox';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = cods
          ? 'usa-checkbox__input cods-checkbox__input'
          : 'usa-checkbox__input';
        input.id = `probe-${state}-${disabled}`;
        input.checked = state === 'checked';
        input.indeterminate = state === 'indeterminate';
        input.disabled = disabled;
        const label = document.createElement('label');
        label.className = cods
          ? 'usa-checkbox__label cods-checkbox__label'
          : 'usa-checkbox__label';
        label.htmlFor = input.id;
        label.textContent = `${state}${disabled ? ' disabled' : ''}`;
        container.append(input, label);
        probe.append(container);
      }
    }
    (document.querySelector('main') ?? document.body).append(probe);
  }, options.cods ?? false);
  await page.evaluate(() => document.fonts.ready);

  await page.emulateMedia({ forcedColors });
  for (const state of ['checked', 'indeterminate', 'unchecked']) {
    for (const disabled of [false, true]) {
      const label = page.locator(`label[for="probe-${state}-${disabled}"]`);
      await label.scrollIntoViewIfNeeded();
      const style = await label.evaluate((element) => {
        const pseudo = getComputedStyle(element, '::before');
        const rect = element.getBoundingClientRect();
        return {
          image: pseudo.backgroundImage,
          asset: (() => {
            const match = pseudo.backgroundImage.match(
              /^url\((?:"([^"]+)"|'([^']+)'|([^)]*))\)/,
            );
            const url = match?.[1] ?? match?.[2] ?? match?.[3];
            if (!url?.startsWith('data:image/svg+xml')) return { url };
            const separator = url.indexOf(',');
            const encoded = url.slice(separator + 1);
            const markup = url.includes(';base64,')
              ? atob(encoded)
              : decodeURIComponent(encoded);
            const document = new DOMParser().parseFromString(
              markup,
              'image/svg+xml',
            );
            if (document.querySelector('parsererror'))
              throw new Error('Checkbox glyph data URL is not valid SVG');
            return { url, markup: document.documentElement.outerHTML };
          })(),
          background: pseudo.backgroundColor,
          // Exclude rounded corners so page pixels cannot masquerade as the glyph.
          clip: {
            x:
              rect.x +
              parseFloat(pseudo.left) +
              parseFloat(pseudo.marginLeft) +
              2,
            y:
              rect.y +
              parseFloat(pseudo.top) +
              parseFloat(pseudo.marginTop) +
              2,
            width: parseFloat(pseudo.width) - 4,
            height: parseFloat(pseudo.height) - 4,
          },
        };
      });
      if (state === 'unchecked') {
        expect(style.image).toBe('none');
        continue;
      }
      const color =
        forcedColors === 'none' && !(options.cods && disabled)
          ? 'ffffff'
          : state === 'checked'
            ? '171717'
            : '000000';
      const icon = state === 'checked' ? 'check' : 'minus';
      const expectedPath = resolve(
        'packages/colorado-design-system/dist/icons',
        `${icon}--${color}.svg`,
      );
      const expectedSvg = readFileSync(expectedPath, 'utf8');
      const expectedMarkup = await page.evaluate((source) => {
        const document = new DOMParser().parseFromString(
          source,
          'image/svg+xml',
        );
        if (document.querySelector('parsererror'))
          throw new Error('Generated checkbox glyph is not valid SVG');
        return document.documentElement.outerHTML;
      }, expectedSvg);
      if (style.asset.markup) {
        expect(style.asset.markup).toBe(expectedMarkup);
      } else {
        expect(style.asset.url).toMatch(
          new RegExp(`/${icon}--${color}\\.svg(?:[?#]|$)`),
        );
      }
      const pixels = await page.screenshot({
        clip: style.clip,
        scale: 'css',
      });
      const rendered = await page.evaluate(
        async ({ png, color, background }) => {
          const image = new Image();
          image.src = `data:image/png;base64,${png}`;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas context unavailable');
          context.drawImage(image, 0, 0);
          const data = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          ).data;
          const foreground = [0, 2, 4].map((offset) =>
            parseInt(color.slice(offset, offset + 2), 16),
          );
          const surface = background
            .match(/[\d.]+/g)
            ?.slice(0, 3)
            .map(Number);
          if (!surface || surface.length !== 3)
            throw new Error(`Unexpected checkbox background: ${background}`);
          let foregroundPixels = 0;
          let backgroundPixels = 0;
          for (let offset = 0; offset < data.length; offset += 4) {
            // The Regular glyph is subpixel-thin at the control's actual size.
            // Match antialiased foreground/surface blends, not just solid pixels.
            const delta = foreground.map(
              (value, channel) => value - surface[channel]!,
            );
            const coverage =
              delta.reduce(
                (sum, value, channel) =>
                  sum + (data[offset + channel]! - surface[channel]!) * value,
                0,
              ) / delta.reduce((sum, value) => sum + value * value, 0);
            if (
              coverage >= 0.25 &&
              coverage <= 1.01 &&
              delta.every(
                (value, channel) =>
                  Math.abs(
                    data[offset + channel]! -
                      (surface[channel]! + coverage * value),
                  ) < 6,
              )
            )
              foregroundPixels++;
            if (
              surface.every(
                (value, channel) =>
                  Math.abs(data[offset + channel]! - value) <= 1,
              )
            )
              backgroundPixels++;
          }
          const luminance = (channels: number[]) => {
            const linear = channels.map((channel) => {
              const value = channel / 255;
              return value <= 0.04045
                ? value / 12.92
                : ((value + 0.055) / 1.055) ** 2.4;
            });
            return (
              linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722
            );
          };
          const values = [luminance(foreground), luminance(surface)].sort(
            (a, b) => b - a,
          );
          return {
            foregroundPixels,
            backgroundPixels,
            contrast: (values[0]! + 0.05) / (values[1]! + 0.05),
          };
        },
        {
          png: pixels.toString('base64'),
          color,
          background: style.background,
        },
      );
      const description = `${state}, disabled=${disabled}, forcedColors=${forcedColors}`;
      expect(rendered.foregroundPixels, description).toBeGreaterThan(0);
      expect(rendered.backgroundPixels, description).toBeGreaterThan(0);
      // Disabled controls are contrast-exempt, but their glyph must still render.
      if (!disabled || options.cods)
        expect(rendered.contrast, description).toBeGreaterThanOrEqual(3);
    }
  }
}
