# Accessibility Evidence: Language Selector

**Maturity:** experimental  
**Review date:** 2026-11-18  
**Scope:** two-language links and the multiple-language disclosure.

## CODS-P4-025 hardening — 2026-11-20

Developer first pass for Phase 4 (CDS-148). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`apps/web` `/language-selector/` now follows the CoDS Website Content outline:
title and description, a curated preview (Two languages (default), Multiple
languages) with the exact markup that renders it, Component Status, Guidance
(When to use with a variant table and placement, Writing, Accessibility), and
Specifications (classes and attributes, controller setup, API and events,
limitations). The page explains the two-language links and the disclosure,
native-language labels, the `lang`, `hreflang`, and `aria-current` attributes,
and that consumers provide the translated destinations. It does not promise
translation, preference storage, or redirects, and it adds no header controls.
Public localization/RTL guidance and the examples catalogue were removed; the
RTL state stays in Storybook and its browser test. The status makes no
conformance claim: it says automated axe checks pass for both preview states
and manual review is pending.

The fixture wraps each state in `<div data-cods-fixture-state>`, which the
shared preview helper on `main` did not strip. `preview-markup.mjs` was taken
verbatim from the Card hardening branch (CODS-P4-014), which adds that.

### Test audit

Counts are Playwright test runs (web specs in Chromium, Firefox, and WebKit;
Storybook in Chromium). The forced-colors test is Chromium-only by design, as it
was before.

| Area                                     | Before              | After                          |
| ---------------------------------------- | ------------------- | ------------------------------ |
| Unit (`language-selector.test.ts`)       | 5 cases             | 4 cases                        |
| `web-language-selector.spec.ts`          | 1 test × 3 = 3      | 5 tests × 3 = 15 (13 run)      |
| `storybook-language-selector.spec.ts`    | 6 (5 run, Chromium) | 1                              |
| `web-shared-fixtures.spec.ts` (this one) | 1 × 3               | 1 × 3 (now checks the preview) |
| Spec lines (web + Storybook)             | 16 + 111 = 127      | 152 + 25 = 177                 |

Browser coverage grew because both fixture states are now on the page, so the
engine-sensitive tests moved from Chromium-only Storybook to all three browsers.

Decisions:

- **Moved to the web page (all three browsers):** the trigger focus ring and
  menu geometry (Figma: 4px ring, 2px gap, 200px rounded menu, no separators),
  the open-menu ring clearance, the forced-colors globe (still Chromium-only
  emulation), and no-JS link availability, now with a JavaScript-disabled
  browser context instead of a Storybook story without its play function.
- **Consolidated:** the two Storybook geometry tests (focus ring and menu, and
  ring clearance) became one web test. The Storybook click/Escape test and the
  web keyboard test became one web test that opens with Enter, tabs into the
  links, runs axe while open, and closes with Escape back to the button.
- **Added:** a page-outline test (headings, both preview states, enhancement,
  evidence-backed status, exclusions, 320px reflow, axe).
- **Removed as fixture restatement:** the unit case that counted `hreflang`
  links and checked the panel was visible before initialization, and the
  Storybook `hreflang` assertion. The build's docs output check and
  `web-shared-fixtures.spec.ts` fail on fixture drift; the destroy and invalid
  markup unit cases still cover the visible fallback after controller work.
- **Kept in Storybook (Chromium only):** the RTL 320px menu containment test,
  because the page no longer shows an RTL state.
- **Kept unchanged:** the remaining unit cases: toggle, events, Escape focus
  return, idempotent init and exact restore on destroy; and the two
  multi-instance teardown regressions (destroying one selector must not break or
  click another) and the invalid-markup warning.

### Automated results

Base commit `9f759ee` (`origin/main`), Node 26.5.0 (Node 24 was not installed
on this machine).

- `pnpm exec vitest run packages/colorado-design-system/src/components/language-selector tests/component-fixtures.test.ts`:
  61 passed.
- `pnpm build`: passed, including the docs output check of the curated preview.
- `pnpm exec playwright test --config config/playwright.built-files.ts` for
  `web-language-selector.spec.ts`, `storybook-language-selector.spec.ts`, and the
  Language Selector case in `web-shared-fixtures.spec.ts`: 12 passed in
  Chromium, WebKit, and Storybook, 1 skipped (forced colors in WebKit). Firefox
  could not launch locally ("Could not find profile folder"); CI covers it.
- `pnpm check:workspace`, `pnpm validate`, `pnpm tokens:check`,
  `pnpm format:check`, `pnpm lint`, and `pnpm typecheck`: passed.
- `pnpm test`: 365 of 370 passed. The 5 failures were timeouts in the
  unrelated icon-generation and fixture-regeneration tests while about a dozen
  other worktrees were building. Run alone with `--testTimeout 120000`, those two
  files passed (65 tests).

### Manual matrix for Aten Accessibility/QA (pending)

Review both variants on the PR preview, and the RTL state in Storybook
(`pnpm dev:storybook`). Record browser, assistive technology, and versions for
each result.

- [ ] Language links: accessible names, `lang` pronunciation of native labels,
      `hreflang`, `aria-current="page"`, and real destinations.
- [ ] Keyboard disclosure: Tab to the button, Enter and Space open and close it,
      Tab and Shift+Tab move through the links.
- [ ] Expanded state announced on the button when opened and closed.
- [ ] Focus: visible ring on the button and inset ring on rows; Escape and
      closing return focus to the button; the open menu does not cover the ring.
- [ ] No JavaScript: button hidden and every link visible; init and destroy
      restore the links.
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion (no animation authored), forced colors / Windows High
      Contrast.
- [ ] Internal localization and long-text notes: long language names, mixed
      directions, RTL menu alignment.

## Keyboard and focus

- [ ] Verify Tab and Shift+Tab order, Enter and Space activation, visible focus, Escape and focus return in Chromium, Firefox and WebKit.
- Unit tests exercise open, Escape, focus return, idempotent initialization, restoration of the visible no-JavaScript list, independent teardown of multiple instances without dispatching clicks on other selectors, and the fallback when USWDS markup is missing. These do not substitute for browser or assistive-technology checks.

## Naming and roles

- The navigation landmark is named Languages. Language choices are links named by their text; each carries `lang` and `hreflang`. The disclosure is a native button with `aria-controls` and an enhanced `aria-expanded` state.
- [ ] Confirm these names and expanded states using a screen reader with a named browser and operating system.

## Reflow, motion, forced colors and localization

- [ ] Verify 400% zoom, narrow reflow, focus visibility and forced colors in all required browsers.
- [ ] Verify long language names, mixed directions, and translations with content and accessibility reviewers.
- No animation is authored by this component.
- The globe icon is drawn in `ButtonText` under forced colors so it stays visible on the button. A Chromium forced-colors emulation test covers this; Windows High Contrast still needs a manual check.
- The trigger focus indicator is a 2px white gap inside a 4px blue ring. Menu rows use the separate inset row focus style. The open menu starts 6px below the trigger, so the whole ring stays visible.
- The menu aligns to the trigger's inline end, so it stays inside a 320px viewport in both LTR and RTL. A Storybook browser test covers the RTL case.

## Open items

- Human screen-reader testing, actual zoom, forced-colors, localization and State accessibility review remain outstanding. Do not mark stable until completed.
