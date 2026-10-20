import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  checkIcons,
  generatedDir,
  generateIcons,
  validateManifest,
  writeDistIcons,
} from './icons.mjs';

let temporaryRoot;
const temporaryDir = async () =>
  (temporaryRoot = await mkdtemp(resolve(tmpdir(), 'cods-icon-test-')));
const approved = [
  ...new Set(
    JSON.parse(
      readFileSync(
        resolve(import.meta.dirname, '../src/icons/approved-icons.json'),
        'utf8',
      ),
    ).icons,
  ),
];

afterEach(async () => {
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
  temporaryRoot = undefined;
});

describe('Phosphor icon generation', () => {
  it('requires manifest provenance to match the pinned Phosphor source', () => {
    const manifest = JSON.parse(
      readFileSync(
        resolve(import.meta.dirname, '../src/icons/approved-icons.json'),
        'utf8',
      ),
    );
    expect(validateManifest(manifest)).toEqual(manifest);
    expect(() =>
      validateManifest({
        ...manifest,
        source: { ...manifest.source, version: '0.0.0' },
      }),
    ).toThrow(/source metadata must match/);
    expect(() =>
      validateManifest({
        ...manifest,
        weight: 'bold',
      }),
    ).toThrow(/source metadata must match/);
  });

  it('matches the committed output, so stale generated files fail the build', async () => {
    await checkIcons(generatedDir);
  });

  it('generates a sprite and catalog with one hashed entry per unique approved ID', async () => {
    const outputDir = resolve(await temporaryDir(), 'icons');
    await generateIcons(outputDir);

    expect((await readdir(outputDir)).sort()).toEqual([
      'catalog.json',
      'sprite.svg',
    ]);
    const catalog = JSON.parse(
      await readFile(resolve(outputDir, 'catalog.json'), 'utf8'),
    );
    expect(catalog.source).toEqual({
      package: '@phosphor-icons/core',
      version: '2.1.1',
      license: 'MIT',
    });
    expect(catalog.weight).toBe('regular');
    expect(catalog.categoryMetadata).toEqual({
      phosphorCategories: 'Phosphor taxonomy',
    });
    expect(catalog.icons.map(({ id }) => id)).toEqual(approved);
    expect(
      catalog.icons.every(({ phosphorCategories }) =>
        Array.isArray(phosphorCategories),
      ),
    ).toBe(true);
    expect(catalog.icons[0]).not.toHaveProperty('phosphorFigmaCategory');
    expect(
      catalog.icons.every(({ sha256 }) => /^[0-9a-f]{64}$/.test(sha256)),
    ).toBe(true);
    const sprite = await readFile(resolve(outputDir, 'sprite.svg'), 'utf8');
    expect(sprite.match(/<symbol /g)).toHaveLength(approved.length);
    await checkIcons(outputDir);
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

  it('writes dist from committed output with per-icon SVGs and the MIT notice', async () => {
    const distDir = resolve(await temporaryDir(), 'icons');
    await writeDistIcons(distDir);

    const names = await readdir(distDir);
    expect(names).toHaveLength(approved.length + 3);
    for (const name of ['sprite.svg', 'catalog.json', 'LICENSE'])
      expect(names).toContain(name);
    expect(await readFile(resolve(distDir, 'cursor.svg'), 'utf8')).toContain(
      'viewBox="0 0 256 256"',
    );
    expect(await readFile(resolve(distDir, 'cursor.svg'), 'utf8')).toMatch(
      /^<svg width="24" height="24"/,
    );
    expect(await readFile(resolve(distDir, 'LICENSE'), 'utf8')).toContain(
      'MIT License',
    );
  });

  it('refuses to write dist when a committed hash no longer matches the source', async () => {
    const root = await temporaryDir();
    const sourceDir = resolve(root, 'generated');
    await generateIcons(sourceDir);
    const catalogPath = resolve(sourceDir, 'catalog.json');
    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
    catalog.icons[0].sha256 = '0'.repeat(64);
    await writeFile(catalogPath, JSON.stringify(catalog));
    await expect(
      writeDistIcons(resolve(root, 'dist'), sourceDir),
    ).rejects.toThrow(`Phosphor icon ${catalog.icons[0].id} does not match`);
  });
});
