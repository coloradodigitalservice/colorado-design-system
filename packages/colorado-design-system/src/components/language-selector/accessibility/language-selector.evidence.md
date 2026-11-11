# Accessibility Evidence: Language Selector

**Maturity:** experimental  
**Review date:** 2026-11-06  
**Scope:** two-language links and the multiple-language disclosure.

## Keyboard and focus

- [ ] Verify Tab and Shift+Tab order, Enter and Space activation, visible focus, Escape and focus return in Chromium, Firefox and WebKit.
- Unit tests exercise open, Escape, focus return, idempotent initialization and restoration of the visible no-JavaScript list. These do not substitute for browser or assistive-technology checks.

## Naming and roles

- The navigation landmark is named Languages. Language choices are links named by their text; each carries `lang` and `hreflang`. The disclosure is a native button with `aria-controls` and an enhanced `aria-expanded` state.
- [ ] Confirm these names and expanded states using a screen reader with a named browser and operating system.

## Reflow, motion, forced colors and localization

- [ ] Verify 400% zoom, narrow reflow, focus visibility and forced colors in all required browsers.
- [ ] Verify long language names, mixed directions, and translations with content and accessibility reviewers.
- No animation is authored by this component.

## Open items

- Human screen-reader testing, actual zoom, forced-colors, localization and State accessibility review remain outstanding. Do not mark stable until completed.
