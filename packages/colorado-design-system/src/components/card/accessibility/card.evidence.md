# Accessibility Evidence: `cods-card`

**Component maturity:** experimental

**Reviewer:** Codex (automated preparation)

**Date:** 2026-10-29

## Keyboard and focus

- [ ] Verify Tab order, visible focus, and leaving each card in Chromium, Firefox, and WebKit. On 2026-10-29, a built-fixture check at 320px found the first link reachable by Tab with a visible outline in Chromium. WebKit uses Alt+Tab for link navigation in this environment; the documentation test verified focus moves between the two internal links with Alt+Tab. Firefox could not launch. Links use native Tab and Enter behavior; the component does not move focus.

## Naming and roles

- [ ] Verify link names and heading order in context. Whole-card links derive their accessible name from their content; internal links use their own text. Decorative icons are hidden from assistive technology. Image alternatives depend on the content and destination.

## Screen reader verification

- [ ] A human reviewer must test and record screen-reader/browser pairings and observed announcements.

## Zoom, motion, forced colors, and localization

- [ ] Verify actual 400% zoom and 320px reflow in all supported browsers. On 2026-10-29, the built fixture had no document-level horizontal overflow at a 320px viewport in Chromium and WebKit; this is not a full zoom review.
- [ ] Verify forced colors and visible focus in all supported browsers.
- [ ] Verify long, translated, and right-to-left content in all supported browsers. The fixture includes long and Arabic examples.
- N/A — the component has no animation; reduced motion does not change its behavior.

## Open items

- On 2026-10-29, axe found no violations in the built fixture in Chromium and WebKit; the image request was blocked for this isolated check. Firefox could not launch. The built Storybook Card test and documentation Card test passed in Chromium; the documentation test also passed in WebKit. Full browser suites and Firefox remain open.
- Keyboard, focus, actual zoom, forced-colors, localization, and human screen-reader review remain open.
- Design and accessibility owners must review the component before stable maturity.
