# ADR-001: pnpm workspaces and Turborepo for the CoDS repository

- **Status:** Proposed for State technical-owner acceptance at G1
- **Date:** 2026-09-17
- **Related work:** CODS-P1-001; accepted architecture memo of 2026-09-14

## Context

The accepted memo calls for a State-owned monorepo and suggests delaying a heavy orchestrator until its value is established. CODS-P1-001 later names pnpm workspaces. The project now has two libraries, two applications, and a consumer example that need ordered validation and builds. The implementation request explicitly selects Turborepo.

## Proposed decision

Use pnpm for workspace discovery, dependency installation, local links, and the single lockfile. Use Turborepo for task ordering and local caching of build outputs. Keep applications private. Publishable boundaries remain the token and core design-system packages only, subject to State naming and release approval. Use `apps/web` as the local path for the Astro site by project direction; the upstream task calls it `apps/docs`.

## Consequences

`turbo.json` defines `validate`, `build` (with per-package outputs), `dev`, and `tokens:check` tasks. Affected-path CI selection is in `.github/workflows/foundation.yml` and `scripts/ci-scope.mjs` (see [CI](../CI.md)); the root `dev` commands run Turbo watch ([BUILD](../BUILD.md)). The toolchain adds a pinned development dependency and requires contributors to understand the workspace graph. State review of this amendment is still required; this document does not claim the existing memo was retroactively changed.
