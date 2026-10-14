# Accessibility Evidence: `cods-link`

**Component maturity at time of review:** experimental

**Reviewer:** Codex, automated implementation review; human testing completion confirmed by the user; owner sign-off pending

**Date:** 2026-10-13

**Related component metadata:** `link.metadata.json`

## Method and automated results

Built the package, Astro site, and Storybook with pinned Node 24.21.0 and pnpm
12.4.2. Source fixtures and generated package examples pass structural and drift
validation. The Link browser specs and shared-fixture parity tests were run in
Chromium, Firefox, and WebKit against the built files using temporary Playwright
request interception. No local server was started: port 6006 belongs to another
project, and the user manages servers. This verifies rendered browser behavior
but does not certify preview-server routing or replace the normal `pnpm check`
gate. The temporary adapter and config are outside the repository.

WCAG 2 A/AA, 2.1 AA, and 2.2 AA axe scans passed for all Link variants in the
built docs (three browsers) and Storybook (Chromium). Accessible names, native
navigation without JavaScript, new-tab navigation, CSS-disabled behavior,
link token colors, underline, keyboard order, and 320px wrapping are covered by
`tests/browser/web-link.spec.ts`, `storybook-link.spec.ts`, and `link-checks.ts`.
Firefox used the `CFFIXED_USER_HOME` workaround documented in `tests/README.md`.
Interactive Playwright CLI inspection in Chromium reviewed the docs accessibility
snapshot and a 320px screenshot. No screen-reader observations are claimed.

The alignment rerun passed 70 browser checks (including all three web engines
and Storybook) and 117 unit tests. Token validation passes with 257 tokens and
31 contrast pairs. The original 46 semantic mappings remain unchanged: six
supplemental Link color aliases and four decoration dimensions were added with
Figma provenance. The visited color reuses the existing alias shared with PR #38.
The actual default, hover, active, type sizes, line heights,
underline thickness/offset, focus geometry, and mask dimensions are asserted.
Figma SVG resources for external, globe, and arrow icons are stored locally,
unmodified; their roots and rendered slots are 16 × 16. Source node IDs and export
method are in `assets/README.md`.

PR #38 compatibility was checked against commit `1047d0711138f9b3a9626138a1ad4c0ccb08768c`.
All 26 existing Link token dependencies match its generated values; the four
underline dimensions are additive. The 70 browser checks also passed with
PR #38 token CSS applied to the built docs and Storybook. The shared visited
alias replaces the redundant inline-visited alias. PR #38 remains a draft;
shared token files and generated output require reconciliation when integrating
the branches.

WebKit reports forced-colors emulation but does not implement
`forced-color-adjust`. Tests verify visible system-color focus and icons painted
in the inherited system link color in all three engines, and require
`forced-color-adjust: none` where the browser supports it. Actual Windows
high-contrast testing completion was confirmed by the user on 2026-10-13.

## Keyboard

- [x] Every interactive element is reachable using only the keyboard, in a logical (visual/DOM-matching) order. All 15 fixture links were traversed in Chromium, Firefox, and WebKit on 2026-10-13. WebKit on macOS uses Option+Tab.
- [x] No keyboard trap: focus can always move away from the component using standard keys. Forward traversal leaves the final fixture link; reverse traversal returns to the preceding link.
- [x] Documented keyboard interactions: Tab / Shift+Tab move forward / backward; Enter follows the native destination with JavaScript disabled. New-tab links preserve the original page. Option+Tab / Option+Shift+Tab traverse links in macOS WebKit.

## Focus

- [x] Visible focus indication uses the approved focus tokens at every focusable state. Browser tests verify the 2px-radius shape, 2px white spread, and 4px total blue spread on every fixture link in all three browsers. This creates the Figma 2px blue band; the transparent 2px outline becomes a visible system outline in forced colors. The docs shell excludes CoDS Link from its generic focus rule so it cannot override this treatment.
- N/A — Focus placement on open, close, add, remove, and validation state changes: no controller, dynamic state, or managed focus. Native navigation controls focus.

