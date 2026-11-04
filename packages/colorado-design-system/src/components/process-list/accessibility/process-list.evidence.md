# Accessibility Evidence: `cods-process-list`

**Maturity:** experimental  
**Reviewer:** automated implementation review  
**Date:** 2026-11-03

## Keyboard and focus

The component has no interactive behavior. Links authored inside steps retain their native keyboard behavior; human verification remains open.

## Naming and roles

The fixture uses ordered lists, list items, and headings. Number icons are decorative, and the list carries the sequence. An explicit list role supports Safari list semantics.

## Screen reader verification

- [ ] A human must verify list order, step numbers, headings, and decorative icons with a named screen reader and browser.

## Zoom and reflow

- [x] The built documentation page had no horizontal overflow at 320px in Chromium, Firefox, and WebKit on 2026-11-03.
- [ ] A human must verify actual 400% browser zoom.

## Motion

N/A — the component has no animation.

## Forced colors and localization

- [x] Automated forced-colors checks verified connector visibility in Chromium, Firefox, and WebKit emulation on 2026-11-03.
- [x] Automated checks verified native numbering without styles and alert accessibility in the built documentation on 2026-11-03.
- [x] On 2026-11-04, server-free browser tests verified visible decorative numbers with a host `[hidden]` reset, native numbering without styles, and a consumer override restoring native markers without duplicate icons in Chromium, Firefox, and WebKit.

- [ ] A human must verify forced colors and translated content.
- [x] Automated layout checks covered the right-to-left example in Chromium, Firefox, and WebKit on 2026-11-03; human review remains open.

## Open items

Screen-reader, keyboard with authored links, 400% zoom, forced-colors, translated-content, design, and accessibility-owner reviews remain open. Automated tests do not constitute acceptance.
