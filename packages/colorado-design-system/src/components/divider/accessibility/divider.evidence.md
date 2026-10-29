# Accessibility Evidence: `cods-divider`

**Component maturity:** experimental

**Reviewer:** Automated and source review by Codex; human review pending

**Date:** 2026-10-29

**Related component metadata:** `divider.metadata.json`

## Keyboard and focus

N/A — The divider is static and has no interactive or focusable elements. It does not manage focus or define keyboard interactions.

## Naming and roles

| Element                              | Role                             | Accessible name source |
| ------------------------------------ | -------------------------------- | ---------------------- |
| Meaningful `<hr>`                    | separator                        | None needed            |
| Decorative `<hr aria-hidden="true">` | Hidden from assistive technology | N/A                    |

## Automated checks

- On 2026-10-29, built-file browser tests passed for the documentation page in Chromium and WebKit, and for Storybook in Chromium. The checks cover separator exposure, line styling, item spacing, and axe. Firefox failed to launch because its browser could not find its profile folder.

## Screen reader verification

- [ ] A human tester must verify meaningful and decorative dividers with named screen reader and browser pairings; no announcements have been observed yet.

## Zoom and reflow

- [ ] Human verification at 400% zoom and browser reflow remains open.

## Motion

N/A — The component has no animation.

## Forced colors / high contrast

- [ ] Human verification in operating-system forced colors remains open.

## Localization

N/A — The divider contains no text. Logical margins support either writing direction; surrounding content must be translated and reviewed separately.

## Open items

- Human screen-reader, zoom, forced-colors, design, and accessibility-owner review remain open under CDS-68.
- Run the automated documentation test in Firefox after repairing its Playwright browser environment.
