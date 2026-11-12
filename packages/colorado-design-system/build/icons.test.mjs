import { icons as phosphorIcons } from '@phosphor-icons/core';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { afterEach, describe, expect, it } from 'vitest';
import iconVariants from './uswds-icon-variants.json' with { type: 'json' };
import componentVariants from './component-icon-variants.json' with { type: 'json' };
import {
  checkIcons,
  generatedDir,
  generateIcons,
  svgSymbol,
  validateComponentIconVariants,
  writeDistIcons,
} from './icons.mjs';

const allVariants = [
  ...Object.values(iconVariants),
  ...Object.values(componentVariants),
];
const allIds = phosphorIcons.map(({ name }) => name).sort();
let temporaryRoot;
const temporaryDir = async () =>
  (temporaryRoot = await mkdtemp(resolve(tmpdir(), 'cods-icon-test-')));

afterEach(async () => {
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
  temporaryRoot = undefined;
});

describe('Phosphor icon generation', () => {
  it('matches variant foreground colors to the pinned USWDS source assets', async () => {
    const require = createRequire(import.meta.url);
    for (const [name, { color }] of Object.entries(iconVariants)) {
      if (name === 'checkbox-indeterminate-alt.svg') {
        expect(color).toBe(iconVariants['correct8-alt.svg'].color);
        continue;
      }
      const source = await readFile(
        require.resolve(`@uswds/uswds/img/${name}`),
        'utf8',
      );
      const colors = [...source.matchAll(/\bfill="(#[a-f\d]+)"/gi)].map(
        ([, hex]) => {
          const value = hex.slice(1).toLowerCase();
          return value.length === 3
            ? [...value].map((digit) => digit + digit).join('')
            : value;
        },
      );
      expect(colors.length ? colors : ['000000'], name).toContain(color);
    }
  });

  it('requires component variants to match Regular artwork and source tokens', () => {
    expect(validateComponentIconVariants(componentVariants)).toEqual(
      Object.values(componentVariants),
    );
    expect(() =>
      validateComponentIconVariants({
        caret: { ...componentVariants['select-caret'], color: '000000' },
      }),
    ).toThrow(/source token/);
    expect(() =>
      validateComponentIconVariants({
        caret: { ...componentVariants['select-caret'], id: '../caret-down' },
      }),
    ).toThrow(/Phosphor Regular icon ID/);
  });

  it('rejects source SVG features that cannot safely be combined into symbols', () => {
    const root =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"';
    expect(svgSymbol('test', `${root}><path d="M0 0"/></svg>`)).toContain(
      '<symbol id="test"',
    );
    expect(() =>
      svgSymbol('test', `${root} stroke="red"><path/></svg>`),
    ).toThrow(/Unsupported Phosphor SVG/);
    expect(() =>
      svgSymbol('test', `${root}><path id="shared"/></svg>`),
    ).toThrow(/Unsupported Phosphor SVG/);
  });

  it('matches the committed output, so stale generated files fail the build', async () => {
    await checkIcons(generatedDir);
  });

  it('deterministically generates every Regular symbol and a minimal index', async () => {
    const outputDir = resolve(await temporaryDir(), 'icons');
    await generateIcons(outputDir);
    expect((await readdir(outputDir)).sort()).toEqual([
      'catalog.json',
      'sprite.svg',
    ]);
    const index = JSON.parse(
      await readFile(resolve(outputDir, 'catalog.json'), 'utf8'),
    );
    const sprite = await readFile(resolve(outputDir, 'sprite.svg'), 'utf8');
    expect(index).toEqual({
      source: {
        package: '@phosphor-icons/core',
        version: '2.1.1',
        license: 'MIT',
      },
      weight: 'regular',
      spriteSha256: createHash('sha256').update(sprite).digest('hex'),
      icons: allIds,
    });
    expect(sprite.match(/<symbol /g)).toHaveLength(allIds.length);
    await checkIcons(outputDir);
    await generateIcons(outputDir);
    expect(await readFile(resolve(outputDir, 'sprite.svg'), 'utf8')).toBe(
      sprite,
    );
    expect(
      JSON.parse(await readFile(resolve(outputDir, 'catalog.json'), 'utf8')),
    ).toEqual(index);
  });

  it('reports missing and stale committed output', async () => {
    const outputDir = resolve(await temporaryDir(), 'icons');
    await generateIcons(outputDir);
    await writeFile(
      resolve(outputDir, 'sprite.svg'),
      `${await readFile(resolve(outputDir, 'sprite.svg'), 'utf8')} `,
    );
    await rm(resolve(outputDir, 'catalog.json'));
    await expect(checkIcons(outputDir)).rejects.toThrow(
      /out of date: sprite\.svg, missing: catalog\.json/,
    );
    await expect(checkIcons(outputDir)).rejects.toThrow('pnpm icons:build');
  });

  it('ships the full sprite, tools, notice, and only the requested CSS files', async () => {
    const distDir = resolve(await temporaryDir(), 'icons');
    const files = [
      'cursor.svg',
      ...allVariants.flatMap(({ id, color }) => [
        `${id}.svg`,
        `${id}--${color}.svg`,
      ]),
    ];
    await writeDistIcons(distDir, { files });
    const names = await readdir(distDir);
    expect(names.sort()).toEqual(
      [
        ...new Set([
          ...files,
          'sprite.svg',
          'catalog.json',
          'LICENSE',
          'selection.mjs',
          'selection.d.ts',
          'vite.mjs',
          'vite.d.ts',
          'cli.mjs',
        ]),
      ].sort(),
    );
    expect(await readFile(resolve(distDir, 'cursor.svg'), 'utf8')).toMatch(
      /^<svg width="24" height="24".*viewBox="0 0 256 256"/,
    );
    expect(await readFile(resolve(distDir, 'LICENSE'), 'utf8')).toContain(
      'MIT License',
    );
    for (const { id, color } of allVariants) {
      const original = await readFile(resolve(distDir, `${id}.svg`), 'utf8');
      const variant = await readFile(
        resolve(distDir, `${id}--${color}.svg`),
        'utf8',
      );
      expect(original).toContain('currentColor');
      expect(variant).toBe(original.replaceAll('currentColor', `#${color}`));
    }
    expect(names).not.toContain('house.svg');
  });

  it('rejects unknown CSS assets and corrupted committed sprite/index pairs', async () => {
    const root = await temporaryDir();
    await expect(
      writeDistIcons(resolve(root, 'dist'), { files: ['not-an-icon.svg'] }),
    ).rejects.toThrow('Unknown packaged Phosphor icon');
    const sourceDir = resolve(root, 'generated');
    await generateIcons(sourceDir);
    const catalogPath = resolve(sourceDir, 'catalog.json');
    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
    catalog.spriteSha256 = '0'.repeat(64);
    await writeFile(catalogPath, JSON.stringify(catalog));
    await expect(
      writeDistIcons(resolve(root, 'dist'), { sourceDir }),
    ).rejects.toThrow('does not match the icon index SHA-256');
  });
});
