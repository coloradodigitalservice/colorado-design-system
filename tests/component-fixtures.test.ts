import { afterEach, describe, expect, it } from 'vitest';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
  cpSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  checkComponentAssets,
  generateExamples,
  loadComponents,
  packageRoot,
  writeComponentAssets,
} from '../scripts/component-fixtures.mjs';

const components = loadComponents();
const temporary: string[] = [];
afterEach(() => {
  for (const directory of temporary.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

describe('canonical component examples', () => {
  for (const component of components) {
    it(`${component.name} maps every supported state to renderable, named markup`, () => {
      expect(
        component.examples.examples.map((example) => example.state),
      ).toEqual(component.metadata.states);
      for (const example of component.examples.examples) {
        document.body.innerHTML = example.html;
        expect(
          document.querySelector(`.cods-${component.name}`),
        ).not.toBeNull();
        expect(example.code).toBe(example.html);
        expect(example.status).toBe(
          example.setup === 'none' ? 'valid' : 'review-required',
        );
      }
    });
    it(`${component.name} rejects metadata, missing states, and broken accessible relationships`, () => {
      const metadata = structuredClone(component.metadata);
      metadata.maturity = 'invented';
      expect(() => generateExamples(metadata, component.fixture)).toThrow(
        'invalid maturity',
      );
      const missing = component.fixture.replace(
        'data-cods-fixture-state="default"',
        'data-cods-fixture-state="unknown"',
      );
      expect(() => generateExamples(component.metadata, missing)).toThrow(
        'undeclared fixture block',
      );
      expect(() =>
        generateExamples(
          component.metadata,
          `${component.fixture}<button aria-controls="missing">Open</button>`,
        ),
      ).toThrow('unresolved aria-controls');
      const duplicate = structuredClone(component.metadata);
      duplicate.examples[1] = duplicate.examples[0]!;
      expect(() => generateExamples(duplicate, component.fixture)).toThrow(
        'one example definition',
      );
    });
  }

  it('rejects USWDS pin drift and unapproved component divergence', () => {
    const root = mkdtempSync(join(tmpdir(), 'cods-metadata-'));
    temporary.push(root);
    cpSync(join(packageRoot, 'src/components'), join(root, 'src/components'), {
      recursive: true,
    });
    cpSync(join(packageRoot, 'package.json'), join(root, 'package.json'));
    const file = join(root, 'src/components/accordion/accordion.metadata.json');
    const metadata = JSON.parse(readFileSync(file, 'utf8'));
    metadata.uswdsVersion = '0.0.1';
    writeFileSync(file, JSON.stringify(metadata));
    expect(() => loadComponents(root)).toThrow(
      'USWDS version differs from package pin',
    );
    const component = components[0]!;
    const divergent = { ...component.metadata, componentType: 'C' };
    expect(() => generateExamples(divergent, component.fixture)).toThrow(
      'divergence needs approval',
    );
    const missing = { ...component.metadata, uswdsVersion: null };
    expect(() => generateExamples(missing, component.fixture)).toThrow(
      'pinned version',
    );
  });

  it('fixture changes regenerate samples and stale fixture, metadata, examples, and exports fail independently', () => {
    const root = mkdtempSync(join(tmpdir(), 'cods-fixtures-'));
    temporary.push(root);
    cpSync(join(packageRoot, 'src/components'), join(root, 'src/components'), {
      recursive: true,
    });
    cpSync(join(packageRoot, 'package.json'), join(root, 'package.json'));
    mkdirSync(join(root, 'src/components/shared'));
    writeComponentAssets(root);
    expect(() => checkComponentAssets(root)).not.toThrow();
    const component = components.find(
      (component) => component.name === 'accordion',
    )!;
    const source = join(
      root,
      'src/components/accordion/accordion.fixture.html',
    );
    writeFileSync(
      source,
      component.fixture.replace('Before you apply', 'Prepare your application'),
    );
    expect(() => checkComponentAssets(root)).toThrow('stale fixtures');
    writeComponentAssets(root);
    expect(
      loadComponents(root).find((component) => component.name === 'accordion')!
        .examples.examples[0]!.code,
    ).toContain('Prepare your application');
    for (const area of ['fixtures', 'metadata', 'examples']) {
      const file = join(
        root,
        'dist',
        area,
        `accordion.${area === 'fixtures' ? 'html' : 'json'}`,
      );
      writeFileSync(file, readFileSync(file, 'utf8') + '\n');
      expect(() => checkComponentAssets(root)).toThrow(`stale ${area}`);
      writeComponentAssets(root);
    }
    const manifest = JSON.parse(
      readFileSync(join(root, 'package.json'), 'utf8'),
    );
    delete manifest.exports['./examples/*.json'];
    writeFileSync(join(root, 'package.json'), JSON.stringify(manifest));
    expect(() => checkComponentAssets(root)).toThrow('missing export');
  });
});
