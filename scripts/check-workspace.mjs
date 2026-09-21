#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scope = '@coloradodigitalservice/';
const expected = new Map([
  [
    'packages/colorado-design-tokens',
    { name: `${scope}colorado-design-tokens`, internal: [] },
  ],
  [
    'packages/colorado-design-system',
    {
      name: `${scope}colorado-design-system`,
      internal: [`${scope}colorado-design-tokens`],
    },
  ],
  [
    'apps/web',
    {
      name: '@cods-internal/web',
      internal: [
        `${scope}colorado-design-system`,
        `${scope}colorado-design-tokens`,
      ],
    },
  ],
  [
    'apps/storybook',
    {
      name: '@cods-internal/storybook',
      internal: [
        `${scope}colorado-design-system`,
        `${scope}colorado-design-tokens`,
      ],
    },
  ],
  [
    'examples/static-html',
    {
      name: '@cods-internal/example-static-html',
      internal: [`${scope}colorado-design-system`],
    },
  ],
]);
const names = new Map([...expected].map(([path, entry]) => [entry.name, path]));
const failures = [];

function fail(message) {
  failures.push(message);
}

function json(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`${path}: ${error.message}`);
    return null;
  }
}

function validateWorkspace(path) {
  const expectation = expected.get(path);
  const manifestPath = join(root, path, 'package.json');
  const manifest = json(manifestPath);
  if (!manifest) return;

  if (manifest.name !== expectation.name)
    fail(`${path}: expected name ${expectation.name}`);
  if (manifest.version !== '0.0.0') fail(`${path}: expected version 0.0.0`);
  if (manifest.private !== true)
    fail(`${path}: must remain private during skeleton work`);
  if (manifest.repository?.directory !== path)
    fail(`${path}: repository.directory must match its workspace path`);
  if (
    manifest.repository?.url !==
    'https://github.com/coloradodigitalservice/colorado-design-system.git'
  ) {
    fail(`${path}: repository.url must point to the State repository`);
  }
  if (
    manifest.scripts?.validate !==
    `node ../../scripts/check-workspace.mjs --workspace ${path}`
  ) {
    fail(`${path}: validate script must run this workspace check`);
  }

  const dependencyGroups = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ];
  const actualInternal = [];
  for (const group of dependencyGroups) {
    for (const [name, range] of Object.entries(manifest[group] ?? {})) {
      if (names.has(name)) {
        actualInternal.push(name);
        if (group !== 'dependencies')
          fail(`${path}: ${name} must be a regular dependency`);
        if (range !== 'workspace:*')
          fail(`${path}: ${name} must use workspace:*`);
      } else if (range.startsWith('workspace:')) {
        fail(`${path}: ${name} is not a declared local workspace`);
      }
    }
  }
  const wanted = [...expectation.internal].sort();
  const actual = actualInternal.sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    fail(
      `${path}: internal dependencies differ from the approved boundary (${wanted.join(', ') || 'none'})`,
    );
  }

  const requireFromWorkspace = createRequire(manifestPath);
  for (const name of expectation.internal) {
    try {
      const resolved = requireFromWorkspace.resolve(`${name}/package.json`);
      const target = realpathSync(join(root, names.get(name), 'package.json'));
      if (realpathSync(resolved) !== target)
        fail(`${path}: ${name} resolves outside its local workspace`);
    } catch (error) {
      fail(
        `${path}: ${name} is not installed as a local workspace link (${error.code ?? error.message})`,
      );
    }
  }
}

function validateRepository() {
  for (const area of [
    'apps/web',
    'apps/storybook',
    'packages/colorado-design-tokens',
    'packages/colorado-design-system',
    'examples/static-html',
    'docs/governance',
    'config',
    'scripts',
    'tests',
    '.github/workflows',
  ]) {
    if (!existsSync(join(root, area)))
      fail(`required repository area is missing: ${area}`);
  }
  const rootManifest = json(join(root, 'package.json'));
  if (rootManifest) {
    if (rootManifest.private !== true) fail('root package must be private');
    if (rootManifest.packageManager !== 'pnpm@12.4.2')
      fail('root packageManager must pin pnpm@12.4.2');
    if (rootManifest.engines?.node !== '24.21.0')
      fail('root engines.node must pin 24.21.0');
    if (rootManifest.devDependencies?.turbo !== '2.10.13')
      fail('root must pin turbo@2.10.13');
  }
  if (readFileSync(join(root, '.nvmrc'), 'utf8').trim() !== '24.21.0')
    fail('.nvmrc must pin 24.21.0');

  const workspaceFile = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8');
  const packageSection =
    workspaceFile.match(/^packages:\s*\n((?: {2}- .+\n)+)/m)?.[1] ?? '';
  const globs = [...packageSection.matchAll(/^ {2}- ['"]?([^'"\s]+)['"]?$/gm)]
    .map((match) => match[1])
    .sort();
  if (
    JSON.stringify(globs) !==
    JSON.stringify(['apps/*', 'examples/*', 'packages/*'])
  ) {
    fail(
      'pnpm-workspace.yaml must declare apps/*, packages/*, and examples/* only',
    );
  }

  const discovered = [];
  for (const parent of ['apps', 'packages', 'examples']) {
    for (const entry of readdirSync(join(root, parent), {
      withFileTypes: true,
    })) {
      if (
        entry.isDirectory() &&
        existsSync(join(root, parent, entry.name, 'package.json'))
      ) {
        discovered.push(`${parent}/${entry.name}`);
      }
    }
  }
  if (
    JSON.stringify(discovered.sort()) !==
    JSON.stringify([...expected.keys()].sort())
  ) {
    fail(
      `workspace discovery differs from the approved five: ${discovered.join(', ')}`,
    );
  }

  const turbo = json(join(root, 'turbo.json'));
  if (
    turbo &&
    (JSON.stringify(turbo.tasks?.validate?.dependsOn) !==
      JSON.stringify(['^validate']) ||
      turbo.tasks?.validate?.cache !== false)
  ) {
    fail(
      'turbo validate task must follow local dependency order with caching disabled',
    );
  }
}

const [mode, path] = process.argv.slice(2);
if (mode === '--repo' && path === undefined) {
  validateRepository();
  for (const workspace of expected.keys()) validateWorkspace(workspace);
} else if (mode === '--workspace' && expected.has(path)) {
  validateWorkspace(path);
} else {
  fail('usage: check-workspace.mjs --repo | --workspace <approved path>');
}

if (failures.length) {
  for (const message of failures) process.stderr.write(`✗ ${message}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    mode === '--repo'
      ? '✓ Five CoDS workspaces and local links verified\n'
      : `✓ ${path} verified\n`,
  );
}
