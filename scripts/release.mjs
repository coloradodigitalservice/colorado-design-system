#!/usr/bin/env node

// Builds the release artifacts (packages, archive, changelog, SBOMs, manifest, checksums) for a version tag. Run after `pnpm build`.
// Usage: node scripts/release.mjs <tag> [--out <dir>] [--allow-untagged]

import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertSafeOutputDir,
  buildChangelog,
  buildManifest,
  formatChecksums,
  mergeEntries,
  sha256,
  validateSbom,
  versionFromTag,
  versionSection,
} from './release-lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageDirs = {
  tokens: 'packages/colorado-design-tokens',
  system: 'packages/colorado-design-system',
};

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    ...options,
  }).trim();
}

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'));
}

function parseArguments(argv) {
  const options = { out: join(root, 'release'), allowUntagged: false };
  let tag;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') {
      const value = argv[++i];
      if (!value || value.startsWith('--'))
        throw new Error('--out requires a directory path');
      options.out = resolve(value);
    } else if (argv[i] === '--allow-untagged') options.allowUntagged = true;
    else if (!tag && !argv[i].startsWith('--')) tag = argv[i];
    else throw new Error(`Unexpected argument: ${argv[i]}`);
  }
  if (!tag) {
    throw new Error(
      'usage: release.mjs <tag> [--out <dir>] [--allow-untagged]',
    );
  }
  return { tag, ...options };
}

function verifySource(tag, allowUntagged) {
  const commit = run('git', ['rev-parse', 'HEAD']);
  const tagged = run('git', ['tag', '--list', tag]) === tag;
  if (tagged) {
    const tagCommit = run('git', ['rev-parse', `${tag}^{commit}`]);
    if (tagCommit !== commit)
      throw new Error(`HEAD (${commit}) is not the commit tagged ${tag}`);
  } else if (!allowUntagged) {
    throw new Error(
      `Tag ${tag} does not exist; create it or use --allow-untagged`,
    );
  }
  if (run('git', ['status', '--porcelain']) !== '') {
    throw new Error(
      'Working tree is not clean; artifacts must match the tagged commit',
    );
  }
  return {
    commit,
    date: run('git', ['show', '-s', '--format=%cI', 'HEAD']),
    tagged,
  };
}

function verifyVersions(version) {
  const manifests = {};
  for (const [key, dir] of Object.entries(packageDirs)) {
    manifests[key] = readJson(`${dir}/package.json`);
    if (manifests[key].version !== version) {
      throw new Error(
        `${manifests[key].name} is ${manifests[key].version}, but the tag is ${version}; run "pnpm release:version" and commit before tagging`,
      );
    }
  }
  return manifests;
}

function verifyDocsVersion(version) {
  const index = join(root, 'apps/web/dist/index.html');
  if (!existsSync(index))
    throw new Error('apps/web/dist is missing; run "pnpm build" first');
  const html = readFileSync(index, 'utf8');
  if (!html.includes(`data-cods-release="${version}"`)) {
    throw new Error(`Documentation site does not show version ${version}`);
  }
}

function requireBuildOutputs() {
  for (const file of [
    'dist/colorado-design-system.mjs',
    'dist/colorado-design-system.css',
  ]) {
    if (!existsSync(join(root, packageDirs.system, file)))
      throw new Error(
        `${packageDirs.system}/${file} is missing; run "pnpm build" first`,
      );
  }
  if (!existsSync(join(root, packageDirs.tokens, 'generated/tokens.css')))
    throw new Error('Token output is missing; run "pnpm tokens:build" first');
}

function packPackage(dir, name, version, out) {
  run('pnpm', ['pack', '--pack-destination', out], { cwd: join(root, dir) });
  const file = `${name.replace('@', '').replace('/', '-')}-${version}.tgz`;
  if (!existsSync(join(out, file)))
    throw new Error(`pnpm pack did not create ${file}`);
  return file;
}

