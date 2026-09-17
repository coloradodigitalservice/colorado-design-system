# Colorado Design System: Turborepo setup plan

Prepared 2026-09-17 from the [accepted architecture memo](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/memos/ADR_Acceptance_Memo_2026-09-14.md), [1.0 proposal](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/proposals/Colorado_Design_System_1.0_Proposal_2026-09-15.md), governance documents, and the Phase 0–5 backlog in the reference repository. CODS-P1-001 now provides the workspace skeleton; the rest of this document is a roadmap for subsequent backlog work. The project uses `apps/web` for the Astro site by direction, while the upstream backlog calls it `apps/docs`.

## Product boundary

CoDS publishes a framework-agnostic browser contract: semantic HTML, layered CSS, and TypeScript behavior. DTCG tokens in Git are the release source of truth; Figma is the design and composition surface. The public reference site is a static Astro build. Storybook is a separate HTML/Vite review and test workbench. A matching archive serves consumers who cannot install npm packages.

The confirmed 1.0 inventory is 27 components and seven foundations: Color, Elevation, Focus States, Grids & Spacing, Icons, Radius, and Typography. The proposal targets November 30, 2026, but requires a capacity checkpoint; keep releases in `0.0.x` until the full contract and approval gates are met. The 1.0 package boundary is two published packages, not one package per component.

Web Components, framework adapters, Drupal packages/themes, a runtime CMS, and a production Node server are outside this plan. The Maps provider and accessible fallback require a separate State decision; no provider dependency should be introduced in the shared core package by default.

## Workspace layout

```text
apps/
  web/                         # private Astro static reference website
  storybook/                    # private Storybook HTML/Vite workbench
packages/
  colorado-design-tokens/       # published DTCG source and generated outputs
  colorado-design-system/       # published CSS, JS, types, fixtures, metadata, icons
examples/
  static-html/                  # private vanilla HTML consumer and install smoke test
governance/                     # ADRs, component contract, accessibility evidence, RACI
scripts/                        # archive, checksum, manifest, drift, and validation scripts
tests/                          # cross-package browser and package-consumer tests
.changeset/                     # release intent for publishable packages
.github/workflows/              # CI, preview, and controlled publishing
pnpm-workspace.yaml
pnpm-lock.yaml
turbo.json
package.json
.nvmrc
```

Only `packages/colorado-design-tokens` and `packages/colorado-design-system` are intended for npm publication after release setup and State approval. All five current workspaces are private. The proposed names `@coloradodigitalservice/colorado-design-tokens` and `@coloradodigitalservice/colorado-design-system` are present in local manifests provisionally; State confirmation of the npm scope remains required. The core package depends on the token package with the pnpm workspace protocol. Web, Storybook, and the HTML example will depend on the built public package exports, avoiding a second component implementation. Keep shared fixtures and metadata inside the core package at first; split them only if a genuine independent consumer or release boundary appears. Likewise, keep icon output in the core package, not a third public package.

## Build and dependency graph

```text
DTCG source -> validate -> Style Dictionary -> CSS variables / Sass / JSON / TS types
                                            |
                                            v
tokens package -> core package (pinned USWDS Sass/JS + CoDS theme and components)
                      |                |                  |
                      v                v                  v
                  Astro docs       Storybook          HTML example
                      \                |                  /
                       browser, accessibility, visual, and package smoke checks
```

Use pnpm for workspaces and dependency installation, Turborepo for task ordering/filtering/caching, and Changesets for version and changelog intent. Pin supported Node LTS in `.nvmrc`, exact pnpm in root `packageManager`, and exact `turbo` in dev dependencies; use Corepack in local setup and CI. TypeScript, Sass, Vite library builds, Astro, Storybook, Vitest, Playwright, axe-core, ESLint, Stylelint, Prettier, EditorConfig, and staged-file checks follow the [Phase 1 toolchain task](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/backlog/phase-1/CODS-P1-002-configure-development-toolchain.md). Use Style Dictionary for token output.

For the core package, compile a full stylesheet and per-component CSS entries, ESM controllers and a browser-ready entry, declarations, and explicit package `exports`. Mark CSS and registration/init entry points as side effects where appropriate. Pin `@uswds/uswds`, map approved semantic tokens to its Sass settings, and record a component ownership matrix: themed USWDS, CoDS-authored, or approved divergence. This USWDS dependency is an expansion of the accepted ADR and needs an amendment before foundation approval. Test the compiled Colorado theme and interactions; upstream accessibility claims do not establish CoDS conformance.

## Turborepo task contract

