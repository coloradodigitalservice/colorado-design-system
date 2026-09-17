# Colorado Design System

The Colorado Design System (CoDS) helps State of Colorado agencies build simple, accessible, and consistent digital services. The State owns this repository and its release decisions. The component contract is semantic HTML, layered CSS, and TypeScript behavior; released design tokens are maintained in Git using DTCG files.

The [Figma kit](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System) remains in development. The [accepted architecture memo](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/memos/ADR_Acceptance_Memo_2026-09-14.md) and [Phase 1 backlog](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/backlog/phase-1-foundation-readiness.md) describe the approved direction and remaining work. Contact zach.alcorn@state.co.us to learn more.

## Workspaces

| Directory | Workspace | Purpose |
| --- | --- | --- |
| `packages/colorado-design-tokens` | `@coloradodigitalservice/colorado-design-tokens` | DTCG source and, later, generated consumer formats |
| `packages/colorado-design-system` | `@coloradodigitalservice/colorado-design-system` | Canonical components, styles, controllers, fixtures, metadata, and icons |
| `apps/web` | `@cods-internal/web` | Astro static reference website |
| `apps/storybook` | `@cods-internal/storybook` | HTML/Vite component workbench |
| `examples/static-html` | `@cods-internal/example-static-html` | Plain HTML consumer example |

The core package depends on tokens. The apps and example depend on core; the apps also depend directly on tokens for token guidance. All internal dependencies use `workspace:*`. Libraries cannot depend on apps or examples. The two `@coloradodigitalservice` names are **provisional** until the State confirms control of the npm scope under [CODS-P0-003](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/backlog/phase-0/CODS-P0-003-confirm-package-naming-and-release-identity.md). Every workspace is private at this stage.

## Contributor setup

1. Install Node `24.21.0` with `nvm` and run `nvm use` in this repository.
2. Run `corepack enable` and `corepack prepare pnpm@12.4.2 --activate` to select the pinned pnpm release.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm check`.

| Command | Purpose |
| --- | --- |
| `pnpm check:workspace` | Check workspace discovery, names, boundaries, and installed local links |
| `pnpm validate` | Run workspace validation in dependency order through Turborepo |
| `pnpm check` | Run both checks |
| `pnpm exec turbo ls` | Show the package graph |

Node, pnpm, and Turbo are pinned for reproducible local and CI validation. Updating them requires a reviewed lockfile change and a clean-checkout check. Build, test, and development commands will be added with the applications and package toolchain in later Phase 1 tasks; the current commands validate the repository skeleton.

## Ownership and scope

[Ownership by role](governance/OWNERSHIP.md) identifies the review path. [ADR-001](governance/adrs/001-pnpm-turborepo-boundaries.md) records this repository's workspace decision and its pending State approval. [G1 evidence](governance/evidence/g1/README.md) tracks the foundation checks. The broader [Turborepo roadmap](TURBOREPO_PLAN.md) and the [P1-001 task](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/backlog/phase-1/CODS-P1-001-create-monorepo-skeleton.md) provide the next steps.

The first supported scope targets 27 components and seven foundations, subject to the documented capacity and approval gates. Web Components, Drupal packages, Twig, framework adapters, a runtime CMS, and a production application server are outside the initial release.
