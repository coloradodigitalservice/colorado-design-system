# Accessibility evidence: Link

**Maturity:** experimental

**Date:** 2026-10-22

**Review:** automated browser checks and visual inspection; human sign-off pending

## CODS-P4-026 hardening — 2026-11-20

Developer first pass for Phase 4 (CDS-138). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`apps/web` `/link/` now follows the CoDS Website Content outline: title and
description, a curated preview with the exact markup that renders it, Component
Status, Guidance (When to use with a variant table, Writing for links,
Accessibility for links), and Specifications (classes, adding icons, new-tab
and download links, disabled links, package files and limitations). The
preview shows Inline, Standalone, Inline small, Inline large, Standalone small,
Standalone with arrow, Prefix icon, External link in a new tab, and Disabled.
Every preview destination resolves on the site (`../getting-started/` and the
USWDS site); the Download and Phone states stay out of the preview because the
docs site does not serve `../icons/catalog.json` at that path and `tel:` is a
fictional number. The full fixture catalogue and public localization/RTL
guidance, including the `--cods-link-rtl-transform` property, were removed from
the page. All 18 fixture states remain in Storybook and in the tests below. The
page status makes no conformance claim: it states that axe passes for the
preview and that manual review is pending. The Figma link is the Link design
node recorded in [icon sources](link-icons.md).

The shared preview helper (`apps/web/src/lib/preview-markup.mjs`) now also
strips a `<div data-cods-fixture-state>` wrapper, which Link's fixture uses.
The change is identical to the one in the Card hardening branch (CODS-P4-014).

### Test audit

| Area                                              | Before | After |
| ------------------------------------------------- | ------ | ----- |
| Unit tests                                        | 0      | 0     |
| `web-link.spec.ts` (incl. shared `linkChecks`)    | 13 × 3 | 9 × 3 |
| `storybook-link.spec.ts`                          | 9      | 2     |
| `web-component-docs.spec.ts` (Link)               | 2 × 3  | 0     |
| `web-shared-fixtures.spec.ts` (Link)              | 1 × 3  | 1 × 3 |
| Playwright runs                                   | 57     | 32    |
| Spec lines (`web-link`, `link-checks`, Storybook) | 563    | 551   |

Decisions:

- **Kept on the web page, in all three browsers:** Figma typography and sizes,
  the external link's accessible name with its new-tab notice, suffix-icon gap,
  shared icon artwork, disabled decoration/no navigation/no focus and
  `GrayText`, inherited leading and wrapped hover-underline clearance, pointer
  hover/press states, keyboard order and the focus ring, resolved-direction
  arrow mirroring (`:dir()`, including `dir="auto"` and an LTR override), forced
  colors focus and icon color with axe, and deployment-prefix links.
- **Re-targeted, not moved:** the wrapped-underline and RTL checks now build
  their long and RTL links from preview links on the page, so they still run in
  Chromium, Firefox, and WebKit against the same CSS.
- **Moved to Storybook (Chromium only):** 320px reflow and axe for the Spanish,
  Arabic, long-content, phone, and download states, the phone and download icon
  artwork, and the download file bytes, suggested filename, and saved file.
  These states are not on the page. Native download completion previously ran
  in all three engines; it is browser behavior, and the CoDS-owned parts (a
  same-origin file that resolves to the icon index and the `download` filename)
  are still checked.
- **Consolidated:** the page-outline test replaces the legacy
  `web-component-docs.spec.ts` heading and 320px tests for Link; the shared
  `linkChecks` suite no longer runs twice (web and Storybook) on identical
  markup.
- **Removed as duplicates or browser behavior:** the Storybook copies of every
  web check; the no-JavaScript Enter test (Link ships no controller); the
  no-CSS test and the new-tab popup test (native `target="_blank"` behavior,
  and the notice is already proven to be text by the accessible name);
  fixture restatements (`href`, `target`, `rel`, `aria-hidden`,
  `aria-disabled`, `tabindex` attributes, the `tel:` value, Spanish and Arabic
  link text), which the docs output check and `web-shared-fixtures.spec.ts`
  guard against drift.

### Automated results

Base commit `9f759ee` (`origin/main`), Node 26.5.0 (the pinned 24.21.0 was not
installed locally; CI uses the pinned version), pnpm 12.4.2.

- `pnpm build`: passed, including the docs output check (curated preview and
  code match the fixture).
- `pnpm exec playwright test --config config/playwright.built-files.ts
--project=web --project=web-webkit --project=storybook
tests/browser/web-link.spec.ts tests/browser/storybook-link.spec.ts`: 20
  passed.
- The Link case in `web-shared-fixtures.spec.ts`: 2 passed (Chromium, WebKit).
- Firefox would not launch on this machine (browser process launch failure), so CI covers the Firefox runs.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on the PR preview and in Storybook.
Record browser, assistive technology, and versions for each result.

- [ ] Keyboard navigation: Tab/Shift+Tab order, Enter follows each destination,
      disabled links are skipped.
- [ ] Meaningful names and destinations, including the new-tab notice, phone,
      and download labels.
