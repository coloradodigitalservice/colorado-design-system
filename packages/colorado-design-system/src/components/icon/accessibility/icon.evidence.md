# Accessibility Evidence: `cods-icon`

**Component maturity at time of review:** experimental  
**Reviewer:** Not yet assigned; human accessibility review pending  
**Date:** 2026-10-20  
**Related work:** CODS-P3-036  
**Related component metadata:** `icon.metadata.json`

This evidence covers the static SVG usage pattern and generated catalog. It
does not approve consuming components or replace human assistive-technology
review. Keep maturity experimental.

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
      Automated DOM/browser checks verify the authored attributes and the named
      Search image in the default Storybook fixture; axe reports no violations
      there in Chromium. The Astro catalog previews are axe-checked in Chromium,
      Firefox, and WebKit.

  | Element                         | Role                           | Accessible name source                                          |
  | ------------------------------- | ------------------------------ | --------------------------------------------------------------- |
  | Decorative SVG beside “Home”    | Hidden from accessibility tree | `aria-hidden="true"`; no name                                   |
  | Meaningful standalone SVG       | `img`                          | `aria-labelledby` points to the SVG `<title>`                   |
  | Flow-direction arrow in example | Hidden from accessibility tree | `aria-hidden="true"`; adjacent “Next” text supplies the meaning |
  | Icon-only button example        | `button`                       | `aria-label="Search"`; SVG is hidden to avoid duplicate naming  |
  | SVG inside an icon-only button  | Hidden from accessibility tree | SVG uses `aria-hidden="true"`; the button has its own name      |

- N/A — there are no interactive state variations; the component metadata
  defines one static `default` state.

## Screen reader verification

- [ ] Screen reader / browser pairing(s) tested.
- [ ] Observed behavior notes.

No screen-reader announcement is claimed. A human reviewer must test the
standalone named SVG and the icon-only button example with a named
screen-reader/browser pairing and record the observed announcements.

## Zoom and reflow

- [x] The Astro icon catalog was checked at a 320 CSS-pixel viewport in
      Chromium, Firefox, and WebKit. The approved icon previews remain present and
      the document has no horizontal overflow. Actual browser zoom at 400% was not
      tested.

## Motion

- N/A — icons have no animation, transition, or automatic movement.

## Forced colors / high contrast

- [x] Chromium, Firefox, and WebKit emulated forced-colors mode. Catalog SVG
      geometry remained non-empty, fills matched the forced text color, and
      foreground-to-background contrast measured at least 3:1. The page remained
      free of horizontal overflow.

A real Windows High Contrast review remains necessary; browser emulation is
not equivalent to a user session.

## Localization

- N/A — `localization` is `text-content-only`; icons have no intrinsic strings.
  Consumers supply and localize accessible names and adjacent text, and must
  verify wrapping in their own layouts.
- The opt-in `cods-icon--mirror-in-rtl` behavior was checked in Chromium:
  flow-direction icons mirror in RTL, ordinary icons do not, and a nearer
  explicit `dir="ltr"` prevents mirroring. The catalog also reflows with RTL
  document direction in Chromium, Firefox, and WebKit.

## Open items

These items remain tracked under Jira CDS-84.

- Human screen-reader review of the standalone SVG and icon-only control
  example; record the screen reader, browser, and observed announcements.
- Real Windows forced-colors/High Contrast review.
- Verify actual browser zoom at 400% and record the result.
- Dependent components must verify functional icon/background contrast and
  their own interactive target sizes.
