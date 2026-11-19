# Accessibility Evidence: `cods-radio`

**Component maturity at time of review:** experimental  
**Reviewer:** Codex, automated implementation and browser checks; human acceptance pending  
**Date:** 2026-10-16  
**Related component metadata:** `radio.metadata.json`  
**Tracking issue:** CODS-P3-009 / CDS-57

## CODS-P4-030 hardening — 2026-11-19

Developer first pass for Phase 4 (CDS-151). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`/radio/` now follows the component page outline: lead description, Component
preview, Component code, Component status, Guidance (When to use with a
Default/Tile variant table and the comparison table, Writing for Radio Buttons,
Accessibility for Radio Buttons), and Specifications (Variants and elements,
Adding icons to tiles, Variable settings, Limitations). The preview shows the
`default`, `selected`, `disabled`, `disabled-group`, `error`, `tile`, and
`tile-error` fixture states; the code block is generated from the same states
and the tile icon uses the package sprite URL. The examples catalogue and
public localization/RTL guidance were removed; those states remain in Storybook
and the tests. The status states that automated axe checks pass and manual
review is pending; it makes no conformance claim. The preview helper now also
strips fixture `<h2>` labels that carry attributes (the `default` and `error`
states use `<h2 id>`).

### Test audit

| Area                                      | Before              | After                |
| ----------------------------------------- | ------------------- | -------------------- |
| Unit tests                                | 0 (no controller)   | 0                    |
| `web-radio.spec.ts`                       | 9 × 3 browsers = 27 | 10 × 3 browsers = 30 |
| `storybook-radio.spec.ts` (Chromium)      | 1                   | 2                    |
| `web-shared-fixtures.spec.ts` radio entry | 1 × 3               | 1 × 3                |
| `web-component-docs.spec.ts` radio entry  | 0                   | 0                    |

Decisions:

- **Added:** a page-outline test (headings, seven preview states, generated code, built sprite URL, status, no localization copy or fixture catalogue, 320px no-overflow, axe).
- **Moved:** 320px reflow for `long-content`, `localization`, and `rtl`, the RTL label padding check, the disabled tile group, and tile long-content/Spanish/RTL reflow and selection moved from `web-radio.spec.ts` to a new `storybook-radio.spec.ts` test, because those states are not in the curated preview. They now run in Chromium only.
- **Consolidated / removed:** none; no demonstrable duplicates. The Storybook all-states smoke test overlaps the web keyboard test but runs against every fixture state, so it is kept.
- **Kept:** keyboard, exclusive selection, label selection, disabled options and groups, error association and `valueMissing`, the error-border hover regressions (selected and unselected), focus ring and typography, forced colors, no-JS and no-CSS, Figma geometry, tile behavior, and axe — all against preview states in three browsers.

### Automated results

Base commit `ba92348` (main). Run on 2026-11-19 with
`config/playwright.built-files.ts` (port 4321 was in use by another worktree):

