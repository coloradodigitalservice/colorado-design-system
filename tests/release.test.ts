// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  accessibilityLines,
  buildChangelog,
  changeEntries,
  formatChecksums,
  isBreaking,
  mergeEntries,
  releaseChannel,
  validateSbom,
  versionFromTag,
  versionSection,
  // @ts-expect-error The release helpers are plain Node ESM without a TS build.
} from '../scripts/release-lib.mjs';

const packageChangelog = `# @coloradodigitalservice/colorado-design-system

## 0.0.2

### Patch Changes

- 1a2b3c4: BREAKING: rename the \`--cods-card-gap\` property
  to \`--cods-card-space\`.
- 5d6e7f8: Add the Tag component.
- Updated dependencies [1a2b3c4]
  - @coloradodigitalservice/colorado-design-tokens@0.0.2

## 0.0.1

### Patch Changes

- 9a8b7c6: Initial release.
`;

describe('release tags', () => {
  it.each([
    ['v0.0.1', '0.0.1'],
    ['v0.0.42', '0.0.42'],
    ['v0.1.0', '0.1.0'],
    ['v1.0.0', '1.0.0'],
  ])('accepts %s', (tag, version) => {
    expect(versionFromTag(tag)).toBe(version);
  });

  it.each(['v0.0.0', 'v0.0.1-rc.1', '0.0.1', 'v0.0.01', 'v1.0'])(
    'rejects %s',
    (tag) => {
      expect(() => versionFromTag(tag)).toThrow(/not a release tag/);
    },
  );

  it('treats pre-1.0 versions as development and later ones as supported', () => {
    expect(releaseChannel('0.0.3')).toBe('development');
    expect(releaseChannel('0.9.0')).toBe('development');
    expect(releaseChannel('1.0.0')).toBe('supported');
  });
});

describe('changelog generation', () => {
  it('selects only the requested version section', () => {
    const section = versionSection(packageChangelog, '0.0.2');
    expect(section).toContain('Add the Tag component');
    expect(section).not.toContain('Initial release');
    expect(versionSection(packageChangelog, '0.0.3')).toBeNull();
  });

  it('keeps wrapped entries and drops dependency bumps', () => {
    const entries = changeEntries(versionSection(packageChangelog, '0.0.2'));
    expect(entries).toHaveLength(2);
    expect(entries[0]).toContain('to `--cods-card-space`');
  });

  it('deduplicates entries repeated across fixed-group packages', () => {
    const section = versionSection(packageChangelog, '0.0.2');
    expect(mergeEntries([section, section])).toHaveLength(2);
  });

  it('lists breaking entries and states the non-stable status', () => {
    const entries = changeEntries(versionSection(packageChangelog, '0.0.2'));
    expect(entries.filter(isBreaking)).toHaveLength(1);
    const changelog = buildChangelog({
      version: '0.0.2',
      tag: 'v0.0.2',
      commit: 'abc123',
      date: '2026-10-05T12:00:00-06:00',
      entries,
      commits: ['abc123 Add Tag'],
      previousTag: 'v0.0.1',
      components: [],
    });
    expect(changelog).toContain('Development release.');
    expect(changelog).toContain('not a supported release');
    expect(changelog).toMatch(
      /## Known breaking changes\n\n- 1a2b3c4: BREAKING/,
    );
    expect(changelog).toContain('## Commits since v0.0.1');
    expect(changelog.match(/BREAKING:/g)).toHaveLength(1);
    expect(changelog).toContain('No components ship in this release');
    expect(changelog).toContain('U.S. Web Design System (USWDS)');
  });

  it('reports none when nothing is marked breaking', () => {
    const changelog = buildChangelog({
      version: '0.0.1',
      tag: 'v0.0.1',
      commit: 'abc123',
      date: 'now',
      entries: ['- 9a8b7c6: Initial release.'],
      commits: [],
      previousTag: '',
      components: [],
    });
    expect(changelog).toContain('None recorded.');
  });

  it('omits the development notice for a supported release', () => {
    const changelog = buildChangelog({
      version: '1.0.0',
      tag: 'v1.0.0',
      commit: 'abc123',
      date: 'now',
      entries: ['- 9a8b7c6: First supported release.'],
      commits: [],
      previousTag: 'v0.0.9',
      components: [],
    });
    expect(changelog).not.toContain('Development release.');
    expect(changelog).toContain('None recorded.');
    expect(changelog).not.toContain('potentially breaking');
  });

  it('reports evidence presence per component', () => {
    const lines = accessibilityLines([
      { name: 'tag', maturity: 'experimental', evidence: true },
      { name: 'card', maturity: 'experimental', evidence: false },
    ]).join('\n');
    expect(lines).toContain('| tag | experimental | present |');
    expect(lines).toContain('| card | experimental | missing |');
  });
});

describe('checksums', () => {
  it('uses sha256sum format sorted by file name', () => {
    expect(
      formatChecksums([
        { name: 'b.tgz', sha256: '2'.repeat(64) },
        { name: 'a.tgz', sha256: '1'.repeat(64) },
      ]),
    ).toBe(`${'1'.repeat(64)}  a.tgz\n${'2'.repeat(64)}  b.tgz\n`);
  });
});

describe('SBOM validation', () => {
  const sbom = {
    bomFormat: 'CycloneDX',
    metadata: {
      component: {
        purl: 'pkg:npm/%40coloradodigitalservice/colorado-design-system@0.0.1',
      },
    },
    components: [{ name: 'uswds' }],
  };
  const expected = {
    name: '@coloradodigitalservice/colorado-design-system',
    version: '0.0.1',
    requires: ['uswds'],
  };

  it('accepts a CycloneDX SBOM for the package and version', () => {
    expect(() => validateSbom(sbom, expected)).not.toThrow();
  });

  it('rejects the wrong root, format, or a missing dependency', () => {
    expect(() => validateSbom(sbom, { ...expected, version: '0.0.2' })).toThrow(
      /expected pkg:npm/,
    );
    expect(() =>
      validateSbom({ ...sbom, bomFormat: 'SPDX' }, expected),
    ).toThrow(/not CycloneDX/);
    expect(() => validateSbom({ ...sbom, components: [] }, expected)).toThrow(
      /does not list uswds/,
    );
  });
});
