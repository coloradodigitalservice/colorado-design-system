# Themed USWDS components (type A, and divergent type C)

Use this when the component has a USWDS equivalent in the [component ownership matrix](../../../../docs/governance/component-ownership-matrix.md). Pass `--uswds <id>` to the scaffold script; it sets `componentType: "A"` and reads `uswdsVersion` from the design-system `package.json`. Use `--component-type C` for an intentional divergence.

Authoritative sources: [ADR-002](../../../../docs/adrs/002-uswds-foundational-dependency.md), [ADR-006](../../../../docs/adrs/006-uswds-javascript-ingestion.md) and [contract section 4.5](../../../../docs/governance/component-contract.md#45-wrapping-uswds-javascript) for JavaScript, the ownership matrix, and the [USWDS upgrade policy](../../../../docs/governance/USWDS-UPGRADE-POLICY.md). This file only sequences the work; it does not restate them.

## What is already in place (verified 2026-10-02)

- `@uswds/uswds` is pinned exactly (currently `3.14.0`) in `packages/colorado-design-system/package.json`. Never use a caret range.
- `src/styles/index.scss` forwards, in order: `_uswds-theme.scss` (configures `uswds-core`; must load first), the full `uswds` library, `_cods-color-overrides.scss`, `_cods-typography-overrides.scss`, then declares the `cods.*` layers. The full USWDS stylesheet is already compiled; a type A component does not import its own USWDS Sass.
- USWDS theme settings accept only USWDS system color tokens, so they approximate the Colorado palette. Exact Colorado colors come from `_cods-color-overrides.scss`, which re-declares `.usa-*` selectors with `--cods-*` custom properties and wins by source order, not `!important`. The file ends with a "Known gaps" list of roles deliberately left at USWDS defaults.
- The Storybook preview imports the compiled package stylesheet, so a story already receives USWDS and override styles.
- **USWDS JavaScript is ingested per component** (ADR-006): a controller imports only the behavior it wraps, and Vite bundles it into the package's ES module. The global bundle and `uswds-init.js` are never used. No wrapper exists yet; the first interactive type A component in the Phase 2 vertical slice becomes the reference implementation.
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
5. **Wrap USWDS's JavaScript.** Reuse as much of USWDS as possible, including behavior; do not reimplement an interaction USWDS already provides. Follow [Wrapping a USWDS behavior](#wrapping-a-uswds-behavior) below.
6. **Preserve behavior.** Keep USWDS's ARIA roles and keyboard model. Any change is a divergence: set `componentType: "C"`, fill `divergenceNotes`, and get State design and accessibility sign-off before setting `divergenceApproved: true` ([ownership matrix, Type C](../../../../docs/governance/component-ownership-matrix.md)).
7. **Set the metadata to match.** USWDS panels are visible without JavaScript, but state such as `aria-expanded` is only accurate once the controller runs, so an accordion declares `progressiveEnhancement: "partial"` (ADR-006).
8. **Record accessibility.** USWDS conformance is a baseline, not a replacement. The evidence file is still required in full, and the [accessibility review skill](../../cods-accessibility-review/SKILL.md) still applies.

## Wrapping a USWDS behavior

For an interactive type A component. The normative rules are in contract section 4.5 and ADR-006. Until a reference component exists, the skeleton below covers only the attribute-only case, verified against the USWDS accordion behavior (ADR-006); other behaviors need the component-specific work listed after it.

### Steps

1. Scaffold with `--type interactive --uswds <id>`, then replace the generated controller: it is a CoDS-authored skeleton, not a wrapper.
2. Find the behavior at `node_modules/@uswds/uswds/packages/<id>/src/index.js`. Read what its `init`/`on` sets, generates, or moves, what `teardown`/`off` undoes, what it throws on, and whether it dispatches events or updates properties.
3. Declare the import in `packages/colorado-design-system/src/types.d.ts` (`declare module '@uswds/uswds/js/<id>'`) with `on`, `off`, and any selector constants you use. USWDS exposes selectors on the behavior object (for example `BUTTON`); use those instead of copying them.
4. Copy USWDS's markup into the fixture. Keep every `usa-*` class and attribute, and add `cods-*` classes and `data-cods-<name>` on the root.
5. Write the controller, starting from the skeleton below and adding the component-specific work.
6. Test lifecycle, idempotency, failure, markup-after-`destroy` equals markup-before-`init`, and events against the real fixture (`?raw` import). Events from a `MutationObserver` are asynchronous; await a task before asserting.
7. Initialize only after the root is attached to the document: USWDS resolves controlled elements by id there. The scaffolded story does this by calling `initAll` in `play`, not in `render`.

### Controller skeleton (attribute-only behaviors, such as the accordion)

```ts
import behavior from '@uswds/uswds/js/<id>';

interface Item {
  el: HTMLElement;
  attrs: Record<string, string | null>; // authored values of what the behavior changes
}

const instances = new WeakMap<
  HTMLElement,
  { items: Item[]; observer: MutationObserver }
>();

export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  // Return null when markup is missing anything the behavior would throw on.
  const items = snapshotAuthoredState(root);
  if (!items) {
    console.warn('cods-<name>: <what is missing>', root);
    return;
  }

  behavior.on(root);

  // Start observing after `on`, so the behavior's own setup emits nothing.
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.oldValue === (record.target as Element).getAttribute('<attr>'))
        continue;
      root.dispatchEvent(
        new CustomEvent('cods-<name>:<event>', {
          bubbles: true,
          composed: false,
          detail: {/* element, new state */},
        }),
      );
    }
  });
  observer.observe(root, {
    subtree: true,
    attributes: true,
    attributeFilter: ['<attr>'],
    attributeOldValue: true,
  });
  instances.set(root, { items, observer });
}

export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  instance.observer.disconnect(); // first, so restoring emits nothing
  behavior.off(root);
  restoreAuthoredState(instance.items); // USWDS's off() does not restore attributes
  instances.delete(root);
}
```

### Beyond the accordion

Checked by reading the USWDS 3.14.0 source; none has a CoDS wrapper yet.

- **Combo Box:** `off` leaves the DOM the behavior generated, so `destroy` must remove it and restore the original `<select>`. It sets `value` and dispatches `change`, which a `MutationObserver` cannot see; listen for `change` on the root and translate it into a CoDS event.
- **Modal:** the behavior moves its root into `document.body`, so `destroy` must account for the relocated element and `init` must not assume the root stays where the author put it. Check how its `teardown` restores the markup.
- **Date Picker:** like the Combo Box, it updates values and dispatches `change`.

### Checks before calling it done

- `dist/colorado-design-system.mjs` has no `require(` and no `uswdsPresent`.
- A second `init` and a `destroy` without `init` do not throw. Compare the root's `outerHTML` before `init` and after `destroy`; for a relocated or generated-DOM behavior, also check the document around the root.
- Behavior the controller depends on is USWDS's, not reimplemented.
- The component works from `examples/static-html`-style usage (one module import) and in Storybook and `apps/web`.

## Decisions and follow-ups

- **Class naming** (decided 2026-10-01 by the project lead; recorded in contract section 4.5). Keep USWDS's `usa-*` classes and add `cods-*` classes alongside; do not rename or replace USWDS classes. `usa-*` is covered by USWDS's stability; `cods-*` is the CoDS public surface, and `data-cods-*` remains the controller hook.
- **Cascade layers.** Intent: a component that extends a USWDS component must be able to override USWDS. The current setup prevents this because USWDS is unlayered. A spike compiled USWDS inside a lowest-priority layer (`@layer uswds { @include meta.load-css('uswds'); }` after `@use 'uswds-theme'`) and the output kept the `@layer uswds, cods.reset, ...` order statement and the `@font-face` rules. Layers are not being removed; the proposed fix is to put USWDS below the `cods.*` layers (CODS-P1-018). Caveat: USWDS utility classes use `!important`, which layer order cannot override with normal declarations. Update this file when CODS-P1-018 lands.
- **Metadata shape.** The scaffold follows the ownership matrix schema. A formal JSON Schema and validator is a follow-up.
- **No USWDS-specific scaffold template.** Only the accordion case has been exercised; revisit when the vertical-slice component and a second wrapper show which parts repeat. Until then this document is the template.
- **`uswds-init.js` is not needed.** It only supports the global bundle.
- **Bundle duplication.** Measure shared USWDS utility code when the second wrapper lands.
- **Remaining interactive type A components** (Combo Box, Modal, Tooltip, Language Selector, In-Page Navigation, and others in the ownership matrix) follow this pattern in their Phase 2 and Phase 3 tasks.
