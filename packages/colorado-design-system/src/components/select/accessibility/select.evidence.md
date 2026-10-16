# Accessibility Evidence: `cods-select`

**Component maturity at time of review:** experimental

**Reviewer:** Codex, automated checks and source inspection; human review pending

**Date:** 2026-10-16

**Related component metadata:** `select.metadata.json`

**Tracking:** CDS-58 / CODS-P3-010

## Keyboard

- [ ] Every interactive element is reachable using only the keyboard, in logical order. Chromium, Firefox, and WebKit tests verify label focus, type-ahead selection, and forward tab navigation past the disabled control. Full native-popup keyboard review remains a human check.
- [ ] No keyboard trap. Chromium, Firefox, and WebKit verify Escape preserves control focus and Tab leaves the control; Human native-popup review remains open.
- [ ] Documented keyboard interactions: Tab/Shift+Tab traverse controls; native arrow keys and type-ahead select options; platform open/close keys include Space, Enter, Alt+ArrowDown, and Escape. Type-ahead, Escape, and Tab were tested in Chromium, Firefox, and WebKit. Headless macOS popup arrow navigation did not reliably commit a changed option, so full popup operation needs a human platform review. There are no event handlers, controller, or ARIA popup replacements.

## Focus

- [ ] Visible focus indication uses approved focus tokens. Chromium, Firefox, and WebKit computed styles verify the solid 4px Colorado ring; forced-colors tests verify a solid outline. Human visual review remains open.
- [ ] Focus is placed predictably. Chromium, Firefox, and WebKit keep focus on the select after Escape, and native disabled behavior skips the control. No script moves focus; dynamically inserted errors and application validation focus policy are consumer responsibilities. Native popup review remains open.

## Naming and roles

- [x] Accessible name and role documented for each interactive element. Fixture-derived DOM checks and axe pass in Chromium, Firefox, and WebKit.

  | Element/state                                          | Role                                             | Accessible name source / description                                                         |
  | ------------------------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
  | Default, focus-visible, disabled, placeholder, success | Native single-choice combobox                    | Visible “County” label via `for`/`id`; associated hint via `aria-describedby`                |
  | Error                                                  | Native single-choice combobox, required, invalid | “County (required)” label; hint and “Error: Choose a county.” message via `aria-describedby` |
  | Long content                                           | Native single-choice combobox                    | Expanded visible county label and explanatory hint                                           |
  | Spanish                                                | Native single-choice combobox                    | Visible “Condado” label; Spanish hint; `lang="es"`                                           |
  | Arabic                                                 | Native single-choice combobox                    | Visible Arabic label and hint; `lang="ar"`, `dir="rtl"`                                      |
  | Options                                                | Native option                                    | Visible option text; browser exposes selected value                                          |

- [x] Naming across state variations: disabled remains named, placeholder retains the visible label, error has both description references, success uses an explicit success hint. Chromium, Firefox, and WebKit checks pass; Screen-reader announcements remain open.

## Screen reader verification

- [ ] Screen reader / browser pairing(s) tested: none by the agent. Human VoiceOver/Safari and/or NVDA/Firefox review required.
- [ ] Observed behavior notes: no screen-reader observations claimed. Verify name, selected value, required/invalid/disabled states, and hint/error/success descriptions in each state.

## Zoom and reflow

- [ ] Verified usable at 400% zoom / 320px-equivalent reflow. Chromium, Firefox, and WebKit pass 320px component overflow checks, including expanded labels and hints. Actual browser zoom remains open. Native selected text can truncate; verify long option readability in the platform popup.

## Motion

- N/A — no component animation or transition. Source inspection and reduced-motion browser runs cover the static component; platform popup motion is browser/OS owned.

## Forced colors / high contrast

- [ ] Chromium, Firefox, and WebKit emulation confirms the CSS restores the native arrow (`appearance: auto`, no background image), preserves a focus outline, and uses system colors. Visual review and real Windows high contrast remain open. Error and success wording conveys state independently of the colored border.

## Localization

- [ ] String expansion: long-content and Spanish fixtures wrap labels/hints without component overflow at 320px in Chromium, Firefox, and WebKit. Native selected text may truncate. Native popup readability and human translation review remain open.
- [ ] Bidirectional text: Arabic fixture inherits RTL and shifts the decorative arrow to the inline end. Chromium, Firefox, and WebKit computed checks pass; Human reading-order review remains open.

## Automated and design evidence

`tests/browser/web-select.spec.ts` covers label/hint/error associations, required validation, placeholder clearing, disabled form submission, native selection, keyboard type-ahead, focus, tab order, narrow reflow, RTL, forced colors, and operation without CSS/JavaScript. `storybook-select.spec.ts` checks fixture parity and axe; the discovered-story suite scans each state. Axe uses the shared WCAG 2.0/2.1/2.2 A/AA helper without rule exclusions.

Final validation: `pnpm check` passes, including 130 unit tests and all 236
Chromium, Firefox, WebKit, and Storybook browser tests. Workspace/fixture validation, app validation, token drift,
formatting, lint, typecheck, builds, generated examples, and static consumer
checks pass. The final Storybook all-states screenshot was visually inspected: the chevron,
focus ring, disabled surface, validation borders, and RTL placement render
correctly.

Interactive Playwright CLI inspection confirmed native roles/names and type-ahead in Chromium. Its only console error was the existing missing `/favicon.ico`; automated browser error checks remain enabled.

The Figma Select page and six visual variants were inspected through the Aten Chrome profile on 2026-10-16. `assets/icon-medium-chevron-down.svg` is the unmodified 24×24 export downloaded from the default variant's Assets panel. Package CSS consumes that exact asset at 24×24 and switches to the platform arrow in forced colors. Final design acceptance remains pending; no token values were changed.

The Firefox startup blocker was resolved with the shared browser fixture's
macOS-only, worker-scoped temporary app-data home (`CFFIXED_USER_HOME`). The
regular installed Firefox data remains untouched. Standard temporary home
folders are pre-created to avoid macOS delete-denying ACLs, and teardown removes
the isolated data after the browser closes. All Firefox tests and worker
cleanup pass. See [upstream issue #42768](https://github.com/microsoft/playwright/issues/42768).

CodeRabbit CLI review was attempted after a clean staged betterleaks scan. The
service remained in the reviewing phase for more than ten minutes without
findings or a completion result; it was stopped. No automated review approval
is claimed.

## Open items

- CDS-58: human screen-reader review with recorded browser/AT versions and observed announcements.
- CDS-58: native popup arrow/open/close review on supported OS/browser combinations; actual 400% zoom; Windows high contrast; long-option readability and translated-content review.
- CDS-58: design review and accessibility-owner sign-off. Experimental maturity is retained; this file does not grant stable or gate approval.
