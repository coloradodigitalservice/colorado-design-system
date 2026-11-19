# Accessibility Evidence: `cods-breadcrumbs`

**Component maturity at time of review:** experimental  
**Reviewer:** Codex, automated checks and Chromium browser inspection; human review pending  
**Date:** 2026-10-16  
**Related component metadata:** `breadcrumbs.metadata.json`

## CODS-P4-012 hardening — 2026-11-17

Developer first pass for Phase 4 (CDS-126). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`apps/web` `/breadcrumbs/` now follows the CoDS Website Content outline: title
and description, a curated preview (Default, Long trail, Inverse) with the exact
markup that renders it, Component Status, Guidance (When to use with a variant
table, Accessibility for breadcrumbs), and Specifications (classes, the
immediate-parent link markup, narrow screens and long trails, variable
settings, limitations). Figma supplies no writing guidance, so that section is
omitted. The full fixture catalogue and public localization/RTL guidance were
removed from the page; those states remain in Storybook and the tests. The page
makes no WCAG conformance claim.

### Test audit

Counts are Playwright test runs (web specs run in Chromium, Firefox, and
WebKit; Storybook in Chromium only), plus Breadcrumbs' entries in
`web-component-docs.spec.ts`.

| Area                                     | Before           | After            |
| ---------------------------------------- | ---------------- | ---------------- |
| `web-breadcrumbs.spec.ts`                | 8 tests × 3 = 24 | 8 tests × 3 = 24 |
| `storybook-breadcrumbs.spec.ts`          | 1                | 2                |
| `web-component-docs.spec.ts` Breadcrumbs | 2 tests × 3 = 6  | 0                |
| Total browser runs                       | 31               | 26               |

Breadcrumbs has no controller, so there are no unit tests.

Decisions:

- **Kept in all three browsers (web):** separator artwork, hover on light and
  inverse, keyboard order and activation, forced colors and reduced motion,
  light/dark focus and line height, no-CSS/no-JS readability, and the narrow
  layout of the default trail (parent link, hidden current page, mirrored back
  caret, forced-color caret, no horizontal overflow). These run against the
  preview's Default and Inverse variants. At 320px, the Long trail also checks
  the parent link name, hidden current page, and wrapping without overflow.
- **Replaced:** the web "ordered ancestors and copyable markup" test became a
  page-outline test (headings, three previewed trails with list semantics and an
  unlinked current page, status, axe). Copied-code accuracy is checked by the
  build's docs output check and `web-shared-fixtures.spec.ts`.
- **Moved to Storybook (states not on the page):** the all-trail structure and
  single-level separator checks, and the single-level and right-to-left parts
  of the narrow-width test. These now run in Chromium only.
- **Consolidated:** the existing Storybook long-trail test merged into the
  existing narrow-width web test so its assertions run in all three browsers.
- **Removed:** Breadcrumbs' Summary/Anatomy and link/320px entries in
  `web-component-docs.spec.ts`, replaced by the page-outline test; links are
  also checked by the build.
- **Unaffected:** the Hero breadcrumb tests in `web-hero.spec.ts`.

### Automated results

On branch CODS-P4-012, based on CODS-P4-011 (`54617ad`):

- `pnpm build`: passed, including the docs output check (28 pages).
- `web-breadcrumbs`, `storybook-breadcrumbs`, `web-shared-fixtures`,
  `web-component-docs`, `web-accordion`, and `web-hero` in Chromium, WebKit, and
  Storybook: 110 passed before the final copy fix, then `web-breadcrumbs` 16
  passed. Firefox does not launch on this machine (known local profile issue);
  CI runs Firefox.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `astro check`: passed.

### Manual matrix for Aten Accessibility/QA (pending)

Review the Default, Long trail, and Inverse variants on the PR preview at
desktop and narrow widths. States not on the page (single-level, Spanish, RTL)
are in the local Storybook (`pnpm dev:storybook`). Record browser, assistive
technology, and versions for each result.

- [ ] Named navigation landmark and ordered-list semantics announced.
- [ ] Link destinations and order; Tab/Shift+Tab and Enter.
- [ ] Current page announced (`aria-current="page"`), not a link or tab stop.
- [ ] Decorative separators not announced.
- [ ] Long-trail wrapping and narrow-screen parent link, including its
      accessible name "Previous level: _parent_".
- [ ] Focus visibility on light and inverse surfaces; hover treatment.
- [ ] Contrast, 400% zoom / 320px reflow.
- [ ] Forced colors / Windows High Contrast, reduced motion.
- [ ] Internal localization and long-text notes (Spanish, RTL, long labels).

## Keyboard

- [x] Ancestor links follow DOM order with Tab/Shift+Tab; the current item is not focusable. Automated Chromium, Firefox and WebKit coverage in `web-breadcrumbs.spec.ts`.
- [x] Focus leaves the trail with the next Tab; no controller or keyboard interception exists. Same three-browser test.
- [x] Documented interactions: Tab/Shift+Tab move among links; Enter follows the focused link. macOS WebKit uses Option+Tab. The test verifies actual navigation to an intercepted ancestor destination.

## Focus

- [x] Keyboard focus has a solid outline using `--cods-focus-ring-width`, `--cods-color-bg-action-focus`, `--cods-focus-ring-offset` and `--cods-color-focus-gap`. Automated checks cover Chromium, Firefox and WebKit; Chromium was also inspected interactively at 320px.
- N/A — no opening, closing, insertion, removal, validation, or automatic focus movement; this is static navigation.

## Naming and roles

