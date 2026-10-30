# Accessibility Evidence: `cods-hero`

**Component maturity:** experimental

**Reviewer:** Codex (automated preparation)

**Date:** 2026-10-30

**Related metadata:** `hero.metadata.json`

## Keyboard and focus

- [ ] Verify keyboard order, visible focus, and that focus can leave the actions in Chromium, Firefox, and WebKit. Actions are ordinary links; Tab moves between them and Enter follows a link.
- [ ] Verify focus indicators against both surface colors. The Hero does not move focus.

## Naming and roles

- [ ] Verify heading level and action names in each example with assistive technology. Action names come from link text; the image alternative comes from its `alt` attribute.

## Screen reader verification

- [ ] A person must test and record the screen reader and browser pairings and observed announcements.

## Zoom, motion, and forced colors

- [ ] Verify actual 400% zoom and 320px reflow without loss of content or actions in all three browsers.
- N/A — Hero adds no animation.
- [ ] Verify forced colors in all three browsers and an operating system high-contrast mode.

## Localization

- [ ] Verify long and translated content and the Arabic right-to-left example in all three browsers and with representative readers.

## Open items

- Human design and accessibility review, including image cropping, contrast, touch targets, keyboard, zoom, forced colors, and screen-reader checks.
- Automated browser and axe checks in Chromium, Firefox, and WebKit remain to be run.
