# Colorado Design System

The Colorado Design System (CoDS) helps State of Colorado agencies build simple, accessible, and consistent digital services. The State owns this repository and its release decisions. The component contract is semantic HTML, layered CSS, and TypeScript behavior; released design tokens are maintained in Git using DTCG files.

The design kit remains in development. The [accepted architecture memo](docs/memos/ADR_Acceptance_Memo_2026-09-14.md), [governance documentation](docs/governance/README.md), and repository issues describe the approved direction and remaining work.

## Workspaces

| Directory                         | Workspace                                        | Purpose                                                                  |
| --------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| `packages/colorado-design-tokens` | `@coloradodigitalservice/colorado-design-tokens` | DTCG source and generated consumer formats                               |
| `packages/colorado-design-system` | `@coloradodigitalservice/colorado-design-system` | Canonical components, styles, controllers, fixtures, metadata, and icons |
| `apps/web`                        | `@cods-internal/web`                             | Astro static reference website                                           |
| `apps/storybook`                  | `@cods-internal/storybook`                       | HTML/Vite component workbench                                            |
| `examples/static-html`            | `@cods-internal/example-static-html`             | Plain HTML consumer example                                              |

The core package depends on tokens. The apps and example depend on core; the apps also depend directly on tokens for token guidance. All internal dependencies use `workspace:*`. Libraries cannot depend on apps or examples. The two `@coloradodigitalservice` names are **provisional** until the State confirms control of the npm scope. Every workspace is private at this stage.

## Contributor setup

1. Install Node `24.21.0` with `nvm` and run `nvm use` in this repository.
2. Run `corepack enable` and `corepack prepare pnpm@12.4.2 --activate` to select the pinned pnpm release.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm check`.

| Command                | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `pnpm check:workspace` | Check workspace discovery, names, boundaries, and installed local links |
| `pnpm validate`        | Run workspace validation in dependency order through Turborepo          |
| `pnpm format`          | Format supported source and documentation files                         |
| `pnpm format:check`    | Fail if those files need formatting                                     |
| `pnpm lint`            | Run ESLint for JS, TS, and Astro and Stylelint for CSS and Sass         |
| `pnpm typecheck`       | Typecheck the current TypeScript toolchain and test sources             |
| `pnpm test`            | Run Vitest's DOM-capable test suite                                     |
| `pnpm build`           | Build all packages via Turbo (tokens and design-system)                 |
| `pnpm check`           | Run workspace, format, lint, typecheck, test, and build checks          |
| `pnpm exec turbo ls`   | Show the package graph                                                  |

Install enables the Husky pre-commit hook. It runs lint-staged on changed source and documentation files. No environment variables are required for the current toolchain; `.env.example` documents this and must never contain credentials. The TypeScript baseline is in `config/typescript/tsconfig.base.json`. Root ESLint, Stylelint, Prettier, and Vitest configurations cover the current source types, including future Astro files.

Node, pnpm, Turbo, and all toolchain dependencies are pinned to exact versions. Upgrade them in a reviewed change, update `pnpm-lock.yaml`, run every root check, and repeat the frozen install in a fresh clone. Token generation and package builds are implemented via [Style Dictionary](packages/colorado-design-tokens/README.md) and [Vite](docs/BUILD.md) respectively. Astro and Storybook development is coordinated by the root Turbo watch commands.

## Build & Development

The [Build Architecture guide](docs/BUILD.md) describes the complete package build configuration, dependency alignment, and development workflow for both `colorado-design-tokens` and `colorado-design-system`.

**Development commands:**

```sh
pnpm dev                 # Docs + Storybook + dependency rebuilds
pnpm dev:web             # Docs + dependency rebuilds
pnpm dev:storybook       # Storybook + dependency rebuilds
```

Docs run at <http://127.0.0.1:4321/> and Storybook at
<http://127.0.0.1:6006/>. Run one of these commands per checkout. Each builds
its shared dependencies before starting the requested app(s), so a clean
checkout does not need a separate package build. Ctrl+C stops the session.
Browsers do not open automatically, and occupied ports cause startup to fail
rather than move to another port.

Turbo watches token and design-system inputs and rebuilds them in dependency
order. Astro and Storybook handle their own page/story updates. This includes
component Sass/TypeScript, fixture HTML, metadata, and DTCG token source changes;
package assets are refreshed by the normal build hooks. Generated token output
remains tracked and must be reviewed when token sources change. Watch inputs
exclude the token build's own `generated/` output to avoid rebuild loops.

Use the root commands for development. Direct app `dev` scripts bypass dependency
building/watching; the package's `build:watch` watches Vite's module graph and is
useful for styles/code alone, but does not cover every copied fixture or metadata
input. The root workflow uses Turbo's task-input-aware watch mode (enabled in the
pinned version) to cover those files as well.

**Common build commands:**

```bash
pnpm build                                                    # Build all packages via Turbo (tokens → design-system)
pnpm --filter @coloradodigitalservice/colorado-design-system build:watch  # Watch mode for colorado-design-system development
pnpm tokens:build                                             # Build design tokens only
pnpm tokens:check                                             # Validate tokens and compare with committed outputs
```

Each package (`colorado-design-tokens`, `colorado-design-system`) includes its own `README.md` with package-specific build instructions and development workflows.

## Ownership and scope

[Ownership and RACI](docs/governance/ownership-and-raci.md) identifies the review path. [ADR-001](docs/adrs/001-pnpm-turborepo-boundaries.md) records this repository's workspace decision and its pending State approval. Repository issues and pull requests track the next implementation steps. Agent-assisted development resources are indexed in [`.agents/README.md`](.agents/README.md); see [ADR-005](docs/adrs/005-unified-agent-directory.md).

The first supported scope targets 27 components and seven foundations, subject to the documented capacity and approval gates. Web Components, Drupal packages, Twig, framework adapters, a runtime CMS, and a production application server are outside the initial release.
