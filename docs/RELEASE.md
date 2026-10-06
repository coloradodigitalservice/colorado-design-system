# Release workflow

This is the repeatable process for producing a release of the CoDS packages. Versions below `1.0.0` (the `0.x` series) are **development** releases: they are published as GitHub prereleases and the changelog states they are not supported. A `1.0.x` release is a supported release and is gated on the readiness criteria in the [release policy](memos/ADR_Acceptance_Memo_2026-09-14.md#release-policy); the tooling does not decide that readiness, and `pnpm check:workspace` allows `0.x.y` package versions until that gate is deliberately opened. npm trusted publishing and long-term support are out of scope.

## What a release contains

Pushing a tag such as `v0.0.1` (or `v1.0.0`) triggers [`release.yml`](../.github/workflows/release.yml), which generates everything below from the tagged commit. Nothing is written by hand.

| File                                                  | Purpose                                                                                                    |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `coloradodigitalservice-colorado-design-tokens-*.tgz` | npm package archive for the tokens package                                                                 |
| `coloradodigitalservice-colorado-design-system-*.tgz` | npm package archive for the design system, depending on the exact tokens version                           |
| `colorado-design-system-*.tar.gz`                     | Archive for non-npm consumers: `dist/`, token outputs, `LICENSE`, `CHANGELOG.md`, `VERSION`                |
| `*.cdx.json` (one per package)                        | CycloneDX software bill of materials: production dependencies from the lockfile, including bundled USWDS   |
| `CHANGELOG.md`                                        | Non-stable notice, known breaking changes, other changes, commits, accessibility status, USWDS attribution |
| `release-manifest.json`                               | Version, tag, commit, toolchain, USWDS pin, package files, hashes, docs version, a11y status               |
| `SHA256SUMS`                                          | `sha256sum` checksums for every other file, including the manifest                                         |

Release notes and assets are published as a GitHub **prerelease**. The workflow does not publish to npm; see [npm publication](#npm-publication).

## Cutting a release

1. **Record intent.** Run `pnpm changeset`, choose `patch` for a task release or `minor` to close a phase, and describe the change. Start the summary with `BREAKING:` for a breaking change; those are listed under "Known breaking changes". The two `@coloradodigitalservice` packages are a Changesets `fixed` group, so they always share one version. Internal `@cods-internal/*` workspaces are ignored.
2. **Version.** On a branch containing only the changes intended for this release, run `pnpm release:version`. It consumes the changesets, bumps both packages, and writes each package's `CHANGELOG.md`. Commit the version changes. For phase-only releases, base `release/<version>` on the last commit included in that phase so later-phase work is excluded.
3. **Validate.** Push `release/<version>` (for example `release/0.1.0`) and wait for the [Foundation workflow](CI.md) to pass on its tip. Keep the branch tip unchanged until release generation finishes.
4. **Tag.** Create `v<version>` on that exact release-branch tip and push it. A tag may instead target a commit already on `main`. Pushing the tag is the approval; the release workflow accepts a release-branch tag only when its commit is still the branch tip.
5. **Generate and publish.** The `build` job runs the repository gate and generates the artifacts without any secret. The `publish` job then verifies `SHA256SUMS` and creates the GitHub release (a prerelease for any `0.x` version).

## Gates enforced by the workflow

`scripts/release.mjs` fails the release if any of these do not hold:

- The tag matches `vMAJOR.MINOR.PATCH` (above `0.0.0`), and its commit is on `main` or exactly the tip of `release/<version>`.
- Both package versions, the packed dependency range between them, and the version shown in the documentation footer (`data-cods-release`) all equal the tag version.
- The working tree is clean after the build, so artifacts match the tagged commit.
- A `## <version>` entry exists in a package changelog (that is, `pnpm release:version` ran).
- A clean `npm install` of both tarballs resolves the tag version and exposes `dist/`, token outputs, and an importable ESM entry; the archive extracts with its CSS.
- Each package has a CycloneDX SBOM whose root matches the package and tag version, and the design-system SBOM lists `uswds`. SBOMs cover npm dependencies only; bundled font files are not in them.

The `build` job also runs workspace, format, token drift, lint, typecheck, unit test, and build checks. Browser and axe checks run in the [Foundation workflow](CI.md); confirm it passed on the tagged commit before tagging.

## Credentials

The workflow uses only the repository `GITHUB_TOKEN`. The `build` job has `contents: read` and runs on tag pushes only, so pull requests cannot start it or reach `contents: write`. Only the `publish` job has write access. There is no approval gate between the jobs: the Senior Developer, who pushes the tag, is the sole approver for now, and anyone without write access to the repository cannot trigger a release. Two optional controls need repository admin access and are not configured:

- A tag ruleset limiting creation of `v*` tags to named maintainers, plus branch protection for `main`.
- A GitHub environment with required reviewers on the `publish` job (`environment:`), for a second approver once the client team takes over.

No npm token, signing key, or other secret is used by the workflow. Introducing one requires an environment secret held by the project owners and a documented ownership decision before this workflow changes.

## npm publication

The `@coloradodigitalservice` npm scope is set up. The project's Senior Developer publishes to npm by hand until the client team takes over, using the verified tarballs from the GitHub release (`npm publish <file>.tgz`) and their own credentials, so no npm secret is stored in CI. Both packages are `private` until the first publication; removing `private` from them, and from the matching rule in `scripts/check-workspace.mjs`, is a deliberate change made at that time. Ownership of publishing moves to the client team by a recorded handoff.

## Verify a release

```sh
sha256sum --check SHA256SUMS     # shasum -a 256 -c SHA256SUMS on macOS
tar -xOf coloradodigitalservice-colorado-design-system-0.0.1.tgz package/package.json
npm install ./coloradodigitalservice-colorado-design-tokens-0.0.1.tgz ./coloradodigitalservice-colorado-design-system-0.0.1.tgz
```

The tarballs depend on each other at the exact release version, so install both together.

## Rehearse locally

Use a scratch clone, not your working checkout. Commit the version bump, create a local tag, run the build, then generate the artifacts:

```sh
pnpm release:version && git commit -am "Version packages" && git tag v0.0.1
pnpm build
pnpm release:artifacts v0.0.1        # writes ./release (ignored by Git)
```

`--allow-untagged` skips the tag-exists check for a dry run before tagging; `--out <dir>` changes the output directory. The script deletes that directory first, so it refuses a missing value, the repository root or any parent, anything inside `.git`, and any non-empty directory that is not a previous release output. Archive bytes include file timestamps, so rebuilding yields different hashes; the published `SHA256SUMS` is the reference for a given release.

## Rollback

A bad release is withdrawn by deleting the GitHub release and tag and issuing the next patch version. Do not rewrite or re-upload a released artifact. The [rollback runbook](governance/release-rollback-runbook.md) covers production documentation and Storybook hosting.
