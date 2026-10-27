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

- [x] State roles documented: static default/info/success/warning/urgent notices have no live-region role. Optional headings use native heading semantics; body-only content retains explicit severity wording. Nonurgent dynamic updates use `role="status"`; urgent dynamic messages use `role="alert"`. Consumers mount an empty region before updating its content. CSS icons have no accessible name and supplement explicit text.

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
- Success aliases existing `bg-page-surface-green` and `state-success` tokens. Design and accessibility review remain open.
- Optional dismissal is deferred; the Storybook criterion for examples with and without a dismiss control is not applicable until dismissal is implemented. No dismissal or persistence is claimed.

## Follow-up review — 2026-10-21

This section supersedes the earlier Figma-access and Firefox limitations. Figma
frame 3583:10290 and urgent component 3583:10317 were inspected. Headed notices
now use 32px icons with a 12px inset and 12px text gap; compact notices use
24px icons and 8px vertical padding. Heading/body gap remains 8px. The urgent
exclamation-circle now uses shared `warning-circle` rather than `x-circle`.
Four optional icon-free examples and three additional compact examples cover
the Figma structure while retaining explicit severity text. Success remains a
ticket-required extension to Figma's info/warning/urgent set and needs review.
Metadata ownership now follows CDS-52's Aten engineer/technical lead roles.

145 unit tests and 29 component browser checks passed, including Chromium,
Firefox, WebKit, and Storybook Chromium. New checks assert headed/compact
padding and icon sizes and icon-free spacing. Builds, token drift, workspace
and Astro/Storybook validation, lint, type checks, fixture and static-consumer
checks passed. Formatting passed excluding the pre-existing unrelated AGENTS.md
change in this review worktree; that file was preserved and not committed.
No local servers were started. Human checks and design approval remain open.

## Review update — 2026-10-26

The CoDS variant is named Urgent and retains the USWDS error class. The shared USWDS error artwork now maps to Phosphor `warning-circle`; the comparison image was refreshed. Site Alert's shipped examples use `usa-site-alert--no-icon` and their icons remain hidden in Chromium and WebKit. Success uses supplemental aliases for the existing green surface and state colors. Text, links, and the accent pass the recorded contrast checks; design and accessibility owner review remains open.

The built-file suite passed 26 checks in Chromium, WebKit, and Storybook Chromium, including forced-color emulation. Firefox could not launch because it could not find its profile folder; its six checks remain open for this revision. Manual screen-reader, real 400% zoom, OS high contrast, localization, and visual design review remain open. Dismiss-control examples are not applicable until dismissal is implemented.
