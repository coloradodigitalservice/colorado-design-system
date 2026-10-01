# Accessibility evidence: Accordion

- Component: `cods-accordion`, experimental (`0.0.x`).
- Work: CODS-P2-002; interactive vertical-slice selection: Accordion, confirmed by Eric on 2026-10-01.
- Automated implementation review: Codex, 2026-10-01. Manual accessibility lead acceptance and G2 approval are pending.
- Basis: pinned USWDS 3.14.0 markup and toggle/exclusivity behavior, wrapped with the CoDS per-root lifecycle, events, and focus safety. Upstream accessibility claims do not establish acceptance of this wrapper.

## Automated validation results

Full local repository gate passed on 2026-10-01: workspace checks, token drift,
formatting, lint, root type checking, 51 unit/DOM tests, package/app builds, and
50 browser tests across Chromium, Firefox, WebKit, and Storybook. The package
source was also type checked directly, and its built ES module was imported in
Node without browser globals. The host's nested command runner used Node
24.19.0 / pnpm 11.19.0; the prescribed Node 24.21.0 / pnpm 12.4.2 validation
must be confirmed by CI. No pinned-toolchain result is claimed here.

## Keyboard

Native buttons support Enter and Space, and Tab/Shift+Tab follow the page order. Disabled triggers skip the tab order. No custom arrow navigation, Escape behavior, or focus trap is added. Browser tests check keyboard toggling, link navigation, and focus retention; unit tests cover repeated initialization, independent/nested roots, dynamic insertion, and cleanup. Manual keyboard review remains open.

## Focus

Triggers use the approved focus width, offset, gap, and action-focus tokens. Programmatic collapse returns focus from inside a closing panel to its trigger. Opening another item does not move focus away from the activating trigger. DOM tests cover programmatic focus restoration; browser tests check visible keyboard outlines. Manual review of focus contrast and order remains open.

## Names, roles, and announcements

Each native button gets its name from heading text. `aria-controls` points to a unique panel ID and `aria-expanded` reports state. Panels remain ordinary content rather than adding a region role to every item. There is no live region: state should be conveyed by the native button's expanded state. Axe scans cover the built docs and Storybook stories. Actual announcement behavior needs screen-reader review.

## Screen reader

Pending: VoiceOver/Safari or the accessibility lead's required screen-reader/browser pairing. No screen-reader test or observation is claimed. Verify button names, heading navigation, expanded/collapsed announcements, hidden-content exclusion, and disabled-state announcements.

## Zoom and reflow

Automated checks use a 320px viewport, long headings/body text, and panel overflow assertions. Firefox desktop and narrow viewport screenshots were inspected during implementation. Actual 400% browser zoom, text-only zoom, and complete page reflow require manual review; viewport simulation is not a completed zoom check.

## Motion

The component adds no animation, transition, or automatic scrolling. Browser checks run with reduced motion. The focus ring and plus/minus state indicators do not depend on motion. Manual reduced-motion review remains open.

## Forced colors

Native system colors, borders, and outline retain state/focus indicators; the plus/minus icons use borders rather than background images. Browser checks emulate forced colors, verify keyboard outlines, and capture narrow screenshots. Actual Windows High Contrast review remains open; macOS emulation does not replace it.

## Localization

Fixture variants include Spanish (`lang="es"`), Arabic (`lang="ar"`, `dir="rtl"`), and long English content. Logical padding and icon positioning support RTL; content wraps without fixed height. Browser checks verify language/direction and overflow. Translation/content owner and bidirectional keyboard review remain open.

## Progressive enhancement and lifecycle

Server-rendered panels are visible with `aria-expanded="true"`; `data-cods-accordion-expanded` supplies the enhanced initial state. No-JavaScript browser tests verify all nine panels remain visible, and repeat after removing stylesheets. Buttons do not collapse content without JavaScript; reading the content remains available. Destroy removes listeners and restores authored attributes. Consumers must destroy/reinitialize before changing an existing root's item structure and must not also bind a USWDS auto-initializer.

## Visual evidence

Browser tests attach expanded-focus, collapsed-focus, narrow forced-colors, and unenhanced screenshots to the Playwright report. Firefox desktop/narrow rendering was inspected locally. These are review captures, not approved screenshot regression baselines. Review and establish baselines using the same browser and OS as the comparison runner before claiming completed visual regression coverage.

## Open items and G2 acceptance

- Manual keyboard/focus, screen-reader, actual 400% zoom, reduced-motion, Windows forced-colors, and localization review by the appropriate domain owners.
- Design/content review. The disabled fixture starts expanded so its explanatory text remains available with or without scripting.
- Approved visual regression baselines for the CI platform.
- Controller and fixture review by the technical lead; accessibility lead acceptance; G2 sign-off and ticket evidence attachment.

Keep maturity experimental. Implementation and automated results prepare G2 evidence; they do not constitute G2 approval.