After the build, test, and browser workflows exist, expand the initial validate-only `turbo.json` toward the following shape, matching actual scripts and outputs as each workspace is created:

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "validate": { "outputs": [], "cache": false },
    "build": { "dependsOn": ["^build", "validate"], "outputs": ["dist/**", "!dist/**/*.map", "storybook-static/**", ".astro/**"] },
    "lint": { "outputs": [] },
    "typecheck": { "dependsOn": ["^build"], "outputs": [] },
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "test:browser": { "dependsOn": ["build"], "outputs": ["playwright-report/**", "test-results/**"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

Keep cache keys aware of any environment variables that affect output, and do not cache release signing, publishing, or secret-bearing tasks. Adjust Astro's actual build output (`dist/`) and Storybook's output (`storybook-static/`) per workspace. Browser tests should run against built static output using an ephemeral test server started by the test runner; no development server is part of the setup plan. Use `turbo run build --affected` or package filters on PRs only when CI has enough Git history to identify the base; run a full suite on release candidates and protected release branches. Start with local cache and CI dependency caching; add shared remote cache only if State hosting/security approval and measured CI benefit justify it. Turborepo schedules scripts; pnpm remains responsible for dependencies and workspace links.

## Delivery sequence and reviewable gates

1. **Ownership and decisions (G0).** Confirm State repository administration, final npm scope, static hosting/CDN, preview URLs, release credentials, Figma access, design/content/accessibility owners, and the 27-component capacity assumption. Record the Turborepo choice and USWDS decision in an ADR amendment; the earlier memo explicitly proposed waiting for evidence before adding a heavy orchestrator. Turborepo is requested here to coordinate the already approved workspaces, so keep its configuration small.
2. **Workspace foundation (G1).** CODS-P1-001 adds the directory skeleton, pnpm workspace, pinned runtime/tool versions, validation commands, `turbo.json`, role-based ownership metadata, and clean-checkout skeleton CI. CODS-P1-002 and later tasks add shared TS/lint/format conventions, dependency updates, buildable package/app entry points, and verified CODEOWNERS identities. A clean clone must install and resolve local workspace packages.
3. **Token and core build (G1).** Validate DTCG tokens, generate CSS/Sass/JSON/types, detect drift, configure Vite library outputs and exports, theme a proof USWDS component, and build source plus release artifacts reproducibly. Define the `cods-` markup/CSS/controller contract and accessibility evidence template.
4. **Docs and workbench (G1).** Add Astro content schema, accessible shell, static build, Storybook HTML/Vite and accessibility addon, and a representative shared fixture. Publish review previews as static artifacts on State-approved infrastructure. Site-only styling stays separate from published component CSS.
5. **Vertical slice (G2).** Take one static and one interactive component from token through core exports, fixture, docs, story, unit/interaction/browser/axe checks, manual accessibility review, HTML consumer, `0.0.x` package, and matching archive. Use this to verify the dependency graph and revise it before scaling.
6. **Full inventory and beta (G3).** Implement approved foundations and 27 components, with a first-class icon sprite/per-icon pipeline in core. Prioritize USWDS integration and high-risk CoDS-only patterns (Hero, Maps, Videos, Toasts/Snackbars, Divider). Build the approved docs sections: principles, foundations, components, developer/designer getting started, implementations, About, Contact, Contribute, policies/attributions, accessibility, localization, and release guidance. Produce iterative `0.0.x` artifacts.
7. **Release hardening and launch (G4–G5).** Run clean builds and the full browser/visual/accessibility matrix, complete named manual reviews, inspect packed npm tarballs and archive, verify checksums and a manifest tying commit/tag, package versions, docs version, and evidence together. Changesets creates version/changelog PRs; only a State-controlled protected workflow publishes packages and static sites. Move to `1.0.x` only after the approval record and clean consumer install pass.

## Required CI checks

PR validation: frozen pnpm install; format/lint/typecheck; token schema and generated-output drift; Vitest; package builds and export/asset checks; Astro and Storybook static builds; docs links; representative Playwright/axe checks; and previews. Scope work by affected package and dependency graph so token changes rebuild downstream consumers and docs-only edits avoid unrelated component suites. Preserve full checks for release candidates. Keep secrets unavailable to PR jobs and pin actions according to State policy. Automated accessibility checks supplement manual keyboard, screen reader, zoom/reflow, forced-colors, and reduced-motion review.

## Decisions to close before implementation or publication

| Decision | Why it matters |
|---|---|
| State-owned npm scope and package names | Determines published manifests, archive identity, and installation docs. |
| Hosting/CDN and preview destination | Determines Astro/Storybook deployment workflows and recovery. |
| USWDS ADR amendment and version/upgrade policy | Defines the source of markup, Sass, and JS for most components. |
| Approved DTCG/Figma mapping and icon set | Defines token and asset source for stable output. |
| Maps provider and accessible fallback | Avoids an unapproved runtime dependency in the core package. |
| Capacity for 27 components and seven foundations | Determines whether November 30 remains a credible supported-release target. |

## Source precedence

The September 16 finalized inventory and Phase 1 backlog refine the September 14 ADR and September 15 proposal. Where the memo says a workspace manager may be npm and suggests waiting to add an orchestrator, use the later [pnpm workspace task](https://github.com/AtenDesignGroup/colorado-state-design-system/blob/main/docs/backlog/phase-1/CODS-P1-001-create-monorepo-skeleton.md) plus the requested Turborepo layer. Where older proposal text mentions an 8–12 component cap, use the finalized 27-component/7-foundation decision, while retaining its capacity checkpoint. Preserve unresolved State approval items as decisions, not assumed facts.

Turborepo's [task graph/configuration](https://turborepo.com/docs/reference/configuration) and [CI filtering guidance](https://turborepo.com/docs/crafting-your-repository/constructing-ci) support this task setup; [Changesets configuration](https://changesets.dev/guide/config) supports coordinated package versioning.
