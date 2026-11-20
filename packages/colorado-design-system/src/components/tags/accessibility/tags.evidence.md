# Accessibility Evidence: `cods-tags`

**Component maturity:** experimental

**Review date:** 2026-11-03

**Metadata:** `tags.metadata.json`

## CODS-P4-034 hardening — 2026-11-20

Developer first pass for Phase 4 (CDS-147). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`apps/web` `/tags/` now follows the CoDS Website Content outline: title and
description, a curated preview of the seven colors (Gray (default), Blue,
Green, Red, Yellow, Plum, Teal) with the exact markup that renders it,
Component Status, Guidance (When to use as bullets, Accessibility for tags),
and Specifications (color classes paired with `usa-tag`, an in-heading usage
sample, variable settings for the `--cods-component-tag-<color>-*` tokens, and
limitations). The page states that tags are static and that removable,
selectable, and linked tags are not supported. The examples catalogue and the
public right-to-left example were removed; the long-content (Arabic, RTL) and
in-context states remain in Storybook and its test. The page status makes no
conformance claim: it records that axe passes for the preview and that manual
review is pending. There is no Figma writing guidance for tags, so the page has
no Writing section; the guidance reuses the reviewed Phase 3 copy and needs
Design to confirm it against Figma.

The Tags fixture wraps each state in a `<div data-cods-fixture-state>` rather
than a `<section>`. The preview helper (`apps/web/src/lib/preview-markup.mjs`)
now strips that wrapper too, using the same change as the Card hardening PR
(CODS-P4-014), so the preview code block is the tag markup only.

### Test audit

Counts are Playwright test runs (web runs in Chromium, Firefox, and WebKit;
Storybook in Chromium). Tags has no unit tests and no controller. Its entries
in the shared `web-shared-fixtures.spec.ts` (1 × 3) and the two tag-token tests
in `web-token-catalog.spec.ts` (2 × 3) are unchanged.

| Area                         | Before         | After          |
| ---------------------------- | -------------- | -------------- |
| `web-tags.spec.ts`           | 1 test × 3 = 3 | 1 test × 3 = 3 |
| `storybook-tags.spec.ts`     | 1              | 1              |
| Total Tags-specific runs     | 4              | 4              |
| Spec lines (web + Storybook) | 42 + 11 = 53   | 60 + 21 = 81   |

Decisions:

- **Kept in all three browsers (web):** the computed text and background color
  of each of the seven colors, now read from the curated preview, and axe at
  320px.
- **Added to the web test:** the page-outline checks required by the new page
  (headings, seven preview states, status wording, USWDS link, no
  localization text or fixture catalogue, no horizontal overflow at 320px).
  This accounts for the extra spec lines.
- **Moved to Storybook (states not on the page):** the per-tag no-clipping
  check at 320px. The long right-to-left label and the in-context state are no
  longer on the page, so this check now runs in Chromium only, across all nine
  fixture states, and also asserts that no tag extends past the viewport. The
  page-outline test still checks 320px overflow for the previewed colors in all
  three browsers.
- **Removed as fixture restatement:** non-empty text, the `SPAN` tag name, the
  in-context `h4` class check, and the two in-context code-sample text checks.
  The build's docs output check and `web-shared-fixtures.spec.ts` fail on any
  drift between the page and the fixture.
- **Removed from Storybook:** the non-empty-text loop, replaced by the
  no-clipping check over the same nine tags.
- **No no-JS test:** Tags ships no JavaScript.

### Automated results

Base commit `9f759ee` (origin/main), Node 26.5.0 (Node 24.21.0 is not installed
on this machine).

- `pnpm build`: passed, including the docs output check (36 pages).
- Tags browser tests, run against the built files with
  `config/playwright.built-files.ts` in the `web`, `web-webkit`, and
  `storybook` projects (`-g "tags|Tags"` over `web-tags`, `storybook-tags`,
  `web-shared-fixtures`, and `web-token-catalog`): 7 passed.
- Firefox could not launch locally (the browser process failed to start); CI
  covers Firefox.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported colors and states on the PR preview and in Storybook.
Record browser, assistive technology, and versions for each result.

- [ ] Category/status text is readable and announced in context with a named
      screen reader and browser.
- [ ] Contrast for each of the seven colors.
- [ ] Meaning is conveyed without color.
- [ ] No accidental tab stops: tags are skipped by Tab and are not announced as
      controls.
- [ ] Long-label wrapping, including the long right-to-left label in Storybook.
- [ ] 400% zoom / 320px reflow, narrow screens.
- [ ] Forced colors. Reduced motion: N/A, the component has no animation.
- [ ] Keyboard operation and focus management: N/A, tags are static text.
- [ ] Internal localization and long-text notes.

## Keyboard, focus, and naming

- N/A — Tags are static text, with no controls, keyboard interaction, or focus management. Their visible text conveys the category or status; color is supplemental.

## Contrast

- Token contrast check passed on 2026-11-03 for all seven text/background pairs, with ratios from 6.94:1 to 14.44:1. The documentation examples passed axe in Chromium, Firefox, and WebKit on 2026-11-03.

## Screen reader verification

- [ ] A person must test and record a named screen reader and browser pairing and observed reading in context.

## Zoom and reflow

- [ ] Verify actual 400% zoom and 320px reflow without content loss across Chromium, Firefox, and WebKit.

## Motion

- N/A — The component has no animation.

## Forced colors

- [ ] Verify the text and meaning in forced colors in Chromium, Firefox, and WebKit.

## Localization

- [ ] Verify long translated and right-to-left labels in Chromium, Firefox, and WebKit. The fixture includes Arabic text, and the styles permit wrapping.

## Open items

- Human screen-reader, design, zoom, forced-colors, and accessibility review remain open.
- Storybook axe checks remain open.
