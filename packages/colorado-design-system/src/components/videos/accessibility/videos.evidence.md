# Accessibility Evidence: `cods-videos`

**Maturity:** experimental  
**Date:** 2026-11-04  
**Related component metadata:** `videos.metadata.json`

## Keyboard and focus

- [ ] Verify native controls and the embedded player's keyboard operation and focus visibility in Chromium, Firefox, and WebKit.
- Native controls are provided by the browser; embedded player controls are provided by the third party.

## Naming and roles

- [ ] Verify accessible names and roles with assistive technology.
- The native video examples have an `aria-label`; the iframe has a descriptive `title`.

## Captions and transcript

- [ ] Verify the caption track displays during playback and matches the media in each browser.
- The fixture track describes the silent blue-screen sample. The embedded example is a local stand-in; accessibility and captions for real third-party players have not been verified.

## Screen reader verification

- [ ] Human review required with VoiceOver/Safari and NVDA/Firefox or Chrome.

## Zoom, motion, forced colors, and localization

- [ ] Verify 400% zoom and 320px reflow in all three browsers.
- [ ] Verify reduced motion and forced colors, including native and embedded controls.
- [ ] Verify translated captions, long labels, and right-to-left context.

## Open items

- Human accessibility, screen-reader, keyboard, captions, reflow, and design review remain open.
- Figma marks Videos as work in progress; the transcript disclosure concept needs design review.
- Embedded player accessibility and caption availability depend on the actual provider and video; the local stand-in does not establish either.
