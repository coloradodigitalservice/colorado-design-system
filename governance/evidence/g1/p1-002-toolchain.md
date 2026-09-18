# CODS-P1-002 toolchain evidence

**Status:** Local implementation checks passed on 2026-09-18. Technical review and G1 approval remain open.

The ticket source is [CODS-P1-002](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/backlog/phase-1/CODS-P1-002-configure-development-toolchain.md). The toolchain pins Node `24.21.0` and pnpm `12.4.2`; exact dependency versions are in the root manifest and lockfile.

| Check                                  | Result                                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm check`                           | Workspace validation, formatting, linting, typecheck, Vitest, and Sass build passed locally   |
| TypeScript and Astro ESLint violations | Each produced a nonzero exit code                                                             |
| Invalid Sass color                     | Stylelint produced a nonzero exit code                                                        |
| Unformatted JSON                       | Prettier check produced a nonzero exit code                                                   |
| Failing DOM test                       | Vitest produced a nonzero exit code                                                           |
| Repeated Sass compilation              | Both runs produced SHA-256 `afecb8f8bc78e278dc08e28295ba83b0761cf4d69f2e3fe18e251fdcc0dc5a91` |

The Sass output currently contains only the CSS layer order. It is a real generated artifact, but not a distributable component stylesheet. Full token and package outputs belong to later Phase 1 tasks.

A fresh clone of the committed toolchain installed with `pnpm install --frozen-lockfile` under Node `24.21.0` and pnpm `12.4.2`, then passed `pnpm check` without tracked changes. Its Sass output had the same SHA-256 value shown above. In a disposable clone, a staged TypeScript violation caused the Husky pre-commit hook to run lint-staged and reject the commit with a nonzero exit code.

The [draft PR's skeleton validation workflow](https://github.com/coloradodigitalservice/colorado-design-system/actions/runs/35393118048/job/105755785889) passed with the P1-002 toolchain checks included. Passing this ticket does not constitute full G1 approval.
