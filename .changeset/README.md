# Changesets

Release intent for the `0.0.x` development series. Add one changeset per user-visible change with `pnpm changeset`. See [docs/RELEASE.md](../docs/RELEASE.md) for the full workflow.

- Both `@coloradodigitalservice` packages share one version (`fixed` group), so select either; the version moves together.
- Always choose `patch` during `0.0.x`. Mark a breaking change by starting its summary with `BREAKING:`; the release script lists those under "Known breaking changes".
- Internal `@cods-internal/*` workspaces are ignored.