## Naming and roles

- [x] Accessible name and role documented for each interactive element. Snapshot, native markup, and external-link accessible-name assertion and hidden decorative-mask checks reviewed on 2026-10-13.

  | Element / fixture state                        | Role | Accessible name source                                                                |
  | ---------------------------------------------- | ---- | ------------------------------------------------------------------------------------- |
  | Default                                        | link | Visible “get started with CoDS” text                                                  |
  | Standalone                                     | link | Visible “Read the installation guide” text                                            |
  | More link                                      | link | Visible “Read more about installing CoDS”; arrow mask excluded                        |
  | External                                       | link | Visible destination name plus hidden “(opens in a new tab)”; decorative mask excluded |
  | Hover / active / visited / focus-visible       | link | Each fixture's visible installation-guide text; no state changes its name             |
  | Long content                                   | link | Full visible guide description; no truncation                                         |
  | Small inline / large inline / small standalone | link | Full visible installation-guide text; typography does not change the name             |
  | Prefix icon                                    | link | Visible installation-guide text; decorative globe mask excluded                       |
  | Spanish / RTL                                  | link | Visible translated text with `lang`; decorative arrow mask excluded                   |

- [x] Accessible name/role documented for each state variation. Every state remains a native link, with no expanded, pressed, disabled, or live-region state.

## Screen reader verification

- [x] Screen reader / browser pairing(s) tested: completion confirmed by the user on 2026-10-13. Pairing and version details were not supplied in this chat.
- [x] Observed behavior review completed: completion confirmed by the user on 2026-10-13. Detailed human observations were not supplied in this chat; this confirmation is separate from the automated browser accessibility snapshots.

## Zoom and reflow

- [x] Verified usable at 320px-equivalent reflow without loss of content or function. All fixture blocks fit their containers in Chromium, Firefox, and WebKit with long, Spanish, and Arabic text. Chromium screenshot visually inspected. Actual 400% browser zoom testing completion was confirmed by the user on 2026-10-13.

## Motion

- N/A — The Link component contains no animation, transition, or JavaScript; reduced-motion emulation was included in browser checks.

## Forced colors / high contrast

- [x] Automated forced-colors checks passed in Chromium, Firefox, and WebKit: axe, wrapping, visible system-color focus outline, and icons painted in the inherited link color. Source retains underlines and uses system link colors.
- [x] Human visual high-contrast verification of focus and icons, including actual Windows high contrast: completion confirmed by the user on 2026-10-13.

## Localization

- [x] String expansion, truncation, and wrapping behavior noted for long or translated content. Long descriptive text and Spanish examples wrap without clipping at 320px in all three browsers. No fixed widths or truncation; authors must translate new-tab notices and link text together.
- [x] Bidirectional text behavior noted. Arabic fixture has `lang="ar" dir="rtl"`; logical icon spacing and mirrored standalone arrow are verified in all three browsers. Regression cases cover an LTR link inside RTL content, Arabic dir="auto" inside LTR content, direct RTL, and external/prefix icons that must not mirror. Storybook preserves native :dir() instead of lowering it to inaccurate ancestor/lang selectors. Human translation/content review remains required.

## Open items

Tracked under CDS-51 / CODS-P3-004:

- Record human screen-reader pairing, versions, and detailed observations alongside the user-confirmed testing completion.
- Content review of link purpose in isolation, translations, and approved design.
- Visited-state visual review after navigation: browsers conceal history-dependent styles from scripts. Inline visited color now uses the Figma plum alias (#491839); browser privacy still requires visual review of actual visited presentation.
- Run the regular preview-based `pnpm check` gate when the user makes ports 4321/6006 available and authorizes preview servers. This session's browser verification used intercepted built files.
- Reconcile priority scope with CODS-P0-006 and obtain accessibility-owner sign-off before stable maturity. This component remains experimental.
