# Accessibility Evidence: `cods-tooltip`

**Maturity:** experimental

**Component type:** C (CoDS divergent from USWDS tooltip); direction approved in PR #98 review

**Reviewer:** automated checks only; human review pending

**Date:** 2026-11-18

**Tracking:** CODS-P3-035 / CDS-83

## Keyboard and focus

- [ ] Verify Tab and Shift+Tab reach each trigger and that focus remains on the trigger when Escape dismisses the tooltip.
- [ ] Verify focus indication is visible and unobscured, including at 400% zoom.
- Automated: unit tests cover focus, hover, Escape, reopening on a fresh hover or focus after Escape, and focus preserved through `init` and `destroy`. Browser tests cover Escape without moving focus, focus preserved through `init` and `destroy`, and the trigger staying unobscured in a 320 × 180 viewport with 125 characters of text.

## Names and roles

| Element | Role              | Name or description source                                          |
| ------- | ----------------- | ------------------------------------------------------------------- |
| Trigger | button in fixture | Visible button text; tooltip is supplemental description            |
| Tooltip | tooltip           | Text from the authored `title`, associated using `aria-describedby` |

- [ ] Review the generated description and role with accessibility specialists, including existing descriptions.

## Screen readers

- [ ] A human must verify announcements with VoiceOver and Safari and with NVDA or JAWS in a supported browser. No announcements have been observed.

## Reflow, motion, forced colors, contrast, and localization

- [ ] Verify positioning and readability at 400% zoom and 320px reflow, including viewport edges. Automated: when no side fits, the tooltip opens below the trigger without covering it or starting above the page and wraps to the viewport width; an open tooltip repositions on scroll and resize; the arrow tracks the trigger when the body shifts; the hover path holds inside a `scale(0.5)` ancestor.
- [ ] Verify reduced motion (the tooltip has no animation) and forced colors (system-color border, arrow hidden).
- [ ] Verify contrast of both treatments with design. Default: white text on `text-primary`. Light: `text-primary` on white with a `border-default` border and low elevation shadow. Automated axe checks run on both.
- [ ] Verify long translated content and right-to-left layout.

## Open items

- Compared the light and dark variants and authoring guidance with the Tooltip Figma page on 2026-11-19. The design shows matching arrows, a soft shadow, and light tooltips on a dark surface. The docs include its 3:1 surrounding-background guidance.
- Human design and accessibility review of the Type C result remains open, including State design owner review of the light treatment and elevation against Figma.
- The Tooltip browser suite passed against the built Storybook and documentation site on 2026-11-19. Storybook behavior and axe checks ran in Chromium; the documentation smoke test ran in Chromium, Firefox, and WebKit. Manual browser and screen-reader verification remains open.
