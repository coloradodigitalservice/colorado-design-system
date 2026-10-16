# Accessibility Evidence: `cods-breadcrumbs`

**Component maturity at time of review:** experimental  
**Reviewer:** Codex, automated checks and Chromium browser inspection; human review pending  
**Date:** 2026-10-16  
**Related component metadata:** `breadcrumbs.metadata.json`

## Keyboard

- [x] Ancestor links follow DOM order with Tab/Shift+Tab; the current item is not focusable. Automated Chromium, Firefox and WebKit coverage in `web-breadcrumbs.spec.ts`.
- [x] Focus leaves the trail with the next Tab; no controller or keyboard interception exists. Same three-browser test.
- [x] Documented interactions: Tab/Shift+Tab move among links; Enter follows the focused link. macOS WebKit uses Option+Tab. The test verifies actual navigation to an intercepted ancestor destination.

## Focus

- [x] Keyboard focus has a solid outline using `--cods-focus-ring-width`, `--cods-color-bg-action-focus`, `--cods-focus-ring-offset` and `--cods-color-focus-gap`. Automated checks cover Chromium, Firefox and WebKit; Chromium was also inspected interactively at 320px.
- N/A — no opening, closing, insertion, removal, validation, or automatic focus movement; this is static navigation.

## Naming and roles

- [x] Names and roles are defined by native markup, checked in all three browsers; page and isolated-story axe scans supplement the structural assertions.

  | Element                         | Role              | Accessible name source                                                                       |
  | ------------------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
  | `nav`                           | navigation        | Consumer-authored, localized `aria-label`; repeated documentation trails have distinct names |
  | `ol` / `li`                     | list / listitem   | Ancestor labels in document order                                                            |
  | Ancestor `a[href]`              | link              | Visible text span                                                                            |
  | Final `li[aria-current="page"]` | current list item | Visible non-linked page text                                                                 |
  | Separator `::after`             | decorative        | Empty generated content with a CSS mask; no text or ARIA name                                |

- [x] Default, long-content, single-level, Spanish, RTL and focus-visible examples use the same naming model. The single-level example has one current item, no link and no separator.

## Screen reader verification

- [ ] A human must test VoiceOver/Safari and/or NVDA/Firefox and record browser/AT versions.
- [ ] Verify list/landmark discovery, current-page announcement, link order, separator exclusion and localized pronunciation. No observed screen-reader announcements are claimed here.

## Zoom and reflow

- [x] At a 320 CSS px viewport, every ancestor and current label remains visible and within the viewport, including a long unbroken label and Arabic content. Automated Chromium, Firefox and WebKit tests check overflow. Chromium's long-content rendering was inspected via the pinned Playwright CLI against the test-owned static preview.
- [ ] Actual browser zoom at 400% remains a human check; viewport emulation is not evidence of browser UI zoom.

## Motion

- N/A — no animation, transition or JavaScript behavior. Reduced-motion emulation is included in the three-browser forced-colors test; computed animation is `none`.

## Forced colors / high contrast

- [x] Browser forced-colors emulation retains a solid focus outline and a nontransparent masked separator, using system Highlight/CanvasText and link colors. Automated Chromium, Firefox and WebKit coverage; Chromium additionally inspected with the CLI.
- [ ] Real Windows high-contrast inspection remains open, including focus and separator legibility.

## Localization

- [x] Long strings wrap without clipping or ellipsis; Spanish and Arabic examples use `lang`. The all-state fixture is shared with Storybook and Astro, and all three browser engines check reflow.
- [x] Arabic uses `dir="rtl"`; the list follows logical order and the directional separator mirrors. Automated three-browser coverage verifies the transform and overflow. Consumer text, URLs and navigation names require localization.
- [ ] Content reviewers must verify the translated labels and reading order with assistive technology.

## Automated coverage and design reference

- `web-breadcrumbs.spec.ts`: native semantics, non-linked current item, single-level trail, canonical copyable markup, axe, keyboard order/activation, focus tokens, narrow layout, RTL, forced colors, no motion, and CSS/JavaScript disabled.
- `storybook-breadcrumbs.spec.ts`: narrow long-trail visibility and axe. The generic Storybook suite scans every story; shared-fixture tests compare every state with canonical content.
- `web-component-docs.spec.ts`: required documentation, links and narrow-page layout.
- The base token catalog's October 8 Figma evidence records regular Open Sans 16px/16px text, 4px spacing and 12px vertical padding. This implementation reuses USWDS's shipped separator, not an exported Figma CaretRight asset. Design review must confirm shape, focus and all-level wrapping treatment; Figma mobile parent-only and dark variants are outside this implementation.
- Live Figma connector access was denied (the second connection needs reauthentication), and Chrome disables JavaScript from Apple Events. No live visual parity or Figma asset extraction is claimed.

## Open items

Tracked with CDS-66 / CODS-P3-018:

- Human screen-reader, actual 400% zoom, Windows high contrast, and translated-content reviews above.
- Aten design lead/State design owner: approve the wrapping trail, USWDS separator and token-based focus treatment against the current Figma design. G2 token/design approval remains a dependency.
- Accessibility lead and State accessibility owner: review this evidence before stable maturity. The component remains experimental; no human or gate approval is implied by automated passing checks.
