import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillsRoot = join(repoRoot, '.agents/skills');
// Committed unmodified from upstream; not ours to edit or lint.
const vendored = new Set(['playwright-cli']);

const skillNames = readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

function readFrontmatter(path: string) {
  const source = readFileSync(path, 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${path}: missing front matter`);
  const fields: Record<string, string> = {};
  for (const line of (match[1] ?? '').split('\n')) {
    const field = line.match(/^([a-z-]+):\s*(.*)$/);
    if (field?.[1])
      fields[field[1]] = (field[2] ?? '').replace(/^(['"])(.*)\1$/, '$2');
  }
  return { fields, body: match[2] ?? '' };
}

function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.name.endsWith('.md') ? [path] : [];
  });
}

function relativeLinks(markdown: string): string[] {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]*`/g, '');
  return [...prose.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((match) => match[1] ?? '')
    .filter((target) => !/^(https?:|mailto:|#)/.test(target))
    .map((target) => target.split('#')[0] ?? '')
    .filter(Boolean);
}

describe('agent skills follow the Agent Skills specification', () => {
  it('finds the repository skills', () => {
    expect(skillNames).toEqual(
      expect.arrayContaining([
        'create-cods-component',
        'cods-accessibility-review',
        'cods-token-change',
        'cods-browser-verification',
      ]),
    );
  });

  it.each(skillNames)(
    '%s has valid front matter and a bounded body',
    (name) => {
      const { fields, body } = readFrontmatter(
        join(skillsRoot, name, 'SKILL.md'),
      );
      const description = fields.description ?? '';
      expect(fields.name).toBe(name);
      expect(name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(name.length).toBeLessThanOrEqual(64);
      expect(description.length).toBeGreaterThan(0);
      expect(description.length).toBeLessThanOrEqual(1024);
      expect(body.split('\n').length).toBeLessThan(500);
    },
  );

  it.each(skillNames.filter((name) => !vendored.has(name)))(
    '%s links only to files that exist',
    (name) => {
      const missing: string[] = [];
      for (const file of markdownFiles(join(skillsRoot, name))) {
        for (const target of relativeLinks(readFileSync(file, 'utf8'))) {
          if (!existsSync(resolve(dirname(file), decodeURI(target))))
            missing.push(`${file.slice(repoRoot.length + 1)} -> ${target}`);
        }
      }
      expect(missing).toEqual([]);
    },
  );

  it('lists every skill in .agents/README.md and nothing else', () => {
    const readme = readFileSync(join(repoRoot, '.agents/README.md'), 'utf8');
    const listed = [
      ...readme.matchAll(/\]\(skills\/([^/]+)\/SKILL\.md\)/g),
    ].map((match) => match[1]);
    expect([...listed].sort()).toEqual([...skillNames].sort());
  });
});

describe('create-cods-component scaffold script', () => {
  const script = join(
    skillsRoot,
    'create-cods-component/scripts/create-component.mjs',
  );
  const temporaryRoots: string[] = [];

  afterEach(() => {
    for (const root of temporaryRoots.splice(0))
      rmSync(root, { recursive: true, force: true });
  });

  function makeRepo(): string {
    const root = mkdtempSync(join(tmpdir(), 'cods-scaffold-'));
    temporaryRoots.push(root);
    const components = join(
      root,
      'packages/colorado-design-system/src/components',
    );
    mkdirSync(components, { recursive: true });
    cpSync(
      join(repoRoot, 'packages/colorado-design-system/src/components/index.ts'),
      join(components, 'index.ts'),
    );
    writeFileSync(
      join(root, 'packages/colorado-design-system/package.json'),
      JSON.stringify({ dependencies: { '@uswds/uswds': '3.14.0' } }),
    );
    mkdirSync(join(root, 'docs/governance/templates'), { recursive: true });
    cpSync(
      join(
        repoRoot,
        'docs/governance/templates/accessibility-evidence-template.md',
      ),
      join(
        root,
        'docs/governance/templates/accessibility-evidence-template.md',
      ),
    );
    return root;
  }

  function scaffold(root: string, ...args: string[]) {
    return execFileSync(process.execPath, [script, ...args], {
      env: { ...process.env, CODS_REPO_ROOT: root },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }

  it('scaffolds an interactive component with story, evidence, and export', () => {
    const root = makeRepo();
    scaffold(root, '--name', 'probe-box', '--type', 'interactive');
    const dir = join(
      root,
      'packages/colorado-design-system/src/components/probe-box',
    );

    const metadata = JSON.parse(
      readFileSync(join(dir, 'probe-box.metadata.json'), 'utf8'),
    );
    expect(metadata).toMatchObject({
      name: 'probe-box',
      type: 'interactive',
      uswdsEquivalent: null,
      uswdsVersion: null,
      componentType: 'B',
      divergenceApproved: false,
    });

    const evidence = readFileSync(
      join(dir, 'accessibility/probe-box.evidence.md'),
      'utf8',
    );
    expect(evidence).toContain('# Accessibility Evidence: `cods-probe-box`');
    expect(evidence).not.toContain('<component-name>');
    expect(evidence).not.toContain('Copy this template');
    expect(evidence).toContain(
      '**Component maturity at time of review:** experimental',
    );

    const story = readFileSync(
      join(root, 'apps/storybook/src/stories/probe-box.stories.ts'),
      'utf8',
    );
    expect(story).toContain('components/probe-box/probe-box.fixture.html?raw');
    expect(story).toContain("title: 'Components/Probe Box'");
    expect(story).toContain('play: ({ canvasElement })');

    const index = readFileSync(
      join(root, 'packages/colorado-design-system/src/components/index.ts'),
      'utf8',
    );
    expect(index).toContain("from './probe-box/probe-box.js';");
    expect(index).toContain('initAll as initAllProbeBox');
    expect(existsSync(join(dir, 'probe-box.ts'))).toBe(true);
    expect(existsSync(join(dir, 'probe-box.test.ts'))).toBe(true);
  });

  it('records the pinned USWDS version for a themed component and leaves the barrel alone', () => {
    const root = makeRepo();
    const indexPath = join(
      root,
      'packages/colorado-design-system/src/components/index.ts',
    );
    const before = readFileSync(indexPath, 'utf8');
    scaffold(root, '--name', 'probe-tag', '--type', 'static', '--uswds', 'tag');

    const metadata = JSON.parse(
      readFileSync(
        join(
          root,
          'packages/colorado-design-system/src/components/probe-tag/probe-tag.metadata.json',
        ),
        'utf8',
      ),
    );
    expect(metadata).toMatchObject({
      type: 'static',
      uswdsEquivalent: 'tag',
      uswdsVersion: '3.14.0',
      componentType: 'A',
    });
    expect(readFileSync(indexPath, 'utf8')).toBe(before);
  });

  it('refuses to overwrite an existing component and rejects a bad component type', () => {
    const root = makeRepo();
    scaffold(root, '--name', 'probe-box', '--type', 'static');
    expect(() =>
      scaffold(root, '--name', 'probe-box', '--type', 'static'),
    ).toThrow(/already exists/);
    expect(() =>
      scaffold(
        root,
        '--name',
        'other',
        '--type',
        'static',
        '--component-type',
        'Z',
      ),
    ).toThrow(/--component-type/);
  });
});
