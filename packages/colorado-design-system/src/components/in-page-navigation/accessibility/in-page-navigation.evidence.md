# Accessibility Evidence: `cods-in-page-navigation`

**Component maturity at time of review:** experimental

**Reviewer:** Automated source-level checks by Codex; human review pending

**Date:** 2026-10-28

**Related component metadata:** `in-page-navigation.metadata.json`

## Keyboard

- [ ] Verify Tab and Shift+Tab reach each link in order and leave the navigation normally; Enter follows the selected link.
- Source-level tests with the full compiled Sass passed first-link Tab/Enter and no-JavaScript anchor navigation in Chromium and WebKit on 2026-10-28. Firefox could not launch.
- [ ] Verify all links and keyboard order in Chromium, Firefox, and WebKit using the built package.

## Focus

- [ ] Verify the focus indicator and that scrolling does not move focus in all three browsers.
- The controller does not deliberately move focus. Native links retain browser behavior.

## Naming and roles

- [ ] Verify names and current state with assistive technology.

  | Element      | Role       | Accessible name source                                              |
  | ------------ | ---------- | ------------------------------------------------------------------- |
  | Navigation   | navigation | `aria-label`                                                        |
  | Section link | link       | Link text; `aria-current="location"` identifies the current section |

## Screen reader verification

- [ ] A human tester must document screen reader and browser pairings and observed announcements, including current-state changes.

## Zoom and reflow

- [ ] Verify at 400% zoom and 320px with the built package and translated text.
- Isolated source-level automated checks found no horizontal overflow at 320px in Chromium and WebKit on 2026-10-28. Firefox could not launch.

## Motion

- The controller requests no animation or smooth scrolling. Consumer page styles can affect anchor scrolling.
- [ ] Verify reduced-motion behavior in the built package.

## Forced colors / high contrast

- Source-level testing found a visible focus outline in forced colors in Chromium and WebKit on 2026-10-28.
- [ ] Verify focus and current-state indicators in forced colors in the built package and Firefox.

## Localization

- [ ] Verify long translated labels, wrapping, and right-to-left layout in all supported browsers.

## Automated checks

- Isolated source-level axe checks passed in Chromium and WebKit on 2026-10-28. These did not exercise the built package or Storybook. Firefox failed to launch.
- [ ] Run the repository Storybook and web accessibility suites against the built package.

## Open items

- A large scroll jump into space between sections can leave an outdated current link. Reproduced in isolated Chromium and WebKit checks on 2026-10-28.
- Human screen-reader, design, and accessibility reviews; State approval of the USWDS divergence.
- Full built-package checks in Chromium, Firefox, and WebKit, including keyboard, focus, reduced motion, forced colors, zoom, and localization.
- The component cannot be marked stable while these items remain open.
