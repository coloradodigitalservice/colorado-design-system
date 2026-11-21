# Accessibility Evidence: `cods-hero`

**Component maturity:** experimental

**Reviewer:** Codex (automated preparation)

**Date:** 2026-10-30

**Related metadata:** `hero.metadata.json`

## CODS-P4-020 hardening — 2026-11-21

Developer first pass for Phase 4 (CDS-134). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

The `/hero/` page now follows the CoDS Website Content outline: lead
description, a Component preview of four fixture states (Light image, Dark
image, Light banner, and Dark banner with breadcrumb and eyebrow), the exact
code for that preview, and a Component status block (experimental, automated
axe checks pass for every preview state, manual review pending, CoDS-authored
with no USWDS equivalent). Guidance covers When to use (Image and Banner
variant table, the optional parts, image selection), Writing for Heroes, and
Accessibility for Heroes (heading level, eyebrow, alt text, action, breadcrumb,
contrast and overlay responsibilities). Specifications cover every `cods-hero`
class verified against `hero.scss`, images, responsive behavior, and
limitations. Hero supports no custom properties, so there is no variable
settings table.

Removed: the six-example catalogue and its code blocks, the Anatomy, Choosing
a Hero, Public styling, and Known limitations headings (content kept within
the new sections), and public right-to-left/translation guidance. The
`without-cta` and `long-content` (Arabic, RTL) states remain in Storybook and
its tests. The full-width `/hero-preview/` page is unchanged and linked from
Responsive behavior. The status makes no conformance claim.

Shared docs helpers: `preview-markup.mjs` now strips a `<div
data-cods-fixture-state>` wrapper (the same change as the Card hardening PR),
and `ComponentPreview` accepts an `imageBase` so the fixture's root-relative
`/images/` URLs carry the deployment base path in both the preview and the
code. `check-docs-output.mjs` and `web-shared-fixtures.spec.ts` apply the same
rewrite. The GitHub Pages base-path build was verified locally.

### Test audit

| Area                                             | Before      | After       |
| ------------------------------------------------ | ----------- | ----------- |
| Unit tests                                       | 0           | 0           |
| `web-hero.spec.ts` (× 3 browsers)                | 8 (24 runs) | 7 (21 runs) |
| `storybook-hero.spec.ts` (Chromium)              | 1           | 1           |
| Spec lines (web / Storybook)                     | 250 / 35    | 253 / 26    |
| Shared: `web-shared-fixtures` (× 3)              | 1 (3 runs)  | 1 (3 runs)  |
| Shared: `web-shell-focus` `/hero-preview/` (× 3) | 2 (6 runs)  | 2 (6 runs)  |
| Shared: `web-component-docs`                     | not listed  | not listed  |

Decisions:

- **Consolidated:** "Hero examples expose accessible content and reflow on
  mobile" and "Hero documentation explains anatomy, variants, and limitations"
  into one page-outline test: page headings, preview states and order, image
  accessible name and load, 320px reflow of every preview Hero, status wording,
  exclusions, and axe.
- **Removed as fixture restatement:** the Hero count of six, the raw `alt`
  attribute (replaced by the computed accessible name), at most one action per
  Hero, and no action in `without-cta`. The docs output check and
  `web-shared-fixtures.spec.ts` fail on any drift between the page and the
  fixture.
- **Removed as a dead step:** `focus()` then `toBeFocused()` on the dark action,
  which only tests the browser. Keyboard focus to the action is still covered
  by the Storybook Tab test.
- **Removed as duplicates (kept the web copy, three browsers):** Storybook's
  image visibility and `naturalWidth`, image-above-content at 320px, and
  image-beside-content at 1440px. Web covers them in the outline, breakpoint,
  and full-width preview tests.
- **Kept:** breakpoint typography, breadcrumb, and image placement at
  767/768/1279/1280px; desktop grid alignment and growth; dark and light
  action colors and hover; the wide-screen documentation-column and narrow
  Hero in a wide viewport regressions (past layout defects, including the
  145px image and one-item breadcrumb); the full-width preview; and
  Storybook's every-state reflow, axe, 323px desktop height, and Tab order,
  which are the only checks of `without-cta` and `long-content`.
- Selectors moved from `[data-cods-fixture-state]` to
  `[data-cods-docs-preview-state]` because the preview strips the fixture
  wrapper. No assertion, tolerance, or axe rule was loosened.

### Automated results

Base commit `9f759ee`. Node 26.5.0 locally (nvm is not installed; CI uses the
pinned `.nvmrc` version).

- `pnpm build`: passed, including `check-docs-output.mjs` (36 pages).
- `PUBLIC_BASE_PATH=/colorado-design-system pnpm exec turbo run build --filter=@cods-internal/web...`: passed.
- `playwright test --config config/playwright.built-files.ts --project=web --project=web-webkit --project=storybook` for `web-hero`, `storybook-hero`, `web-shared-fixtures`, and `web-shell-focus`: 86 passed, 1 skipped.
- Firefox could not launch locally (`browserType.launch` failed); CI covers `web-firefox`.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on the PR preview, the full-width
`/hero-preview/` page, and in Storybook (`pnpm dev:storybook`). Record browser,
assistive technology, and versions for each result.

- [ ] Heading hierarchy: one title per Hero at the level the page needs; the eyebrow is not a heading.
- [ ] Meaningful and decorative imagery: informative alt text is announced; `alt=""` images are skipped.
- [ ] Text contrast over every supported background (light and dark surfaces), including the breadcrumb, eyebrow, intro, and action.
- [ ] Call to action: accessible name, visible focus on both surfaces, keyboard operation, and target size.
- [ ] Breadcrumb: landmark name, current page, and the "Previous level:" name below 768px.
- [ ] Image cropping and focal point at 375, 768, 1280, and wider.
- [ ] Long-content reflow, including `long-content` and `without-cta`.
- [ ] Screen-reader announcements in each preview state.
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion (N/A: no animation), forced colors.
- [ ] Internal localization and long-text notes, including the Arabic right-to-left state.

## Keyboard and focus

- [ ] Verify keyboard order, visible focus, and that focus can leave the actions in Chromium, Firefox, and WebKit. Actions are ordinary links; Tab moves between them and Enter follows a link.
- [ ] Verify focus indicators against both surface colors. The Hero does not move focus.

## Naming and roles

- [ ] Verify heading level and action names in each example with assistive technology. Action names come from link text; the image alternative comes from its `alt` attribute.

## Screen reader verification

- [ ] A person must test and record the screen reader and browser pairings and observed announcements.

## Zoom, motion, and forced colors

- [ ] Verify actual 400% zoom and 320px reflow without loss of content or actions in all three browsers.
- N/A — Hero adds no animation.
- [ ] Verify forced colors in all three browsers and an operating system high-contrast mode.

## Localization

- [ ] Verify long and translated content and the Arabic right-to-left example in all three browsers and with representative readers.

## Open items

- Human design and accessibility review, including image cropping, contrast, touch targets, keyboard, zoom, forced colors, and screen-reader checks.
- On 2026-11-02, built documentation Hero tests passed in Chromium, Firefox, and WebKit, including axe, narrow reflow, breadcrumb visibility, responsive image placement, button colors, and desktop alignment. The built Storybook Hero test passed in Chromium. These automated results do not complete the human reviews above.
