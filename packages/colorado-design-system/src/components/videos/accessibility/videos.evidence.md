# Accessibility Evidence: `cods-videos`

**Maturity:** experimental  
**Date:** 2026-11-09  
**Related component metadata:** `videos.metadata.json`

## CODS-P4-036 hardening — 2026-11-20

Developer first pass for Phase 4 (CDS-149). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`apps/web` `/videos/` now follows the CoDS Website Content outline: title and
description, a curated preview (Native video, Embedded player, 4:3) with the
exact markup that renders it, Component Status, Guidance (When to use with a
variant table and don'ts, Accessibility for videos), and Specifications
(classes, native video attributes, embedded players and media-owner
responsibilities, sizing, variable settings, package files, limitations). No
Writing section was added because no Figma writing guidance was available.
The examples catalogue was removed. The labelled local embed stand-in
(`embed-local-stand-in`) is no longer on the page; it remains in the fixture
and in Storybook. No preview autoplays. The page status makes no conformance
claim; it states that axe passes and manual review is pending.

The preview prefixes the sample `/videos/` media with the site base path, so
it plays on the GitHub Pages project path; the code block keeps the canonical
fixture paths. This uses a new optional `previewHtml` prop on the shared
`ComponentPreview.astro` that changes only the rendered preview.

### Test audit

Counts are Playwright test runs (web runs in Chromium, Firefox, and WebKit;
Storybook in Chromium). Lines are spec code in the Videos-specific files.

| Area                                        | Before          | After            |
| ------------------------------------------- | --------------- | ---------------- |
| Unit (`component-fixtures.test.ts`, Videos) | 1 case          | 1 case           |
| `web-videos.spec.ts`                        | 1 test × 3 = 3  | 1 test × 3 = 3   |
| `storybook-videos.spec.ts`                  | 1               | 0 (file removed) |
| Shared web specs for `/videos/`             | 3 tests × 3 = 9 | 3 tests × 3 = 9  |
| Shared Storybook specs for Videos stories   | 9               | 9                |
| Videos-specific browser runs                | 4               | 3                |
| Videos-specific spec lines                  | 79              | 87               |

Decisions:

- **Rewritten (web, all three browsers):** the page test now checks the
  outline headings, the three preview states, computed accessible names for
  every player, that native previews keep controls, never autoplay, and carry
  a captions track, that the mocked provider embed loads, the 16:9 and 4:3
  wrapper geometry with the player filling the wrapper at 320px (previously
  only the 4:3 computed `aspect-ratio` value was read), status wording,
  exclusions, 320px overflow, and axe.
- **Removed as fixture restatement:** attribute reads of `controls`, `title`,
  and the stand-in's `title`, replaced by computed names and media
  properties; the caption-track check inside the local stand-in document,
  which tests a documentation asset rather than CoDS code.
- **Removed as duplicates:** the Vimeo `dnt=1` URL assertion in both browser
  specs (the unit fixture-safety test enforces it at generation), and the
  whole `storybook-videos.spec.ts`: its player and iframe counts restate the
  fixture (`storybook-shared-fixtures.spec.ts` checks every state's canonical
  content), its mocked-embed load check is covered by the web test in three
  browsers, and its axe check repeats `storybook.spec.ts`, which runs smoke
  and axe on all five Videos stories, including the local stand-in.
- **Kept:** the unit fixture-safety test (titled iframe, no `srcdoc`, Vimeo
  `dnt=1`, iframes rejected in other components); the shared web smoke and
  axe tests for `/videos/`; the shared Storybook content, smoke, and axe tests.
- **Not added:** no no-JS test, because Videos has no controller.

### Automated results

On the CODS-P4-036 working tree, from base `9f759ee`:

- `pnpm build`: passed, including the docs output check (36 pages). A build
  with `PUBLIC_BASE_PATH=/colorado-design-system` also passed and the preview
  media paths carry the base path.
- `pnpm exec playwright test --config config/playwright.built-files.ts` for
  `web-videos.spec.ts` and the `/videos/` entries in `web.spec.ts` and
  `web-shared-fixtures.spec.ts`: 8 passed in Chromium and WebKit. Firefox did
  not launch locally ("Could not find profile folder"), a known environment
  issue; CI runs Firefox.
- Full gate results are in the PR description.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on the PR preview and in Storybook
(including `embed-local-stand-in`, which is Storybook-only). Record browser,
assistive technology, and versions for each result.

- [ ] Native and embedded keyboard operation of every control, including
      captions and fullscreen, and that focus can leave the player (no trap).
- [ ] Player names announced for the native `aria-label`s and the iframe
      `title`.
- [ ] Caption display and accuracy for the native sample and the Vimeo clip;
      caption availability in each browser.
- [ ] Transcript and other required alternatives (the Vimeo clip still has no
      transcript; see Open items).
- [ ] No autoplay in any state.
- [ ] Responsive media and fallback behavior: 16:9 and 4:3 wrappers, the
      fallback text, and the embed when the provider is unreachable.
- [ ] Contrast of player controls, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion, forced colors, including native and embedded controls.
- [ ] Internal localization and long-text notes (translated captions, long
      labels, right-to-left context).

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
