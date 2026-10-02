# ADR-006: Ingest USWDS JavaScript through per-component imports and the controller contract

- **Status:** Proposed pending State technology owner approval at G1
- **Date:** 2026-10-02
- **Amends:** ADR-002 (USWDS as the foundational dependency)
- **Related work:** CODS-P1-017 (Jira CDS-103), CODS-P1-004, CODS-P1-015, CODS-P1-018

## Context

The proposal describes components with a USWDS equivalent as themed wrappers around USWDS markup and JavaScript behavior, not reimplementations of the same interactions. ADR-002 adopted USWDS for markup and Sass but did not say how its JavaScript reaches consumers. As of 2026-10-01 nothing imported it, so interactive Type A components could not be completed.

Verified against `@uswds/uswds` 3.14.0, using a throwaway accordion wrapper (unit tests, plus browser tests in Chromium and WebKit) that was removed because the accordion belongs to the Phase 2 vertical slice:

- Each behavior is CommonJS at `@uswds/uswds/js/<package>` and exposes `on(root)` and `off(root)`, which map to `init(root)` and `destroy(root)`.
- `on(root)` runs the behavior's `init`, then calls `addEventListener` with module-level handler functions. The DOM ignores a repeated registration of the same handler, so a second `on(root)` does not double-bind.
- `off(root)` removes the listeners but does not restore the attributes the behavior changed (for example `aria-expanded` and `hidden` on the accordion).
- The behavior throws, rather than failing quietly, when the panel an accordion button controls is missing.
- The global bundle (`dist/js/uswds.min.js`) initializes every component on `document.body` at load and sets `window.uswdsPresent`.
- `uswds-init.js` only adds a `usa-js-loading` class to `<html>` until the bundle sets `window.uswdsPresent`. No behavior reads that class, and it is only meaningful for the global bundle.

## Decision

1. **Per-component imports.** Each interactive Type A controller imports exactly the USWDS behavior it wraps (`import behavior from '@uswds/uswds/js/<package>'`). Vite bundles that code into the package's single ES module output, so consumers need no CommonJS handling and only a `<script type="module">` import.
2. **Thin wrapper.** The controller's `init(root)` validates the markup and calls `behavior.on(root)`. Its `destroy(root)` calls `behavior.off(root)` and restores the attributes `init` changed from a snapshot taken before `on`. CoDS source contains no equivalent of the interaction itself.
3. **Events.** USWDS behaviors emit none. The controller reports state changes as `cods-<name>:<event>` events (`bubbles: true`, `composed: false`, payload in `event.detail`), derived from the attributes the behavior sets, so every change USWDS makes is reported, including side effects such as a sibling collapsing.
4. **Failure behavior.** `init` checks what the USWDS behavior would otherwise throw on, logs one `console.warn`, and leaves the markup untouched.
5. **Markup.** `usa-*` classes stay in fixtures because USWDS selectors depend on them. `cods-*` classes and the `data-cods-<name>` root hook are added alongside.
6. **`uswds-init.js` is not used.** It exists for the global bundle only.

## Alternatives considered

### A1. The global bundle (`uswds.min.js`)

- **Pros:** one import; every component works.
- **Cons:** initializes every component on `document.body` at load, which contradicts contract section 4.1 (no global listeners outside a component's own root) and section 4.2 (per-root `init` and `destroy`). It sets a `window` global. It ships behavior for components the page does not use. It cannot be torn down per root.
- **Decision:** Rejected.

### A2. Reimplementing the interaction in CoDS

- **Cons:** the proposal and ADR-002 reject it. It duplicates behavior and accessibility work USWDS already maintains.
- **Decision:** Rejected.

## Consequences

- Behavior and its ARIA model come from USWDS and upgrade with the pinned version. JavaScript upgrades follow the [USWDS upgrade policy](../governance/USWDS-UPGRADE-POLICY.md).
- A wrapper depends on USWDS internals only through its public `on`, `off`, and exposed selector constants. A USWDS upgrade that changes the attributes a behavior sets requires revisiting the wrapper's snapshot and its event derivation.
- Importing several behaviors can duplicate shared USWDS utilities in the single bundle. Measure when the second wrapper lands; the accordion behavior alone added about 5 kB to the bundle.
- Panels that USWDS hides with the `hidden` attribute are visible without JavaScript, because the canonical markup does not carry `hidden`. The button's `aria-expanded` is inaccurate until the controller runs, so an accordion should declare `progressiveEnhancement: "partial"`.
- Detached roots cannot be initialized. USWDS resolves controlled panels by id in the document, so call `init` after attaching the markup.

## Related decisions

- ADR-002: this ADR adds JavaScript to its component strategy.
- CODS-P1-018 (cascade layering) is independent but changes the same contract and stylesheet entry point.
