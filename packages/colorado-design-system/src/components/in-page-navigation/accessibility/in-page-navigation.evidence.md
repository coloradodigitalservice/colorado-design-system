# Accessibility Evidence: `cods-in-page-navigation`

**Component maturity at time of review:** experimental

**Reviewer:** Automated source-level checks by Codex; human review pending

**Date:** 2026-10-28

**Related component metadata:** `in-page-navigation.metadata.json`

## CODS-P4-024 hardening — 2026-11-20

Developer first pass for Phase 4 (CDS-143). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`/in-page-navigation/` now follows the CoDS Website Content outline: title and
description, a curated preview of the `default` fixture state (the navigation
plus the three sections it links to, so preview links jump to displayed target
content), the exact code that renders it, and Component Status. The status
states that axe passes for the preview and that manual review, including
screen-reader testing, is pending; it makes no conformance claim.

Guidance covers when to use, writing labels, and accessibility (landmark name,
keyboard, `aria-current="location"`, no focus movement, labeled target
sections, sticky-header and smooth-scrolling notes). Specifications cover
classes and attributes, linking to sections with stable IDs, responsive
placement, controller setup and events, and limitations including the approved
Type C divergence. The old "Markup and behavior" prose was folded into these
sections. There was no examples catalogue or public localization guidance to
remove. The preview code helper (`apps/web/src/lib/preview-markup.mjs`) now
strips the fixture's `<div data-cods-fixture-state>` wrapper, matching Card's
change in CODS-P4-014.

### Test audit

| Area                                               | Before         | After          |
| -------------------------------------------------- | -------------- | -------------- |
| Unit `in-page-navigation.test.ts`                  | 4              | 4              |
| `web-in-page-navigation.spec.ts`                   | 2 × 3 browsers | 5 × 3 browsers |
| `storybook-in-page-navigation.spec.ts`             | 6              | 2              |
| `web-shared-fixtures.spec.ts` (In-Page Navigation) | 1 × 3          | 1 × 3          |
| Browser spec lines (web + Storybook)               | 41 + 170       | 171 + 73       |

Playwright runs went from 12 to 17 because keyboard and hover checks now run
in Firefox and WebKit as well as Chromium.

Decisions:

- **Moved to the docs page (now in all three browsers):** keyboard order, exit,
  and Enter activation; desktop hover colors and no hover change at mobile
  width. These are engine-sensitive and ran only in Chromium in Storybook.
  The keyboard test uses Option+Tab in macOS WebKit, as the other link tests do.
- **Consolidated:** the Storybook canonical current-section test (scroll to the
  second section, then to the page end) merged into the web current-section
  test, which now also checks the page-end case and that only one link is
  current.
- **Removed as duplicates:** the Storybook canonical test's axe scan (the page
  outline test scans the whole page at 320px) and the Storybook "authored links
  work without enhancement" test (identical to the web no-JS test, which now
  also checks that no link is marked current without JavaScript and that the
  target section is in the viewport).
- **Added:** a page-outline test (headings, single preview state, pending
  status wording, USWDS link, no localization text or fixture wrapper, 320px
  reflow, axe).
- **Kept in Storybook (Chromium only):** the short-final-section and
  gap-after-section scroll regressions. They restyle the whole story to set up
  scroll geometry and guard past controller defects.
- **Kept unit tests:** all four protect distinct behavior: lifecycle,
  coalesced updates, event detail, focus preservation and authored-state
  restore; the short final section rule; listener removal after the root moves
  documents; and invalid markup leaving every link untouched.

### Automated results

Base commit `9f759ee` (`origin/main`). Node 26.5.0 locally; Node 24.21.0 was
not installed.

- `pnpm exec vitest run packages/colorado-design-system/src/components/in-page-navigation`: 4 passed.
- `pnpm build`: passed, including the docs output check.
- `pnpm exec playwright test --config config/playwright.built-files.ts` for the
  In-Page Navigation web and Storybook specs and `web-shared-fixtures.spec.ts`:
  64 passed in Chromium, WebKit, and Storybook.
