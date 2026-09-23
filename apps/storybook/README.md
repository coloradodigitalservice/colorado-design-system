# Component workbench

This private workspace hosts the HTML/Vite Storybook workbench for component states, interactions, accessibility checks, and visual review (CODS-P1-006).

## Commands

- Use Node `24.21.0` from the repository's `.nvmrc` and pnpm `12.4.2`.
- `pnpm --filter @cods-internal/storybook dev` — run Storybook locally.
- `pnpm --filter @cods-internal/storybook build` — build the design-system package boundary and produce the static `storybook-static/` preview artifact. This command is self-contained; the root `pnpm build` also orders the package build through Turborepo.

## Configuration

- `.storybook/main.ts` configures the `@storybook/html-vite` framework and the accessibility addon (`@storybook/addon-a11y`).
- `.storybook/preview.ts` imports the design system's compiled stylesheet through its published `./styles` export — stories never reach into the package's source to load tokens or styles.

## Accessibility checks

The accessibility addon runs automated axe checks when a story is opened in the Storybook Accessibility panel. Start the workbench with `pnpm --filter @cods-internal/storybook dev`, open the representative story, and use that panel to inspect violations and passes. Stories use `a11y.test: 'error'` so the configured checks are blocking when executed by a compatible Storybook test runner or CI integration.

Automated checks supplement, rather than replace, manual accessibility review. Keyboard operation, focus behavior, screen-reader output, zoom/reflow, localization, forced colors, and reduced-motion behavior still require human verification.

## Story conventions

- A story's `render` function returns the component's canonical fixture markup (imported from its `*.fixture.html` file) rather than re-authoring a parallel copy of the markup, so documentation and the component contract's fixture cannot drift apart.
- Story titles use the component's location as their prefix (for example `Contract samples/Tag` for the sample under `docs/governance/component-contract-samples/static/tag/`, or `Components/<Name>` once real components exist under `packages/colorado-design-system/src/components/`).
- A story file never defines its own markup, styles, or a second copy of a component's public API — it only wires the existing fixture and stylesheet into Storybook. This keeps Storybook a consumer of the canonical component contract, not a second source of truth.
