# Accessibility Evidence: `cods-tag`

**Component maturity at time of review:** experimental  
**Reviewer:** Aten accessibility lead (sample only — not a real review)  
**Date:** 2026-09-21  
**Related component metadata:** `tag.metadata.json`

## Keyboard

- [x] N/A — the tag is not interactive and holds no focusable elements.

## Focus

- [x] N/A — the tag never receives focus.

## Naming and roles

- [x] The tag renders as plain inline text content; its accessible name is its visible text, with no implicit role beyond the default `generic` role of `<span>`.

## Screen reader verification

- [x] VoiceOver + Safari: text is announced as part of normal document flow; no extraneous announcements.

## Zoom and reflow

- [x] Verified at 400% zoom: text wraps (`overflow-wrap: anywhere`) instead of clipping or overflowing its container.

## Motion

- [x] N/A — no animation.

## Forced colors / high contrast

- [x] Background and text colors are token-driven and remain distinguishable under a forced-colors simulation; no information is conveyed by color alone.

## Localization

- [x] `localization: text-content-only` — long or translated labels wrap within the tag; no truncation is applied.

## Open items

- _none_
