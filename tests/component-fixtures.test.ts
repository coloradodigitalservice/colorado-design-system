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
        /data-cods-fixture-state="[^"]+"/,
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

  it('requires a native checkbox and review instructions for mixed-state setup', () => {
    const checkbox = components.find(
      (component) => component.name === 'checkbox',
    )!;
    const mixed = checkbox.examples.examples.find(
      (example) => example.state === 'indeterminate',
    )!;
    expect(mixed.status).toBe('review-required');
    expect(mixed.code).not.toContain('data-indeterminate');
    const metadata = structuredClone(checkbox.metadata);
    const example = metadata.examples.find(
      (example) => example.state === 'indeterminate',
    )!;
    example.instructions = '';
    expect(() => generateExamples(metadata, checkbox.fixture)).toThrow(
      'runtime state needs review instructions',
    );
    expect(() =>
      generateExamples(
        checkbox.metadata,
        checkbox.fixture.replaceAll('type="checkbox"', 'type="text"'),
      ),
    ).toThrow('indeterminate setup needs a native checkbox');
  });

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
    const cardDefault = readFileSync(
      join(root, 'dist/fixtures/card-default.html'),
      'utf8',
    );
    expect(cardDefault).toContain('data-cods-fixture-state="default"');
    expect(cardDefault).not.toContain('data-cods-fixture-state="icon"');
    expect(
      readFileSync(join(root, 'dist/fixtures/card.html'), 'utf8'),
    ).toContain('data-cods-fixture-state="icon"');
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
      const original = readFileSync(file, 'utf8');
      writeFileSync(file, original + '\n');
      expect(() => checkComponentAssets(root)).toThrow(`stale ${area}`);
      writeFileSync(file, original);
    }
    expect(() => checkComponentAssets(root)).not.toThrow();
    const manifest = JSON.parse(
      readFileSync(join(root, 'package.json'), 'utf8'),
    );
    delete manifest.exports['./examples/*.json'];
    writeFileSync(join(root, 'package.json'), JSON.stringify(manifest));
    expect(() => checkComponentAssets(root)).toThrow('missing export');
  }, 30_000);
});

describe('Card fixture variants', () => {
  it('keeps icon markup in a separate packaged fixture and combines the canonical examples', () => {
    const card = components.find((component) => component.name === 'card')!;
    expect(card.fixtures['card-default']).toBe(card.fixtures.card);
    expect(card.fixtures['card-default']).not.toContain(
      'data-cods-fixture-state="icon"',
    );
    expect(card.fixtures['card-icon']).toContain(
      'data-cods-fixture-state="icon"',
    );
    expect(card.fixtures.card).not.toContain('data-cods-fixture-state="icon"');
    expect(card.fixture).toContain('data-cods-fixture-state="icon"');
  });
});

describe('video fixture safety', () => {
  it('requires a titled iframe without inline document content', () => {
    const videos = components.find((component) => component.name === 'videos')!;
    expect(() =>
      generateExamples(
        videos.metadata,
        videos.fixture.replace(
          'title="Local stand-in for an embedded video: blue screen"',
          'title=""',
        ),
      ),
    ).toThrow('video iframe requires a title');
    expect(() =>
      generateExamples(
        videos.metadata,
        videos.fixture.replace('<iframe', '<iframe srcdoc="<p>test</p>"'),
      ),
    ).toThrow('video iframe requires a title');
    const embed = videos.fixture
      .split('data-cods-fixture-state="embed"')[1]!
      .split('</section>')[0]!;
    expect(embed).toMatch(
      /src="https:\/\/player\.vimeo\.com\/video\/\d+\?[^"]*dnt=1/,
    );
    const other = components.find((component) => component.name === 'tags')!;
    expect(() =>
      generateExamples(
        other.metadata,
        `${other.fixture}<iframe title="Not allowed"></iframe>`,
      ),
    ).toThrow('fixture must be plain semantic HTML');
  });
});
