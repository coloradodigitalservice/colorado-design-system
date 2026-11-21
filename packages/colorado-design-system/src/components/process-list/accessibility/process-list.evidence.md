# Accessibility Evidence: `cods-process-list`

**Maturity:** experimental  
**Reviewer:** automated implementation review  
**Date:** 2026-11-03

## CODS-P4-029 hardening — 2026-11-20

Developer first pass for Phase 4 (CDS-139). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`apps/web` `/process-list/` now follows the CoDS Website Content outline: title
and description, a curated preview (Default, Long steps with a nested list,
Step with an alert) with the exact markup that renders it, Component Status,
Guidance (When to use as bullets, since Process List has no variants; Writing;
Accessibility), and Specifications (elements, step numbers and connector,
assets and progressive enhancement, limitations). The guidance now states the
boundary with interactive step navigation: Process List is static and has no
current, completed, or linked steps. The full fixture catalogue and public
localization/RTL guidance were removed from the page; the three-, four-, and
five-step and right-to-left states remain in Storybook and the tests below.
The page status makes no conformance claim. Copy was carried over from the
reviewed first-pass page; it was not re-checked against Figma in this pass.

The preview needs the icon sprite, so `ComponentPreview.astro` and
`preview-markup.mjs` gained the optional `spriteUrl` support from CODS-P4-014
(Card, PR #110), and `check-docs-output.mjs` and `web-shared-fixtures.spec.ts`
pass that URL when comparing the preview code with the fixture. The code block
therefore shows the built sprite URL, as the Card page does.

### Test audit

| Area                                            | Before                | After                 |
| ----------------------------------------------- | --------------------- | --------------------- |
| Unit tests (Process List is static; none exist) | 0                     | 0                     |
| `web-process-list.spec.ts`                      | 5 tests × 3 = 15 runs | 6 tests × 3 = 18 runs |
| `storybook-process-list.spec.ts` (Chromium)     | 1                     | 3                     |
| `web-shared-fixtures.spec.ts` (process-list)    | 1 × 3 = 3             | 1 × 3 = 3             |
| `web-component-docs.spec.ts` (process-list)     | 0                     | 0                     |

Decisions:

- **Moved:** step count, icon, and structure checks for the three-, four-, and
  five-step and right-to-left states, the right-to-left icon gap at 320px, and
  their no-styles native-numbering alignment now run against Storybook
  `all-states`, because the public page no longer shows those states. They now
  run in Chromium only (previously Chromium, Firefox, and WebKit). The
  previewed states (default, long-content, with-alert) keep the same checks in
  all three engines.
- **Split:** the first web test now has a page-outline test (headings, status,
  links, no fixture catalogue or RTL copy, 320px reflow, axe) and a preview
  structure test (order, numbering, decorative icons, nested list, icon size and
  gap). The old test checked the legacy headings, which no longer exist.
- **Removed as duplicates:** none.
- **Kept:** the narrow-alignment, connector, and forced-colors test; the host
  `[hidden]` reset regression; the consumer native-marker override; and the
  no-JavaScript native-numbering fallback, all now targeting preview states.

### Automated results

Base `origin/main` 9f759ee. Local Node was 26.5.0 (no Node 24.21.0 installed);
CI uses the pinned version.

- `pnpm exec playwright test --config config/playwright.built-files.ts
tests/browser/web-process-list.spec.ts tests/browser/storybook-process-list.spec.ts
tests/browser/web-shared-fixtures.spec.ts tests/browser/web-accordion.spec.ts`:
  83 passed in Chromium, WebKit, and Storybook. Firefox could not launch
  locally (`browserType.launch` failed); CI covers it.
- `pnpm build` (including the docs output check), `pnpm check:workspace`,
  `pnpm fixtures:validate`, `pnpm validate`, `pnpm tokens:check`,
  `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (371 passed),
  `pnpm fixtures:check`, and the static example check passed.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported states on the PR preview and in Storybook (`pnpm
dev:storybook`). Record browser, assistive technology, and versions for each
result.

- [ ] Ordered-list and step announcements: list length and position are
      announced, and step numbers are not announced twice.
- [ ] Heading hierarchy: step headings fit the page outline, and the In-Page
      Alert heading sits one level below its step heading.
- [ ] Marker duplication and exclusion: decorative icons are hidden from
      assistive technology; with styles off, only native numbers show.
- [ ] Long-step reflow: long content and nested lists at 400% zoom and 320px.
- [ ] Meaning without connector styling: steps make sense without the connector
      or icons, including in forced colors.
- [ ] Links authored inside steps keep native keyboard and focus behavior.
- [ ] Contrast of text, icons, and connector.
- [ ] Reduced motion (N/A: no animation) and forced colors.
- [ ] Internal localization and long-text notes, including the right-to-left
      state in Storybook.

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
