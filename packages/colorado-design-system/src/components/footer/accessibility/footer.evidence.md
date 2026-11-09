# Accessibility Evidence: `cods-footer`

**Component maturity at time of review:** experimental  
**Reviewer:** _Pending human accessibility review_  
**Date:** 2026-11-09
**Related component metadata:** `footer.metadata.json`

Every checklist item must be checked or explicitly marked "N/A — \<reason>" before the component can be marked `stable`. Leaving an item blank means the evidence is incomplete.

## Keyboard

- [ ] Every interactive element is reachable using only the keyboard, in a logical (visual/DOM-matching) order.
- [ ] No keyboard trap: focus can always move away from the component using standard keys.
- [ ] Documented keyboard interactions: Tab and Shift+Tab move through native
      links and narrow-screen disclosure buttons in DOM order; Enter follows links
      and Space/Enter toggles a disclosure.

## Focus

- [ ] Visible focus indication uses the approved focus tokens at every focusable state.
- [ ] USWDS disclosure buttons retain visible focus; focus remains on the
      button as panels open and close.

## Naming and roles

- [ ] Accessible name and role documented for each interactive element:

  | Element                            | Role   | Accessible name source               |
  | ---------------------------------- | ------ | ------------------------------------ |
  | Return-to-top and navigation links | link   | Visible link text                    |
  | Social profile links               | link   | `aria-label` on each link            |
  | Full narrow-screen group controls  | button | Group heading; USWDS ARIA attributes |

- [ ] Accessible name/role documented for each state variation: Full and
      Compact each expose a named contentinfo landmark and separately named
      navigation landmarks; Full's mobile controls expose `aria-expanded` and
      `aria-controls`.

## Screen reader verification

- [ ] Screen reader / browser pairing(s) tested: _e.g., VoiceOver + Safari, NVDA + Firefox_.
- [ ] Observed behavior notes: _describe what was announced and any discrepancies from the expected name/role/value_.

## Zoom and reflow

- [ ] Verified usable at 400% zoom / 320px-equivalent reflow without loss of content or function.

## Motion

- [x] Animation (if any) respects `prefers-reduced-motion`. N/A — the component has no animation.

## Forced colors / high contrast

- [ ] Component remains usable and distinguishable under a forced-colors mode.

## Localization

- [ ] String expansion, truncation, and wrapping behavior noted for long or translated content. Grid links wrap; verify with translated copy.
- [ ] Bidirectional text behavior noted, if the component's `localization` metadata is `layout-sensitive`. Logical layout uses CSS grid and flex; verify with localized copy.

## Open items

List any unresolved findings and their tracking issue. A component with open items here cannot be marked `stable`.

- Human screen-reader verification, actual 400% zoom, forced-colors review,
  and accessibility/design approval are still required. Automated checks and
  browser reflow tests do not replace these reviews.
- The CoDS change event (`cods-footer:change`) reports each group state change
  with `{ group, expanded }`; verify announcements and disclosure behavior
  with the approved screen-reader/browser pairing.

## Automated and browser verification

On 2026-11-09, the targeted Footer and documentation regression run passed all
60 tests using built-file routing: web coverage in Chromium, Firefox, and WebKit, plus the Storybook
Footer suite in Chromium. This covers both canonical variants, named
landmarks, mobile disclosures, axe checks, 320px reflow, touch-target heights,
and the documentation site's static Compact footer. The site footer also
passed keyboard-focus and return-to-top checks with JavaScript disabled.
An earlier server-backed run passed 57 tests before adapting the site footer
to the separate website mockup.
The final server-backed Footer, documentation, Hero, and Card regression run
passed 86 tests, including the updated narrow-container Hero check. The final
`pnpm check` passed all gates, including 220 unit tests and 1136 browser tests.

Interactive Chromium inspection of the built Footer page confirmed 320px
reflow and exposed an inherited USWDS navigation-width cap. The component now
allows navigation to fill its consumer's container; a regression test checks
the documentation site's aligned 1280px containers at a 1600px viewport.
The Full copyright/policies row now spans its entire grid.

These are automated or emulated observations, not screen-reader, actual zoom,
or operating-system high-contrast sign-off. The checklist remains incomplete
pending the human reviews above. The original component Figma file was
initially rate-limited. The separate website mockup at node `12453:2511` was
accessible and supplies the site's static Contact Us footer, 1280px container,
surface colors, and typography. Site links retain 48px touch targets rather
than the mockup's tighter rows; the development-release notice remains visible.

The mobile styling follow-up passed 66 targeted browser tests across Chromium,
Firefox, and WebKit (Storybook in Chromium). Checks at 320px, 375px, and 479px
verify that the first group starts at the primary section's top, adjacent
one-pixel borders overlap, the chevron has a 16px gap, and links align with
heading text in both regular and Contact Us panels. Legal links stack below
768px in Full, Compact, and the site footer; desktop styling is preserved.
Interactive Chromium inspection at 375px confirmed the expanded Contact Us
layout and vertically stacked legal links.