- `pnpm build`: passed, including the docs output check (32 pages).
- `web-radio.spec.ts`, `storybook-radio.spec.ts`, `web-shared-fixtures.spec.ts`, `web-accordion.spec.ts` in `web`, `web-webkit`, and `storybook`: 86 passed.
- Firefox could not launch locally (`browserType.launch` failed); CI covers `web-firefox`.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm --filter @cods-internal/web validate`: passed. `pnpm test`: 17 files, 328 tests passed.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on the PR preview and in Storybook.
Record browser, assistive technology, and versions for each result.

- [ ] Native Tab, arrow keys, and Space; selection by clicking labels and tile descriptions.
- [ ] Group (legend) and selection announcements, including option position.
- [ ] Single-choice behavior within a group and isolation between groups.
- [ ] Disabled options and disabled groups (skipped by keyboard, selection still visible).
- [ ] Error association: fieldset description announced on entry; invalid and required state.
- [ ] Visible focus on default and tile options, including tile error.
- [ ] Long-label and tile long-content reflow.
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion, forced colors.
- [ ] Internal localization and long-text notes (Spanish and RTL states in Storybook).

Only checks actually run and passed are checked. Browser emulation and accessible-tree assertions do not establish screen-reader announcements or human acceptance.

## Keyboard

- [ ] Every enabled option is reachable in logical order; passed in Chromium and WebKit on 2026-10-16; Firefox launch blocked.
- [ ] No keyboard trap; passed in Chromium and WebKit on 2026-10-16; Firefox launch blocked.
- [ ] Documented interactions: Tab enters/leaves a group; arrows move selection and focus; Space selects the focused radio. Disabled options are skipped. No component JavaScript handles keyboard events.

## Focus

- [ ] Visible focus uses the approved focus width, offset, and action-focus color; passed in Chromium and WebKit on 2026-10-16; Firefox launch blocked.
- [ ] Native focus remains on the selected radio during arrow-key navigation; passed in Chromium and WebKit on 2026-10-16; Firefox launch blocked. N/A for open/close lifecycle: this component has no controller or popup. Host applications own dynamic validation focus.

## Naming and roles

- [ ] Accessible names and roles verified through snapshots, native role locators and axe in Chromium and WebKit. Firefox launch blocked.

  | Element        | Role  | Accessible name source                                            |
  | -------------- | ----- | ----------------------------------------------------------------- |
  | Every fieldset | group | Visible legend                                                    |
  | Every input    | radio | Explicit visible label with matching `for`/`id`                   |
  | Invalid group  | group | Legend; description from `aria-describedby="radio-error-message"` |

- [ ] State variations verified in Chromium and WebKit; Firefox launch blocked. Native checked/disabled/required state and input `aria-invalid` carry state without changing labels. The fieldset's native disabled state applies to its descendant inputs.

## Screen reader verification

- [ ] Human tester needed: VoiceOver + Safari and/or NVDA + Firefox, with the chosen pairing recorded.
- [ ] Human observations needed: legend/name, selected and disabled state, option position, required/invalid state, and group-level error description on group entry. No announcement is claimed from DOM checks.

## Zoom and reflow

- [ ] 320 CSS px equivalent reflow passed in Chromium and WebKit, including long, Spanish and Arabic content. Firefox launch blocked. Actual 400% browser zoom remains a human follow-up.

## Motion

- [ ] No authored animation or transition; reduced-motion passed in Chromium and WebKit on 2026-10-16; Firefox launch blocked.

## Forced colors / high contrast

- [ ] Emulated forced-colors checks passed in Chromium and WebKit. Firefox launch blocked. The stylesheet restores visible native inputs and hides decorative circles. Human Windows High Contrast review remains open.

## Localization

- [ ] Long and Spanish labels wrap without truncation; passed in Chromium and WebKit on 2026-10-16; Firefox launch blocked.
- [ ] Arabic fixture uses `lang="ar" dir="rtl"`; logical circle/label positioning passed in Chromium and WebKit; Firefox launch blocked.

## Open items

- CDS-57: Firefox 157 / Playwright build 1555 fails before navigation with “Could not find profile folder.” Reinstalling the pinned browser and using a different temporary directory did not resolve it. Rerun browser checks on a working Firefox host before completing the unchecked items.
- Automated coverage: `web-radio.spec.ts` (Chromium and WebKit) and `storybook-radio.spec.ts` plus generated story axe smoke checks. Interactive CLI inspection in Chromium and WebKit confirmed native arrow selection. Chromium screenshots confirmed visible focus, 320px long/translated content and forced-colors native controls. The initial interactive Chromium iframe produced only an unrelated favicon 404; automated console checks remain enabled.
- Checks remain unchecked because the skill requires all three browsers. No Firefox result is inferred from the other engines.
- CDS-57: human screen-reader reviewer must record pairing and observed announcements, especially the group-level error description; adjust host guidance if needed.
- CDS-57: human accessibility reviewer must check actual 400% zoom and Windows High Contrast and approve evidence. Automated emulation does not close these checks.
- CDS-57: design/accessibility owners must review actual focus and selected/disabled/error treatments. Figma measurement matches are not design acceptance.
- P0-006 final scope confirmation and P2-007 design acceptance remain dependencies. Maturity stays experimental; no stable sign-off is claimed.

## Phosphor integration (2026-10-21)

The updated shared token/icon base is integrated. The native radio indicator remains CSS-drawn; no Figma SVG or USWDS icon is substituted. Native grouping, selected/disabled/error states, keyboard operation, reflow, RTL and forced-colors coverage remain required.

Human screen-reader, actual 400% zoom, Windows High Contrast and design/accessibility acceptance remain open; this update does not change experimental maturity.

## Follow-up review — 2026-10-21

Figma nodes 4060:906, 4060:957 and 4060:975 were inspected. Default rows now
use a 20px border-box control with an 8px inset and 8px label gap. The selected
dot retains its white inner separation. Focus matches the 2px white gap and
2px blue band; invalid borders remain red on hover. The Figma tile example
uses full associated labels in a native fieldset/name group, 240px default
width constrained to its container, and existing form selected/disabled tokens.
It is a card-row treatment, not a segmented button group. Ownership follows
CDS-57 and the Getting Started link preserves the deployment prefix.

145 unit tests and 25 browser checks passed across Chromium, Firefox, WebKit
and Storybook Chromium, covering label activation, native arrows, errors on
hover, tile geometry, group exclusivity, disabled options, no CSS/JavaScript,
forced colors, RTL and reflow. Workspace, Astro/Storybook validation, tokens,
builds, formatting, lint, type checks, fixture/static output checks passed.
Tests routed built files without servers. Human and design approval remain open.

The final focus review also checked the Figma card/tile focus frame (659:3313
for Checkbox; 4060:1294 for Radio). The subtle inset border and outer focus ring
now remain visible when the pointer stays over the focused card. The hover rule
excludes keyboard-focused inputs so it cannot suppress that indicator; the
regression asserts the combined border, white gap and blue band.

## Tile review follow-up — 2026-10-27

Tile examples now include supporting text and a decorative icon, invalid and disabled groups, and long, Spanish and Arabic content. Browser checks cover native selection, error and hover borders, disabled selection, 320px reflow and axe in Chromium and WebKit; the Storybook fixture also passes axe in Chromium (19 checks total). Firefox failed before navigation with the existing profile-folder error. These automated results do not replace the open human reviews above.

Figma's Default guidance recommends more than five options, while its comparison table gives Radio Buttons two to five. Both are reproduced in the documentation for design-owner review.