- [x] Names and roles are defined by native markup, checked in all three browsers; page and isolated-story axe scans supplement the structural assertions.

  | Element                         | Role              | Accessible name source                                                                       |
  | ------------------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
  | `nav`                           | navigation        | Consumer-authored, localized `aria-label`; repeated documentation trails have distinct names |
  | `ol` / `li`                     | list / listitem   | Ancestor labels in document order                                                            |
  | Ancestor `a[href]`              | link              | Visible text span                                                                            |
  | Final `li[aria-current="page"]` | current list item | Visible non-linked page text                                                                 |
  | Separator `::after`             | decorative        | Empty generated content with a CSS mask; no text or ARIA name                                |

- [x] Default, long-content, single-level, Spanish, RTL and focus-visible examples use the same naming model. The single-level example has one current item, no link and no separator.

## Screen reader verification

- [ ] A human must test VoiceOver/Safari and/or NVDA/Firefox and record browser/AT versions.
- [ ] Verify list/landmark discovery, current-page announcement, link order, separator exclusion and localized pronunciation. No observed screen-reader announcements are claimed here.

## Zoom and reflow

- [ ] Recheck 320 CSS px reflow after the mobile previous-level change. At narrow widths the immediate parent is the only visible link; the full trail returns at wider widths.
- [ ] Actual browser zoom at 400% remains a human check; viewport emulation is not evidence of browser UI zoom.

## Motion

- N/A — no animation, transition or JavaScript behavior. Reduced-motion emulation is included in the three-browser forced-colors test; computed animation is `none`.

## Forced colors / high contrast

- [x] Browser forced-colors emulation retains a solid focus outline and a nontransparent masked separator, using system Highlight/CanvasText and link colors. Automated Chromium, Firefox and WebKit coverage; Chromium additionally inspected with the CLI.
- [ ] Real Windows high-contrast inspection remains open, including focus and separator legibility.

## Localization

- [ ] Recheck long strings and translated previous-level labels after the responsive change. Spanish and Arabic examples use `lang`.
- [ ] Recheck the mobile back caret and desktop separators in Arabic with `dir="rtl"`. Consumer text, URLs and navigation names require localization.
- [ ] Content reviewers must verify the translated labels and reading order with assistive technology.

## Automated coverage and design reference

- `web-breadcrumbs.spec.ts`: native semantics, non-linked current item, single-level trail, canonical copyable markup, axe, keyboard order/activation, focus tokens, narrow layout, RTL, forced colors, no motion, and CSS/JavaScript disabled.
- `storybook-breadcrumbs.spec.ts`: narrow previous-level link and axe. The generic Storybook suite scans every story; shared-fixture tests compare every state with canonical content.
- `web-component-docs.spec.ts`: required documentation, links and narrow-page layout.
- The base token catalog's October 8 Figma evidence records regular Open Sans 16px/16px text, 4px spacing and 12px vertical padding. This implementation uses the shared Phosphor Regular `caret-right` separator, not an exported Figma CaretRight asset. The inverse and mobile previous-level variants are implemented. Design review must confirm the separator shape and focus treatment.
- Live Figma connector access was denied (the second connection needs reauthentication), and Chrome disables JavaScript from Apple Events. No live visual parity or Figma asset extraction is claimed.

## Open items

Tracked with CDS-66 / CODS-P3-018:

- Human screen-reader, actual 400% zoom, Windows high contrast, and translated-content reviews above.
- Aten design lead/State design owner: review the responsive trail, shared Phosphor separator and token-based focus treatment against the current Figma design. G2 token/design approval remains a dependency.
- Accessibility lead and State accessibility owner: review this evidence before stable maturity. The component remains experimental; no human or gate approval is implied by automated passing checks.

## Phosphor integration (2026-10-21)

The former USWDS `navigate_next.svg` separator now uses shared Phosphor Regular `caret-right` from the approved generated pipeline. The original 16px decorative mask box, current-color semantic token, wrapping, link names and RTL mirroring are retained. This is USWDS-to-Phosphor adoption; no component-local Figma export existed to remove.

Human screen-reader, actual 400% zoom, Windows High Contrast and design/accessibility acceptance remain open; this update does not change experimental maturity.

## Follow-up review — 2026-10-21

Figma light/dark nodes 6209:517 and 5054:1737 were inspected. Removing extra
list padding restores the 40px one-line height (12px + 16px + 12px). Links
retain 1px underlines. A keyboard-focus contrast bug was fixed: light-surface
links now keep blue text rather than becoming white on a light background.
Focus uses the observed 2px white gap and 2px blue band. The docs site's generic
anchor focus rule excludes component links so it cannot override that ring.
An inverse example supplies white links/separators on a primary navy surface.

145 unit tests and 22 browser checks passed across Chromium, Firefox, WebKit
and Storybook Chromium, including axe while links are focused on both surfaces.
Workspace, Astro/Storybook validation, token drift, builds, formatting, lint,
type checks, fixture/static output checks passed. Browser tests used built files
without servers. The Getting Started docs link preserves deployment prefixes.
At that time, the mobile trail wrapped every ancestor. The October 30 review
changed this to the parent-only treatment described below; human design and
accessibility acceptance remains open.

## Review changes (2026-10-30)

Hover removes underlines and uses the standalone hover color on light surfaces. Line height inherits from surrounding content. Below 40rem, the immediate parent link uses a localized previous-level label and includes the parent name for assistive technology. On October 30, automated Chromium and WebKit checks passed for the parent destination and accessible name, keyboard focus, 320px reflow, RTL caret, forced-colors mask, hover and the wider trail. Firefox could not launch during that run. On November 2, the focused Breadcrumbs web tests passed in Chromium, Firefox, and WebKit using built files; Firefox used the documented temporary-home workaround. Human screen-reader and design review remain open.
