// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const script = fileURLToPath(
  new URL('../scripts/check-release-readiness.mjs', import.meta.url),
);
const packages = [
  'packages/colorado-design-tokens',
  'packages/colorado-design-system',
] as const;

describe('release readiness CLI', () => {
  let repo: string;
  let base: string;
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
  const write = (path: string, contents: string) => {
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), contents);
  };
  const version = (path: string, value: string) => {
    write(`${path}/package.json`, JSON.stringify({ version: value }));
    write(`${path}/CHANGELOG.md`, `# Changelog\n\n## ${value}\n\nChanges.\n`);
  };
  const commit = () => {
    git('add', '.');
    git('commit', '--allow-empty', '-m', 'fixture');
  };
  const check = (ref: string = base) => {
    commit();
    const result = spawnSync(process.execPath, [script, ref], {
      cwd: repo,
      encoding: 'utf8',
    });
    return { status: result.status, output: result.stdout + result.stderr };
  };

  beforeEach(() => {
    repo = mkdtempSync(join(tmpdir(), 'cods-release-readiness-'));
    git('init', '-b', 'main');
    git('config', 'user.name', 'Release readiness test');
    git('config', 'user.email', 'release@example.invalid');
    git('config', 'commit.gpgsign', 'false');
    for (const path of packages) version(path, '0.2.8');
    write('.changeset/config.json', '{}');
    write('.changeset/README.md', '# Changesets');
    commit();
    base = git('rev-parse', 'HEAD');
  });

  afterEach(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it.each([
    'docs/RELEASE.md',
    'apps/web/src/content/docs/example.md',
    'apps/storybook/example.ts',
    '.github/workflows/foundation.yml',
    'tests/example.test.ts',
  ])('allows unversioned non-package changes to %s', (path) => {
    write(path, 'Non-package changes');
    expect(check().status).toBe(0);
  });

  it.each(['0.2.9', '0.3.0', '0.10.0'])(
    'accepts a prepared fixed-group release %s',
    (value) => {
      for (const path of packages) version(path, value);
      expect(check().status).toBe(0);
    },
  );

  it('blocks pending changesets with an actionable message', () => {
    write('.changeset/ready-release.md', '---\n"package": patch\n---\nFix');
    const result = check();
    expect(result.status).toBe(1);
    expect(result.output).toContain('pnpm release:version');
    expect(result.output).toContain('.changeset/ready-release.md');
  });

  it('blocks pending changesets even after a version bump', () => {
    for (const path of packages) version(path, '0.2.9');
    write('.changeset/forgotten.md', 'Pending');
    expect(check().status).toBe(1);
  });

  it('checks pending changesets on pushes without a PR base', () => {
    write('.changeset/forgotten.md', 'Pending');
    expect(check('').status).toBe(1);
  });

  it('allows a prepared snapshot without a PR base', () => {
    expect(check('').status).toBe(0);
  });

  it.each(packages)('blocks changes to %s without a bump', (path) => {
    write(`${path}/src/example.ts`, 'export const value = true;');
    const result = check();
    expect(result.status).toBe(1);
    expect(result.output).toContain(
      'Published package changes require a version bump',
    );
  });

  it('blocks deleting or moving files out of published packages', () => {
    write(`${packages[0]}/source.txt`, 'Published source');
    commit();
    base = git('rev-parse', 'HEAD');
    git('mv', `${packages[0]}/source.txt`, 'moved-source.txt');
    expect(check().status).toBe(1);
  });

  it('blocks mismatched fixed-group versions', () => {
    version(packages[0], '0.2.9');
    const result = check();
    expect(result.status).toBe(1);
    expect(result.output).toContain('same version');
  });

  it.each(['0.2.7', '0.1.9'])('blocks version rollback to %s', (value) => {
    for (const path of packages) version(path, value);
    expect(check().output).toContain('must advance from 0.2.8');
  });

  it.each(['1.0.0', '0.2.9-beta.1', '0.02.9', 'not-a-version'])(
    'rejects unsupported version %s',
    (value) => {
      for (const path of packages) version(path, value);
      const result = check();
      expect(result.status).not.toBe(0);
      expect(result.output).toContain('expected a development version');
    },
  );

  it.each(packages)('requires the new changelog heading in %s', (path) => {
    for (const directory of packages) version(directory, '0.2.9');
    write(`${path}/CHANGELOG.md`, '## 0.2.8\nOld release\n');
    const result = check();
    expect(result.status).toBe(1);
    expect(result.output).toContain(`${path}/CHANGELOG.md: missing ## 0.2.9`);
  });

  it('rejects reuse of an existing release tag', () => {
    git('tag', 'v0.2.9');
    for (const path of packages) version(path, '0.2.9');
    expect(check().output).toContain('Tag v0.2.9 already exists');
  });

  it('fails explicitly when the base commit is unavailable', () => {
    const result = check('missing-base');
    expect(result.status).not.toBe(0);
    expect(result.output).toContain('missing-base');
  });

  it('rejects a stale bump when another PR has advanced the base version', () => {
    git('switch', '-c', 'feature');
    for (const path of packages) version(path, '0.2.9');
    write(`${packages[1]}/feature.txt`, 'Feature');
    commit();
    git('switch', 'main');
    for (const path of packages) version(path, '0.2.9');
    commit();
    base = git('rev-parse', 'HEAD');
    git('merge', '--no-ff', 'feature', '-m', 'Synthetic PR merge');
    const result = check();
    expect(result.status).toBe(1);
    expect(result.output).toContain(
      'Published package changes require a version bump',
    );
  });

  it('accepts a PR merge snapshot based on the latest main version', () => {
    for (const path of packages) version(path, '0.2.9');
    commit();
    base = git('rev-parse', 'HEAD');
    git('switch', '-c', 'feature');
    for (const path of packages) version(path, '0.2.10');
    commit();
    git('switch', 'main');
    git('merge', '--no-ff', 'feature', '-m', 'Synthetic PR merge');
    expect(check().status).toBe(0);
  });
});
