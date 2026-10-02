# Themed USWDS components (type A, and divergent type C)

Use this when the component has a USWDS equivalent in the [component ownership matrix](../../../../docs/governance/component-ownership-matrix.md). Pass `--uswds <id>` to the scaffold script; it sets `componentType: "A"` and reads `uswdsVersion` from the design-system `package.json`. Use `--component-type C` for an intentional divergence.

Authoritative sources: [ADR-002](../../../../docs/adrs/002-uswds-foundational-dependency.md), the ownership matrix, and the [USWDS upgrade policy](../../../../docs/governance/USWDS-UPGRADE-POLICY.md). This file only sequences the work; it does not restate them.

## What is already in place (verified 2026-10-01)

- `@uswds/uswds` is pinned exactly (currently `3.14.0`) in `packages/colorado-design-system/package.json`. Never use a caret range.
- `src/styles/index.scss` forwards, in order: `_uswds-theme.scss` (configures `uswds-core`; must load first), the full `uswds` library, `_cods-color-overrides.scss`, `_cods-typography-overrides.scss`, then declares the `cods.*` layers. The full USWDS stylesheet is already compiled; a type A component does not import its own USWDS Sass.
- USWDS theme settings accept only USWDS system color tokens, so they approximate the Colorado palette. Exact Colorado colors come from `_cods-color-overrides.scss`, which re-declares `.usa-*` selectors with `--cods-*` custom properties and wins by source order, not `!important`. The file ends with a "Known gaps" list of roles deliberately left at USWDS defaults.
- The Storybook preview imports the compiled package stylesheet, so a story already receives USWDS and override styles.
- **No USWDS JavaScript is ingested.** Only the `package.json` dependency mentions `@uswds/uswds`: nothing under `src/`, no script in `apps/web`, and no import in the Storybook preview. Type A components that need behavior (accordion, combo box, modal, tooltip, and others) have nothing to wrap yet. This is a P1 gap tracked by CODS-P1-017; see [Decisions](#decisions-and-follow-ups).
- **USWDS is compiled unlayered**, and the `cods.*` layer order is declared at the end of `index.scss`. Layered CoDS rules therefore lose to `.usa-*` rules. Tracked by CODS-P1-018; see [Decisions](#decisions-and-follow-ups).

## Procedure

1. **Find the pinned markup.** Read the USWDS source for the pinned version under `packages/colorado-design-system/node_modules/@uswds/uswds/packages/usa-<id>/src/`: `usa-<id>.twig` (markup reference only; do not author Twig or copy it into the repo), `content/*.json` (variants and states), `index.js` (behavior, if any), and `styles/`.
2. **Write the fixture from that markup.** Keep USWDS's element structure, ARIA attributes, states, and `usa-*` classes (USWDS CSS and JavaScript select on them). Add the CoDS classes alongside, for example `<div class="usa-accordion cods-accordion" data-cods-accordion>`, with `cods-<name>__element` and `cods-<name>--modifier` following the contract's naming. Fixture rules from the contract still apply: one labeled block per state, and it must make sense with CSS and JavaScript off.
3. **Theme through tokens first.** Check whether the Colorado look needs a change at all. Order of preference:
   1. An existing token already applied by `_uswds-theme.scss` or `_cods-color-overrides.scss`.
   2. A new override in `_cods-color-overrides.scss` for a role that has an unambiguous token.
   3. A component partial that uses tokens (`tokens.$...`), in `@layer cods.components` as the contract requires. Do not work around the cascade with unlayered styles. Until CODS-P1-018 lands, a `cods.components` rule cannot override a `.usa-*` rule; if the component needs such an override, note the dependency on CODS-P1-018 in the PR.
   4. A new token. Stop and follow the [token change skill](../../cods-token-change/SKILL.md); do not hard-code a value.
4. **Check the "Known gaps" list** in `_cods-color-overrides.scss`. If the component depends on a gap (visited links, alert tints, most focus-ring colors), record it in the metadata `description` or evidence file instead of guessing a color.
5. **Use USWDS's JavaScript.** Reuse as much of USWDS as possible, including behavior; do not reimplement an interaction USWDS already provides. Each USWDS component exposes a behavior with `on(root)` and `off(root)` (import path `@uswds/uswds/js/usa-<id>`), which map onto the contract's `init(root)` and `destroy(root)`. The CoDS controller should be a thin wrapper that calls them and dispatches any `cods-<name>:<event>` events. Two USWDS behaviors need handling in the wrapper:
   - **Mount first.** USWDS resolves targets such as an accordion panel's `aria-controls` id with `document.getElementById`, so `init(root)` must run after `root` is attached to the document. In a story, initialize in `play`, not in `render` (the scaffolded interactive story does this).
   - **`destroy(root)` must restore the markup.** USWDS's `off(root)` only removes listeners; behaviors such as Accordion define no teardown and leave changed state (for example `aria-expanded` and panel `hidden`) behind. The contract requires `destroy` to return the element to its no-JavaScript state, so `init` records the attributes USWDS may change and `destroy` calls `off(root)` and then restores them.

   Avoid the global bundle and its auto-init on `document.body`; the contract forbids global listeners outside a component's own root. This path is blocked until CODS-P1-017 lands, so say so in the PR rather than hand-rolling behavior.

6. **Preserve behavior.** Keep USWDS's ARIA roles and keyboard model. Any change is a divergence: set `componentType: "C"`, fill `divergenceNotes`, and get State design and accessibility sign-off before setting `divergenceApproved: true` ([ownership matrix, Type C](../../../../docs/governance/component-ownership-matrix.md)).
7. **Record accessibility.** USWDS conformance is a baseline, not a replacement. The evidence file is still required in full, and the [accessibility review skill](../../cods-accessibility-review/SKILL.md) still applies.

## Decisions and follow-ups

Decided 2026-10-01 by the project lead. The contract does not yet say this, so a contract amendment is part of the follow-ups.

- **Class naming.** Keep USWDS's `usa-*` classes and add `cods-*` classes alongside; do not rename or replace USWDS classes. `usa-*` is covered by USWDS's stability; `cods-*` is the CoDS public surface, and `data-cods-*` remains the controller hook.
- **USWDS JavaScript.** Use USWDS behavior wherever USWDS has an equivalent. CoDS does not currently ingest any, which is a P1 miss. Until fixed, interactive type A components cannot be completed. Facts for the fix: the package exports per-component behaviors as CommonJS (`@uswds/uswds/js/<package>` resolves to `packages/*/src/index.js`) with `on`/`off`; a Vite library build bundled `usa-accordion` to ESM (about 3.6 kB, no leftover `require`) in a spike.
- **Cascade layers.** Intent: a component that extends a USWDS component must be able to override USWDS. The current setup prevents this because USWDS is unlayered. A spike compiled USWDS inside a lowest-priority layer (`@layer uswds { @include meta.load-css('uswds'); }` after `@use 'uswds-theme'`) and the output kept the `@layer uswds, cods.reset, ...` order statement and the `@font-face` rules. Layers are not being removed; the proposed fix is to put USWDS below the `cods.*` layers. Caveat: USWDS utility classes use `!important`, which layer order cannot override with normal declarations.
- **Metadata shape.** The scaffold follows the ownership matrix schema. A formal JSON Schema and validator is a follow-up.

Open until CODS-P1-017 and CODS-P1-018 are done: how USWDS behaviors are exposed through the CoDS controller, and how CoDS styles override USWDS. Update this file when each is resolved.
