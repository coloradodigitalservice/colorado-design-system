# Accessibility Evidence: `cods-input`

**Maturity:** experimental  
**Review date:** 2026-11-02  
**Reviewer:** automated implementation review

## CODS-P4-022 hardening — 2026-11-19

Developer first pass for Phase 4 (CDS-136). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

The `/input/` page now follows the CoDS Website Content outline: lead
description, Component preview and Component code (`ComponentPreview`), Component
status (`ComponentStatus`), Guidance (When to use, Accessibility for Input), and
Specifications (Variant classes, Variable settings, Adding icons). The preview
shows 12 canonical fixture states: default (Medium), required, error, success,
email, number, small, disabled, read-only, large, decorative icons, and large
with icons, with the built sprite URL. The examples catalogue and public RTL and
localization guidance were removed; focus-visible, tel, long-content, RTL, and
hover states remain in Storybook and the tests. The status states that axe
passes for every preview state and that manual review is pending; it makes no
conformance claim. Guidance reuses the previously reviewed page copy; it has not
been confirmed against Figma.

### Test audit

| Area                                        | Before      | After       |
| ------------------------------------------- | ----------- | ----------- |
| Unit tests                                  | 0           | 0           |
| `web-input.spec.ts`                         | 11 × 3 = 33 | 11 × 3 = 33 |
| `storybook-input.spec.ts`                   | 1           | 1           |
| `web-shared-fixtures.spec.ts` (input)       | 1 × 3 = 3   | 1 × 3 = 3   |
| `storybook-shared-fixtures.spec.ts` (input) | 17          | 17          |
| `web-component-docs.spec.ts` (input)        | 0           | 0           |

Decisions:

- **Moved:** none. The preview includes every state the web spec exercises
  (including email, number, small, and large with icons), so all engine-sensitive
  tests still run in Chromium, Firefox, and WebKit.
- **Consolidated:** none.
- **Removed as duplicates:** none. The Storybook border-token test checks the
  public custom properties in the Storybook frame; the web border-token test
  additionally checks large-icon alignment, so neither contains the other.
- **Kept:** all tests. The page test now checks the new outline headings, the
  removed legacy headings, the evidence-backed status, and the 12 preview
  states. Keyboard order uses the Small field before Disabled (focus-visible is
  no longer on the page), and the hover color check uses the default field
  (the hover fixture has identical markup). Validation-border, hover-precedence,
  icon-color, icon-alignment, forced-colors, 320px reflow, and no-JS tests are
  past-defect or distinct-behavior guards and are unchanged.

The shared drift checks (`scripts/check-docs-output.mjs` and
`web-shared-fixtures.spec.ts`) now pass the preview's sprite URL to
`componentMarkup`, matching `ComponentPreview`, so previews with icons are
checked against the built sprite path.

### Automated results

Base commit `ba92348`. Ports 4321/6006 were busy, so browser specs ran with
`config/playwright.built-files.ts` against the built output.

- `pnpm build`: passed, including the docs output check.
- `web-input`, `storybook-input`: 23 passed (Chromium and WebKit web, Storybook);
  the 11 Firefox runs could not launch the browser locally, CI covers them.
- `web-shared-fixtures`, `web-component-docs`, `storybook-shared-fixtures`, with
  the above: 308 passed; Firefox could not launch locally.
- Desktop and 320px page check: no horizontal overflow; tables fit at 320px.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on the PR preview and in Storybook.
Record browser, assistive technology, and versions for each result.

- [ ] Label, hint, description, and error announcements with a screen reader.
- [ ] Native editing, keyboard selection, and native validation.
- [ ] Required and invalid states; disabled and read-only behavior.
- [ ] Error and success are conveyed without relying on color.
- [ ] Visible focus and focus order.
- [ ] Long label, hint, and message reflow.
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion (N/A: no animation), forced colors.
- [ ] Internal localization (RTL icon swap) and long-text notes.

## Keyboard and focus

- [ ] Verify keyboard navigation, text entry, visible focus, and focus contrast in supported browsers.
- Native inputs use standard browser editing and Tab navigation; disabled inputs are skipped and read-only inputs remain focusable.
- No script changes focus or handles keyboard events.

Automated browser tests on 2026-11-02 exercised text entry, read-only and disabled controls, and focus in Chromium, Firefox, and WebKit. A full keyboard-only pass remains open.

## Naming and roles

Each input has a visible associated label. Hints and feedback are linked through `aria-describedby`, and the error uses `aria-invalid="true"` with a visible corrective message. The native input type supplies its role.

Automated axe checks passed on the documentation page in Chromium, Firefox, and WebKit, and on each Input Storybook story in Chromium.

## Screen reader verification

- [ ] A human must verify labels, required state, hints, errors, and success feedback with a named screen reader and browser. Dynamic error announcements depend on the host application.

## Zoom and reflow

- [x] The built documentation page had no horizontal overflow at a 320px viewport in Chromium, Firefox, and WebKit (2026-11-02).
- [ ] Verify actual 400% browser zoom without clipping.

## Motion

N/A — no animation.

## Forced colors and localization

- [ ] Verify focus and control boundaries in forced colors with a human reviewer. Automated tests checked that a focused input retains an outline in emulated forced colors in Chromium, Firefox, and WebKit.
- [ ] Verify long and right-to-left translated content with design and accessibility reviewers. Automated checks verified that the prefix and suffix exchange sides in RTL.

## Open items

Screen reader, actual zoom, forced colors, localization, design, and accessibility-owner review remain open. Automated results do not constitute acceptance.
