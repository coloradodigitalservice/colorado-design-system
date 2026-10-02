import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const RELEASE_TAG = /^v((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/;

export const STATUS_NOTICE =
  'This is a `0.0.x` development release, not a supported release. Markup, tokens, CSS custom properties, controller APIs, fixtures, and package boundaries may change between releases without a migration path.';

export const USWDS_ATTRIBUTION =
  'CoDS incorporates components and styles from the U.S. Web Design System (USWDS), maintained by the General Services Administration. USWDS is a public-domain design system for U.S. federal government websites and applications. See https://designsystem.digital.gov/ for more information.';

export function versionFromTag(tag) {
  const match = RELEASE_TAG.exec(tag);
  if (!match || match[1] === '0.0.0') {
    throw new Error(
      `"${tag}" is not a release tag (expected vMAJOR.MINOR.PATCH, above 0.0.0)`,
    );
  }
  return match[1];
}

// Pre-1.0 versions are the development channel; 1.0 and later are supported releases.
export function releaseChannel(version) {
  return version.startsWith('0.') ? 'development' : 'supported';
}

export function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

// `requires` lists dependency names that must appear in the SBOM (for example bundled USWDS).
export function validateSbom(sbom, { name, version, requires = [] }) {
  if (sbom.bomFormat !== 'CycloneDX') {
    throw new Error(`SBOM for ${name} is not CycloneDX`);
  }
  const expected = `pkg:npm/${name.replace('@', '%40')}@${version}`;
  if (sbom.metadata?.component?.purl !== expected) {
    throw new Error(
      `SBOM root is ${sbom.metadata?.component?.purl}, expected ${expected}`,
    );
  }
  const present = new Set((sbom.components ?? []).map((c) => c.name));
  for (const dependency of requires) {
    if (!present.has(dependency)) {
      throw new Error(`SBOM for ${name} does not list ${dependency}`);
    }
  }
}

// Changesets writes "## <version>" headings into each package's CHANGELOG.md.
export function versionSection(markdown, version) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start === -1) return null;
  const end = lines.findIndex((line, i) => i > start && /^## /.test(line));
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join('\n')
    .trim();
}

export function changeEntries(section) {
  const entries = [];
  for (const line of section.split('\n')) {
    if (/^- /.test(line)) entries.push(line);
    else if (entries.length > 0 && /^\s+\S/.test(line)) {
      entries[entries.length - 1] += `\n${line}`;
    }
  }
  return entries.filter((entry) => !entry.startsWith('- Updated dependencies'));
}

export function mergeEntries(sections) {
  return [...new Set(sections.flatMap(changeEntries))];
}

export function isBreaking(entry) {
  return /\bBREAKING:/.test(entry);
}

export function accessibilityLines(components) {
  if (components.length === 0) {
    return [
      'No components ship in this release; no accessibility evidence applies yet.',
    ];
  }
  return [
    '| Component | Maturity | Evidence file |',
    '| --- | --- | --- |',
    ...components.map(
      ({ name, maturity, evidence }) =>
        `| ${name} | ${maturity} | ${evidence ? 'present' : 'missing'} |`,
    ),
    '',
    'Evidence presence only. Screen-reader findings and `stable` sign-off come from people, not this workflow.',
  ];
}

export function buildChangelog({
  version,
  tag,
  commit,
  date,
  entries,
  commits,
  previousTag,
  components,
}) {
  const development = releaseChannel(version) === 'development';
  const breaking = entries.filter(isBreaking);
  const other = entries.filter((entry) => !isBreaking(entry));
  const lines = [
    `# Colorado Design System ${version}`,
    '',
    ...(development ? [`> **Development release.** ${STATUS_NOTICE}`, ''] : []),
    `- Tag: \`${tag}\``,
    `- Commit: \`${commit}\``,
    `- Date: ${date}`,
    '',
    '## Known breaking changes',
    '',
    ...(breaking.length > 0
      ? breaking
      : [
          development
            ? 'None recorded. Treat every change in this series as potentially breaking.'
            : 'None recorded.',
        ]),
    '',
    '## Other changes',
    '',
    ...(other.length > 0 ? other : ['None.']),
    '',
    `## Commits${previousTag ? ` since ${previousTag}` : ''}`,
    '',
    ...(commits.length > 0 ? commits.map((c) => `- ${c}`) : ['None.']),
    '',
    '## Accessibility evidence status',
    '',
    ...accessibilityLines(components),
    '',
    '## Attribution',
    '',
    USWDS_ATTRIBUTION,
    '',
  ];
  return lines.join('\n');
}

export function formatChecksums(files) {
  return `${[...files]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, sha256: hash }) => `${hash}  ${name}`)
    .join('\n')}\n`;
}

export function buildManifest({
  version,
  tag,
  commit,
  date,
  repository,
  toolchain,
  uswds,
  packages,
  files,
  components,
  docsVersionVerified,
}) {
  return {
    schemaVersion: 1,
    release: {
      version,
      tag,
      channel: releaseChannel(version),
      stable: releaseChannel(version) === 'supported',
    },
    source: { repository, commit, committedAt: date },
    toolchain,
    dependencies: { uswds },
    packages,
    files,
    documentation: { version, verified: docsVersionVerified },
    accessibility: {
      components,
      note: 'Evidence presence only; stable sign-off is a human decision.',
    },
  };
}
