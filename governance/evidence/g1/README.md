# G1 foundation evidence

**Status:** CODS-P1-001 local implementation checks passed on 2026-09-17. Technical and State review remain open. This record does not constitute G1 approval.

## Sources and versions

- Reference documentation: [accepted architecture memo](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/memos/ADR_Acceptance_Memo_2026-09-14.md), [CODS-P1-001](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/backlog/phase-1/CODS-P1-001-create-monorepo-skeleton.md), and [final component inventory](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/backlog/phase-0/CODS-P0-006-select-capped-1-0-component-set.md), inspected at reference commit `186bfe8`.
- Pinned tool versions: Node `24.21.0`, pnpm `12.4.2`, Turbo `2.10.13`.
- Local reference site path: `apps/web`, per project direction. The upstream P1-001 task names `apps/docs`.

## Skeleton verification

The initial checks ran with Node `24.21.0`, pnpm `12.4.2`, and Turbo `2.10.13` using a fresh copy of the working tree without `.git`, `node_modules`, or `.turbo`. After committing the skeleton, the install and checks were repeated from a fresh local Git clone of the commit. A further fresh-clone check on 2026-09-18 confirmed the frozen install, five workspace validations, and a clean Git status.

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed; lockfile unchanged and all six projects (root plus five workspaces) installed |
| `pnpm check` | Passed; root graph checks and five uncached Turbo `validate` tasks succeeded |
| Fresh Git clone | Passed frozen install and `pnpm check`; `git status --porcelain` remained empty afterward |
| `pnpm exec turbo ls` | Discovered exactly five workspaces, including `apps/web` |
| Local dependency links | All core, token, app, and example links resolved to their expected workspace manifests |
| Broken workspace metadata | Validator failed as expected |
| Duplicate package name | Validator failed as expected |
| Forbidden library-to-app dependency | Validator failed as expected |
| Missing local package link | Validator failed as expected |
| Workflow YAML parse and `git diff --check` | Passed |
| GitHub Actions skeleton validation | [Passed on draft PR #1](https://github.com/coloradodigitalservice/colorado-design-system/actions/runs/35283320414/job/105409979503) |

The two GitHub Actions references were resolved to immutable v7 commit SHAs on 2026-09-17, and their action metadata declares Node 24. The PR check passed on the amended CODS-P1-001 commit.

## Open prerequisites

- P0-002: State GitHub team identities, branch protection, recovery, and CODEOWNERS enforcement.
- P0-003: Final State-controlled npm scope, package names, and release identity.
- P0-004: Static hosting, preview locations, and recovery ownership.
- P1-002 through P1-015: remaining toolchain, token, contract, app, quality, release, and USWDS evidence required for G1.

Technical review, State acceptance, and G1 gate approval must be recorded by the responsible roles under the upstream [gate matrix](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/governance/gate-approval-matrix.md).
