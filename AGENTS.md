# CoDS Agent Instructions

Authoritative, durable conventions for AI coding agents (and human contributors) working in this repository. This file is the single source of truth for agent guidance — do not fork or duplicate this content into another instructions file; other tool-specific entry points should link back here instead.

For full detail behind any rule below, follow the linked governance document rather than asking the user to re-explain it.

## Repository structure

Monorepo managed with pnpm workspaces + Turborepo:

- `packages/colorado-design-tokens/` — DTCG token source (`src/*.tokens.json`) and generated CSS/Sass/JSON/TypeScript output (`generated/`). Built with Style Dictionary.
- `packages/colorado-design-system/` — the component package. Components live one-per-directory under `src/components/<name>/`; see the [component contract](docs/governance/component-contract.md) before adding or editing one.
- `apps/web/` — public reference site (`@cods-internal/web`).
- `apps/storybook/` — HTML/Vite Storybook engineering/QA workbench (`@cods-internal/storybook`), not the public docs site.
- `examples/static-html/` — plain-HTML consumer example.
- `docs/` — governance, ADRs, proposal, and backlog. Start with [docs/governance/README.md](docs/governance/README.md).

A component directory never imports from another component's directory; shared behavior belongs in a `shared/` support module. Every internal workspace package/app name, version, and `workspace:*` dependency is enforced by `scripts/check-workspace.mjs` (`pnpm check:workspace`) — don't hand-edit those fields without checking that script's expectations.

## Tooling: pnpm, nvm, Corepack

- Node version is pinned in `.nvmrc` and `package.json#engines` (`24.21.0`). Run `nvm use` before installing or building — the default shell Node is often older and Storybook/Vite will fail silently or loudly otherwise.
- Package manager is pnpm, pinned via `package.json#packageManager` (`pnpm@12.4.2`). Run `corepack enable` once, then plain `pnpm install` resolves the pinned version automatically. Do not use `npm` or `yarn` in this repo.
- pnpm blocks native postinstall scripts by default. If a dependency's build is required (for example `esbuild`), approve it in `pnpm-workspace.yaml`'s `allowBuilds`, don't work around it with `--ignore-scripts`.

## Required commands

Run from the repo root unless noted; each is expected to exit `0` before a change is considered done:

| Command                             | Purpose                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm check:workspace`              | Validates workspace package boundaries against `scripts/check-workspace.mjs`               |
| `pnpm tokens:check`                 | Rebuilds tokens and diffs against committed `generated/` output — fails on drift           |
| `pnpm format:check` / `pnpm format` | Prettier check / write                                                                     |
| `pnpm lint`                         | ESLint (`lint:js`) + Stylelint (`lint:styles`)                                             |
| `pnpm typecheck`                    | `tsc --noEmit` across the workspace                                                        |
| `pnpm test`                         | Vitest                                                                                     |
| `pnpm build`                        | `tokens:check` then `turbo run build` (tokens must build before the design-system package) |
| `pnpm check`                        | Runs everything above in order — the full gate a change must pass                          |

`packages/colorado-design-tokens/generated/**` is committed to git (unlike `dist/` and `storybook-static/`, which are gitignored). Never delete `generated/` to simulate a clean checkout; restore it with `git checkout -- packages/colorado-design-tokens/generated` if that happens by accident.

## Canonical component contract

Every component must satisfy the [canonical component contract](docs/governance/component-contract.md): semantic HTML fixture, layered Sass in the `cods.components` cascade layer, `cods-`-prefixed public classes/custom properties/data attributes, a metadata JSON file, and (for interactive components) a TypeScript controller with an `init`/`destroy` lifecycle and `cods-<component>:<event>` custom events. Use the [`create-cods-component` skill](.github/skills/create-cods-component/SKILL.md) to scaffold a new component rather than hand-rolling the directory shape.

**Do not, for the `1.0.x` release line:**

- Author Web Components, Custom Elements, Lit, or anything using Shadow DOM.
- Author Twig templates, or any Drupal theme/module/runtime integration.
- Build or ship official React, Vue, or Svelte framework adapters.
- Publish packages per-component (the design system ships as one package).
- Add a database-backed content store, runtime CMS, or production Node server.
- Wire up automatic Figma-to-production publishing.
- Point release assets at a mutable CDN URL — released artifacts are versioned and checksummed, not overwritten in place.

Components with a USWDS equivalent are themed wrappers around USWDS markup/behavior (pinned `@uswds/uswds` version, see the [USWDS upgrade policy](docs/governance/USWDS-UPGRADE-POLICY.md)); components without one (Hero, Maps, Videos, Toasts/Snackbars, Divider) are CoDS-authored from scratch.

## Design tokens: Git is authoritative, not Figma

Figma is the design-composition and display surface only. Approved token _values_ are authored and reviewed as DTCG-format JSON in `packages/colorado-design-tokens/src/*.tokens.json` and built into CSS/Sass/JSON/TypeScript via Style Dictionary. A change to a Figma variable is not a released token change until it is reflected in the repository's token source and passes `pnpm tokens:check`. Never hand-edit files under `packages/colorado-design-tokens/generated/` — they're build output.

## Package naming and release policy

- Published package names are `@coloradodigitalservice/colorado-design-tokens` and `@coloradodigitalservice/colorado-design-system` (scope subject to the State's final confirmed npm scope). Internal app package names under `apps/` use the private `@cods-internal/*` scope and are never published.
- Release series has a specific meaning — don't casually suggest or imply a `1.0.x` tag:
  - **`0.0.x`** — current, active development series. Markup, tokens, CSS custom properties, controller APIs, and package boundaries may still change between releases.
  - **`1.0.x`** — the first _supported_ release, gated on an approved public component contract, completed accessibility evidence, stable exports, and explicit State sign-off (see the [ADR acceptance memo](docs/memos/ADR_Acceptance_Memo_2026-09-14.md) and the [1.0 proposal](docs/proposals/Colorado_Design_System_1.0_Proposal_2026-09-15.md)). If a readiness condition isn't met, the answer is to stay on `0.0.x` and move the date — never label an incomplete contract `1.0.x`.

## Accessibility evidence

Every component at `experimental` maturity or above needs `accessibility/<name>.evidence.md` covering keyboard operation, focus management, accessible naming, screen-reader verification, 400% zoom/reflow, reduced-motion, forced-colors, and localization notes (contract [section 6](docs/governance/component-contract.md#6-accessibility-localization-and-evidence-requirements)). A component cannot be marked `stable` in its metadata without a completed evidence file and every acceptance-criteria item satisfied.

## Reference documents (read these instead of asking for re-explanation)

- [1.0 Proposal](docs/proposals/Colorado_Design_System_1.0_Proposal_2026-09-15.md) — scope, phases, explicit exclusions.
- [ADR Acceptance Memo](docs/memos/ADR_Acceptance_Memo_2026-09-14.md) — accepted architecture decisions, naming, release policy.
- [Canonical Component Contract](docs/governance/component-contract.md) — normative component rules.
- [Build Architecture](docs/BUILD.md) — build systems, entry points, package exports.
- [Ownership and RACI](docs/governance/ownership-and-raci.md) — who approves what.
- [`create-cods-component` skill](.github/skills/create-cods-component/SKILL.md) — component scaffolding workflow.
