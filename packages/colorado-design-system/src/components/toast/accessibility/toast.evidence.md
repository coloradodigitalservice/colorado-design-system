# Accessibility Evidence: `cods-toast`

**Maturity:** experimental  
**Reviewer:** automated unit tests only; human review pending  
**Date:** 2026-11-11  
**Tracking:** CODS-P3-034

## CODS-P4-035 hardening — 2026-11-25

Developer first pass for CDS-145, based on main `f92de13`. Aten Accessibility/QA, State domain acceptance, design review, and client sign-off remain pending. This is not an accessibility conformance claim.

### Documentation and test audit

The page now presents the default, icon, and action fixture states, their generated HTML, status, guidance, and controller setup. The examples retain contextual feedback and Undo. The no-JavaScript exception and the design of the action require human review. Copy follows the existing PR #97 review; confirm against Figma.

| Area                                    | Before |  After |
| --------------------------------------- | -----: | -----: |
| Toast unit cases                        |      8 |      8 |
| Web browser cases (three engines)       | 12 × 3 | 13 × 3 |
| Storybook browser cases (Chromium)      |      9 |      9 |
| Shared web fixture case (three engines) |  1 × 3 |  1 × 3 |

Kept all existing behavior, focus, geometry, and copied-example checks; none were shown to be duplicates. Updated the copied-example and preview selectors for the new layout and added a page-outline check. No tests were moved or removed. The shared legacy documentation-heading spec did not include Toast.

### Automated results

- `pnpm exec vitest run packages/colorado-design-system/src/components/toast/toast.test.ts`: 8 passed; `pnpm test`: 383 passed.
- `pnpm check:workspace`, `pnpm --filter @cods-internal/web validate`, `pnpm lint`, `pnpm typecheck`, and `pnpm format:check`: passed.
- `pnpm build`: exited 0; the declaration generator reported an existing Tooltip TS7022 diagnostic at `tooltip.ts:148`. The web build and its static documentation checks passed again after the page edits.
- Browser counts were listed, not executed. The test configuration starts local preview servers; no server was running and the current task prohibits starting one. Browser and visual checks remain for CI or a user-managed preview.
- Commands used Node 26.5.0 rather than the repository-pinned 24.21.0; repeat under the pinned version in CI.

### Manual matrix for Aten Accessibility/QA (pending)

Review all fixture states and Phase 3 acceptance criteria. Record the tested revision, browser, assistive technology and versions, findings, fixes, and retests.

- [ ] Keyboard operation, names and roles, focus visibility, no focus stealing, dismissal and focus recovery including stacked and removed triggers.
- [ ] Human screen-reader review of polite and assertive messages, first and repeated announcements, queue order, interruptions, and duplicates.
- [ ] Timing, hover and focus pause, persistent actions, lifecycle and timer cleanup.
- [ ] Contrast, 400% zoom and 320px reflow, narrow-screen layout and obscured controls.
- [ ] Reduced motion and forced colors.
- [ ] Long text, translated content, labels and RTL; record limitations.
- [ ] Review no-JavaScript fallback and contextual information/action; confirm whether the exception is accepted.
- [ ] Design review of the rendered basic, icon, and Undo treatments against Figma; State domain acceptance and client sign-off on the tested revision.

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
