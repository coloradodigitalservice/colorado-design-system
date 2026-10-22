# Accessibility Evidence: `cods-radio`

**Component maturity at time of review:** experimental  
**Reviewer:** Codex, automated implementation and browser checks; human acceptance pending  
**Date:** 2026-10-16  
**Related component metadata:** `radio.metadata.json`  
**Tracking issue:** CODS-P3-009 / CDS-57

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
