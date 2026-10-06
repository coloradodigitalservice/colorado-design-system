# Shared scripts

- `check-workspace.mjs` validates package boundaries, manifest metadata, workspace globs, shared `0.x.y` versions, and installed local links. Run it through `pnpm check` from the root.
- `ci-scope.mjs` selects which CI jobs a pull request needs; see [Foundation CI](../docs/CI.md).
- `check-docs-output.mjs` validates the built documentation site, including the release version in its footer.
- `release.mjs` and `release-lib.mjs` generate the changelog, archives, SBOMs, release manifest, and checksums for a release tag; see [the release workflow](../docs/RELEASE.md).
