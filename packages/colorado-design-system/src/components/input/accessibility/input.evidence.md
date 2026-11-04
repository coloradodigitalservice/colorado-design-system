# Accessibility Evidence: `cods-input`

**Maturity:** experimental  
**Review date:** 2026-11-02  
**Reviewer:** automated implementation review

## Keyboard and focus

- [ ] Verify keyboard navigation, text entry, visible focus, and focus contrast in supported browsers.
- Native inputs use standard browser editing and Tab navigation; disabled inputs are skipped and read-only inputs remain focusable.
- No script changes focus or handles keyboard events.

Automated browser tests on 2026-11-02 exercised text entry, read-only and disabled controls, and focus in Chromium, Firefox, and WebKit. A full keyboard-only pass remains open.

## Naming and roles

Each input has a visible associated label. Hints and feedback are linked through `aria-describedby`, and the error uses `aria-invalid="true"` with a visible corrective message. The native input type supplies its role.

Automated axe checks passed on the documentation page in Chromium, Firefox, and WebKit, and on each Input Storybook story in Chromium.

## Screen reader verification

- [ ] A human must verify labels, required state, hints, errors, and success feedback with a named screen reader and browser. Dynamic error announcements depend on the host application.

## Zoom and reflow

- [x] The built documentation page had no horizontal overflow at a 320px viewport in Chromium, Firefox, and WebKit (2026-11-02).
- [ ] Verify actual 400% browser zoom without clipping.

## Motion

N/A — no animation.

## Forced colors and localization

- [ ] Verify focus and control boundaries in forced colors with a human reviewer. Automated tests checked that a focused input retains an outline in emulated forced colors in Chromium, Firefox, and WebKit.
- [ ] Verify long and right-to-left translated content with design and accessibility reviewers. Automated checks verified that the prefix and suffix exchange sides in RTL.

## Open items

Screen reader, actual zoom, forced colors, localization, design, and accessibility-owner review remain open. Automated results do not constitute acceptance.
