# Accessibility Evidence: `cods-checkbox`

**Component maturity:** stable (`0.x`), promoted 2026-11-23

**Date:** 2026-11-23

**Related component metadata:** `checkbox.metadata.json`

## CODS-P4-015 stabilization — 2026-11-23

The requester confirmed that all outstanding manual checks and required
accessibility, technical, design, State, and client approvals are complete.
This confirmation resolves the checklist below. Reviewer identities,
screen-reader/browser pairings, and detailed observations were not provided.

## CODS-P4-015 hardening — 2026-11-19

Developer first pass for Phase 4. This section records the content and
test-audit work and its automated results; manual review and approvals were
subsequently confirmed complete.

### Documentation page

`/checkbox/` now follows the component page outline: lead description from Figma,
Component preview and Component code (12 canonical fixture states: default,
checked, indeterminate, disabled, disabled checked, error, group, and the five
card states), Component status, Guidance (When to use and component comparison
from Figma, Writing for checkboxes from Figma, and
Accessibility for checkboxes), and Specifications (variants and elements,
setting the indeterminate state, validation, variable settings, limitations).
The full fixture catalogue and the public localization/RTL guidance were
removed; the long-content, Spanish, and RTL states remain in Storybook and the
tests. The status originally stated that automated axe checks pass and manual
review remained to be completed; it made no conformance claim. The shared
preview helper also strips a fixture `<h2>` label that carries an `id`.

### Test audit

| Area                                          | Before         | After           |
| --------------------------------------------- | -------------- | --------------- |
| `web-checkbox.spec.ts`                        | 9 × 3 browsers | 10 × 3 browsers |
| `storybook-checkbox.spec.ts`                  | 1              | 2               |
| `web-package-assets.spec.ts` (checkbox)       | 1 × 3 browsers | 1 × 3 browsers  |
| `storybook-package-assets.spec.ts` (checkbox) | 2              | 2               |
| `web-shared-fixtures.spec.ts` (checkbox)      | 1 × 3 browsers | 1 × 3 browsers  |
| `component-fixtures.test.ts` (checkbox)       | 1              | 1               |

Decisions:

- **Added:** a page-outline test (headings, the 12 preview states in order,
  status text and links, no localization text or fixture catalogue, no
  horizontal overflow at 320px, axe).
- **Moved:** the 320px reflow and RTL padding assertions for the long-content,
  Spanish, and RTL states, from the web spec to `storybook-checkbox.spec.ts`,
  because the page preview no longer shows those states. They now run in
  Chromium only. Every assertion is unchanged.
- **Consolidated / removed:** none. The remaining web tests cover distinct
  behavior (label, keyboard, mixed state, forced colors, no-JS and no-CSS,
  glyph contrast, geometry, hover, focused cards and error alignment), and the
  hover, focused-card, and error-alignment tests guard past review defects. The
  preview keeps every state they use, so they still run in three browsers.

### Automated results

Base commit `ba92348`. Node 26.5.0 locally (Node 24 was not installed).

- `pnpm build`: passed, including the docs output check (32 pages).
- Focused browser run with `config/playwright.built-files.ts` (web-checkbox,
  storybook-checkbox, package-assets, shared-fixtures, component-docs): 321
  passed in Chromium, WebKit, and Storybook Chromium. Firefox could not launch
  locally (50 launch failures); CI covers it.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm validate`
  (including `@cods-internal/web` `astro check`): passed.
- `pnpm exec vitest run`: 328 passed (17 files).

### Manual matrix for Aten Accessibility/QA

Completion of the following checks was confirmed by the requester on
2026-11-23; browser and assistive-technology details were not provided.

- [x] Space toggles and label click activates each enabled standard and card checkbox; focus stays on the input.
- [x] Checked, unchecked, and indeterminate (mixed) states are announced, including after activation clears mixed state.
- [x] Group legend is announced with each grouped checkbox.
- [x] Disabled and disabled checked checkboxes are skipped in the tab order and announced as unavailable.
- [x] Error text is announced as the description of the invalid checkbox.
- [x] Visible focus on standard and card states.
- [x] Long labels reflow at 400% zoom / 320px, including cards.
- [x] Contrast, narrow screens.
- [x] Reduced motion (no animation), Windows High Contrast / forced colors.
- [x] Internal localization and long-text notes (Spanish and RTL in Storybook).

## Keyboard

- [x] Enabled standard and card inputs were checked in visual and DOM order, including moving focus away, as confirmed by the requester.
- [x] Documented native interactions: Tab and Shift+Tab navigate; Space toggles the input and clears its mixed state. Clicking a label activates its input.

## Focus

- [x] Visible focus for standard and card states was checked, as confirmed by the requester.
- [x] Focus remains on the input after activation, as confirmed by the requester. The consuming form owns focus on validation.

## Naming and roles

- [x] Each input has checkbox role and a visible associated label; grouped inputs use a fieldset and legend. Native properties convey checked, mixed, and disabled states; invalid inputs reference their error text.

  | Element                  | Role     | Name or description source                            |
  | ------------------------ | -------- | ----------------------------------------------------- |
  | Standard and card inputs | checkbox | Associated visible label                              |
  | Group                    | group    | Fieldset legend                                       |
  | Invalid input            | checkbox | Label; `aria-describedby` points to the visible error |

## Screen reader verification

- [x] Human screen-reader verification of standard, grouped, card, mixed, disabled, and error states was completed, as confirmed by the requester. Pairings and observations were not supplied.

## Zoom and reflow

- [x] Actual 400% browser zoom and 320px reflow with long and translated labels, including cards, were checked, as confirmed by the requester.

## Motion

- [x] N/A — no animation or transitions are added.

## Forced colors / high contrast

- [x] Standard and card states and focus in Windows High Contrast were checked, as confirmed by the requester. The forced-colors implementation exposes native inputs and hides decorative glyphs.

## Localization

- [x] Long and translated labels, including Arabic RTL, were checked, as confirmed by the requester.

## Automated results

On 2026-10-27, the updated Checkbox suite passed locally in Chromium (8 tests), WebKit (8 tests), and Storybook Chromium (1 test), using built files. Firefox could not launch locally, so its 8 tests did not run.

GitHub Actions run 40584208267 passed for commit `6249542`: 312 web tests across Chromium, Firefox, and WebKit, and 277 Storybook Chromium tests. This run precedes the focused-card and error-alignment follow-up and does not verify those changes. Automated checks do not establish human screen-reader, zoom, or Windows High Contrast results.

## Stabilization acceptance

The requester confirmed on 2026-11-23 that the required human accessibility,
visual, technical, and State domain reviews and client sign-off are complete.

## Stabilization validation — 2026-11-23

- The full unit suite passed: 373 tests, including 57 fixture tests. Checkbox
  has no controller unit tests.
- The Checkbox web and Storybook specs and the Checkbox shared-fixture web
  case passed all 35 tests, with web coverage in Chromium, Firefox, and WebKit
  and Storybook coverage in Chromium.
- Build, lint, typecheck, formatting, web validation, workspace checks, and
  release readiness passed with Node 24.21.0.
