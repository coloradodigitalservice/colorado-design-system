# Accessibility Evidence: `cods-disclosure`

**Component maturity at time of review:** experimental  
**Reviewer:** Aten accessibility lead (sample only — not a real review)  
**Date:** 2026-09-21  
**Related component metadata:** `disclosure.metadata.json`

## Keyboard

- [x] The native `<summary>` element is reachable with <kbd>Tab</kbd> and toggles with <kbd>Enter</kbd> or <kbd>Space</kbd> — no scripted key handling is required.
- [x] No keyboard trap: focus moves to the next document element normally.
- Documented keyboard interactions: <kbd>Enter</kbd>/<kbd>Space</kbd> on the trigger toggles `open`.

## Focus

- [x] Focus indication on the trigger uses the approved focus-ring tokens (`--cods-focus-ring-color`).
- [x] Focus remains on the trigger after toggling; it is not moved into or out of the panel.

## Naming and roles

| Element               | Role                                                           | Accessible name source                                         |
| --------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| `<summary>` (trigger) | native disclosure `button`-equivalent (exposed by `<details>`) | its own text content                                           |
| `<div>` (panel)       | `generic`                                                      | not separately named; contextually associated by DOM adjacency |

- [x] Expanded/collapsed state is exposed natively via the `<details open>` attribute; no `aria-expanded` duplication is required.

## Screen reader verification

- [x] VoiceOver + Safari: announces "collapsed"/"expanded" and toggles correctly using native semantics.

## Zoom and reflow

- [x] Verified at 400% zoom / 320px reflow: trigger and panel text wrap without loss of content.

## Motion

- [x] N/A — no animation is applied to the open/close transition in this sample.

## Forced colors / high contrast

- [x] Border and focus ring remain visible under a forced-colors simulation.

## Localization

- [x] `localization: text-content-only` — trigger and panel text wrap for longer translated strings.

## Open items

- _none_
