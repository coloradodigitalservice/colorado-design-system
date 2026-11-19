# Accessibility Evidence: `cods-card`

**Component maturity:** experimental

**Reviewer:** Codex (automated preparation)

**Date:** 2026-10-29

## CODS-P4-014 hardening — 2026-11-18

Developer first pass for Phase 4 ([CDS-128](https://atendesign.atlassian.net/browse/CDS-128)).
Manual QA, State domain acceptance, and client sign-off are pending. This
section records only the content and test-audit work and its automated results.

### Documentation pages

Card has two pages that match the Figma frames: `/card-default/` (Default Card)
and `/card-icon/` (Icon Card). Both follow the component page outline. The old
combined `/card/` guide was merged into them and removed. Its usage, non-use,
link-pattern, destination-type, image, icon, heading, and layout guidance now
sits in each page's Guidance and Specifications. The two pages link to each
other. Both use the shared Card metadata and evidence file. The package still
publishes `fixtures/card.html`, `fixtures/card-default.html`, and
`fixtures/card-icon.html`.

The Default Card preview shows seven canonical fixture states, generated from
the fixture with the built sprite URL: Default, With media, Flag, Media only,
Links inside a card, External destination, and Card group. The Icon Card
preview shows Icon and External destination. Long content, RTL, and icon long
content stay in Storybook and the tests. Each status says that axe checks the
preview and that manual review is pending. Neither makes a conformance claim.
The guidance reuses the reviewed Phase 3 copy. Design should confirm it against
the Default Card and Icon Card Figma frames, including whether Figma supplies
writing guidance.

The shared preview helper now also strips fixture wrappers that are a `<div>`
with `data-cods-fixture-state`. Card's fixture uses that wrapper instead of a
`<section>`. The docs output check and shared fixture test read each
component's page slugs from `apps/web/src/lib/docs-pages.mjs`, so they check
both Card pages.

### Test audit

| Area                                                 | Before | After |
| ---------------------------------------------------- | -----: | ----: |
| Card web spec (three engines)                        |     18 |    30 |
| Card Storybook spec (Chromium)                       |      2 |     2 |
| Shared fixture check, Card pages (three engines)     |      3 |     6 |
| Docs smoke and axe, Card pages (three engines)       |     18 |    12 |
| Storybook shared fixtures and story smoke (Chromium) |     25 |    25 |
| Total                                                |     66 |    75 |

Decisions:

- **Moved:** every web assertion from the removed `/card/` page now runs
  against the `/card-default/` or `/card-icon/` preview in three engines.
  Long-content and RTL states were also on the old combined page; they now get
  axe only through their Storybook stories, in Chromium.
- **Consolidated:** the per-page smoke and axe runs for the removed `/card/`
  page (6 runs) are gone.
- **Split:** the "separate card guides" test was split into Default hover and
  Icon hover tests. Its Figma-link checks moved into the page-outline tests.
- **Added:** a page-outline test for each page (headings, preview states, code,
  status links, Figma links, omitted localization content, and axe), a test
  that the two pages link to each other, and the icon-external accessible name
  on `/card-icon/`. The shared fixture check now covers both pages.
- **Kept:** keyboard order between internal links, no nested interactive
  elements, media order, grid reflow at 320px, the hover-movement regressions
  for with-media and icon cards, resting and hover border width and color, flag
  stacking, the flag narrow-container regression, and no whole-card hover on
  unlinked containers. These guard distinct behavior and past Phase 3 review
  defects.
- The icon hover test now scrolls the card into view before measuring, so the
  hover cannot scroll the card between readings. The position assertions are
  unchanged.

### Automated results

Base: `ba92348`, with the Button branch's shared sprite-preview support
(CODS-P4-013) applied identically. Local Node 26.5.0; the pinned Node 24 was
unavailable.

- `pnpm build` passed, including the generated docs and preview drift check
  for both Card pages.
- `pnpm check:workspace`, `pnpm fixtures:validate`, `pnpm format:check`,
  `pnpm lint`, `pnpm typecheck`, and `pnpm --filter @cods-internal/web validate`
  passed.
- `pnpm test` passed all 326 tests.
- The built-files Playwright run (`config/playwright.built-files.ts`) of the
  Card cases in `web-card`, `storybook-card`, `web-shared-fixtures`, `web`,
  `storybook-shared-fixtures`, and `storybook` passed 69 cases in Chromium,
  WebKit, and Storybook. Firefox could not launch locally; CI covers it.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on both PR preview pages and in Storybook.
Record browser, assistive technology, and versions for each result.

- [ ] Link and focus order for whole-card links and for cards with links
      inside, with a visible focus outline.
- [ ] No nested interactive elements inside whole-card links.
- [ ] Heading hierarchy in context. The examples use `h3`.
- [ ] Meaningful and decorative media and icons, including the media-only
      card's `aria-label` and the external indicator's hidden text.
- [ ] Image-free layout: cards without media, and icon cards.
- [ ] Grid reflow, flag stacking, contrast, 400% zoom and 320px reflow, and
      narrow screens.
- [ ] Reduced motion (no animation) and forced colors.
- [ ] Internal localization and long-text notes: the long-content, icon
      long-content, and RTL fixtures.

## Keyboard and focus

- [ ] Verify Tab order, visible focus, and leaving each card in Chromium, Firefox, and WebKit. On 2026-10-29, a built-fixture check at 320px found the first link reachable by Tab with a visible outline in Chromium. WebKit uses Alt+Tab for link navigation in this environment; the documentation test verified focus moves between the two internal links with Alt+Tab. Firefox could not launch. Links use native Tab and Enter behavior; the component does not move focus.

## Naming and roles

- [ ] Verify link names and heading order in context. Whole-card links derive their accessible name from their content; internal links use their own text. Decorative icons are hidden from assistive technology. Image alternatives depend on the content and destination.

## Screen reader verification

- [ ] A human reviewer must test and record screen-reader/browser pairings and observed announcements.

## Zoom, motion, forced colors, and localization

- [ ] Verify actual 400% zoom and 320px reflow in all supported browsers. On 2026-10-29, the built fixture had no document-level horizontal overflow at a 320px viewport in Chromium and WebKit; this is not a full zoom review.
- [ ] Verify forced colors and visible focus in all supported browsers.
- [ ] Verify long, translated, and right-to-left content in all supported browsers. The fixture includes long and Arabic examples.
- N/A — the component has no animation; reduced motion does not change its behavior.

## Open items

- On 2026-10-29, axe found no violations in the built fixture in Chromium and WebKit; the image request was blocked for this isolated check. Firefox could not launch. The built Storybook Card test and documentation Card test passed in Chromium; the documentation test also passed in WebKit. Full browser suites and Firefox remain open.
- Keyboard, focus, actual zoom, forced-colors, localization, and human screen-reader review remain open.
- Design and accessibility owners must review the component before stable maturity.

## Review update: 2026-11-02

The built documentation Card tests passed in Chromium, Firefox, and WebKit. They exercised the separate variant pages, named media-only link, external-link labels, hover borders, responsive flag layout, grid reflow, and an axe scan of the combined page. The built Storybook Card tests passed in Chromium. These automated checks do not complete the human keyboard, zoom, screen-reader, design, or accessibility reviews above. The light resting and hover borders are decorative; the visible focus outline remains separate.

## Review update: 2026-11-03

Built documentation tests passed in Chromium, Firefox, and WebKit for the narrow-container flag layout, full image area, linked and unlinked hover treatments, and Icon Card border and text spacing. These automated checks do not complete human design, keyboard, screen-reader, zoom, or accessibility review.
