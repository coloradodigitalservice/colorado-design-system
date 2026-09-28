# Colorado Design System documentation

This private Astro workspace is the static documentation site for the Colorado Design System. The approved monorepo path is `apps/web` (the upstream CODS-P1-005 ticket calls it `apps/docs`; see ADR-001).

## Run locally

From the repository root, install dependencies and start the documentation site:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Astro prints the local URL (normally `http://localhost:4321/`). Stop the server with Ctrl+C. To inspect the production build instead, run `pnpm --filter @cods-internal/web build` followed by `pnpm --filter @cods-internal/web preview`.

## Build and preview

From a clean checkout, use the repository's pinned Node and pnpm versions:

```sh
pnpm install --frozen-lockfile
pnpm --filter @cods-internal/web build
```

The deployable artifact is `apps/web/dist`. It contains HTML and assets only; no Node runtime or Astro adapter is needed. `pnpm --filter @cods-internal/web check` checks Astro/TypeScript diagnostics. `pnpm check` runs the repository checks and builds all workspaces in dependency order.

The local preview command is not required for deployment.

## Preview deployment

Configure the approved static host to install at the repository root with `pnpm install --frozen-lockfile`, build with `pnpm build`, and publish `apps/web/dist`. Enable per-branch or per-pull-request preview deployments in the host. Point the preview URL at the `dist` artifact; do not configure a production Node server or SSR adapter. The hosting owner still needs to select and connect the actual provider before a remote preview URL can exist.

Documentation entries live in `src/content/docs/*.md`. Each entry requires `title`, `description`, `navLabel`, and `order` frontmatter. The collection schema checks these at build time; navigation and static routes are generated from the same entries. Site shell styles live in `src/styles/site.css` and consume generated tokens. Component styles remain in the design-system package for future component examples.
