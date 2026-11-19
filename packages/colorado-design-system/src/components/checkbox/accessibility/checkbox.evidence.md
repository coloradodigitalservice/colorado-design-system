# Accessibility Evidence: `cods-checkbox`

**Component maturity:** experimental

**Date:** 2026-10-27

**Related component metadata:** `checkbox.metadata.json`

## CODS-P4-015 hardening — 2026-11-19

Developer first pass for Phase 4 (CDS-129). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`/checkbox/` now follows the component page outline: lead description,
Component preview and Component code (12 canonical fixture states: default,
checked, indeterminate, disabled, disabled checked, error, group, and the five
card states), Component status, Guidance (When to use variant table and
Accessibility for checkboxes), and Specifications (variants and elements,
setting the indeterminate state, validation, variable settings, limitations).
The full fixture catalogue and the public localization/RTL guidance were
removed; the long-content, Spanish, and RTL states remain in Storybook and the
tests. The status states that automated axe checks pass and manual review is
pending; it makes no conformance claim. The shared preview helper now also
strips a fixture `<h2>` label that carries an `id`.

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

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on the PR preview and in Storybook.
Record browser, assistive technology, and versions for each result.

- [ ] Space toggles and label click activates each enabled standard and card checkbox; focus stays on the input.
- [ ] Checked, unchecked, and indeterminate (mixed) states are announced, including after activation clears mixed state.
- [ ] Group legend is announced with each grouped checkbox.
- [ ] Disabled and disabled checked checkboxes are skipped in the tab order and announced as unavailable.
- [ ] Error text is announced as the description of the invalid checkbox.
- [ ] Visible focus on standard and card states.
- [ ] Long labels reflow at 400% zoom / 320px, including cards.
- [ ] Contrast, narrow screens.
- [ ] Reduced motion (no animation), Windows High Contrast / forced colors.
- [ ] Internal localization and long-text notes (Spanish and RTL in Storybook).

## Keyboard

- [ ] Verify all enabled standard and card inputs in visual and DOM order, and that focus can leave each control.
- [x] Documented native interactions: Tab and Shift+Tab navigate; Space toggles the input and clears its mixed state. Clicking a label activates its input.

## Focus

- [ ] Verify visible focus for standard and card states with approved tokens.
- [ ] Verify focus remains on the input after activation. The consuming form owns focus on validation.

## Naming and roles

- [x] Each input has checkbox role and a visible associated label; grouped inputs use a fieldset and legend. Native properties convey checked, mixed, and disabled states; invalid inputs reference their error text.

  | Element                  | Role     | Name or description source                            |
  | ------------------------ | -------- | ----------------------------------------------------- |
  | Standard and card inputs | checkbox | Associated visible label                              |
  | Group                    | group    | Fieldset legend                                       |
  | Invalid input            | checkbox | Label; `aria-describedby` points to the visible error |

## Screen reader verification

- [ ] A human tester must record browser and screen-reader pairings and announcements for standard, grouped, card, mixed, disabled, and error states.

## Zoom and reflow

- [ ] Verify actual 400% browser zoom and 320px reflow with long and translated labels, including cards.

## Motion

- [x] N/A — no animation or transitions are added.

## Forced colors / high contrast

- [ ] Verify standard and card states and focus in Windows High Contrast. The forced-colors implementation exposes native inputs and hides decorative glyphs.

## Localization

- [ ] Verify long and translated labels wrap and remain usable, including Arabic RTL.

## Automated results

On 2026-10-27, the updated Checkbox suite passed locally in Chromium (8 tests), WebKit (8 tests), and Storybook Chromium (1 test), using built files. Firefox could not launch locally, so its 8 tests did not run.

GitHub Actions run 40584208267 passed for commit `6249542`: 312 web tests across Chromium, Firefox, and WebKit, and 277 Storybook Chromium tests. This run precedes the focused-card and error-alignment follow-up; those changes need CI verification. Automated checks do not establish human screen-reader, zoom, or Windows High Contrast results.

## Open items

Tracked in CDS-56:

- Accessibility lead and human testers: screen-reader observations with named browser pairings, actual 400% zoom, and Windows High Contrast for standard and card states.
- Aten design lead and State design owner: visual acceptance, including disabled treatments and the proposed geometry tokens.
- Aten technical lead: implementation and contract review. State accessibility owner: eventual stable sign-off.
