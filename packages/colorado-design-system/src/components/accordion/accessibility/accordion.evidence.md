# Accessibility evidence: Accordion

- Component: `cods-accordion`, experimental (`0.0.x`).
- Work: CODS-P2-002; interactive vertical-slice selection: Accordion, confirmed by Eric on 2026-10-01.
- Automated implementation review: Codex, 2026-10-01. Manual accessibility lead acceptance and G2 approval are pending.
- Basis: pinned USWDS 3.14.0 markup and toggle/exclusivity behavior, wrapped with the CoDS per-root lifecycle, events, and focus safety. Upstream accessibility claims do not establish acceptance of this wrapper.

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

The component adds no animation, transition, or automatic scrolling. Browser checks run with reduced motion. The focus ring and plus/minus state indicators do not depend on motion. Eric reports the manual accessibility checks passed; detailed motion observations are not recorded.

## Forced colors

Native system colors, borders, and outline retain state/focus indicators; the plus/minus icons use borders rather than background images. Browser checks emulate forced colors, verify keyboard outlines, and capture narrow screenshots. Eric reports the manual accessibility checks passed; the operating system and high-contrast settings were not supplied. macOS emulation alone does not establish Windows High Contrast verification.

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
