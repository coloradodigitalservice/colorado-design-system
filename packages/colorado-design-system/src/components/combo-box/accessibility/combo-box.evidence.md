# Accessibility Evidence: `cods-combo-box`

**Maturity:** experimental  
**Reviewer:** Codex, automated checks; human review pending  
**Date:** 2026-11-09  
**Tracking:** CODS-P3-029 / CDS-77

## CODS-P4-016 hardening — 2026-11-19

Developer first pass for Phase 4 (CDS-130). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

The `/combo-box/` page now follows the component page outline: lead
description, a curated preview of the Default, Grouped options, Required with
error, and Disabled fixture states with their exact generated code, Component
status, `## Guidance` (When to use, Accessibility for combo boxes), and
`## Specifications` (Elements, Markup requirements, Initializing the
controller, Filtering and validation, Limitations). The examples catalogue and
public localization guidance were removed. The status states that axe passes
for every preview state and that manual review is pending; it makes no
conformance claim. Guidance reuses the previously reviewed page copy and was
checked against `combo-box.ts`, `combo-box.scss`, and the metadata; it has not
been compared with the Figma page. The shared preview helper was updated
(identically to CODS-P4-014) to strip this fixture's `<div>` state wrapper.

### Test audit

| Area                                           | Before      | After       |
| ---------------------------------------------- | ----------- | ----------- |
| Unit (`combo-box.test.ts`)                     | 9           | 9           |
| `web-combo-box.spec.ts`                        | 14 × 3 = 42 | 16 × 3 = 48 |
| `storybook-combo-box.spec.ts` (Chromium)       | 4           | 1           |
| `web-component-docs.spec.ts` combo-box entries | 2 × 3 = 6   | 0           |
| `web-shared-fixtures.spec.ts` combo-box entry  | 1 × 3 = 3   | 1 × 3 = 3   |
| **Playwright runs**                            | **55**      | **52**      |

Decisions:

- **Moved (Storybook → web, now three browsers):** filter/clear/no-results
  status messages; group heading text; disabled input and select; required,
  `aria-describedby`, and `aria-invalid` on the enhanced input. The preview
  shows all four fixture states, so these gain Firefox and WebKit coverage.
- **Consolidated:** disabled and attribute checks folded into the web
  "groups, disabled, validation and reset" test.
- **Removed as duplicates:** Storybook pointer selection and form reset (same
  assertions in web tests 1 and 2); Storybook axe on all states (web axe covers
  all four preview states plus the open no-results list); the legacy
  `web-component-docs.spec.ts` heading and link checks, replaced by the new
  page-outline test (links remain checked by `check-docs-output.mjs`).
- **Added:** page-outline test (headings, four enhanced preview states, code,
  status, no localization or catalogue, 320px reflow, axe).
- **Kept:** every past-defect regression (hover focus, Enter after an
  uncommitted edit, uncommitted text on blur, group-heading click, Tab out of
  the list, keyboard-active focus treatment and forced colors) and the
  no-JavaScript native fallback, which stays in Storybook (Chromium only)
  because it uses its own story; axe was added to it.

### Automated results

Base commit `ba92348`. Local Node 26.5.0 (repo pins 24.21.0; no version
manager installed).

- `pnpm exec vitest run packages/colorado-design-system/src/components/combo-box tests/component-fixtures.test.ts`: 62 passed.
- `pnpm build`: passed, including `check-docs-output.mjs`.
- `pnpm exec playwright test --config config/playwright.built-files.ts` on
  `web-combo-box`, `storybook-combo-box`, `web-shared-fixtures`,
  `web-component-docs`, and `web-accordion` for `web`, `web-webkit`, and
  `storybook`: all combo-box tests passed. The four other pages' "internal links
  resolve" tests fail only under the built-files config (their API request
  needs a server on 4321) and are unaffected by this change.
