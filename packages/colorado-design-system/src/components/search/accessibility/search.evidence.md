# Accessibility Evidence: `cods-search`

**Maturity:** experimental

**Review date:** 2026-11-05

**Metadata:** `search.metadata.json`

## CODS-P4-031 hardening — 2026-11-19

Developer first pass for Phase 4 (CDS-140). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

`/search/` now follows the CoDS Website Content outline: lead description,
Component preview and Component code (`ComponentPreview` with the default,
compact, and slim fixture states and the built icon sprite URL), Component
status, Guidance (When to use as a variant table, Accessibility for search), and
Specifications (variant classes, connecting your search endpoint, adding the
search icon). The status states that automated axe checks pass and manual
review is pending; it makes no conformance claim. The examples catalogue and
the public right-to-left note were removed; those states remain in Storybook
and the browser tests. No writing guidance was added because none was
available from Figma. Search's public markup, classes, and metadata are
unchanged (Header reuses the slim markup).

To render the sprite in the preview, `ComponentPreview`, `preview-markup.mjs`,
and the sprite handling in `scripts/check-docs-output.mjs` and
`web-shared-fixtures.spec.ts` were copied from CODS-P4-014 (Card).

### Test audit

Search has no unit tests (it has no controller).

| Area                                         | Before     | After      |
| -------------------------------------------- | ---------- | ---------- |
| `web-search.spec.ts`                         | 4 × 3 = 12 | 4 × 3 = 12 |
| `storybook-search.spec.ts`                   | 2          | 2          |
| `web-shared-fixtures.spec.ts` (search entry) | 1 × 3 = 3  | 1 × 3 = 3  |
| `web-component-docs.spec.ts` (search entry)  | 0          | 0          |

Decisions:

- **Consolidated:** the first web test now checks the page outline, status,
  absence of the examples catalogue and localization text, the built sprite
  URL, and full-page 320px overflow, alongside the existing names, form
  overflow, axe, and GET submission assertions. Axe now scans the whole page
  instead of the `article`.
- **Moved:** none. All engine-sensitive tests (focus, forced colors, RTL
  reflow) still run in Chromium, Firefox, and WebKit against the preview.
- **Removed as duplicates:** none. The Storybook spacing test checks the story
  layout CSS, which is different from the docs page layout checked on the web.
- **Kept:** keyboard focus and joined-control `z-index`; forced-colors focus
  and bounds; the RTL reflow regression for the former `usa-sr-only` label
  (past defect); Storybook axe and story spacing.

### Automated results

Base commit `ba92348`. Node 26.5.0 (Node 24.21.0 is not installed locally).

- `pnpm build`: passed, including the docs output drift check.
- `pnpm exec playwright test` for `web-search`, `storybook-search`,
  `web-shared-fixtures`, `web-icon`, and `storybook-icon` in `web`,
  `web-webkit`, and `storybook`: 68 passed. Firefox could not launch locally;
  CI covers `web-firefox`.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`,
  `pnpm check:workspace`, and `pnpm --filter @cods-internal/web validate`:
  passed.
- `pnpm test`: 326 passed; two `icons.test.mjs` cases timed out under load and
  passed (8/8) when rerun alone. They do not touch Search.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on the PR preview and in Storybook.
Record browser, assistive technology, and versions for each result.

- [ ] Search landmark names are distinct and announced for each form.
- [ ] Input and submit button names, including the slim icon-only button.
- [ ] Enter in the input and activating the button both submit the query.
- [ ] Focus order (input, then button) and visible focus on joined controls.
- [ ] Icon-only submit button target size in the slim variant.
- [ ] Narrow-width usability with a controlled demo.
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion (N/A, no animation), forced colors.
- [ ] Internal localization and long-text notes, including right-to-left.

## Keyboard and focus

- [ ] Verify Tab reaches the input and submit button in order, and focus can leave the form.
- [ ] Verify Enter submits a query and the approved focus indicators remain visible.
- There is no scripted focus management; submission uses the browser's form behavior.

## Naming and roles

| Element       | Role            | Accessible name source                        |
| ------------- | --------------- | --------------------------------------------- |
| Form          | search landmark | `aria-label`, distinct for each fixture       |
| Input         | searchbox       | Associated visible or visually hidden `label` |
| Submit button | button          | Text, or `aria-label` for the slim variant    |

- [ ] A human must confirm names and roles with a screen reader. Browser assertions checked names and axe in Chromium, Firefox, and WebKit on 2026-11-05.

## Screen reader verification

- [ ] A human reviewer must verify names, landmarks, and operation with a named screen reader and browser. No screen-reader results have been recorded.

## Reflow, motion, and forced colors

- [ ] Check actual 400% zoom. The documentation fixture passed an automated 320px overflow check in Chromium, Firefox, and WebKit on 2026-11-05.
- [ ] Human review of forced colors and focus visibility remains open. Automated tests checked a visible focus outline and control bounds in emulated forced colors and a narrow right-to-left example in Chromium, Firefox, and WebKit on 2026-11-05.
- Motion: N/A — the component adds no animation.

## Localization

- [ ] Check long translations and right-to-left text with a human reviewer. The layout uses logical properties, but its rendered appearance has not been reviewed by a person.
- Right-to-left reflow: the compact and slim labels originally used `usa-sr-only`, which positions hidden text at `left: -999em` and expanded the documentation page to roughly 16,288px under `dir="rtl"` at 320px. They now use `cods-search__label--hidden`, which clips the label in place. An automated full-document right-to-left test checks for horizontal overflow and the accessible names of both variants in Chromium, Firefox, and WebKit.

## Open items

Human design and accessibility review, screen-reader testing, and browser checks remain open. Track this work under CDS-76; do not mark stable until the accessibility owner completes review.
