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
