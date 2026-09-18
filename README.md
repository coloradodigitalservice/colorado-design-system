# Colorado Design System

The Colorado Design System (CoDS) helps State of Colorado agencies build simple, accessible, and consistent digital services. The State owns this repository and its release decisions. The component contract is semantic HTML, layered CSS, and TypeScript behavior; released design tokens are maintained in Git using DTCG files.

The [Figma kit](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System) remains in development. The [accepted architecture memo](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/memos/ADR_Acceptance_Memo_2026-09-14.md) and [Phase 1 backlog](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/backlog/phase-1-foundation-readiness.md) describe the approved direction and remaining work. Contact zach.alcorn@state.co.us to learn more.

## Workspaces

| Directory                         | Workspace                                        | Purpose                                                                  |
| --------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| `packages/colorado-design-tokens` | `@coloradodigitalservice/colorado-design-tokens` | DTCG source and, later, generated consumer formats                       |
| `packages/colorado-design-system` | `@coloradodigitalservice/colorado-design-system` | Canonical components, styles, controllers, fixtures, metadata, and icons |
| `apps/web`                        | `@cods-internal/web`                             | Astro static reference website                                           |
| `apps/storybook`                  | `@cods-internal/storybook`                       | HTML/Vite component workbench                                            |
| `examples/static-html`            | `@cods-internal/example-static-html`             | Plain HTML consumer example                                              |

The core package depends on tokens. The apps and example depend on core; the apps also depend directly on tokens for token guidance. All internal dependencies use `workspace:*`. Libraries cannot depend on apps or examples. The two `@coloradodigitalservice` names are **provisional** until the State confirms control of the npm scope under [CODS-P0-003](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/backlog/phase-0/CODS-P0-003-confirm-package-naming-and-release-identity.md). Every workspace is private at this stage.

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
| `pnpm build`           | Compile the current Sass layer-order entry to CSS                       |
| `pnpm check`           | Run workspace, format, lint, typecheck, test, and build checks          |
| `pnpm exec turbo ls`   | Show the package graph                                                  |

Install enables the Husky pre-commit hook. It runs lint-staged on changed source and documentation files. No environment variables are required for the current toolchain; `.env.example` documents this and must never contain credentials. The TypeScript baseline is in `config/typescript/tsconfig.base.json`. Root ESLint, Stylelint, Prettier, and Vitest configurations cover the current source types, including future Astro files.

Node, pnpm, Turbo, and all toolchain dependencies are pinned to exact versions. Upgrade them in a reviewed change, update `pnpm-lock.yaml`, run every root check, and repeat the frozen install in a fresh clone. The current `build` command compiles only the core Sass layer declaration. Token generation, package bundles, Astro, Storybook, and development commands arrive with their implementation tasks.

## Ownership and scope

[Ownership by role](governance/OWNERSHIP.md) identifies the review path. [ADR-001](governance/adrs/001-pnpm-turborepo-boundaries.md) records this repository's workspace decision and its pending State approval. [G1 evidence](governance/evidence/g1/README.md) tracks the foundation checks. The [Phase 1 backlog](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/backlog/phase-1-foundation-readiness.md) provides the next steps.

The first supported scope targets 27 components and seven foundations, subject to the documented capacity and approval gates. Web Components, Drupal packages, Twig, framework adapters, a runtime CMS, and a production application server are outside the initial release.
