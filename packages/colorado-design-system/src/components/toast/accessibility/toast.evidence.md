# Accessibility Evidence: `cods-toast`

**Maturity:** experimental  
**Reviewer:** automated unit tests only; human review pending  
**Date:** 2026-11-11  
**Tracking:** CODS-P3-034

## Keyboard and focus

- [ ] Verify Tab and Shift+Tab reach every dismiss button in order and can leave the notification area. Enter and Space activate the native button.
- [ ] Confirm focus indication is visible and not obscured at all states. On 2026-11-23, 320 x 256 browser tests verified that the contextual Undo is not covered in Chromium, Firefox, and WebKit, and that stacked toast controls remain keyboard reachable in Chromium. Broader manual verification remains open.
- [x] The shared focus color measured about 1.90:1 against the toast surface. Dismiss and action controls now use the `color.focus-toast` outline (blue/20 on `surface/toast/default`), approved by design and accessibility in review. `references/contrast-pairs.json` checks it at 3:1 or more, and a browser test measures the computed outline against the toast background for both controls.
- [ ] Unit tests check that showing a message does not move focus and that dismissing a focused message returns focus to the supplied trigger. Verify keyboard operation and focus behavior in browsers, including dismissal of stacked items and missing or removed return targets.

## Names and roles

| Element             | Role   | Name source                     |
| ------------------- | ------ | ------------------------------- |
| Notification area   | region | Authored `aria-label`           |
| Dismiss control     | button | Consumer-supplied visible label |
| Polite announcement | status | Message text                    |
| Urgent announcement | alert  | Message text                    |

Error-severity notifications must use `urgency: 'assertive'`; the documentation states this requirement.

- [ ] Review naming, role and announcement semantics with accessibility specialists.

## Screen readers

- [ ] A human must test VoiceOver with Safari and NVDA or JAWS with a supported browser. Check first, repeated, simultaneous and urgent messages; interruption; announcement order; and whether controls are discoverable. No screen-reader announcements have been observed.

## Reflow, motion, forced colors, and localization

- [ ] Verify 400% zoom and 320px reflow without content or controls being obscured.
- [ ] The entrance animation is suppressed by `prefers-reduced-motion`. Browser verification remains open.
- [ ] Verify forced colors and focus visibility in high contrast.
- [ ] Verify long translated messages and dismiss labels, wrapping, and right-to-left layout.

## Open items

- A human design and accessibility review must decide whether the pattern should ship, including the Figma Undo variant and the relationship to persistent contextual feedback. The controller supports a persistent action, but the Undo example and its equivalent contextual action still need design and accessibility review.
- Timeouts are optional, default off, and pause on hover and focus. A timeout minimum does not make information or actions accessible; equivalent information must remain available. The component cannot enforce that requirement for consuming pages.
- Browser, axe, screen-reader, and manual checks have not been completed. Unit tests do not establish accessibility acceptance. The component remains experimental.
