# Accessibility evidence: Accordion

- Component: `cods-accordion`, experimental (`0.0.x`).
- Work: CODS-P2-002; interactive vertical-slice selection: Accordion, confirmed by Eric on 2026-10-01.
- Automated implementation review: Codex, 2026-10-01. Manual accessibility lead acceptance and G2 approval are pending.
- Basis: pinned USWDS 3.14.0 markup and toggle/exclusivity behavior, wrapped with the CoDS per-root lifecycle, events, and focus safety. Upstream accessibility claims do not establish acceptance of this wrapper.

## CODS-P4-011 hardening — 2026-11-17

Developer first pass for Phase 4 (CDS-125). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`apps/web` `/accordion/` now follows the CoDS Website Content outline: title and
description, a curated preview (Bordered, Borderless, White) with the exact
markup that renders it, Component Status, Guidance (When to use with a variant
table, Writing, Accessibility), and Specifications (classes, attributes, the
multiple-open option, controller setup and API, variable settings,
limitations). The full fixture catalogue and public localization/RTL guidance
were removed from the page. The full fixture, including the Spanish, RTL, long
content, and disabled states, remains in Storybook and in the browser tests
below. The page status does not claim WCAG conformance; it states that axe
checks pass and manual review is in progress. `check-docs-output.mjs` now
verifies that each previewed state and the preview code block match the
canonical fixture exactly.

### Test audit

Counts are Playwright test runs from `config/playwright.accordion.ts` (web runs
in Chromium, Firefox, and WebKit; Storybook in Chromium), plus Accordion's
entries in `web-component-docs.spec.ts`.

| Area                                   | Before            | After            |
| -------------------------------------- | ----------------- | ---------------- |
| Unit (`accordion.test.ts`)             | 19 cases          | 19 cases         |
| `web-accordion.spec.ts`                | 11 tests × 3 = 33 | 5 tests × 3 = 15 |
| `storybook-accordion.spec.ts`          | 12                | 14               |
| `web-component-docs.spec.ts` Accordion | 2 tests × 3 = 6   | 0                |
| Total browser runs                     | 51                | 29               |

Decisions:

- **Moved to Storybook (full fixture):** keyboard/exclusive state/focus/events,
  multiple-open and disabled, and 320px reflow with reduced motion and forced
  colors. These test the component, not the page, and the curated docs preview
  no longer contains every state. All assertions were retained; the reflow check
  now covers every fixture root, including long-content, Spanish, and RTL.
- **Consolidated:** the Storybook interaction smoke test was a subset of the
  moved keyboard/events test and was replaced by it. Expanded and collapsed
  focus screenshots for visual review now attach to the Storybook focus-ring
  test. The 12px item separation check joined the Storybook geometry test. In
  unit tests, the missing-target and duplicate-target cases became one
  parameterized test, which now also checks warn-once and retry for duplicates.
- **Removed as duplicates:** the web copies of the focus-ring and forced-colors
  highlight tests (identical assertions remain in Storybook). Accordion's
  Summary/Anatomy and link/320px entries in `web-component-docs.spec.ts` were
  replaced by a page-outline test; links are also checked by the build.
- **Updated to the new page rule:** `web-shared-fixtures.spec.ts` checked
  that every fixture state's code appeared on the page, a Phase 3 rule that
  conflicts with the curated preview. On pages with a curated preview it now
  checks the status maturity line and that the preview code block exactly
  matches the previewed fixture states, using the same helper as the build
  check. Pages without a curated preview keep the original per-state check.
- **Kept on the web page:** page outline/status/axe at 320px, no-JS/no-CSS
  readability, delayed-enhancement focus (a past defect), and the two
  `setAccordionExpanded` focus-restoration regressions against the bundled
  module.
- **Kept unchanged:** the remaining unit tests (each covers a distinct
  lifecycle, focus, validation, or upstream-integration path), the Storybook
  state stories, token customization, Figma geometry, borderless, and chevron
  artwork tests.

### Automated results

On the CODS-P4-011 working tree, from base `528f54a`:

- `pnpm exec vitest run packages/colorado-design-system/src/components/accordion`:
  19 passed.
- `pnpm build`: passed, including the docs output check (28 pages).
- `pnpm exec playwright test --config config/playwright.accordion.ts`: 24
  passed in Chromium, WebKit, and Storybook. Firefox did not launch locally
  ("Could not find profile folder"), the same environment issue recorded on
  2026-10-16; CI runs Firefox.
- Preview-server run of `web-accordion`, `web-component-docs`,
  `web-package-assets`, `storybook-accordion`, and `storybook-package-assets`
  in Chromium, WebKit, and Storybook: 57 passed.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `astro check`:
  passed.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on the PR preview and in Storybook.
