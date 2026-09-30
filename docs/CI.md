# Foundation CI (CODS-P1-007 / CDS-30)

## Job selection

The `Foundation` workflow runs on every PR, pushes to `main`, and manual dispatch.
Require the final `foundation` job in the repository ruleset; it fails when any
selected job fails or is cancelled. Do not require conditional jobs individually.
There are no workflow-level path exclusions that would leave a required check pending.

| Changed paths                                                                                            | Validation                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/**`, root README, AGENTS, LICENSE                                                                  | Workspace boundaries and repository formatting                                                                                                |
| `apps/web/**` (including Markdown content)                                                               | Above plus lint, token drift, dependent builds, Astro validation, generated-page link checks, Chromium/Firefox/WebKit smoke/axe, web artifact |
| `apps/storybook/**`                                                                                      | Above plus lint, token drift, dependent builds, Chromium smoke/axe of every story, Storybook artifact                                         |
| Contract sample fixtures, packages, tests, configuration, lockfile, workflows, scripts, or unknown paths | All jobs and both previews                                                                                                                    |
| Main push / manual dispatch                                                                              | All jobs                                                                                                                                      |

The scope selector uses the PR base SHA and the checked-out merge commit, includes
deleted files, and combines selections across all changed paths. Unknown paths
fail open to full validation. `tests/ci-scope.test.ts` covers representative docs,
app content, token, component, fixture, lockfile, and new-workspace changes.

## Local verification

Run `nvm use`, `corepack enable`, and `pnpm install --frozen-lockfile` from a clean
checkout. Install all three browsers once with `pnpm test:browser:install`, then
run `pnpm check`. The full gate builds both sites before browser checks.
For a scoped CI reproduction, build the app and its dependencies with
`pnpm exec turbo run build --filter=@cods-internal/web...` (or Storybook), then run
`CODS_BROWSER_TARGET=web pnpm test:browser` (or `storybook`).
See [browser testing conventions](../tests/README.md) for setup, project selection,
axe reports, failure diagnostics, and future visual baselines.

Browser smoke checks exercise documentation skip-link focus and scan WCAG A/AA
rules with axe. Storybook checks enumerate its built story index. Automated axe
results supplement the component contract's manual accessibility evidence; they
do not complete screen-reader, zoom, forced-colors, or localization evidence.
The Astro build also runs `scripts/check-docs-output.mjs` for generated internal
page links, same-page anchors, and structural accessibility. External URLs and
repository Markdown links are not currently checked.

## Preview artifacts and deployment

Successful browser validation uploads `web-preview-<sha>` and
`storybook-preview-<sha>` as immutable, run-scoped GitHub Actions artifacts,
retained for 14 days. Browser runs retain `test-results` and HTML reports for 7 days, including failure
traces, screenshots, console errors, and axe JSON attachments.
Download an artifact from the workflow run, extract it, and serve it at the root
of a local static HTTP server. Artifacts are review builds, not published releases.

Remote preview deployment is **pending State-approved host selection and connection**.
The repository currently contains no host configuration or preview credentials.
The hosting owner must connect both static output directories (`apps/web/dist`
and `apps/storybook/storybook-static`) and record fork-PR policy, preview URLs,
expiration, and access controls. A privileged deployment must never execute PR
code with deployment credentials. No production deployment is configured here.

## Workflow security review record

Technical review prepared September 29, 2026; **State security approval pending**.

- Workflow token permission is `contents: read`; no write, deployment, or OIDC grant.
- Checkout disables credential persistence; no production or preview secrets are used.
- Every external action is pinned to a full commit SHA. Dependency updates must
  verify the upstream commit and preserve SHA pinning.
- The workflow uses `pull_request`, never `pull_request_target`, for untrusted code.
- Event values enter scripts through environment variables; paths are read with
  a NUL-delimited git diff and never interpolated into shell commands.
- Jobs have timeouts; superseded runs cancel; retention is explicit. No shared
  persistent runner or privileged cache is configured.

Before claiming G1 completion, the State technology/security owners must record
approval, configure the required `foundation` check, and review representative
PR runs for docs, web content, tokens, and components. Attach their workflow run
URLs and both artifact links to CDS-30. CI is only active after this workflow is
merged/pushed; local verification cannot prove hosted job selection or approval.

## Acceptance status and handoff

| Acceptance criterion                                            | Implementation / remaining evidence                                                                                                                                                                                                      |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required checks run on relevant changes                         | Workflow selects affected jobs and aggregates their result. GitHub's current `main` ruleset has no required status checks; the owner must require `foundation` after its first run.                                                      |
| Docs-only changes avoid every component job                     | Governance docs select repository checks only; published site content selects Astro/browser checks. Scope tests cover both.                                                                                                              |
| Token and component changes trigger affected validation         | Both select shared-code validation and both site builds/accessibility suites.                                                                                                                                                            |
| Astro and Storybook preview artifacts are available             | Upload steps retain both static builds for 14 days. Availability must be demonstrated by a successful PR run. Hosted URLs remain a separate deployment dependency.                                                                       |
| Workflow permissions and action pinning meet State requirements | Read-only permission and SHA pins are implemented. Technical review is recorded above; State security approval is still pending.                                                                                                         |
| Clean checkout passes the foundation workflow                   | A fresh detached checkout passed frozen-lockfile installation and the full gate on macOS with Node 24.21.0/pnpm 12.4.2 (36 unit tests, 3 browser tests). Hosted Ubuntu evidence and representative PR job-selection runs remain pending. |

Storybook validation explicitly runs its own TypeScript project check, including
stories and `.storybook` configuration, during both root validation and scoped
builds. Each built story has an individual browser test, timeout, and failure trace.

GitHub repository settings inspected September 29, 2026: the global ruleset
requires signed commits, and the default-branch ruleset requires PR approval but
contains no required status-check rule. The local environment currently has no
configured commit-signing key. Configure an existing contributor signing identity
and sign the feature-branch commits before pushing; do not weaken the ruleset.

### Suggested CDS-30 comment (draft)

CI scaffolding is implemented on `codex/CDS-30-configure-ci-previews`: path-aware
validation, builds, internal documentation link checks, Storybook typechecking,
per-story browser/axe checks, and retained Astro/Storybook preview artifacts.
Local checks pass. To close this ticket, capture representative PR workflow runs,
require the final `foundation` status check, and record State security approval.
Hosted preview deployment additionally needs a selected/connected State-approved
static host for the two output directories. Downloadable artifacts satisfy the
preview-artifact criterion; hosted deployment remains open unless the accountable
owner explicitly accepts its deferral to a follow-up ticket.
