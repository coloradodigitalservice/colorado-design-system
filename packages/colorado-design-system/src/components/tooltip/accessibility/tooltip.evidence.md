# Accessibility Evidence: `cods-tooltip`

**Maturity:** experimental

**Component type:** C (CoDS divergent from USWDS tooltip); direction approved in PR #98 review

**Divergence approval:** State design and accessibility approved the Type C divergence; individual accessibility evidence checks remain open.

**Reviewer:** automated tests and agent-run browser checks; human verification pending

**Date:** 2026-11-19

**Tracking:** CODS-P3-035 / CDS-83

## CODS-P4-037 hardening — 2026-11-25

Developer first pass for CDS-146. Manual QA, State domain acceptance, and client sign-off remain pending.

### Documentation page

The page uses the shared preview, code, and status, followed by guidance and specifications. The preview retains all five fixture states. It explains supplemental descriptions, accessible names, initialization, placement, and limitations. The public localization section and examples catalogue were removed; localization remains in this evidence. Status does not claim conformance. Confirm guidance against Figma during design review.

### Test audit

| Area                                          | Before | After |
| --------------------------------------------- | -----: | ----: |
| Unit cases                                    |     11 |    11 |
| Web Tooltip runs (1 test × 3 browsers)        |      3 |     3 |
| Storybook Tooltip runs (Chromium)             |     13 |    13 |
| Shared web fixture runs (1 test × 3 browsers) |      3 |     3 |
| Shared Storybook fixture runs (5 states)      |      5 |     5 |

The web smoke test was updated for the shared page outline and preview, preserving focus and axe checks. Keep the distinct lifecycle, geometry, hover, focus, contrast, and prior-review regressions; no identical tests were identified for safe removal. No tests moved between browser engines.

### Automated results

Base: `f92de13` (main). Tooltip unit tests: 11 passed. `pnpm build` (including token and static documentation checks), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm check:workspace` passed. The first build logged a TypeScript TS7022 diagnostic in the Tooltip controller despite exiting successfully; an explicit type annotation addresses it. These checks used Node 26.5.0, not the pinned 24.21.0. Browser runs and visual review are pending: no local server was running and starting one was not authorized. See the PR for remaining results.

### Manual matrix for Aten Accessibility/QA (pending)

Record browser, assistive technology, and versions for each result. Review both treatments and all positions on the tested revision.

- [ ] Focus and hover appearance, persistence and pointer movement onto the tooltip; Escape dismissal without focus loss and fresh interaction reopening.
- [ ] VoiceOver/Safari and NVDA or JAWS announcements, including an existing description and the trigger's separate accessible name.
- [ ] Viewport collision, scrolling, clipping, 400% zoom and 320px reflow, including the no-fit fallback.
- [ ] Essential information available on touch devices and without JavaScript; lifecycle initialization and cleanup preserve focus.
- [ ] Contrast and visual treatment with design; forced colors and reduced motion.
- [ ] Internal localization, long text, and right-to-left layout.
- [ ] State domain acceptance and client sign-off on the tested revision.

## Keyboard and focus

- [ ] Verify Tab and Shift+Tab reach each trigger and that focus remains on the trigger when Escape dismisses the tooltip.
- [ ] Verify focus indication is visible and unobscured, including at 400% zoom.
- Automated: unit tests cover focus, hover, Escape, reopening on a fresh hover or focus after Escape, and focus preserved through `init` and `destroy`. Browser tests cover Escape without moving focus and the trigger staying unobscured in a 320 × 180 viewport with 125 characters of text.
- Manual: focus was preserved through `init` and `destroy` in Chromium, Firefox, and WebKit on 2026-11-19.

## Names and roles

| Element | Role              | Name or description source                                          |
| ------- | ----------------- | ------------------------------------------------------------------- |
| Trigger | button in fixture | Visible button text; tooltip is supplemental description            |
| Tooltip | tooltip           | Text from the authored `title`, associated using `aria-describedby` |

- [ ] Review the generated description and role with accessibility specialists, including existing descriptions.

## Screen readers

- [ ] A human must verify announcements with VoiceOver and Safari and with NVDA or JAWS in a supported browser. No announcements have been observed.

## Reflow, motion, forced colors, contrast, and localization

- [ ] Verify positioning and readability at 400% zoom and 320px reflow, including viewport edges. Automated: when no side fits, the tooltip opens below the trigger without covering it or starting above the page and normal-flow overflow can be reached by keyboard scrolling; an open tooltip repositions on scroll and resize and fits inside clipping containers when space allows; the arrow tracks the trigger when the body shifts; the hover path holds inside a `scale(0.5)` ancestor. Fixed-position and clipping layouts can still make no-fit overflow unreachable.
- [ ] Verify reduced motion (the tooltip has no animation) and forced colors (system-color border, arrow hidden).
- [ ] Verify contrast of both treatments with design. Default: white text on `text-primary`. Light: `text-primary` on white with a `border-default` border and low elevation shadow. Automated axe checks run on both.
- [ ] Verify long translated content and right-to-left layout.

## Open items

- Compared the light and dark variants and authoring guidance with the Tooltip Figma page on 2026-11-19. The design shows matching arrows, a soft shadow, and light tooltips on a dark surface. The docs include its 3:1 surrounding-background guidance.
- The Tooltip Storybook behavior and axe checks and documentation smoke tests ran in Chromium, Firefox, and WebKit on 2026-11-19. Manual browser and screen-reader verification remains open.