Record browser, assistive technology, and versions for each result.

- [ ] Enter/Space toggles; focus stays on the trigger; Tab/Shift+Tab order.
- [ ] Expanded/collapsed state announced; trigger name; heading level.
- [ ] Header/panel relationship (`aria-controls`) and panel content reachable.
- [ ] Focus never lands in hidden content; focus returns to the trigger when a
      panel containing focus closes.
- [ ] Single-open default and `data-cods-accordion-multiple` behavior.
- [ ] Disabled trigger skipped and not operable.
- [ ] No-JS and no-CSS readability; destroy/reinitialize lifecycle.
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion, Windows High Contrast / forced colors.
- [ ] Internal localization and long-text notes (Spanish, RTL, long heading).

## Phosphor integration — 2026-10-21

Updated from the shared CODS-P3-001 base containing #67. Decorative up/down masks
now reference shared Phosphor Regular `caret-up`/`caret-down`, retaining their
24px box, logical inset, `currentColor`, disabled GrayText, forced-color behavior,
and existing semantics. Local duplicate SVG exports were removed; their original
commit, hashes, and measured comparison remain in `icons.provenance.json`.

Comparison at 16px and 24px found visual parity in geometry, weight, alignment,
and spacing. Normalized bounds differ by less than 0.0007px at 24px due to export
precision; cubic/arc rasterization changes edge antialiasing, so pixel identity
is not claimed. The current Figma Accordion page was viewed in Chrome’s Aten
profile; recorded original exports remain the precise geometry evidence.

Fresh automated validation results are recorded below after verification.
Human screen-reader findings, actual zoom, operating-system high contrast, and
domain-owner sign-off are not established by this source migration.

## Figma alignment update — 2026-10-16

Eric authorized fixing chevrons, borders, focus, and the missing white variant.
The live file was inspected and icons exported in Chrome's **Aten** profile.
The Figma connector still lacks access, so these observations come from the
browser Inspect panels and original SVG downloads, not a connector response.

- Header/body: 16px padding, 18px/600/24px Open Sans summary, 16px/400/24px body;
  4px header radius and the existing dark text/secondary-surface roles.
- Icons: original 24×24 up/down SVGs, used as masks with `currentColor` so
  disabled, consumer color, and forced-color treatments remain available.
- Bordered panel: 4px sides/bottom, no top border, gray/10 (`#EBECED`). A new
  component-specific color role preserves the shared gray/20 semantic mapping.
- White: white surface, 1px gray/20 header and panel borders, shared lifecycle.
- Focus: 2px white spread and blue outer spread of 4px. A transparent 2px outline
  becomes system Highlight under forced colors; the global 4px focus-width token
  used elsewhere is unchanged. No expand/collapse transition is added.

Eric reported completing fresh human screen-reader, actual 400% zoom, and Windows
High Contrast checks on October 16, before this visual follow-up. Environments,
versions, individual announcements, and outcome details were not supplied. This
records reported completion without inventing observations or State sign-off.

Current verification: 133 unit tests pass, including 19 controller tests. Token
validation covers 355 tokens and 47 contrast pairs. The focused browser suite
passes 31 checks in Chromium/WebKit, including exact exported SVG paths, border
and inset geometry, white states, axe, focus, and forced colors. Firefox's ten
checks remain enabled but fail locally before running because its browser process
cannot find its temporary profile. Built desktop, white focus/collapsed, 320px,
and RTL examples were inspected using the pinned Playwright CLI without starting
a local server. CodeRabbit identified missing Sass token fallbacks; those were
added. Its follow-up review could not authenticate (provider identity error).

The sections below retain historical validation and review context.

## CODS-P3-007 production update — 2026-10-14

This update is stacked directly on CODS-P3-001. It retains experimental maturity
and the historical G2 evidence below; those results do not approve the updated
lifecycle or styles for G3.

**Open-panel decision:** preserve the shipped single-open default and USWDS's
legacy default. Every panel may be closed. `data-cods-accordion-multiple` opts
into independent open panels. Expanded, Mixed, and Collapsed stories demonstrate
the decisions explicitly. Native Tab, Shift+Tab, Enter, and Space are supported;
arrow-key roving navigation and nested accordions are out of scope. Nested roots
warn and remain unenhanced/readable.

