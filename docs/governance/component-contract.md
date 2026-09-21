# CoDS Canonical Component Contract

**Status:** Draft for G1 approval  
**Related work:** [CDS-27 / CODS-P1-004](https://atendesign.atlassian.net/browse/CDS-27) — Define the canonical component contract  
**Depends on:** CODS-P0-006 (capped 1.0 component set), CODS-P1-001 (monorepo skeleton), CODS-P1-003 (DTCG token pipeline)  
**Blocks:** Phase 2 vertical slice and every Phase 3 component task

This document is the shared contract every CoDS component must satisfy: semantic markup, layered CSS, TypeScript behavior, metadata, fixtures, states, and accessibility evidence. It is normative — a component that does not conform cannot enter the `1.0.x` release. Web Components, framework adapters, Drupal integration, and Twig templates are out of scope for this contract; the contract covers HTML, CSS, and TypeScript only.

## 1. Directory conventions

Each component lives in its own directory under `packages/colorado-design-system/src/components/<component-name>/`, where `<component-name>` is the kebab-case component name (for example `site-alert`, `combo-box`). A component directory contains only what it needs from the list below; static components omit the controller and event files.

```
src/components/<component-name>/
├── <component-name>.metadata.json    # required — see section 5
├── <component-name>.fixture.html     # required — see section 2
├── <component-name>.scss             # required — see section 3
├── <component-name>.ts               # optional — required only for interactive components, see section 4
├── <component-name>.test.ts          # optional — required whenever a controller exists
└── accessibility/
    └── <component-name>.evidence.md  # required for every stable/interactive component, see section 6
```

A component directory never imports from another component's directory. Shared behavior belongs in a `shared/` support module, not in a cross-component import.

## 2. Semantic HTML fixture expectations

- The fixture file is real, renderable, semantic HTML — the same markup a consuming page is expected to author or generate. It is not a framework template and contains no build-time placeholders.
- Use the most specific native HTML element and ARIA role available before adding custom scripting behavior (for example, `<button>` before `role="button"` on a `<div>`).
- The fixture must include every documented state (default, focus-visible, disabled, error/invalid, loading, empty, and long-content, as applicable to the component) as separate, labeled fixture blocks, not as a single ambiguous example.
- The fixture renders correctly, and remains understandable, with CSS and JavaScript both disabled. Purely decorative or enhancement-only markup is allowed only when the component's core purpose still functions without it (see section 4.4).
- Fixtures used for automated checks (Storybook stories, Vitest DOM tests, Playwright specs) must import or reference the same fixture markup rather than re-authoring a parallel copy, so tests and documentation cannot drift from the canonical markup.

## 3. CSS conventions and `cods-` naming

- All public CSS lives in the `cods.components` Sass/cascade layer declared by `src/styles/index.scss` (`@layer cods.reset, cods.base, cods.components, cods.utilities;`). A component must never write rules outside its assigned layer or increase specificity to defeat the layer order.
- Every publicly documented class, custom property, and `data-` attribute is namespaced with the `cods-` prefix:
  - Block class: `.cods-<component-name>` (for example `.cods-site-alert`).
  - Elements use a single hyphen-delimited BEM-style suffix: `.cods-site-alert__icon`, `.cods-site-alert__body`.
  - Modifiers are boolean or enumerated state classes: `.cods-site-alert--emergency`, `.cods-site-alert--is-dismissed`.
  - Component-scoped custom properties: `--cods-site-alert-<token-purpose>` (for example `--cods-site-alert-gap`).
  - Behavioral hooks used only by the controller (never styled directly by consumers): `data-cods-site-alert-*`.
- Any class, attribute, or custom property without the `cods-` prefix is private implementation detail and is not covered by this contract's stability guarantees; consumers who rely on unprefixed internals do so at their own risk.
- Component styles consume tokens from `@coloradodigitalservice/colorado-design-tokens`; a component must not hard-code a raw color, spacing, radius, or type value that already has an approved token.
- A component's Sass partial is the single place responsible for its own layout, spacing, and color; it must not reach into another component's namespace.

## 4. Controller lifecycle and public behavior contract

Interactive components ship a TypeScript controller in `<component-name>.ts`. Static components (no scripted behavior) omit this file entirely and are validated by section 2's no-JavaScript requirement instead.

### 4.1 Public attributes, properties, and events

- The only public integration surface is: documented `data-cods-<component-name>-*` attributes read at initialization, documented public methods on the controller instance, and documented `CustomEvent`s namespaced as `cods-<component-name>:<event-name>` (for example `cods-combo-box:select`).
- Events are dispatched with `bubbles: true` and `composed: false` (Shadow DOM is out of scope) and carry their payload in `event.detail`.
- Controllers must not depend on global state, global event listeners outside their own root element, or a specific bundler/module system beyond a standard ES module export.

### 4.2 Controller lifecycle

Every controller exports module functions with the following lifecycle. Instances are tracked per root; `destroy(root)` tears down only that root:

| Stage                        | Responsibility                                                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init(root: HTMLElement)`    | Locate required elements by data attribute inside `root`, attach listeners, read initial state from markup (never assume JavaScript-only default state). |
| Runtime                      | Respond to user interaction and public method calls; dispatch documented events on state change.                                                         |
| `destroy(root: HTMLElement)` | Remove all listeners and any DOM/attribute changes made by `init`, so the element can return to its no-JavaScript markup state.                          |

Controllers must be idempotent: calling `init` twice on the same root, or calling `destroy` without a prior `init`, must not throw.

### 4.3 Progressive enhancement

- Markup and CSS alone must deliver the component's core purpose. JavaScript only enhances behavior (for example, `<details>`/`<summary>` for a disclosure, native `<dialog>` for a modal-like pattern) — it must never be the only way to reach or read the content.
- If a component has no meaningful non-JavaScript behavior (for example, a Toast/Snackbar that is announced only at runtime), the contract requires that this is explicitly documented as an accepted exception in the component's metadata (section 5) and accessibility evidence (section 6), not silently assumed.
- A component must not require a build step, framework runtime, or bundler to function; a single `<script type="module">` import is sufficient.

### 4.4 Failure behavior

If the controller's `init` cannot find its required elements, it must fail silently for that instance (log a single developer-facing console warning, do not throw) and leave the underlying static markup usable.

## 5. Metadata and maturity model

Every component ships `<component-name>.metadata.json`, validated against the shared metadata shape:

```json
{
  "name": "site-alert",
  "displayName": "Site Alert",
  "maturity": "experimental",
  "type": "static",
  "uswdsEquivalent": "site-alert",
  "owners": {
    "responsible": "Aten component lead",
    "accountable": "State technical owner"
  },
  "states": ["default", "informational", "emergency", "dismissed"],
  "progressiveEnhancement": "full",
  "localization": "text-content-only",
  "description": "A page-level banner communicating site-wide informational or emergency messaging."
}
```

| Field                    | Allowed values                                                     | Meaning                                                                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maturity`               | `experimental`, `stable`, `deprecated`                             | `experimental`: contract-conformant but API/markup may still change. `stable`: API frozen for the current major version; requires completed accessibility evidence. `deprecated`: scheduled for removal; migration guidance required. |
| `type`                   | `static`, `interactive`                                            | Whether the component ships a TypeScript controller.                                                                                                                                                                                  |
| `uswdsEquivalent`        | USWDS component id, or `null`                                      | Names the themed USWDS source when this component is a themed wrapper, per the USWDS foundational-dependency decision. `null` means CoDS-authored with no USWDS equivalent.                                                           |
| `progressiveEnhancement` | `full`, `partial`, `none` (`none` requires a documented exception) | Declares the section 4.3 progressive-enhancement level.                                                                                                                                                                               |
| `localization`           | `text-content-only`, `layout-sensitive`, `not-applicable`          | Flags whether translated content can change layout assumptions (for example bidirectional text, string expansion).                                                                                                                    |

A component cannot be marked `stable` without a completed accessibility evidence file (section 6) and without every acceptance-criteria item in section 7 satisfied.

## 6. Accessibility, localization, and evidence requirements

Every component at `experimental` maturity or above records accessibility evidence in `accessibility/<component-name>.evidence.md`, using the [accessibility evidence template](./templates/accessibility-evidence-template.md). The evidence file must cover, at minimum:

- **Keyboard:** every interactive element is reachable and operable by keyboard alone, in a logical order, with no keyboard trap.
- **Focus:** visible focus indication using the approved focus tokens; focus is managed predictably on open/close, add/remove, and error states.
- **Naming:** accessible name and role are documented for every interactive element and every state variation (for example a toggle's expanded/collapsed name).
- **Screen reader:** a note of the screen reader/browser pairing(s) used for manual verification and the observed behavior.
- **Zoom and reflow:** verified usable at 400% zoom / 320px-equivalent reflow without loss of content or function.
- **Motion:** any animation respects `prefers-reduced-motion`.
- **Forced colors:** the component remains usable and distinguishable in a forced-colors/high-contrast mode.
- **Localization:** notes on string expansion, bidirectional text, and any layout assumption that breaks under translation, per the `localization` metadata field.

A component cannot be marked `stable` in metadata until this evidence file has no open items and has been reviewed by the accessibility lead named in [Ownership and RACI](./ownership-and-raci.md).

## 7. Acceptance criteria checklist

A component (or, for this contract task itself, the sample fixtures in section 8) conforms to the contract when all of the following are true:

- [ ] Required semantic structure and states are present in the fixture (section 2).
- [ ] Public classes, attributes, properties, events, and custom-property tokens follow the `cods-` naming rules and are documented (sections 3-4).
- [ ] Progressive-enhancement and no-JavaScript behavior is stated and, where full, demonstrated by disabling CSS/JS (section 4.3).
- [ ] Accessibility, localization, and manual-review evidence requirements are recorded (section 6).
- [ ] Metadata is present and internally consistent with the fixture and controller (section 5).

## 8. Sample fixtures

Two illustrative fixtures validate this contract before any production component is built:

- [`component-contract-samples/static/tag/`](./component-contract-samples/static/tag/) — a static, no-JavaScript sample (`cods-tag`).
- [`component-contract-samples/interactive/disclosure/`](./component-contract-samples/interactive/disclosure/) — an interactive sample with a controller lifecycle (`cods-disclosure`).

These samples exist only to prove the contract is followable; they are documentation artifacts, not published or built package components, and they are excluded from the package's Sass/TypeScript build entry points.

## 9. Definition of done

- [ ] This contract is published in governance documentation (this file).
- [ ] Sample fixtures in section 8 conform to sections 2-6.
- [ ] Required domain reviewers (Aten technical lead, Aten accessibility lead, State technical owner per [Ownership and RACI](./ownership-and-raci.md)) approve the contract at G1.
