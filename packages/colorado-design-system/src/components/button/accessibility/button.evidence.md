# Accessibility Evidence: `cods-button`

**Component maturity at time of review:** experimental (`0.x`)  
**Reviewer:** Codex, automated/developer verification; human review pending  
**Date:** 2026-10-06  
**Related component metadata:** `button.metadata.json`  
**Ticket:** [CDS-50 / CODS-P3-003](https://atendesign.atlassian.net/browse/CDS-50)

The component themes native USWDS 3.14.0 buttons. Navigation examples remain
native links. No controller, generated accessible strings, focus management,
toggle state, loading state, or animation is shipped.

## Keyboard

- [ ] Every interactive element is reachable using only the keyboard, in a logical (visual/DOM-matching) order. Sequential navigation between examples, native activation, focus on every enabled variant, and disabled skipping passed in Chromium, Firefox, and WebKit. Complete human Tab-order review remains pending.
- [x] No keyboard trap: focus can always move away from the component using standard keys. The browser suite moved focus out of buttons and past the entire disabled block in all three engines on 2026-10-06.
- [x] Documented keyboard interactions: Tab/Shift+Tab move focus; Enter/Space activate native buttons; Enter activates navigation links. Disabled buttons do not activate or enter sequential focus. macOS WebKit uses Option+Tab when full keyboard navigation is unavailable.

## Focus

- [x] Visible focus indication uses the approved focus tokens at every focusable state. The treatment is a 4px action-focus outline, 2px offset, and white gap; computed focus assertions passed for every enabled example in all three engines; desktop screenshots confirmed a visible, unobscured ring on 2026-10-06.
- N/A — focus placement on open/close/add/remove/error belongs to the consuming action; this static component neither changes application state nor moves focus.

## Naming and roles

- [x] Accessible name and role documented for each interactive element; native roles/names appeared in the interactive snapshot; all canonical states passed axe in all three engines on 2026-10-06.

  | Element                                           | Role              | Accessible name source                                            |
  | ------------------------------------------------- | ----------------- | ----------------------------------------------------------------- |
  | Primary, secondary, outline, ghost, danger, small | button            | Visible action text                                               |
  | Hover, active, focus examples                     | button            | Same visible action text as each variant                          |
  | Disabled variants                                 | button (disabled) | Same visible action text; native disabled state                   |
  | Icon-only, including disabled icon                | button            | `aria-label="Add application"`; SVG is decorative                 |
  | Navigation example                                | link              | Visible text “Start an application”                               |
  | Expanded English, Spanish, Arabic labels          | button            | Visible localized text; Spanish/Arabic `lang`, Arabic `dir="rtl"` |

- [x] Accessible name/role documented for each state variation. Visual and size variants retain native roles; no toggle or pressed state is implied. Disabled state is native `disabled`, not `aria-disabled`.

## Screen reader verification

- [ ] Screen reader / browser pairing(s) tested: pending human VoiceOver/Safari or NVDA/Firefox review.
- [ ] Observed behavior notes: no human observations yet. Confirm action labels, button/link role distinction, icon-only names, disabled announcements, and localized pronunciation.

## Zoom and reflow

- [x] Verified usable at 400% zoom / 320px-equivalent reflow without loss of content or function. Automated 320px coverage passed in all three engines, and developer screenshots confirmed expanded/translated label wrapping and square icon targets. Actual 400% browser zoom remains a human follow-up. Default minimum target height is 48px; small is 32px and must have adequate surrounding spacing.

## Motion

- N/A — no animation or transition is authored. The suite checks computed animation names with reduced-motion emulation.

## Forced colors / high contrast

- [x] Component remains usable and distinguishable under a forced-colors mode. Automated media checks and developer screenshots passed in all three engines on 2026-10-06; real OS review remains pending. System ButtonFace/ButtonText, GrayText, and Highlight preserve boundaries, disabled text, and focus. Confirm in Windows high contrast.

## Localization

- [x] String expansion, truncation, and wrapping behavior noted for long or translated content. Canonical expanded English and Spanish examples use natural wrapping, no fixed height, and no ellipsis; checked at 320px in all three engines on 2026-10-06.
- [x] Bidirectional text behavior noted: the Arabic example has `lang="ar" dir="rtl"`; logical sizing/padding and a centered decorative icon avoid left/right assumptions. Representative-reader content review remains separate.

## Open items

- CDS-50: human screen-reader observations with named browser/AT versions.
- CDS-50: actual 400% browser zoom, Windows forced-colors, translated content review, and State accessibility-owner approval.
- CDS-50: design review against the ticket's Figma reference and final priority inventory (CODS-P0-006 remains pending per ticket). Token values are authoritative in Git.
- CDS-50: reviewers must approve fixture, documentation, and implementation before G3 sign-off. No stable maturity or gate approval is asserted.
- Visual regression baselines need a matching Linux runner/container workflow before they can gate CI; this repository currently has no Linux baseline generation workflow. Developer screenshots supplement computed-style checks and axe scans.

## Validation

`pnpm check` passed on 2026-10-06 with Node 24.21.0 and pnpm 12.4.2:
workspace/app validation, 240 tokens and 16 contrast pairs with no generated
drift, formatting, ESLint/Stylelint, typechecking, 102 unit tests, all builds,
and 158 browser tests. The initial full run hit overlapping axe scans on the
existing Site Alert Long Content story; that story passed in isolation and the
subsequent full gate passed. No axe rules were suppressed and no retries were added.

Developer inspection used the built local reference page via the pinned
Playwright CLI in Firefox, WebKit, and Chromium (installed Chrome channel).
Desktop, focus, forced-colors emulation, narrow translated labels, and icon-size screenshots were inspected.
Firefox/WebKit reported no console errors; Chrome requested the reference site's
missing favicon (404), unrelated to the component. Human review items remain open.
Browser checks live in
`tests/browser/button-checks.ts`, invoked on the built documentation in Chromium,
Firefox, and WebKit and the built Storybook in Chromium. The shared harness
captures console/page errors and complete axe results without excluded rules.
