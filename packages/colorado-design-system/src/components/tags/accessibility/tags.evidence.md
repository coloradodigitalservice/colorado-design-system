# Accessibility Evidence: `cods-tags`

**Component maturity:** experimental

**Review date:** 2026-11-03

**Metadata:** `tags.metadata.json`

## Keyboard, focus, and naming

- N/A — Tags are static text, with no controls, keyboard interaction, or focus management. Their visible text conveys the category or status; color is supplemental.

## Contrast

- Token contrast check passed on 2026-11-03 for all seven text/background pairs, with ratios from 6.94:1 to 14.44:1. The documentation examples passed axe in Chromium, Firefox, and WebKit on 2026-11-03.

## Screen reader verification

- [ ] A person must test and record a named screen reader and browser pairing and observed reading in context.

## Zoom and reflow

- [ ] Verify actual 400% zoom and 320px reflow without content loss across Chromium, Firefox, and WebKit.

## Motion

- N/A — The component has no animation.

## Forced colors

- [ ] Verify the text and meaning in forced colors in Chromium, Firefox, and WebKit.

## Localization

- [ ] Verify long translated and right-to-left labels in Chromium, Firefox, and WebKit. The fixture includes Arabic text, and the styles permit wrapping.

## Open items

- Human screen-reader, design, zoom, forced-colors, and accessibility review remain open.
- Storybook axe checks remain open.
