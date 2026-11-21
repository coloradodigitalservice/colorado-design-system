# Accessibility Evidence: `cods-footer`

**Component maturity at time of review:** experimental  
**Reviewer:** _Pending human accessibility review_  
**Date:** 2026-11-09
**Related component metadata:** `footer.metadata.json`

Every checklist item must be checked or explicitly marked "N/A — \<reason>" before the component can be marked `stable`. Leaving an item blank means the evidence is incomplete.

## CODS-P4-018 hardening — 2026-11-20

Developer first pass for Phase 4 (CDS-132). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

The `/footer/` page now follows the CoDS Website Content outline: lead
description, Component preview (Full and Compact fixture states, rendered with
the built icon sprite), generated Component code, Component status, Guidance
(When to use with a Full/Compact variant table, Accessibility for footers), and
Specifications (classes and attributes, Full footer groups, Initializing the
controller, Variable settings, Limitations). The Anatomy, Use the package,
localization/RTL, known-limitations, and manual-checklist sections were
replaced or removed, as was the expandable examples catalogue; those states
stay in Storybook and the tests. The page no longer describes the docs site's
own footer. The status states that axe passes for both preview variants and
that manual review is pending; it makes no conformance claim. Every class,
attribute, function, and custom property was checked against `footer.scss`,
`footer.ts`, the fixture, and metadata.

Guidance text reuses the previously reviewed page copy; it has not been
re-confirmed against the Figma component page (open item). The fixture has no
separate identity/logo group (CDS-132 lists one); none was added.

The preview wraps each variant in the page's `<article>`, so the preview
footers are not exposed as contentinfo landmarks there (HTML-AAM). The page
now tells authors to place the footer outside `<main>`, `<article>`, and
`<section>`.

The shared `ComponentPreview` now accepts `spriteUrl` and strips a
`<div data-cods-fixture-state>` wrapper, copied verbatim from the Card PR
(CODS-P4-014); the docs output check and shared fixtures spec read the sprite
URL from the preview.

### Test audit

| Area                                                              | Before                    | After                      |
| ----------------------------------------------------------------- | ------------------------- | -------------------------- |
| Unit cases (`footer.test.ts`)                                     | 18                        | 16                         |
| `web-footer.spec.ts`                                              | 9 tests × 3 browsers = 27 | 13 tests × 3 browsers = 39 |
| Footer entries in `web-component-docs.spec.ts`                    | 3 tests × 3 browsers = 9  | 0                          |
| `storybook-footer.spec.ts` (Chromium)                             | 10                        | 1                          |
| Playwright runs, total                                            | 46                        | 40                         |
| Shared specs (`web-shared-fixtures`, `storybook-shared-fixtures`) | 3 + 2                     | 3 + 2 (unchanged)          |
| Lines of Footer spec code (unit + web + Storybook + docs entries) | 1018                      | 864                        |

Decisions:

- **Moved to the web spec (now Chromium, Firefox, and WebKit instead of
  Chromium only):** keyboard focus ring and Tab order (Option+Tab on macOS
  WebKit); surface overrides and forced-colors system colors; link weight,
  underline, color, and hover; named navigation landmarks and the axe
  `landmark-unique` rule; 320px reflow and 48px targets without JavaScript.
- **Consolidated:** the two Storybook link-styling tests into one; the site
  footer 320px test and the Storybook 320px test into one no-JS test that
  covers both preview variants and the site footer; the site footer check now
  loads one page instead of two pages that share the same layout.
- **Replaced:** the legacy `web-component-docs` Footer entries (required
  Summary/Anatomy headings, 320px links) and its "renders and enhances" test
  with a page-outline test (headings, two preview states, status wording,
  exclusions, landmark names, Full enhancement at 320px, axe). Internal links
  stay covered by the build's docs output check.