- Firefox would not launch on this machine (known local profile issue); CI
  covers Firefox.

### Manual matrix for Aten Accessibility/QA (pending)

Review the default state on the PR preview and in Storybook (`Default` and
`Without JavaScript` stories). Record browser, assistive technology, and
versions for each result.

- [ ] Keyboard: Tab and Shift+Tab reach each link in order and leave the
      navigation; Enter jumps to the matching section.
- [ ] Jump targets: each link moves to its section, the section heading is
      visible and not obscured, and the URL fragment updates.
- [ ] Current-section state: `aria-current="location"` follows scrolling, is
      announced by screen readers, and is visible without relying on color.
- [ ] No focus stealing: scrolling and current-section updates never move focus.
- [ ] Reduced motion: no animation or smooth scrolling is introduced by the
      component with `prefers-reduced-motion: reduce`.
- [ ] No-JS and lifecycle fallback: links work without JavaScript; after
      destroy, authored `aria-current` values return and listeners stop.
- [ ] Accessible names and roles: navigation landmark name, link names, and
      section labels with a screen reader.
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Forced colors: focus and current-state indicators remain visible.
- [ ] Internal localization and long-text notes: long translated labels wrap,
      and right-to-left layout keeps the border on the inline start side.

## Keyboard

- [ ] Verify Tab and Shift+Tab reach each link in order and leave the navigation normally; Enter follows the selected link.
- Source-level tests with the full compiled Sass passed first-link Tab/Enter and no-JavaScript anchor navigation in Chromium and WebKit on 2026-10-28. Firefox could not launch.
- [ ] Verify all links and keyboard order in Chromium, Firefox, and WebKit using the built package.

## Focus

- [ ] Verify the focus indicator and that scrolling does not move focus in all three browsers.
- The controller does not deliberately move focus. Native links retain browser behavior.

## Naming and roles

- [ ] Verify names and current state with assistive technology.

  | Element      | Role       | Accessible name source                                              |
  | ------------ | ---------- | ------------------------------------------------------------------- |
  | Navigation   | navigation | `aria-label`                                                        |
  | Section link | link       | Link text; `aria-current="location"` identifies the current section |

## Screen reader verification

- [ ] A human tester must document screen reader and browser pairings and observed announcements, including current-state changes.

## Zoom and reflow

- [ ] Verify at 400% zoom and 320px with the built package and translated text.
- Isolated source-level automated checks found no horizontal overflow at 320px in Chromium and WebKit on 2026-10-28. Firefox could not launch.

## Motion

- The controller requests no animation or smooth scrolling. Consumer page styles can affect anchor scrolling.
- [ ] Verify reduced-motion behavior in the built package.

## Forced colors / high contrast

- Source-level testing found a visible focus outline in forced colors in Chromium and WebKit on 2026-10-28.
- [ ] Verify focus and current-state indicators in forced colors in the built package and Firefox.

## Localization

- [ ] Verify long translated labels, wrapping, and right-to-left layout in all supported browsers.

## Automated checks

- Isolated source-level axe checks passed in Chromium and WebKit on 2026-10-28. These did not exercise the built package or Storybook. Firefox failed to launch.
- The three focused Storybook interaction checks, including the scroll-gap regression and axe scan, passed in Chromium and WebKit on 2026-10-28 using preview-only assets. The preview bypassed the divergence approval check for example generation; the component metadata remains unapproved.
- [ ] Run the repository Storybook and web accessibility suites against a normal built package.

## Open items

- Human screen-reader, design, and accessibility reviews; State approval of the USWDS divergence.
- Full built-package checks in Chromium, Firefox, and WebKit, including keyboard, focus, reduced motion, forced colors, zoom, and localization.
- The component cannot be marked stable while these items remain open.
