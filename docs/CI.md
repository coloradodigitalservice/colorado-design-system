# Foundation CI (CODS-P1-007 / CDS-30)

## Job selection

The `Foundation` workflow runs on every PR, pushes to `main`, and manual dispatch.
Require the final `foundation` job in the repository ruleset; it fails when any
selected job fails or is cancelled. Do not require conditional jobs individually.
There are no workflow-level path exclusions that would leave a required check pending.

| Changed paths                                                                                            | Validation                                                                                                                     |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `docs/**`, root README, AGENTS, LICENSE                                                                  | Workspace boundaries and repository formatting                                                                                 |
| `apps/web/**` (including Markdown content)                                                               | Above plus lint, token drift, dependent builds, Astro validation, generated-page link checks, Chromium smoke/axe, web artifact |
| `apps/storybook/**`                                                                                      | Above plus lint, token drift, dependent builds, Chromium smoke/axe of every story, Storybook artifact                          |
| Contract sample fixtures, packages, tests, configuration, lockfile, workflows, scripts, or unknown paths | All jobs and both previews                                                                                                     |
| Main push / manual dispatch                                                                              | All jobs                                                                                                                       |

The scope selector uses the PR base SHA and the checked-out merge commit, includes
deleted files, and combines selections across all changed paths. Unknown paths
fail open to full validation. `tests/ci-scope.test.ts` covers representative docs,
app content, token, component, fixture, lockfile, and new-workspace changes.

## Local verification

Run `nvm use`, `corepack enable`, and `pnpm install --frozen-lockfile` from a clean
checkout. Install Chromium once with `pnpm exec playwright install chromium`, then
run `pnpm check`. The full gate builds both sites before browser checks.
For a scoped CI reproduction, build the app and its dependencies with
`pnpm exec turbo run build --filter=@cods-internal/web...` (or Storybook), then run
`CODS_BROWSER_TARGET=web pnpm test:browser --project=web` (or `storybook`).

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
retained for 14 days. Failed browser runs retain `test-results` traces for 7 days.
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
