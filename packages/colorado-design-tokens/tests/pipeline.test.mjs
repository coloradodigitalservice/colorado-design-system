// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import * as sass from 'sass';
import {
  loadCatalog,
  packageRoot,
  parseSource,
  validateDocuments,
} from '../scripts/validate.mjs';
import { checkContrast, contrastRatio } from '../scripts/contrast.mjs';
import { compareOutputs, formatValue, generate } from '../scripts/build.mjs';

const source = {
  'org.colorado.source': {
    name: 'test fixture',
    location: 'pipeline.test.mjs',
  },
};
const token = ($type, $value) => ({ $type, $value, $extensions: source });
const doc = (data, file = 'fixture.json') => ({ file, data });
let temporary;
let catalog;
let output;
beforeAll(async () => {
  temporary = await mkdtemp(join(tmpdir(), 'cods-token-tests-'));
  catalog = await loadCatalog();
  await generate(join(temporary, 'first'), catalog);
  output = JSON.parse(
    await readFile(join(temporary, 'first/tokens.json'), 'utf8'),
  );
});
afterAll(async () => {
  await rm(temporary, { recursive: true, force: true });
});

describe('DTCG profile and graph', () => {
  it('rejects malformed JSON and repeated keys before JSON.parse can discard them', () => {
    expect(() =>
      parseSource('{"color":{"a":1,"a":2}}', 'duplicate.json'),
    ).toThrow('duplicate key color.a');
    expect(() => parseSource('{"a":1,}', 'trailing.json')).toThrow(
      'invalid JSON',
    );
  });
  it.each([
    ['dimension', { value: 4, unit: 'em' }],
    ['color', { colorSpace: 'srgb', components: [2, 0, 0], alpha: 1 }],
    ['fontWeight', 1001],
    ['fontFamily', ''],
    ['number', '4'],
    ['shadow', {}],
    ['dimension', '{bad}'],
  ])('rejects invalid %s values', (type, value) => {
    expect(() =>
      validateDocuments([doc({ sample: { bad: token(type, value) } })]),
    ).toThrow('invalid DTCG project profile');
  });
  it('rejects missing targets and incompatible alias types', () => {
    expect(() =>
      validateDocuments([
        doc({ space: { a: token('dimension', '{space.missing}') } }),
      ]),
    ).toThrow('space.a: missing alias target space.missing');
    expect(() =>
      validateDocuments([
        doc({
          space: { a: token('dimension', '{space.b}'), b: token('number', 1) },
        }),
      ]),
    ).toThrow('incompatible alias type');
  });
  it('rejects self references and multi-token cycles with the offending chain', () => {
    expect(() =>
      validateDocuments([doc({ space: { a: token('number', '{space.a}') } })]),
    ).toThrow('space.a -> space.a');
    expect(() =>
      validateDocuments([
        doc({
          space: {
            a: token('number', '{space.b}'),
            b: token('number', '{space.a}'),
          },
        }),
      ]),
    ).toThrow('space.a -> space.b -> space.a');
  });
  it('rejects duplicate source paths and flattened-name collisions', () => {
    const a = doc({ color: { primary: token('number', 1) } });
    expect(() => validateDocuments([a, a])).toThrow('duplicate token path');
    expect(() =>
      validateDocuments([
        doc({
          'a-b': { c: token('number', 1) },
          a: { 'b-c': token('number', 2) },
        }),
      ]),
    ).toThrow('generated-name collision');
  });
  it('generates chained aliases and every supported value type', async () => {
    const fixture = validateDocuments([
      doc({
        sample: {
          a: token('number', 1.5),
          b: token('number', '{sample.a}'),
          c: token('number', '{sample.b}'),
          size: token('dimension', { value: 12, unit: 'px' }),
          family: token('fontFamily', ['Open Sans', 'Arial']),
          weight: token('fontWeight', 600),
          color: token('color', {
            colorSpace: 'srgb',
            components: [1, 0, 0],
            alpha: 1,
          }),
        },
      }),
    ]);
    await generate(join(temporary, 'fixture'), fixture);
    const values = JSON.parse(
      await readFile(join(temporary, 'fixture/tokens.json'), 'utf8'),
    );
    expect(values).toMatchObject({
      'sample-c': 1.5,
      'sample-size': '12px',
      'sample-family': '"Open Sans", "Arial"',
      'sample-weight': 600,
      'sample-color': '#ff0000',
    });
    const css = await readFile(join(temporary, 'fixture/tokens.css'), 'utf8');
    expect(css).toContain('--cods-sample-c: var(--cods-sample-b)');
    const scss = sass.compile(join(temporary, 'fixture/_tokens.scss'));
    expect(scss.css).toBe('');
  });
});