- **Removed as duplicates or tautologies:** the Storybook fixture-equivalence
  test (package fixture staleness is checked by `checkComponentAssets`, story
  content by `storybook-shared-fixtures`); the per-story fixture count test;
  the Storybook narrow-screen disclosure test (covered by the web blade,
  group-count, and outline tests); the site footer's Return to top click
  (covered by the no-JS keyboard test); the unit "initializes mobile
  disclosures" case (contained in the `it.each` group-count cases); the unit
  "visible without JavaScript" case, which only re-read static fixture markup
  (now proven in a browser without JavaScript).
- **Removed assertions:** social link count, Compact's lack of social links,
  and the absent identity block were fixture restatements.
- **Kept:** controller lifecycle, restoration, idempotency, and every invalid
  markup case; one and five groups in browsers; mobile blade geometry, the
  1280px container alignment, and the legal-link 640px breakpoint (past
  defects); site footer content, colors, and typography; the Storybook
  surface-token check.
- **Axe without JavaScript:** axe needs JavaScript, so the no-JS reflow test
  does not scan. The outline test scans the enhanced page at 320px and the
  site footer test scans the overview page.

### Automated results

Base commit `9f759ee` (`origin/main`), local Node 26.5.0 (nvm unavailable;
`.nvmrc` pins 24.21.0, which CI uses).

- `pnpm exec vitest run packages/colorado-design-system/src/components/footer`:
  16 passed. `pnpm test`: 368 of 369 passed; the one failure was the icon
  generation test's 5-second timeout under machine load, and it passed (8 of 8)
  when rerun alone.
- `pnpm exec playwright test --config config/playwright.built-files.ts` for
  `web-footer.spec.ts` (Chromium and WebKit) and `storybook-footer.spec.ts`:
  27 passed. The Footer cases in `web-shared-fixtures.spec.ts` (Chromium,
  WebKit) and `storybook-shared-fixtures.spec.ts` passed.
- Firefox could not launch locally (`browserType.launch: Failed to launch the
browser process`); CI covers the `web-firefox` project.
- `pnpm check:workspace`, `fixtures:validate`, `validate`, `tokens:check`,
  `format:check`, `lint`, `typecheck`, `build` (including the docs output
  drift check), `fixtures:check`, and `build-static-example --check` passed.

### Manual matrix for Aten Accessibility/QA (pending)

Review both variants on the PR preview (`/footer/`) and in Storybook
(`pnpm dev:storybook`, including the Without JavaScript story). Record
browser, assistive technology, and versions for each result.

- [ ] Footer and navigation landmarks: contentinfo is exposed when the footer
      is outside sectioning content; every navigation has a distinct name.
- [ ] Link purpose and order: link text describes each destination; reading
      and focus order match the visual order at desktop and narrow widths.
- [ ] Social icon names: each social link announces its network name; icons
      are not announced.
- [ ] Return to top: the link reaches the page's top target and focus or
      reading position moves there.
- [ ] Full disclosures below 480px: Enter/Space toggle, `aria-expanded` is
      announced, focus stays on the button, and one group opens at a time.
- [ ] Narrow-screen wrapping and touch targets: links wrap without truncation
      and keep 48px targets at 320px.
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion (no animation), forced colors.
- [ ] Internal localization and long-text notes with translated copy.

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
768px in Full, Compact, and the site footer at that time. Interactive Chromium
inspection at 375px confirmed the expanded Contact Us layout and vertically
stacked legal links.

On 2026-11-11, 18 Footer controller tests and 37 targeted built-page tests
passed. Web tests ran in Chromium, Firefox, and WebKit; Storybook tests ran in
Chromium. They cover one and five groups in browsers, additional group counts
and malformed markup in unit tests, disclosure events and restoration, named
landmarks, axe scans, the Figma-matched surfaces, scoped surface overrides,
default legal link color, and emulated forced colors. Legal links stack at
639px and return to rows at 640px in both variants and the site footer. The
shared desktop containers remain 1280px wide. Interactive Chromium inspection
confirmed the mobile Contact Us disclosure, the 639px/640px boundary, and the
aligned containers.

The original component Figma file remained rate-limited through the MCP
server. The provided website design file contains the same Full and Compact
component nodes; their design context and the original file's visible
properties confirm the primary, heel, and social-container colors. These
checks do not replace the human reviews listed above.
