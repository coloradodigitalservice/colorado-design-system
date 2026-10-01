// @vitest-environment node
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// @ts-expect-error The scope selector is also executable without a TS build.
import { selectScope } from '../scripts/ci-scope.mjs';

describe('CI job selection', () => {
  it.each([
    ['docs/BUILD.md', [false, false, false]],
    ['apps/web/src/content/docs/getting-started.md', [false, true, false]],
    ['apps/storybook/src/stories/tag.stories.ts', [false, false, true]],
    [
      'packages/colorado-design-tokens/src/color.tokens.json',
      [true, true, true],
    ],
    ['packages/colorado-design-system/src/index.ts', [true, true, true]],
    [
      'docs/governance/component-contract-samples/static/tag/tag.scss',
      [true, true, true],
    ],
    ['pnpm-lock.yaml', [true, true, true]],
    ['new-workspace/index.ts', [true, true, true]],
  ])('selects downstream validation for %s', (path, expected) => {
    expect(Object.values(selectScope([path]))).toEqual(expected);
  });
  it('combines independent app changes', () => {
    expect(
      selectScope(['apps/web/package.json', 'apps/storybook/package.json']),
    ).toEqual({ code: false, web: true, storybook: true });
  });
});

describe('CI scope CLI with real Git renames', () => {
  it.each([
    [
      'apps/web/example.md',
      'docs/example.md',
      'code=false\nweb=true\nstorybook=false\n',
    ],
    [
      'apps/web/example.md',
      'apps/storybook/example.md',
      'code=false\nweb=true\nstorybook=true\n',
    ],
    [
      'packages/example.ts',
      'docs/example.ts',
      'code=true\nweb=true\nstorybook=true\n',
    ],
  ])('validates both areas when %s moves to %s', (from, to, expected) => {
    const repo = mkdtempSync(join(tmpdir(), 'cods-scope-'));
    const output = join(repo, 'scope-output');
    const git = (...args: string[]) =>
      execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
    try {
      git('init', '-b', 'main');
      git('config', 'user.name', 'Scope regression test');
      git('config', 'user.email', 'scope@example.invalid');
      git('config', 'commit.gpgsign', 'false');
      mkdirSync(dirname(join(repo, from)), { recursive: true });
      writeFileSync(
        join(repo, from),
        'Unchanged contents make Git detect a rename.\n',
      );
      git('add', '.');
      git('commit', '-m', 'base');
      const base = git('rev-parse', 'HEAD').trim();
      mkdirSync(dirname(join(repo, to)), { recursive: true });
      git('mv', from, to);
      git('commit', '-m', 'cross-area rename');
      expect(
        git('diff', '--name-status', '--find-renames', base, 'HEAD'),
      ).toContain('R100');
      execFileSync(
        process.execPath,
        [
          fileURLToPath(new URL('../scripts/ci-scope.mjs', import.meta.url)),
          base,
        ],
        {
          cwd: repo,
          env: { ...process.env, GITHUB_OUTPUT: output },
        },
      );
      expect(readFileSync(output, 'utf8')).toBe(expected);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});
