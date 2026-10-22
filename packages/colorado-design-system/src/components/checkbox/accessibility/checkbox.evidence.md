# Accessibility Evidence: `cods-checkbox`

**Component maturity at time of review:** experimental

**Reviewer:** Codex, automated implementation review (human acceptance pending)

**Date:** 2026-10-15

**Related component metadata:** `checkbox.metadata.json`

## Keyboard

- [ ] Every enabled input is reachable in DOM order. Chromium and WebKit automated checks pass; Firefox cannot launch locally.
- [ ] No keyboard trap. Chromium and WebKit automated checks pass; Firefox cannot launch locally.
- [x] Documented interactions: Tab/Shift+Tab navigate enabled inputs; Space toggles a focused input and clears mixed state. Pointer activation of a visible label activates its associated input. See `apps/web/src/content/docs/checkbox.md`.

## Focus

- [ ] Visible focus uses focus width/offset and action-focus color tokens on the label's control pseudo-element. Chromium and WebKit automated checks pass; Firefox cannot launch locally.
- [ ] Native activation retains focus on the input. Dynamic error insertion and submit-time focus belong to the consuming form; no component controller changes focus. Chromium and WebKit automated checks pass; Firefox cannot launch locally.

## Naming and roles

- [ ] Accessible names and descriptions verified in browser accessibility checks; Chromium and WebKit axe and semantic checks pass; Firefox cannot launch locally.

  | Element/state       | Role     | Accessible name source                                                                                   |
  | ------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
  | Default             | checkbox | Visible label: Send me service updates                                                                   |
  | Checked             | checkbox | Visible label: Send me email updates                                                                     |
  | Indeterminate       | checkbox | Visible label: Some notification channels selected; native `indeterminate` property supplies mixed state |
  | Disabled            | checkbox | Visible label: Paper notifications unavailable; native `disabled`                                        |
  | Disabled checked    | checkbox | Visible label: Required service notifications; native `checked disabled`                                 |
  | Error               | checkbox | Visible label: I agree to the terms; `aria-invalid` and `aria-describedby` link visible error            |
  | Group               | group    | Visible fieldset legend: How should we contact you?                                                      |
  | Group items         | checkbox | Visible labels: Email; Postal mail                                                                       |
  | Long/Spanish/Arabic | checkbox | Full visible label in the canonical fixture; `lang` and `dir` on translated containers                   |

- [x] Checked, disabled, mixed, and invalid states use native semantics. The runtime-only mixed example is explicitly flagged `review-required` in generated examples; there is no HTML mixed-state attribute or ARIA-only replacement widget.

## Screen reader verification

- [ ] Human reviewer must record screen reader/browser pairings (for example VoiceOver/Safari and NVDA/Firefox).
- [ ] Human reviewer must record label and legend announcements, mixed/checked/disabled state changes, and error-description announcement. No screen-reader observations are claimed by this review.

## Zoom and reflow

- [ ] 320px-equivalent reflow, translated/long labels, and RTL: Chromium and WebKit automated checks pass; Firefox cannot launch locally. Human 400% browser zoom remains open.

## Motion

- [x] N/A — component adds no animation or transitions; native state changes are immediate. Reduced-motion emulation passes in Chromium and WebKit.

## Forced colors / high contrast

- [ ] Forced-colors mode now exposes the native input and removes the decorative pseudo-element. Regression tests check on-screen native controls, checked/mixed/disabled state, label activation, and visible focus rather than requiring SVG background images. Chromium/WebKit and Firefox CI results are recorded in PR #56; local Firefox cannot launch. Real Windows High Contrast review remains open.

## Localization

- [ ] Long/Spanish labels wrap and preserve function: Chromium and WebKit automated checks pass; Firefox cannot launch locally.
- [ ] Arabic RTL uses logical label padding and control positioning: Chromium and WebKit automated checks pass; Firefox cannot launch locally.

## Open items

Automated results: 131 unit tests and all 82 Storybook tests pass. Interactive Chromium Playwright CLI inspection at desktop and 320px confirms visible focus, readable labels, and the native mixed accessibility state. Screenshots were inspected locally; they are not approved visual baselines.

Review follow-up (2026-10-15): the initial forced-colors glyph-presence check missed poor Chromium contrast and Firefox image suppression. It is superseded by native-input rendering and the regression checks above. The no-JavaScript test uses the native checkbox-state assertion instead of a DOM-property evaluation that timed out in Firefox.

Tracked under CDS-56 / CODS-P3-008:

- Firefox 1555 fails before test execution with “Could not find profile folder,” including with TMPDIR=/tmp. Rerun Firefox checks on a working browser environment before completing evidence. Chromium and WebKit: all 8 targeted checkbox tests pass (2026-10-15). WebKit uses Option+Tab for native checkbox navigation on this macOS host.
- Accessibility lead: human screen-reader observations for single/grouped/mixed/error/disabled states, actual 400% zoom, and Windows forced-colors verification.
- Aten design lead / State design owner: visual acceptance of the standard checkbox treatment and focus/boundary contrast. P3-001 records unresolved design measurements; the implementation uses existing Git tokens and retains upstream glyph assets. Card/tile styling is not included.
- Aten technical lead: review implementation and contract acceptance; stable sign-off remains with the State accessibility owner.

## Follow-up review — 2026-10-21

Figma nodes 639:10245, 659:3273, 659:3306, and 639:10195 were inspected.
The visual control is now a 20px border box with a 2px radius and 2px border,
matching Figma rather than expanding a 16px box with a shadow. Default rows
have an 8px leading inset and 8px control/text gap; focus uses the observed
2px white gap and 2px blue band. Card examples add full-label activation,
selected surface and card focus without replacing the native input. Disabled
checked/mixed artwork still uses the shared dark Phosphor variants, and forced
colors still restores native controls.

146 unit tests and 22 browser checks passed across Chromium, Firefox, WebKit
and Storybook Chromium, including real glyph contrast on selected/disabled
surfaces and card pointer/keyboard activation. Workspace, Astro/Storybook
validation, token drift, builds, lint, type checks, fixture/static output checks
passed. Formatting passed excluding the pre-existing unrelated AGENTS.md change,
which remains untouched. Tests used built-file routing without servers. Human
and design acceptance remain open.

The final focus review also checked the Figma card/tile focus frame (659:3313
for Checkbox; 4060:1294 for Radio). The subtle inset border and outer focus ring
now remain visible when the pointer stays over the focused card. The hover rule
excludes keyboard-focused inputs so it cannot suppress that indicator; the
regression asserts the combined border, white gap and blue band.
