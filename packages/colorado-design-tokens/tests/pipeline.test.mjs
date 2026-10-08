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
import {
  extractTokenDependencies,
  loadImplementationDependencies,
  validateComponentInventory,
} from '../scripts/inventory.mjs';
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
    for (const name of ['color-surface-info'])
      expect(output).not.toHaveProperty(name);
  });
  it('compiles a bare Sass import from a real local consumer', () => {
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
  it('compiles both complete contract Sass samples with documented focus treatment', () => {
    const options = {
      loadPaths: [join(packageRoot, '../colorado-design-system/node_modules')],
    };
    const samples = join(
      packageRoot,
      '../../docs/governance/component-contract-samples',
    );
    const tag = sass.compile(join(samples, 'static/tag/tag.scss'), options).css;
    const disclosure = sass.compile(
      join(samples, 'interactive/disclosure/disclosure.scss'),
      options,
    ).css;
    expect(tag).toContain('#aacdec');
    expect(disclosure).toContain('outline-offset: 2px');
    expect(disclosure).toContain('box-shadow: 0 0 0 2px #ffffff');
    expect(disclosure).toContain('4px');
  });
  it('compiles the interactive scaffold template with the complete focus treatment', async () => {
    const template = await readFile(
      join(
        packageRoot,
        '../../.agents/skills/create-cods-component/assets/interactive/__NAME__.scss.template',
      ),
      'utf8',
    );
    const result = sass.compileString(
      template.replaceAll('__NAME__', 'probe'),
      {
        loadPaths: [
          join(packageRoot, '../colorado-design-system/node_modules'),
        ],
      },
    ).css;
    expect(result).toContain('.cods-probe__trigger:focus-visible');
    expect(result).toMatch(/^@layer cods\.components \{/m);
    expect(result).toContain('var(--cods-focus-ring-width, 4px)');
    expect(result).toContain('var(--cods-focus-ring-color, #173bb3)');
    expect(result).toContain('outline-offset: 2px');
    expect(result).toContain('box-shadow: 0 0 0 2px #ffffff');
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
  it('checks all documented text, tag, link, action, border, icon and focus pairs', async () => {
    const reference = JSON.parse(
      await readFile(
        join(packageRoot, 'references/contrast-pairs.json'),
        'utf8',
      ),
    );
    const report = await checkContrast(catalog);
    expect(report).toHaveLength(reference.pairs.length);
    expect(report.map((pair) => pair.name)).toContain('Tag teal');
    expect(report.map((pair) => pair.name)).toContain('Link visited');
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

describe('Phase 3 catalog dependencies', () => {
  it('covers every approved component and resolves its recorded dependencies', async () => {
    const inventory = JSON.parse(
      await readFile(
        join(packageRoot, 'references/component-token-inventory.json'),
        'utf8',
      ),
    );
    validateComponentInventory(
      inventory,
      catalog,
      await loadImplementationDependencies(catalog),
    );
    const approved = [
      'Accordion',
      'Breadcrumbs',
      'Button',
      'Card - Default',
      'Card - Icon',
      'Checkbox',
      'Combo Box',
      'Divider',
      'Footer',
      'Header',
      'Hero',
      'Icon List',
      'Input',
      'In-Page Alert',
      'In-Page Navigation',
      'Language Selector',
      'Link',
      'Maps',
      'Modal',
      'Process List',
      'Radio Buttons',
      'Search',
      'Select (Dropdown)',
      'Site Alert',
      'Tags',
      'Toasts/Snackbars',
      'Tooltip',
      'Videos',
    ];
    expect(
      inventory.components.map((component) => component.name).sort(),
    ).toEqual(approved.sort());
    for (const component of inventory.components) {
      expect(component.source).toContain(inventory.figmaFileId);
      for (const path of [...component.tokens, ...component.componentTokens]) {
        expect(catalog.tokens.has(path), `${component.name}: ${path}`).toBe(
          true,
        );
        expect(catalog.resolved.has(path), `${component.name}: ${path}`).toBe(
          true,
        );
      }
    }
    for (const [path, entry] of catalog.tokens) {
      if (!path.startsWith('component.')) continue;
      expect(entry.$value).toMatch(
        /^\{color\.(?!co-|white|shadow)[a-z0-9-]+\}$/,
      );
    }
  });
  it('retains source distinctions, responsive units and existing disputed values', () => {
    expect(output).toMatchObject({
      'color-text-action-link-inline': '#173bb3',
      'color-text-action-link-standalone': '#001970',
      'color-text-action-link-standalone-hover': '#2551a3',
      'color-text-action-link-visited': '#491839',
      'component-tag-teal-background': '#aeced4',
      'component-tag-teal-text': '#1a323f',
      'space-4xl': '80px',
      'font-size-mobile-body-sm': '13px',
      'line-height-mobile-body-sm': '18px',
      'paragraph-space-mobile-body-sm': '18px',
      'font-size-mobile-ui': '16px',
      'elevation-low-y': '4px',
      'elevation-high-blur': '32px',
      'elevation-opacity': 0.12,
      'color-border-subtle': '#c4c5c9',
      'font-size-mobile-h3': '28px',
      'font-size-mobile-body-lg': '24px',
    });
    expect(output['color-border-bottom']).toBe('#1b1b1b14');
    expect(output['color-elevation-shadow']).toBe('#0000001f');
    expect(output).not.toHaveProperty('color-surface-table-row-sorted');
  });
  it('rejects a catalog whose tag foreground loses contrast', async () => {
    const resolved = new Map(catalog.resolved);
    resolved.set('color.text-tag-teal', resolved.get('color.surface-tag-teal'));
    await expect(checkContrast({ ...catalog, resolved })).rejects.toThrow(
      'Tag teal: contrast 1.00:1 is below 4.5:1',
    );
  });
});

it('keeps the contrast report reproducible, including the warning accent failures', async () => {
  const report = JSON.parse(
    await readFile(
      join(packageRoot, 'references/catalog-contrast-report.json'),
      'utf8',
    ),
  );
  expect(await checkContrast(catalog)).toEqual(report.passingPairs);
  for (const issue of report.reviewIssues) {
    const ratio = contrastRatio(
      catalog.resolved.get(issue.foreground),
      catalog.resolved.get(issue.background),
    );
    expect(ratio).toBe(issue.ratio);
    expect(ratio).toBeLessThan(issue.requiredIfSoleVisualCue);
  }
});

it('accounts for every observed semantic role and preserves its source alias', async () => {
  const observation = JSON.parse(
    await readFile(
      join(packageRoot, 'references/figma-observed-2026-10-08.json'),
      'utf8',
    ),
  );
  const inventory = JSON.parse(
    await readFile(
      join(packageRoot, 'references/component-token-inventory.json'),
      'utf8',
    ),
  );
  let count = 0;
  for (const category of ['text', 'bg', 'border', 'icon', 'state', 'surface']) {
    let group = category;
    for (const row of observation.tables[category]) {
      if (row.length === 1) {
        group = row[0].replaceAll('\n', '/');
        continue;
      }
      if (row.length < 2 || row[0] === 'Name') continue;
      count += 1;
      const role = `${group}/${row[0]}`;
      if (inventory.excludedRoles[role] || inventory.pendingRoles[role])
        continue;
      const path = inventory.sourceRoles[role];
      expect(catalog.tokens.has(path), role).toBe(true);
      if (role === 'border/bottom') {
        expect(catalog.resolved.get(path).alpha).toBe(0.08);
        continue;
      }
      if (row[1] === 'text/default') {
        expect(catalog.tokens.get(path).$value, role).toBe(
          '{color.text-primary}',
        );
      }
      const target =
        row[1] === 'text/default'
          ? 'color.text-primary'
          : row[1].replace(/^color\//, 'color.').replaceAll('/', '-');
      expect(catalog.resolved.get(path), role).toEqual(
        catalog.resolved.get(target),
      );
    }
  }
  expect(count).toBe(104);
});

describe('component inventory completeness', () => {
  const readInventory = async () =>
    JSON.parse(
      await readFile(
        join(packageRoot, 'references/component-token-inventory.json'),
        'utf8',
      ),
    );
  it.each([
    ['Accordion', 'focus.ring-width'],
    ['Site Alert', 'font.size-mobile-h3'],
  ])(
    'detects omitted %s stylesheet dependencies independently of the inventory',
    async (name, missing) => {
      const inventory = await readInventory();
      const component = inventory.components.find(
        (entry) => entry.name === name,
      );
      component.tokens = component.tokens.filter((path) => path !== missing);
      component.implementationTokens = component.implementationTokens.filter(
        (path) => path !== missing,
      );
      component.foundationTokens = component.foundationTokens.filter(
        (path) => path !== missing,
      );
      for (const [part, paths] of Object.entries(
        component.foundationBindings,
      )) {
        component.foundationBindings[part] = paths.filter(
          (path) => path !== missing,
        );
      }
      expect(() =>
        validateComponentInventory(inventory, catalog, implementations),
      ).toThrow(`stylesheet dependency ${missing} is undocumented`);
    },
  );
  let implementations;
  beforeAll(async () => {
    implementations = await loadImplementationDependencies(catalog);
  });
  it('rejects generic or empty foundation coverage', async () => {
    const inventory = await readInventory();
    inventory.components.find(
      (entry) => entry.name === 'Modal',
    ).foundationBindings = {};
    expect(() =>
      validateComponentInventory(inventory, catalog, implementations),
    ).toThrow('Modal: specify concrete foundation bindings');
  });
  it('rejects unknown proposed foundation dependencies', async () => {
    const inventory = await readInventory();
    const component = inventory.components.find(
      (entry) => entry.name === 'Modal',
    );
    component.foundationBindings.padding = ['space.missing'];
    component.tokens.push('space.missing');
    component.foundationTokens = [
      ...new Set(
        Object.values(component.foundationBindings)
          .flat()
          .filter((path) => !path.startsWith('color.')),
      ),
    ].sort();
    expect(() =>
      validateComponentInventory(inventory, catalog, implementations),
    ).toThrow('Modal: missing catalog token space.missing');
  });
  it('rejects newly introduced stylesheet dependencies until they are documented', async () => {
    const inventory = await readInventory();
    const updated = new Map(implementations);
    const accordion = updated.get('Accordion');
    updated.set('Accordion', {
      ...accordion,
      tokens: [...accordion.tokens, 'space.4xl'],
    });
    expect(() =>
      validateComponentInventory(inventory, catalog, updated),
    ).toThrow('Accordion: stylesheet dependency space.4xl is undocumented');
  });
  it('extracts CSS and namespaced Sass token references without including component properties or comments', () => {
    const styles = `@use '@coloradodigitalservice/colorado-design-tokens' as ds;
      .cods-probe { background: url(https://example.test/image.svg); padding: ds.$space-lg; font-size: var(--cods-font-size-mobile-body); --cods-probe-padding: 1px; }
      /* --cods-space-unused */`;
    expect(extractTokenDependencies(styles, catalog)).toEqual([
      'font.size-mobile-body',
      'space.lg',
    ]);
    expect(
      extractTokenDependencies(
        '.cods-probe { padding: var(--cods-space-missing); }',
        catalog,
      ),
    ).toEqual(['space.missing']);
  });
});
