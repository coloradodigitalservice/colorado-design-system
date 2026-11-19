# Accessibility Evidence: `cods-icon`

**Component maturity at time of review:** experimental  
**Reviewer:** Not yet assigned; human accessibility review pending  
**Date:** 2026-10-20  
**Related work:** CODS-P3-036  
**Related component metadata:** `icon.metadata.json`

Automated and emulated checks were updated for CDS-119 on 2026-11-07.

This evidence covers the static SVG usage pattern and selected-sprite delivery.
The public page no longer renders a catalog. These checks do not approve
consuming components or replace human assistive-technology review. Keep
maturity experimental.

## Keyboard

- N/A — `cods-icon` is a non-interactive graphic; it has no interactive
  elements or keyboard interactions. Containing controls own their keyboard
  behavior.
- N/A — the icon itself cannot receive focus, so it cannot trap keyboard focus.

## Focus

- N/A — the icon is not focusable and has no focus state. A consuming
  button or link must provide its own visible focus treatment.
- N/A — the static icon has no open, close, add, remove, or validation state
  changes.

## Naming and roles

- [x] Accessible names and roles are documented for the static icon patterns.
      On 2026-11-07, browser snapshots of the default Storybook fixture exposed
      the named Search image and hid the decorative icons in Chromium, Firefox,
      and WebKit. Automated DOM checks passed in Storybook and on the Astro
      example; axe reported no violations in the Storybook fixture in Chromium.

  | Element                         | Role                           | Accessible name source                                          |
  | ------------------------------- | ------------------------------ | --------------------------------------------------------------- |
  | Decorative SVG beside “Home”    | Hidden from accessibility tree | `aria-hidden="true"`; no name                                   |
  | Meaningful standalone SVG       | `img`                          | `aria-labelledby` points to the SVG `<title>`                   |
  | Flow-direction arrow in example | Hidden from accessibility tree | `aria-hidden="true"`; adjacent “Next” text supplies the meaning |

- N/A — there are no interactive state variations; the component metadata
  defines one static `default` state.

## Screen reader verification

- [ ] Screen reader / browser pairing(s) tested.
- [ ] Observed behavior notes.

No screen-reader announcement is claimed. A human reviewer must test the
standalone named SVG and the icon-only button example with a named
screen-reader/browser pairing and record the observed announcements.

## Zoom and reflow

- [x] On 2026-11-07, the Storybook fixture was checked at 320 by 256 CSS pixels
      and the Astro example at 320 pixels wide in Chromium, Firefox, and WebKit.
      Icons retained geometry and neither page overflowed horizontally. Actual
      browser zoom at 400% was not tested.

## Motion

- N/A — icons have no animation, transition, or automatic movement.

## Forced colors / high contrast

- [x] On 2026-11-07, Chromium, Firefox, and WebKit emulated forced colors.
      The Astro example's SVG geometry remained non-empty, fills matched the
      forced text color, and foreground-to-background contrast measured at least
      3:1. The page remained free of horizontal overflow. This does not establish
      contrast for icons on other consumer backgrounds.

A real Windows High Contrast review remains necessary; browser emulation is
not equivalent to a user session.

## Localization

- N/A — `localization` is `text-content-only`; icons have no intrinsic strings.
  Consumers supply and localize accessible names and adjacent text, and must
  verify wrapping in their own layouts.
- On 2026-11-07, the Storybook fixture was checked in Chromium, Firefox, and
  WebKit with expanded text and RTL direction. The flow-direction icon mirrored,
  a nearer explicit `dir="ltr"` prevented mirroring, and the fixture did not
  overflow. Automated tests also verify that ordinary icons do not mirror.

## Open items

These items remain tracked under Jira CDS-84.

- Human screen-reader review of the standalone SVG and icon-only control
  example; record the screen reader, browser, and observed announcements.
- Real Windows forced-colors/High Contrast review.
- Verify actual browser zoom at 400% and record the result.
- State accessibility-owner review and sign-off remain pending.
- Dependent components must verify functional icon/background contrast and
  their own interactive target sizes.
