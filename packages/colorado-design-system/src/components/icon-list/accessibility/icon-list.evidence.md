# Accessibility Evidence: `cods-icon-list`

**Maturity:** experimental  
**Date:** 2026-11-02  
**Reviewer:** automated implementation review

## Keyboard and focus

The component has no interactive controls or focus management. Links placed in list content retain their native keyboard behavior and focus styles; a human review remains open.

Automated browser checks passed in Chromium, Firefox, and WebKit on 2026-11-02. Firefox used the repository-documented temporary home workaround.

## Naming and roles

The fixture uses native unordered lists and list items. Icons have `aria-hidden="true"` and `focusable="false"`; the text conveys each item's meaning.

## Screen reader verification

- [ ] A human must verify list announcements and decorative icon exclusion with a named screen reader and browser.

Automated axe checks passed in all three browsers; these do not replace human review.

## Zoom and reflow

- [x] At a 320px viewport, the documentation page had no horizontal overflow in Chromium, Firefox, and WebKit.
- [ ] Human verification at 400% browser zoom remains open.

## Motion

N/A — no animation.

## Forced colors and localization

- [ ] Human forced-colors and translated-content review remains open.
- [ ] Verify right-to-left layout and long content in supported browsers.

## Open items

Screen reader, 400% zoom, forced colors, translated content, design and accessibility owner review remain open. Automated tests do not constitute acceptance.
