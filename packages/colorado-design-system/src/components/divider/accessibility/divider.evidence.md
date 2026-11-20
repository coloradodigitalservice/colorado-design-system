# Accessibility Evidence: `cods-divider`

**Component maturity:** experimental

**Reviewer:** Automated and source review by Codex; human review pending

**Date:** 2026-10-29

**Updated:** 2026-11-03 (automated test results)

**Related component metadata:** `divider.metadata.json`

## CODS-P4-017 hardening — 2026-11-20

Developer first pass for Phase 4 (CDS-131). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

The Divider page now follows the component page outline: lead description,
Component preview (Section divider and Item divider, both canonical fixture
states), generated Component code, Component status, Guidance (When to use as a
variant table, Accessibility for dividers), and Specifications (Variants and
elements, Variable settings, Meaningful and decorative dividers, Limitations).
The guidance explains when a divider is a meaningful thematic break (plain
`<hr>`, exposed as a separator) and when it is decorative (`aria-hidden="true"`).
Variable settings list only `--cods-divider-color` and `--cods-divider-width`,
the two custom properties `divider.scss` declares. The old Summary block and
examples catalogue were removed; the page has no localization or RTL guidance.
The status states that axe passes and manual review is pending; it makes no
conformance claim.

`apps/web/src/lib/preview-markup.mjs` now also strips a `<div
data-cods-fixture-state>` demonstration wrapper (Divider's fixture uses one).
The change is byte-identical to the helper in the other open Phase 4 PRs.

### Test audit

| Area                                        | Before    | After     |
| ------------------------------------------- | --------- | --------- |
| Unit cases (Divider-specific)               | 0         | 0         |
| `web-divider.spec.ts` (tests × 3 browsers)  | 1 × 3 = 3 | 2 × 3 = 6 |
| `storybook-divider.spec.ts` (Chromium)      | 1         | 0         |
| `web-shared-fixtures.spec.ts` divider (× 3) | 1 × 3 = 3 | 1 × 3 = 3 |
| `storybook-shared-fixtures.spec.ts` divider | 2         | 2         |
| `web-component-docs.spec.ts` divider        | 0         | 0         |
| Total Playwright runs                       | 9         | 11        |

Decisions:

- **Kept:** the web semantics, token styling, and inset test, now scoped to the
  preview states. It also asserts that the Section divider is not hidden and
  that neither line is a tab stop (ticket focus: no accidental tab stops).
- **Added:** a page-outline test (headings, two preview states, status text and
  links, no localization or fixture catalogue, 320px reflow, axe). It replaces
  the old Summary-region link assertions.
- **Removed as duplicate:** `storybook-divider.spec.ts`. Its separator count,
  `aria-hidden`, and axe assertions ran on the same fixture markup that the web
  spec checks in all three engines. Per-state Storybook rendering stays covered
  by `storybook-shared-fixtures.spec.ts`.
- **Moved / consolidated:** none.

### Automated results

Base commit `9f759ee` (origin/main). Local Node was 26.5.0; `.nvmrc` pins
24.21.0, which is not installed on this machine, so CI is authoritative for the
pinned version.

- `pnpm build`: passed, including the docs output drift check.
- `web-divider.spec.ts` and the Divider entry of `web-shared-fixtures.spec.ts`:
  6/6 passed in Chromium and WebKit. Firefox could not launch locally
  (`browserType.launch: Failed to launch the browser process`, the known profile
  issue); CI covers Firefox.
- Remaining gates are recorded in the PR description.

### Manual matrix for Aten Accessibility/QA (pending)

Review both variants on the PR preview and in Storybook. Record browser,
assistive technology, and versions for each result.

- [ ] Meaningful separator semantics: the Section divider is announced as a
      separator in each screen reader and browser pairing.
- [ ] Decorative exclusion: the Item divider (`aria-hidden="true"`) is not
      announced.
- [ ] No accidental tab stops: Tab and Shift+Tab never land on either divider.
- [ ] Visibility in forced colors: both lines stay visible in Windows High
      Contrast / forced-colors mode.
- [ ] Responsive width: the Section divider spans the available width and the
      Item divider keeps its inset at 320px and 400% zoom.
- [ ] Contrast of the line against its surface; record whether non-text
      contrast (WCAG 1.4.11) applies and why.
- [ ] Reduced motion: N/A, no animation.
- [ ] Keyboard interaction and focus management: N/A, not interactive.
- [ ] Internal localization and long-text notes: N/A, no text; logical
      properties support either writing direction.

## Keyboard and focus

N/A — The divider is static and has no interactive or focusable elements. It does not manage focus or define keyboard interactions.

## Naming and roles

| Element                              | Role                             | Accessible name source |
| ------------------------------------ | -------------------------------- | ---------------------- |
| Meaningful `<hr>`                    | separator                        | None needed            |
| Decorative `<hr aria-hidden="true">` | Hidden from assistive technology | N/A                    |

## Automated checks

- On 2026-10-29, built-file browser tests passed for the documentation page in Chromium and WebKit, and for Storybook in Chromium. The checks cover separator exposure, line styling, item spacing, and axe. Firefox failed to launch because its browser could not find its profile folder.
- On 2026-11-03, the [hosted web job](https://github.com/coloradodigitalservice/colorado-design-system/actions/runs/41695657751/job/126125444172) passed the web suite, including Divider, in Chromium, Firefox, and WebKit for PR head `a463d26` (471 tests total). The overall Foundation run failed release readiness. The PR also reports a successful local Firefox run using a temporary-home workaround; the original local profile issue was not verified as repaired.

## Screen reader verification

- [ ] A human tester must verify meaningful and decorative dividers with named screen reader and browser pairings; no announcements have been observed yet.

## Zoom and reflow

- [ ] Human verification at 400% zoom and browser reflow remains open.

## Motion

N/A — The component has no animation.

## Forced colors / high contrast

- [ ] Human verification in operating-system forced colors remains open.

## Localization

N/A — The divider contains no text. Logical margins support either writing direction; surrounding content must be translated and reviewed separately.

## Open items

- Human screen-reader, zoom, forced-colors, design, and accessibility-owner review remain open under CDS-68.
