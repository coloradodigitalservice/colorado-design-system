# Accessibility Evidence: `cods-icon-list`

**Maturity:** experimental  
**Date:** 2026-11-02  
**Reviewer:** automated implementation review

## CODS-P4-021 hardening — 2026-11-20

Developer first pass for Phase 4 (CDS-135). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

The `/icon-list/` page now follows the CoDS Website Content outline: lead
description, a Component preview of the **Default** and **With supporting
text** fixture states, the exact generated code for those states (with the
built sprite URL), Component status, then Guidance (When to use as bullets,
Accessibility for icon lists) and Specifications (Elements, Sizes and spacing,
Adding icons, Limitations). The status reports that automated axe checks pass
and that manual review is pending; it makes no conformance claim.

Removed from the public page: the Examples catalogue, the ComponentSummary
block, the canonical asset list, and right-to-left/translated-content
guidance. The `rtl` fixture state remains in Storybook and the tests. Guidance
reuses the previously reviewed page copy; it has not been confirmed against the
Figma page (open item). Icon List has no variants or component custom
properties, so the page has no variant table or variable settings.

The shared preview helper gained optional `spriteUrl` support and strips a
`<div data-cods-fixture-state>` wrapper, matching the change in the open Card
hardening PR (CODS-P4-014), so Icon List previews resolve the built sprite.

### Test audit

| Area                                         | Before | After |
| -------------------------------------------- | ------ | ----- |
| `web-icon-list.spec.ts` (× 3 browsers)       | 1 (3)  | 2 (6) |
| `storybook-icon-list.spec.ts` (Chromium)     | 0      | 1     |
| `web-shared-fixtures.spec.ts` Icon List case | 3      | 3     |
| `storybook-shared-fixtures.spec.ts` states   | 3      | 3     |
| `storybook.spec.ts` Icon List story smoke    | 4      | 4     |
| Unit tests                                   | 0      | 0     |
| Total Playwright runs                        | 13     | 17    |
| Lines of component spec code                 | 81     | 147   |

Lines after include the 52-line shared `icon-list-checks.ts` helper.

Decisions:

- **Split:** the single page test is now a page-outline test (headings,
  preview states, status wording, exclusions, list semantics, decorative icons
  absent from the accessibility tree, sprite loads, 320px reflow, axe) and a
  layout test (icon size, gap, first-line alignment, supporting text).
- **Moved:** right-to-left layout geometry moved to
  `storybook-icon-list.spec.ts` because the `rtl` state is no longer on the
  public page. It now runs in Chromium only.
- **Removed as fixture restatement:** raw `role="list"`, `aria-hidden`, and
  `focusable` attribute checks and the default item count. They are replaced
  by computed checks (list role and no `img` role in the accessibility tree),
  and the docs drift check already fails on markup drift.
- **Removed as same CSS rule:** the 1280px viewport; 768px covers the same
  `width >= 48rem` rule. 320px and 767px cover the narrow rule.
- **Removed as obsolete:** the legacy heading list (Examples, Summary, Anatomy
  and markup, and so on).
- **Added:** status wording, public-page exclusions, and a check that preview
  icons load from the built sprite.
- **Kept:** every geometry assertion (size, 12px gap, text offset, first-line
  alignment), supporting-paragraph spacing and type, 320px reflow, axe, and the
  shared fixture and story smoke checks. Icon List has no controller, so no
  no-JS test is needed.

### Automated results

Base commit `9f759ee` (`origin/main`). Local Node was 26.5.0 (nvm unavailable;
`.nvmrc` pins 24.21.0).

- `pnpm exec playwright test --config config/playwright.built-files.ts`
  with the Icon List web, Storybook, and shared cases: 17 passed in Chromium,
  Firefox, and WebKit. Firefox needed the `CFFIXED_USER_HOME` workaround from
  `tests/README.md`.
- `pnpm build` passed, including the docs output drift check for the curated
  preview.

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported states (default, long content, right-to-left) on the PR
preview and in Storybook. Record browser, assistive technology, and versions
for each result.

- [ ] Screen readers announce each list and its item count, in source order.
- [ ] Decorative icons are not announced.
- [ ] Content stays readable and meaningful when icons or the sprite are unavailable, and without CSS.
- [ ] Text contrast meets requirements.
- [ ] Long items wrap beside the icon; 400% zoom / 320px reflow, narrow screens.
- [ ] Links placed in item content keep visible focus and keyboard operation.
- [ ] Reduced motion (N/A, no animation) and forced colors.
- [ ] Internal localization: right-to-left mirroring and translated long text.

## Keyboard and focus

The component has no interactive controls or focus management. Links placed in list content retain their native keyboard behavior and focus styles; a human review remains open.

Automated browser checks passed in Chromium, Firefox, and WebKit on 2026-11-02. Firefox used the repository-documented temporary home workaround.

## Naming and roles

The fixture uses native unordered lists and list items. Icons have `aria-hidden="true"` and `focusable="false"`; the text conveys each item's meaning.

## Screen reader verification

- [ ] A human must verify list announcements and decorative icon exclusion with a named screen reader and browser.

Automated axe checks passed in all three browsers; these do not replace human review.

## Zoom and reflow

- [x] At a 320px viewport, the documentation page had no horizontal overflow in Chromium, Firefox, and WebKit.
- [ ] Human verification at 400% browser zoom remains open.

## Motion

N/A — no animation.

## Forced colors and localization

- [ ] Human forced-colors and translated-content review remains open.
- [ ] Verify right-to-left layout and long content in supported browsers.

## Open items

Screen reader, 400% zoom, forced colors, translated content, design and accessibility owner review remain open. Automated tests do not constitute acceptance.