function generateSbom(name, version, out, requires) {
  const file = `${name.replace('@', '').replace('/', '-')}-${version}.cdx.json`;
  run('pnpm', [
    '--filter',
    name,
    'sbom',
    '--sbom-format',
    'cyclonedx',
    '--prod',
    '--lockfile-only',
    '--out',
    join(out, file),
  ]);
  validateSbom(JSON.parse(readFileSync(join(out, file), 'utf8')), {
    name,
    version,
    requires,
  });
  return file;
}

function createArchive(version, out, tokens, system) {
  const folder = `colorado-design-system-${version}`;
  const stage = mkdtempSync(join(tmpdir(), 'cods-archive-'));
  try {
    const target = join(stage, folder);
    cpSync(join(root, packageDirs.system, 'dist'), join(target, 'dist'), {
      recursive: true,
    });
    for (const file of [
      'tokens.css',
      'tokens.json',
      'tokens.d.ts',
      '_tokens.scss',
    ]) {
      cpSync(
        join(root, packageDirs.tokens, 'generated', file),
        join(target, 'tokens', file),
      );
    }
    cpSync(join(root, 'LICENSE'), join(target, 'LICENSE'));
    cpSync(join(out, 'CHANGELOG.md'), join(target, 'CHANGELOG.md'));
    writeFileSync(
      join(target, 'VERSION'),
      `${version}\n${tokens.name}@${tokens.version}\n${system.name}@${system.version}\n`,
    );
    const file = `${folder}.tar.gz`;
    run('tar', ['-czf', join(out, file), '-C', stage, folder]);
    return file;
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

function previousReleaseTag(head) {
  try {
    return run(
      'git',
      ['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*', `${head}^`],
      { stdio: ['ignore', 'pipe', 'ignore'] },
    );
  } catch {
    return '';
  }
}

function collectChangelog(version, tag, source) {
  const sections = [];
  for (const dir of Object.values(packageDirs)) {
    const path = join(root, dir, 'CHANGELOG.md');
    const section = existsSync(path)
      ? versionSection(readFileSync(path, 'utf8'), version)
      : null;
    if (section) sections.push(section);
  }
  if (sections.length === 0) {
    throw new Error(
      `No ${version} entry in a package CHANGELOG.md; run "pnpm release:version" and commit before tagging`,
    );
  }
  const head = source.tagged ? tag : 'HEAD';
  const previousTag = previousReleaseTag(head);
  const range = previousTag ? `${previousTag}..${head}` : head;
  const commits = run('git', ['log', '--no-merges', '--format=%h %s', range])
    .split('\n')
    .filter(Boolean);
  return {
    entries: mergeEntries(sections),
    commits,
    previousTag,
    commit: source.commit,
  };
}

function collectComponents() {
  const base = join(root, packageDirs.system, 'src/components');
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const dir = join(base, entry.name);
      const metadata = join(dir, `${entry.name}.metadata.json`);
      if (!existsSync(metadata)) return [];
      return [
        {
          name: entry.name,
          maturity:
            JSON.parse(readFileSync(metadata, 'utf8')).maturity ?? 'unknown',
          evidence: existsSync(
            join(dir, 'accessibility', `${entry.name}.evidence.md`),
          ),
        },
      ];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function verifyCleanInstall(out, version, tokensFile, systemFile, archiveFile) {
  const fixture = mkdtempSync(join(tmpdir(), 'cods-install-'));
  try {
    writeFileSync(
      join(fixture, 'package.json'),
      JSON.stringify({
        name: 'cods-release-fixture',
        private: true,
        type: 'module',
      }),
    );
    execFileSync(
      'npm',
      [
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        join(out, tokensFile),
        join(out, systemFile),
      ],
      { cwd: fixture, stdio: ['ignore', 'ignore', 'inherit'] },
    );
    const scope = join(fixture, 'node_modules/@coloradodigitalservice');
    for (const [name, files] of [
      [
        'colorado-design-tokens',
        ['generated/tokens.css', 'generated/tokens.json', '_index.scss'],
      ],
      [
        'colorado-design-system',
        ['dist/colorado-design-system.mjs', 'dist/colorado-design-system.css'],
      ],
    ]) {
      const installed = JSON.parse(
        readFileSync(join(scope, name, 'package.json'), 'utf8'),
      ).version;
      if (installed !== version)
        throw new Error(
          `Clean install resolved ${name}@${installed}, expected ${version}`,
        );
      for (const file of files) {
        if (!existsSync(join(scope, name, file)))
          throw new Error(`Clean install is missing ${name}/${file}`);
      }
    }
    execFileSync(
      'node',
      [
        '--input-type=module',
        '-e',
        "await import('@coloradodigitalservice/colorado-design-system');",
      ],
      { cwd: fixture, stdio: ['ignore', 'ignore', 'inherit'] },
    );
    run('tar', ['-xzf', join(out, archiveFile), '-C', fixture]);
    if (
      !existsSync(
        join(
          fixture,
          `colorado-design-system-${version}`,
          'dist',
          'colorado-design-system.css',
        ),
      )
    )
      throw new Error('Archive is missing dist/colorado-design-system.css');
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}

function main() {
  const { tag, out, allowUntagged } = parseArguments(process.argv.slice(2));
  assertSafeOutputDir(out, root);
  const version = versionFromTag(tag);
  const source = verifySource(tag, allowUntagged);
  const manifests = verifyVersions(version);
  requireBuildOutputs();
  verifyDocsVersion(version);

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  const changelog = collectChangelog(version, tag, source);
  const components = collectComponents();
  writeFileSync(
    join(out, 'CHANGELOG.md'),
    buildChangelog({
      version,
      tag,
      date: source.date,
      components,
      ...changelog,
    }),
  );

  const tokensFile = packPackage(
    packageDirs.tokens,
    manifests.tokens.name,
    version,
    out,
  );
  const systemFile = packPackage(
    packageDirs.system,
    manifests.system.name,
    version,
    out,
  );
  const archiveFile = createArchive(
    version,
    out,
    manifests.tokens,
    manifests.system,
  );
  const sbomFiles = {
    tokens: generateSbom(manifests.tokens.name, version, out, []),
    system: generateSbom(manifests.system.name, version, out, ['uswds']),
  };

  const packed = JSON.parse(
    run('tar', ['-xOf', join(out, systemFile), 'package/package.json']),
  );
  const tokensRange = packed.dependencies?.[manifests.tokens.name];
  if (tokensRange !== version) {
    throw new Error(
      `Packed design-system depends on tokens ${tokensRange}, expected exactly ${version}`,
    );
  }

  verifyCleanInstall(out, version, tokensFile, systemFile, archiveFile);

  const fileEntries = (names) =>
    names.map((name) => ({
      name,
      sha256: sha256(join(out, name)),
      bytes: statSync(join(out, name)).size,
    }));
  const artifacts = fileEntries([
    tokensFile,
    systemFile,
    archiveFile,
    sbomFiles.tokens,
    sbomFiles.system,
    'CHANGELOG.md',
  ]);
  const manifest = buildManifest({
    version,
    tag,
    commit: source.commit,
    date: source.date,
    repository: manifests.system.repository.url,
    toolchain: {
      node: process.versions.node,
      pnpm: readJson('package.json').packageManager,
    },
    uswds: manifests.system.dependencies['@uswds/uswds'],
    packages: [manifests.tokens, manifests.system].map(({ name }) => {
      const isTokens = name === manifests.tokens.name;
      return {
        name,
        version,
        file: isTokens ? tokensFile : systemFile,
        sbom: isTokens ? sbomFiles.tokens : sbomFiles.system,
      };
    }),
    files: artifacts,
    components,
    docsVersionVerified: true,
  });
  writeFileSync(
    join(out, 'release-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  writeFileSync(
    join(out, 'SHA256SUMS'),
    formatChecksums(
      fileEntries([...artifacts.map((f) => f.name), 'release-manifest.json']),
    ),
  );

  process.stdout.write(
    `✓ ${tag}: ${readdirSync(out).length} release files written to ${out}\n`,
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`✗ ${error.message}\n`);
  process.exitCode = 1;
}