- [ ] Visited, hover, and focus states are distinguishable from each other and
      from the default state.
- [ ] Links are identifiable without color (inline underline; standalone
      context and hover underline).
- [ ] Decorative icons are not announced.
- [ ] New-window announcement for the external link with a screen reader.
- [ ] Disabled links: announcement and lack of activation.
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion (N/A: no animation), forced colors / Windows high contrast.
- [ ] Internal localization and long-text notes (Spanish, Arabic RTL, long
      label in Storybook).

## Automated checks

The fixture has 18 states and 22 link-role elements: 17 enabled destinations
and five disabled examples (inline default/Small/Large; standalone default/Small).
Validation uses Node 24.21.0 and pnpm 12.4.2: 149 unit tests, 44 Link browser
checks, 360 validated tokens and 60 contrast pairs.
Tests run in web Chromium, Firefox and WebKit, plus Storybook Chromium.
The shared fixture is used by the docs, stories and shipped examples.

Checks cover axe WCAG 2 A/AA, 2.1 AA and 2.2 AA; names and roles; pointer states;
keyboard order and focus; resolved RTL; inherited leading and hover underline
clearance; 320px reflow; forced colors; download file/filename; navigation without
JavaScript or CSS; and deployment-prefix preservation.

Built-file routing verifies the compiled component without starting a server,
but cannot complete native downloads in Chromium/WebKit. The normal preview
suite additionally checks saved bytes. Native download completion was verified
on the existing port-4321 preview in all three engines. The regular repository
browser gate runs in CI; no local server was started or restarted for this work.

## Keyboard and focus

- [x] All 17 enabled links follow DOM order; the five disabled examples between enabled states are skipped. Tab/Shift+Tab are used, or Option+Tab on macOS WebKit.
- [x] Focus can leave the component. Native Enter navigation works with JavaScript disabled; new-tab navigation preserves the original page.
- [x] Focus has a 2px radius, 2px white gap and 2px blue band. Forced-colors emulation preserves a visible system outline.
- [x] Disabled examples omit `href`, `tabindex` and activation handlers; clicks do not navigate and `focus()` cannot focus them.
- N/A — Managed focus: no controller or dynamic focus movement.

## Names and roles

Decorative icons are `aria-hidden="true"`. Names come from visible text except
for the visually hidden new-tab notice.

| State                               | Role           | Name                                           |
| ----------------------------------- | -------------- | ---------------------------------------------- |
| Default / visited                   | link           | Get started                                    |
| Standalone / Small / Large / prefix | link           | Read the guide                                 |
| More / hover / active / focus       | link           | Installation guide                             |
| External                            | link           | U.S. Web Design System (opens in a new tab)    |
| Phone                               | link           | Contact us; fictional `tel:+13035550123`       |
| Download                            | link           | Icon index (JSON)                              |
| Disabled, five variants             | link, disabled | Installation guide                             |
| Long content                        | link           | Complete guide description, without truncation |
| Spanish                             | link           | Guía de instalación                            |
| Arabic                              | link           | دليل التثبيت                                   |

- [x] Accessible names, roles and disabled semantics checked automatically; browser snapshots do not establish spoken announcements.

## Reflow, motion and forced colors

- [x] All fixture blocks fit 320px without clipping or horizontal overflow. Wrapped hover underlines clear the next line, and all sizes inherit content leading.
- [x] Forced-colors emulation preserves enabled link/visited colors, focus and inherited mask color. Disabled text uses `GrayText` and retains its per-variant decoration.
- N/A — Motion: no animation or transition.

WebKit emulates forced colors without `forced-color-adjust`; that property is
asserted only where supported. Disabled text is contrast-exempt; no axe rules
or enabled-state contrast checks are excluded.

## Localization and design

- [x] Long, Spanish and Arabic content wraps at 320px. Resolved RTL tests cover direct RTL, an LTR override and Arabic `dir="auto"`; only the navigation arrow mirrors.
- [x] Example labels shortened to Spanish “Guía de instalación” and Arabic “دليل التثبيت”, both meaning “Installation guide”. Wording checked by the AI assistant; no independent human language review is claimed.

Disabled Figma nodes `38:7910`, `38:7930`, `2630:16281`, `5307:9147` and
`5307:9172` were inspected on 2026-10-22. Inline retains 2px underlines (Small:
1px); standalone has none. Text uses the catalog's disabled role. Shared icon
sources and the intentional upload-to-download change are recorded in
[icon sources](link-icons.md). Technical approval is recorded by role and dated
review link in the token mapping; formal design/accessibility sign-off is open.

## Human checks still required

- [ ] Screen-reader/browser/OS pairings, versions and observed announcements, including disabled and new-tab links.
- [ ] Actual 400% zoom results with browser/OS versions and observations.
- [ ] Windows high-contrast results with browser/OS versions and observations.
- [ ] Visited-state visual review, translated service copy and owner sign-off.

Historical testing completion was confirmed on 2026-10-13 without the required
pairings or detailed observations. That predates the revised examples and does
not complete these checks. Link remains experimental pending acceptance and
CODS-P0-006 scope confirmation.
