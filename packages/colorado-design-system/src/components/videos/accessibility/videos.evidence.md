# Accessibility Evidence: `cods-videos`

**Maturity:** experimental  
**Date:** 2026-11-09  
**Related component metadata:** `videos.metadata.json`

## Keyboard and focus

- [ ] Verify native controls and the embedded player's keyboard operation and focus visibility in Chromium, Firefox, and WebKit.
- Native controls are provided by the browser; embedded player controls are provided by the third party.

## Naming and roles

- [ ] Verify accessible names and roles with assistive technology.
- The native video examples have an `aria-label`; the iframe has a descriptive `title`.

## Captions and transcript

- [ ] Verify the caption track displays during playback and matches the media in each browser.
- The fixture track describes the silent blue-screen sample.
- The embedded example now loads a real third-party player (Vimeo clip `76979871`, "The New Vimeo Player (You Know, For Videos)" by Vimeo Staff) with `dnt=1` and `texttrack=en`. The provider reports an English text track, but nobody has confirmed that the captions fully represent the audio.
- [ ] Confirm the embedded clip's captions fully represent its audio.
- [ ] Confirm a matching transcript for the embedded clip is available outside the player. Checked on 2026-11-09: Vimeo publishes no transcript for this clip, so one must be written and placed alongside the player before this item can be closed.
- A clearly labelled local stand-in (`embed-local-stand-in`) remains so wrapper tests stay deterministic; it establishes nothing about provider accessibility.

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
- [x] Use of the Vimeo clip, and Vimeo's privacy practices with `dnt=1`, were approved by the CoDS maintainer on 2026-11-09 for the public documentation site and Storybook. Caveats recorded at the time of approval: `dnt=1` is the provider's own do-not-track option and was not independently verified; it stops Vimeo setting the `vuid` cookie and tracking the session, but the player still requests `player.vimeo.com`, and the option is not on its own a claim of GDPR compliance. State sign-off for the `1.0.x` gate is a separate decision and is not recorded here.
- Transcript UI (download, show/hide) is deliberately out of scope for this PR per review.