**Implementation basis:** pinned USWDS 3.14.0 `on(root)` installs the delegated
click handler; `off(root)` removes it but leaves `aria-expanded` and `hidden`.
The CoDS wrapper snapshots/restores those attributes and its integration markers.
A MutationObserver derives CoDS change events from upstream changes; click and
public-method paths flush settled states synchronously. No events fire during
initialization or teardown. Initial exclusivity still chooses the last declared
open item for compatibility with the shipped CoDS API. Closing focused content
returns focus to its trigger before CoDS events fire.

**Design evidence:** the spacing, heading/body typography, and corner radii use
existing Git-authoritative tokens and the measured P3-001 inventory. Figma
context and screenshot calls both failed because the connected account lacks
file access. Exact icon/geometry/state alignment and the unresolved subtle-border
mapping require design review; no new token values were inferred.

Validation on macOS with Node 24.21.0, pnpm 12.4.2, Playwright 1.64.0:

- [x] All 131 unit tests pass, including 19 controller tests for lifecycle,
      focus restoration, exclusivity, independent roots, upstream change observation,
      unsupported nesting, malformed markup, idempotency, and exact restoration.
- [x] Workspace and fixture validation, token drift (352 tokens / 47 contrast
      pairs), formatting, lint, root TypeScript, Astro/Storybook validation,
      package/site/Storybook builds, generated fixture parity, and static consumer
      drift checks pass.
- [x] 28 browser checks pass: ten docs checks each in Chromium and WebKit,
      and eight Storybook checks in Chromium. They cover keyboard/pointer operation,
      focus, events, declared states, axe without exclusions, runtime token overrides,
      no CSS/JavaScript, 320px reflow, localization, reduced motion, and forced colors.
- [x] Built docs inspected with the pinned Playwright CLI in Chrome at
      1280px and 320px: default/multiple expansion, keyboard activation, long-content
      wrapping, and RTL indicators. Screenshots are local review captures, not
      approved visual regression baselines. CodeRabbit reviewed 13 implementation
      files and reported no findings.
- [ ] Firefox's ten checks could not launch: the local Playwright Firefox
      process exits with “Could not find profile folder.” They remain enabled for CI.
- [ ] Fresh human screen-reader announcements, actual 400% zoom, Windows high
      contrast, keyboard/localization review, and accessibility-owner acceptance.
- [ ] Full preview-backed `pnpm check` browser stage: local servers were not
      started under the user's server-management instruction. Compiled files were
      served to the browser by request interception instead.

Reproduce the focused browser suite after `pnpm build` with
`pnpm exec playwright test --config config/playwright.accordion.ts`. It starts
no local server and retains all three browser engines.

## Manual accessibility review

Eric Swanson reported on 2026-10-01 that he completed all accessibility testing
for this component and found no issues. This records his manual review result;
individual test observations, screen-reader/browser pairing, operating system,
and assistive-technology versions were not supplied. Domain-owner acceptance
and G2 sign-off remain separate review items.

## Automated validation results