describe('State design references and consumers', () => {
  it('preserves all 46 distinct mappings and every palette value', async () => {
    const reference = JSON.parse(
      await readFile(
        join(packageRoot, 'references/design-values.json'),
        'utf8',
      ),
    );
    expect(reference.semanticColors).toHaveLength(46);
    const semantic = JSON.parse(
      await readFile(join(packageRoot, 'src/semantic.tokens.json'), 'utf8'),
    );
    expect(Object.keys(semantic.color)).toHaveLength(46);
    expect(new Set(reference.semanticColors.map((r) => r.codeName)).size).toBe(
      46,
    );
    for (const row of reference.semanticColors) {
      expect(output[row.codeName]).toBe(row.hex);
      expect(semantic.color[row.codeName.slice(6)].$value).toBe(
        `{color.${row.paletteName.slice(6).replaceAll('/', '-')}}`,
      );
    }
    for (const [name, hex] of Object.entries(reference.palette))
      expect(output[`color-${name.replaceAll('/', '-')}`]).toBe(hex);
  });
  it('preserves explicit foundation values and omits unresolved values', () => {
    expect(output).toMatchObject({
      'space-2xs': '4px',
      'space-sm': '12px',
      'radius-sm': '2px',
      'font-size-sm': '14px',
      'font-size-desktop-h4': '28px',
      'paragraph-space-desktop-h4': '26px',
      'font-size-mobile-body-lg': '24px',
      'font-weight-medium': 500,
    });
    for (const name of [
      'radius-full',
      'color-shadow',
      'focus-ring-width',
      'color-surface-info',
    ])
      expect(output).not.toHaveProperty(name);
  });
  it('compiles Phil’s bare Sass import from a real local consumer', () => {
    const requireFromCore = createRequire(
      join(packageRoot, '../colorado-design-system/package.json'),
    );
    const manifest = requireFromCore.resolve(
      '@coloradodigitalservice/colorado-design-tokens/package.json',
    );
    expect(resolve(manifest)).toBe(join(packageRoot, 'package.json'));
    const result = sass.compileString(
      `@use '@coloradodigitalservice/colorado-design-tokens' as tokens; .cods-token-probe { color: tokens.$color-text-primary; padding: tokens.$space-sm; border-radius: tokens.$radius-sm; font-size: tokens.$font-size-sm; }`,
      {
        loadPaths: [
          join(packageRoot, '../colorado-design-system/node_modules'),
        ],
      },
    );
    expect(result.css).toContain('color: #1b1b1b');
    expect(result.css).toContain('padding: 12px');
  });
  it('emits CSS aliases using the public names and valid CSS', async () => {
    const css = await readFile(join(temporary, 'first/tokens.css'), 'utf8');
    expect(css).toContain(
      '--cods-color-text-primary: var(--cods-color-co-gray-90)',
    );
    expect(sass.compileString(css).css).toContain('--cods-color-text-primary');
  });
  it('formats alpha and dimensions without dropping units', () => {
    expect(formatValue('color', { components: [1, 0, 0], alpha: 0 })).toBe(
      '#ff000000',
    );
    expect(formatValue('dimension', { value: 1.25, unit: 'rem' })).toBe(
      '1.25rem',
    );
  });
});

describe('reproducibility and non-mutating drift detection', () => {
  it('reproduces the complete committed output twice', async () => {
    await generate(join(temporary, 'second'), catalog);
    await compareOutputs(join(temporary, 'first'), join(temporary, 'second'));
    await compareOutputs(
      join(temporary, 'first'),
      join(packageRoot, 'generated'),
    );
  });
  it.each(['modified', 'missing', 'unexpected'])(
    'fails for a %s generated file',
    async (kind) => {
      const destination = join(temporary, kind);
      await generate(destination, catalog);
      if (kind === 'modified')
        await writeFile(join(destination, 'tokens.css'), '/* changed */');
      if (kind === 'missing') await rm(join(destination, 'tokens.css'));
      if (kind === 'unexpected')
        await writeFile(join(destination, 'stale.css'), '');
      await expect(
        compareOutputs(join(temporary, 'first'), destination),
      ).rejects.toThrow(/drift|file set differs/);
    },
  );
});

describe('contrast checks', () => {
  it('checks the initial text, action, border, icon and focus pairs', async () => {
    expect(await checkContrast(catalog)).toHaveLength(16);
  });
  it('uses unrounded contrast ratios and rejects transparent pairs', () => {
    const white = { colorSpace: 'srgb', components: [1, 1, 1], alpha: 1 };
    const black = { colorSpace: 'srgb', components: [0, 0, 0], alpha: 1 };
    expect(contrastRatio(white, black)).toBe(21);
    expect(contrastRatio(white, white)).toBe(1);
    expect(() => contrastRatio({ ...white, alpha: 0.5 }, black)).toThrow(
      'opaque sRGB',
    );
  });
  it('fails when a design change makes a checked pair illegible', async () => {
    const altered = { ...catalog, resolved: new Map(catalog.resolved) };
    altered.resolved.set(
      'color.text-primary',
      catalog.resolved.get('color.surface-form'),
    );
    await expect(checkContrast(altered)).rejects.toThrow('below 4.5:1');
  });
});
