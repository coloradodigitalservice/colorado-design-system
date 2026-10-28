import { execFileSync } from 'node:child_process';

const packages = [
  'packages/colorado-design-tokens',
  'packages/colorado-design-system',
];
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const read = (ref, path) => git('show', `${ref}:${path}`);
const failures = [];
const paths = git(
  'ls-tree',
  '-r',
  '--name-only',
  '-z',
  'HEAD',
  '--',
  '.changeset',
)
  .split('\0')
  .filter(Boolean);
const pending = paths.filter(
  (path) => path.endsWith('.md') && path !== '.changeset/README.md',
);
if (pending.length) {
  failures.push(
    `Pending changesets: ${pending.join(', ')}. Run pnpm release:version and commit the updated versions, changelogs, and consumed changesets before merging.`,
  );
}

function versionsAt(ref) {
  return packages.map((path) => {
    const { version } = JSON.parse(read(ref, `${path}/package.json`));
    if (
      typeof version !== 'string' ||
      !/^0\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)
    ) {
      throw new Error(
        `${path}: expected a development version (0.MINOR.PATCH), received ${version}`,
      );
    }
    return version;
  });
}

const versions = versionsAt('HEAD');
if (new Set(versions).size !== 1) {
  failures.push('Both published packages must have the same version.');
}

if (process.argv[2]) {
  const base = git(
    'rev-parse',
    '--verify',
    '--end-of-options',
    `${process.argv[2]}^{commit}`,
  );
  const previous = versionsAt(base);
  if (new Set(previous).size !== 1) {
    throw new Error(
      'The base commit has mismatched published package versions.',
    );
  }
  const changed = git(
    'diff',
    '--no-renames',
    '--name-only',
    '-z',
    base,
    'HEAD',
    '--',
    ...packages,
  );
  const bumped = versions.some((version, index) => version !== previous[index]);
  if (changed && !bumped) {
    failures.push(
      'Published package changes require a version bump. Run pnpm changeset, then pnpm release:version, and commit the generated changes.',
    );
  }
  if (bumped) {
    for (const [index, path] of packages.entries()) {
      const version = versions[index];
      const [, minor, patch] = version.split('.').map(BigInt);
      const [, oldMinor, oldPatch] = previous[index].split('.').map(BigInt);
      if (minor < oldMinor || (minor === oldMinor && patch <= oldPatch)) {
        failures.push(
          `${path}: version ${version} must advance from ${previous[index]} on the PR base. Update your branch from main and regenerate the version changes.`,
        );
      }
      const heading = new RegExp(
        `^## ${version.replaceAll('.', '\\.')}\\s*$`,
        'm',
      );
      if (!heading.test(read('HEAD', `${path}/CHANGELOG.md`))) {
        failures.push(
          `${path}/CHANGELOG.md: missing ## ${version}. Run pnpm release:version and commit the changelog.`,
        );
      }
    }
    if (git('tag', '--list', `v${versions[0]}`)) {
      failures.push(
        `Tag v${versions[0]} already exists. Prepare a new version instead of reusing a released version.`,
      );
    }
  }
}

if (failures.length) {
  for (const failure of failures)
    process.stderr.write(`Release readiness: ${failure}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    'Release readiness: no pending changesets; package version checks passed.\n',
  );
}