Full local repository gate passed on 2026-10-01: workspace checks, token drift,
formatting, lint, root type checking, 54 unit/DOM tests, package/app builds, and
53 browser tests across Chromium, Firefox, WebKit, and Storybook. The package
source was also type checked directly, and its built ES module was imported in
Node without browser globals. The host's nested command runner used Node
24.19.0 / pnpm 11.19.0; the prescribed Node 24.21.0 / pnpm 12.4.2 validation
was confirmed by the successful Foundation CI run for focus-fix commit
`2c206b6adab4997a33e6ddfdf1db93983720ae1b`:
[Foundation run 36927681565](https://github.com/coloradodigitalservice/colorado-design-system/actions/runs/36927681565).

CODS-P2-005 rerun on 2026-10-06 (macOS 27.0.1, Node 24.21.0, pnpm 12.4.2,
Playwright 1.63.0 with Chromium 153.0, Firefox 155.0, WebKit 26.6, axe-core
4.13.0): `pnpm check` passed with 108 unit/DOM tests (16 for the Accordion
controller) and 159 browser tests across Chromium, Firefox, WebKit, and
Storybook. No test is skipped and no axe rule is disabled or excluded. The
consolidated results are in the
[vertical-slice audit](../../../../../../docs/audits/CODS-P2-005-vertical-slice-audit.md).

## Keyboard

Native buttons support Enter and Space, and Tab/Shift+Tab follow the page order. Disabled triggers skip the tab order. No custom arrow navigation, Escape behavior, or focus trap is added. Browser tests check keyboard toggling, link navigation, and focus retention; unit tests cover repeated initialization, independent/nested roots, dynamic insertion, and cleanup. Eric reports the manual accessibility checks passed; detailed observations are not recorded.

## Focus

Triggers use the approved focus width, offset, gap, and action-focus tokens. Initialization and programmatic collapse return focus from inside a closing panel to its trigger. Initialization preserves focus in content that stays open, including after single-open state resolution. DOM tests cover delayed initialization, initial exclusivity, and programmatic focus restoration; browser tests pause script loading while focusing unenhanced content and verify focus restoration after enhancement in Chromium, Firefox, and WebKit. Browser tests also check visible keyboard outlines. Eric reports the manual accessibility checks passed; detailed observations are not recorded.

## Names, roles, and announcements

Each native button gets its name from heading text. `aria-controls` points to a unique panel ID and `aria-expanded` reports state. Panels remain ordinary content rather than adding a region role to every item. There is no live region: state should be conveyed by the native button's expanded state. Axe scans cover the built docs and Storybook stories. Eric reports the manual accessibility checks passed; announcement observations are not recorded.

## Screen reader

Eric reports completed accessibility testing with no issues. The screen-reader/browser pairing and individual observations were not supplied; record those details for reproducible evidence. Accessibility lead acceptance remains pending.

## Zoom and reflow

Automated checks use a 320px viewport, long headings/body text, and panel overflow assertions. Firefox desktop and narrow viewport screenshots were inspected during implementation. Eric reports the manual accessibility checks passed. The actual zoom settings and individual reflow observations were not supplied; viewport simulation alone does not establish a completed zoom check.

## Motion

The component adds no animation or transition. The delegated USWDS click handler may call `scrollIntoView()` when opening a panel leaves its trigger outside the viewport, including after a sibling closes. This behavior also applies with reduced motion; the wrapper does not request smooth scrolling, but author CSS can affect scrolling behavior. Browser checks run with reduced motion. The historical plus/minus indicators and current chevrons do not depend on motion. Eric reports the manual accessibility checks passed; detailed motion observations are not recorded.

## Forced colors

Native system colors, borders, and outline retain state/focus indicators; the original icons used borders; the current chevrons use SVG masks with system colors and `forced-color-adjust: none`. Browser checks emulate forced colors, verify keyboard outlines, and capture narrow screenshots. Eric reports the manual accessibility checks passed; the operating system and high-contrast settings were not supplied. macOS emulation alone does not establish Windows High Contrast verification.

## Localization

Fixture variants include Spanish (`lang="es"`), Arabic (`lang="ar"`, `dir="rtl"`), and long English content. Logical padding and icon positioning support RTL; content wraps without fixed height. Browser checks verify language/direction and overflow. Eric reports the manual accessibility checks passed; translation/content owner acceptance and detailed bidirectional observations are not recorded.

## Progressive enhancement and lifecycle

Server-rendered panels are visible with `aria-expanded="true"`; `data-cods-accordion-expanded` supplies the enhanced initial state. No-JavaScript browser tests verify all nine panels remain visible, and repeat after removing stylesheets. Buttons do not collapse content without JavaScript; reading the content remains available. Destroy removes listeners and restores authored attributes. Consumers must destroy/reinitialize before changing an existing root's item structure and must not also bind a USWDS auto-initializer.

## Visual evidence

Browser tests attach expanded-focus, collapsed-focus, narrow forced-colors, and unenhanced screenshots to the Playwright report. Firefox desktop/narrow rendering was inspected locally. These are review captures, not approved screenshot regression baselines. Review and establish baselines using the same browser and OS as the comparison runner before claiming completed visual regression coverage.

## Open items and G2 acceptance

- Record manual test environments and individual observations supporting Eric’s reported successful accessibility review; obtain the required domain-owner acceptance.
- Design/content review. The disabled fixture starts expanded so its explanatory text remains available with or without scripting.
- Approved visual regression baselines for the CI platform.
- Controller and fixture review by the technical lead; accessibility lead acceptance; G2 sign-off and ticket evidence attachment.

Keep maturity experimental. Implementation and automated results prepare G2 evidence; they do not constitute G2 approval.

## Follow-up review — 2026-10-21

Figma page 1387:254, bordered item 1447:263, and the list instance positions
were inspected. The list places each successive header 12px after the previous
item, with no leading margin. The stylesheet now uses `space.sm` for that gap
and zero margin on the first heading. Existing 56px triggers, panel padding,
inside strokes, chevrons, focus geometry, and controller behavior are preserved.
148 unit tests and 44 browser checks passed across Chromium, Firefox, WebKit
and Storybook Chromium; a new regression asserts first/subsequent heading
spacing. Workspace, Astro/Storybook validation, token drift, format, lint, type
checks, builds, fixture output and static consumer checks passed. Browser tests
used built-file routing without servers. Human and design approval remain open.
