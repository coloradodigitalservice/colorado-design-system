# Foundation CI workflow

`.github/workflows/foundation.yml` runs on pull requests, pushes to `main` and
`release/**`, and manual dispatch. Pushes to release branches run all validation
jobs, so a release branch can be validated before its tag is created. The
workflow does not deploy a production site. Superseded runs for the same
PR/ref are cancelled.

## Jobs and selection

`scope` compares the PR base SHA with the checked-out merge commit. The Git diff
is NUL-delimited and uses `--no-renames`, so a moved file selects validation for
both its old and new locations. Unknown paths select every job. Main pushes and
manual runs select all jobs.

| Changed paths                                                                                 | Selected validation          |
| --------------------------------------------------------------------------------------------- | ---------------------------- |
| `docs/**`, root README, AGENTS, LICENSE                                                       | `repository` only            |
| `apps/web/**`, including published Markdown                                                   | `repository` and `web`       |
| `apps/storybook/**`                                                                           | `repository` and `storybook` |
| Contract sample fixtures, packages, tests, config, lockfile, workflow, scripts, unknown paths | All jobs                     |

Every run executes `repository`: frozen dependency installation, workspace
boundaries, and formatting. Pushes to `main` and release branches select all
jobs. The selected jobs add these checks:

- `code`: workspace validation, token drift, lint, root TypeScript checking,
  Vitest, and package/static-consumer builds.
- `web`: token drift, lint, the Astro site and dependency builds (including Astro
  validation and generated internal links/anchors), and Chromium/Firefox/WebKit smoke/axe checks.
- `storybook`: token drift, lint, Storybook and dependency builds (including its
  own TypeScript project), and Chromium smoke/axe checks of every built story.

`foundation` always runs after the other jobs. It fails if any selected job fails
or is cancelled. Configure **foundation** as the required status check in the
repository ruleset; conditional jobs can legitimately be skipped. Workflow-level
path exclusions are avoided so the required check receives a result on every PR.

## Reproduce a run locally

Use the pinned toolchain from the repository root:

```sh
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm test:browser:install
pnpm check
```

On Linux, install browser system dependencies with
`pnpm exec playwright install --with-deps chromium firefox webkit`. The full gate builds both
sites before browser tests. For a scoped web run:

```sh
pnpm exec turbo run build --filter=@cods-internal/web...
CODS_BROWSER_TARGET=web pnpm test:browser
```

Replace `web` with `storybook` for that app. Targets are validated and select the
named preview server and its project; invalid targets fail immediately. Previews
use Vite's multi-page mode so missing routes return HTTP 404, and browser tests
verify that behavior. Ports 4321/6006 must be free; existing servers are not reused.
Browser checks run against built static files, not development or deployed pages.
Automated axe results supplement the component contract's manual accessibility
requirements.

## Inspect failures and artifacts

Open the PR's **Checks** tab or the repository's **Actions → Foundation** run.
Start with the failing job and step. For browser failures, download that app's
`<app>-browser-results-<sha>` artifact and open a retained trace:

```sh
pnpm exec playwright show-trace path/to/trace.zip
```

Both apps upload HTML reports and test results for seven days, even on failure.
Reports include axe JSON, console diagnostics, failure screenshots, and traces.
See [browser testing conventions](../tests/README.md) for configuration extension
and visual baseline guidance. Successful browser jobs
upload `web-preview-<sha>` and `storybook-preview-<sha>` for fourteen days. These
ZIP artifacts contain `apps/web/dist` or `apps/storybook/storybook-static` contents;
extract a preview and serve its root with a local static HTTP server. Each job
uploads to a distinct name. These are downloadable review builds. Hosted previews
require a separately approved and connected static host.

To rerun a failed workflow, use **Re-run failed jobs** on its Actions page; new
commits also trigger fresh PR checks. Manual dispatch is available once the
workflow exists on the default branch. Record validation links in the PR/ticket,
not a running acceptance diary in this guide.

## Workflow maintenance

Tag-driven `0.x` releases use a separate workflow, [`release.yml`](../.github/workflows/release.yml), documented in [the release workflow](RELEASE.md). Its action pins follow the same rules below.

The workflow uses GitHub-hosted Ubuntu runners, read-only `contents` permission,
checkout without persisted credentials, and no deployment secrets. All third-party
actions are pinned to complete commit SHAs. Upgrade a pin only after verifying
its upstream release commit and runner/input compatibility; then confirm its
actual upload in a PR run. `upload-artifact` v7.0.1 uses Node 24 and retains ZIP
archive behavior by default, compatible with these hosted runners and directory
uploads ([upstream action](https://github.com/actions/upload-artifact/tree/v7.0.1)).
Keep artifact names unique and retention explicit.

Scope selection is covered by both path unit tests and temporary-Git-repository
regression tests for cross-area renames. When changing path rules, extend those
tests so removing or moving a file cannot silently drop affected validation.