- Firefox could not launch locally; CI covers `web-firefox`.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`,
  `pnpm --filter @cods-internal/web validate`: passed.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on the PR preview and in Storybook.
Record browser, assistive technology, and versions for each result.

- [ ] Typing and filtering, including the open list and result counts.
- [ ] Arrow, Enter, Escape, and Tab paths; focus stays in the input.
- [ ] Active-option, result-count, and selection announcements.
- [ ] Clearing: focus returns to the input and "Selection cleared." is announced.
- [ ] No-results state and its announcement.
- [ ] Native no-JS fallback (Storybook "Without JavaScript").
- [ ] Lifecycle cleanup: destroy restores the native select and value.
- [ ] Grouped option names and headings; disabled control; required error.
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion, forced colors.
- [ ] Internal localization and long-text notes (generated strings are English).

## Keyboard and focus

- [ ] Keyboard selection, filtering, Escape and pointer selection passed automated tests in Chromium, Firefox and WebKit. Tab order, focus visibility and no keyboard trap still need human review.
- [ ] Arrow Down highlights results while focus stays in the input; arrow keys navigate; Enter selects; Escape closes. Clear returns focus to the input. Verify this behavior with assistive technology.
- [ ] Focus stays in the input through pointer interaction. Upstream focuses a hovered option, which stopped typing, redirected Enter to the hovered option and, at a CoDS group heading, dropped focus to the document; CoDS now suppresses that focus move and keeps arrow navigation on the input. Covered by automated tests in Chromium, Firefox and WebKit; confirm with assistive technology.
- [ ] Enter on text that matches no option keeps the typed value and stays invalid rather than restoring the previous selection, so a stale value cannot be submitted. Escape still reverts to the previous selection. Covered by automated tests in Chromium, Firefox and WebKit.

## Names and roles

| Element                        | Role     | Name source                                           |
| ------------------------------ | -------- | ----------------------------------------------------- |
| Native select / enhanced input | combobox | Visible label associated with select ID               |
| Results                        | listbox  | USWDS associates the visible label                    |
| Clear button                   | button   | USWDS English accessible label                        |
| Result status                  | status   | USWDS result counts and CoDS selection/clear messages |

- [ ] Axe passed on the documented page in Chromium, Firefox and WebKit, including the open no-results state, and on the Storybook fixture in Chromium. Accessible-tree and state review remains open.

## Screen readers

- [ ] A human must record NVDA or JAWS and VoiceOver results, including filtering, no results, selection, clearing and focus changes. No announcement has been observed or claimed here.

## Reflow, motion, forced colors and localization

- [ ] Automated 320 CSS-pixel reflow passed in Chromium, Firefox and WebKit; actual 400% browser zoom remains open.
- [ ] Forced-colors focus outline and reduced-motion emulation passed in Chromium, Firefox and WebKit; human high-contrast review remains open.
- [ ] The keyboard-active option carries its own indicator rather than relying on the hover fill, which forced colors flattens: it takes `Highlight`/`HighlightText` with an inset outline under `forced-colors: active`, asserted against a non-active sibling in Chromium, Firefox and WebKit.
- [ ] Long text, translations and right-to-left layout need review. USWDS generates English control and status strings; localization is an open issue.

## Open items

- USWDS flattens option groups. CoDS shows group headings and includes each group in the option accessible name; a human screen-reader and design reviewer must verify this treatment. Individually disabled options remain native selects because upstream allows selecting them.
- Required/error, form reset and visual comparison passed the targeted automated and screenshot checks in Chromium; reset and error behavior also passed in WebKit. Complete design and accessibility owner review.
- The keyboard-active option's non-forced-colors focus treatment reuses the input's focus-ring token (`--cods-color-bg-action-focus` at `--cods-space-2xs`) as an inset outline, so hover and keyboard-active are no longer identical. The Figma focus variant was not consulted directly; a design owner must confirm the ring matches it.
- A human screen-reader tester and State accessibility owner must complete the manual evidence and acceptance. The component remains experimental.
