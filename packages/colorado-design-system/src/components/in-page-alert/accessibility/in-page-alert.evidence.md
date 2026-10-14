# Accessibility Evidence: `cods-in-page-alert`

**Component maturity at time of review:** experimental

**Reviewer:** Codex, automated/developer verification; human approval pending

**Date:** 2026-10-13

**Related component metadata:** `in-page-alert.metadata.json`

**Tracking ticket:** [CDS-52 / CODS-P3-005](https://atendesign.atlassian.net/browse/CDS-52)

## Keyboard

- [ ] Every interactive element is reachable using only the keyboard, in a logical order. Automated native-link navigation passed in Chromium 156 and WebKit 27.2; Firefox 157 could not launch. Human keyboard review remains open.
- [ ] No keyboard trap. Forward/backward navigation passed in Chromium and WebKit (Option-Tab on macOS WebKit); Firefox and human review remain open.
- Documented keyboard interactions: Tab/Shift-Tab move between links; Enter activates native links. The Storybook demonstration button uses Enter to update its existing live region. There is no dismiss control or component controller.

## Focus

- [ ] Visible focus indication uses approved focus tokens. Browser assertions passed for the 4px outline in Chromium and WebKit. Firefox and human obscuration review remain open.
- [ ] Focus is placed predictably on state changes. Dynamic Status and Dynamic Alert Storybook tests passed without moving focus away from the demonstration button in Chromium. Screen-reader and Firefox verification remain open; application form-level focus management is consumer-owned.

## Naming and roles

- [x] Accessible name and role documented for every interactive element:

  | Element                        | Role   | Accessible name source                                     |
  | ------------------------------ | ------ | ---------------------------------------------------------- |
  | Action link                    | link   | Visible service-specific link text; native href            |
  | Storybook demonstration button | button | “Show contextual message”; demo-only, not package behavior |

- [x] State roles documented: static default/info/success/warning/error notices have no live-region role. Optional headings use native heading semantics; body-only content retains explicit severity wording. Nonurgent dynamic updates use `role="status"`; urgent dynamic errors use `role="alert"`. Consumers mount an empty region before updating its content. CSS icons have no accessible name and supplement explicit text.

## Screen reader verification

- [ ] Screen reader / browser pairings: not run; human VoiceOver/Safari and NVDA/Firefox review required.
- [ ] Observed announcements: not recorded. Verify initial-render reading order and dynamic polite/assertive updates without duplicate speech or focus disruption. Automated DOM assertions cannot establish audible announcements.

## Zoom and reflow

- [ ] Actual 400% browser zoom and Firefox reflow remain open. Automated 320px-equivalent reflow passed in Chromium and WebKit for all 13 examples, with no component or page overflow. Developer desktop/320px screenshots were inspected via the Playwright CLI; wrapping and RTL placement were readable.

## Motion

- N/A — component introduces no animation, transition, timeout, or auto-dismiss. Reduced-motion emulation was enabled during the narrow-width browser tests.

## Forced colors / high contrast

- [ ] Forced-color emulation passed in Chromium and WebKit, including visible severity wording, boundaries, and mirrored RTL layout. Actual Windows high contrast and Firefox review remain open. System Canvas/CanvasText, LinkText, and Highlight colors are used; severity is independent of color.

## Localization

- [ ] Long-content, Spanish, and Arabic/RTL examples passed narrow-width overflow checks in Chromium and WebKit. Human translated-content review and Firefox verification remain open.
- [ ] RTL border and icon positions passed automated assertions (right-side 8px boundary, 16px icon inset) in Chromium and WebKit. Native language attributes are on translated content only. Human bidirectional review remains open.

## Automated verification

- Node 24.21.0, pnpm 12.4.2, Playwright 1.64.0, pinned USWDS 3.14.0.
- Workspace/fixture validation, Astro and Storybook validation, token drift, formatting, ESLint, Stylelint, TypeScript, 130 unit tests, all builds, packaged fixture checks, and static consumer output checks passed.
- 22 component browser checks passed: 4 built-docs tests in Chromium, 4 in WebKit, and 14 Chromium Storybook tests. Axe scans have no exclusions or disabled rules. Coverage includes all variants, distinct shipped SVG masks, source parity, isolated canonical stories, dynamic updates, keyboard focus, no-CSS/no-JavaScript semantics, 320px reflow, reduced-motion and forced-color emulation.
- Browser tests route built Astro/Storybook files without starting a local server. Run `pnpm exec playwright test --config config/playwright.in-page-alert.ts` after `pnpm build`.
- Firefox 157 downloaded successfully but exits before test execution with “Could not find profile folder,” including a retry using an alternate temporary directory. Its four tests remain unverified.
- The full server-backed `pnpm check` browser stage was not run because the user prohibits starting local servers. Component tests used request routing instead.
- CodeRabbit review was attempted but rate-limited. Local diff and rendered component review completed.

## Open items

All items are tracked by CDS-52; this component is not ready for stable maturity.

- Human screen-reader, actual 400% zoom, keyboard/obscuration, OS high contrast, and translated-content reviews; accessibility owner approval.
- Firefox execution and verification after its local launch failure is resolved.
- Exact Figma alignment and State design review. Both connected Figma accounts failed access/reauthentication. Existing repository measurements informed 8px indicator width, 24px icons, and heading/body typography; pinned USWDS supplies the icon assets.
- Success uses existing `bg-page-surface-green` and `state-success` tokens. Confirm that implementation mapping with the design owner.
- Optional dismissal is deferred; no dismissal or persistence is claimed.
