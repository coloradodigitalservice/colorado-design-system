# Accessibility Evidence: `cods-tooltip`

**Maturity:** experimental

**Reviewer:** automated checks only; human review pending

**Date:** 2026-11-11

**Tracking:** CODS-P3-035 / CDS-83

## Keyboard and focus

- [ ] Verify Tab and Shift+Tab reach each trigger and that focus remains on the trigger when Escape dismisses the tooltip.
- [ ] Verify focus indication is visible and unobscured. Unit tests cover focus, hover, Escape, and teardown; browser checks remain necessary.

## Names and roles

| Element | Role              | Name or description source                                          |
| ------- | ----------------- | ------------------------------------------------------------------- |
| Trigger | button in fixture | Visible button text; tooltip is supplemental description            |
| Tooltip | tooltip           | Text from the authored `title`, associated using `aria-describedby` |

- [ ] Review the generated description and role with accessibility specialists, including existing descriptions.

## Screen readers

- [ ] A human must verify announcements with VoiceOver and Safari and with NVDA or JAWS in a supported browser. No announcements have been observed.

## Reflow, motion, forced colors, and localization

- [ ] Verify positioning and readability at 400% zoom and 320px reflow, including viewport edges.
- [ ] Verify reduced motion and forced colors.
- [ ] Verify long translated content and right-to-left layout.

## Open items

- Human design and accessibility review remains open. The additional Figma color treatment is deferred.
- Browser and screen-reader checks are not complete. Automated tests cannot establish accessibility acceptance.
