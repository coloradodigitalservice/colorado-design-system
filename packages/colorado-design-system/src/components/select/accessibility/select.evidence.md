# Accessibility Evidence: `cods-select`

**Component maturity at time of review:** experimental

**Reviewer:** Codex, automated checks and source inspection; human review pending

**Date:** 2026-10-16

**Related component metadata:** `select.metadata.json`

**Tracking:** CDS-58 / CODS-P3-010

## Phosphor integration — 2026-10-21

Merged the updated CODS-P3-001 base containing #67. The native control now uses
shared Phosphor Regular `caret-down` artwork instead of its local Figma SVG.
The 24px background box, logical placement, padding, names, native popup, target
size, disabled treatment, and forced-colors native arrow remain unchanged.
A token-verified `#1b1b1b` generated variant preserves the original foreground:
standalone background SVGs cannot inherit the select’s currentColor, and native
select pseudo-element masks are unreliable across browsers.

Comparison at 16px/24px found matching weight, silhouette, optical alignment,
viewBox scaling, and control spacing. Normalized bounds differ below 0.0007px
at 24px due to export precision; cubic/arc rasterization changes edge antialiasing
on 8/14 pixels, respectively. Pixel identity is not claimed. Original commit,
asset hash, shared source hash, and comparison are in `icons.provenance.json`.
The current Figma page was revisited in Chrome’s Aten profile; recorded original
exports supply the precise geometry comparison.

Fresh automated results are recorded below after verification. Existing human
review and sign-off items remain open.

## Keyboard

- [ ] Every interactive element is reachable using only the keyboard, in logical order. Chromium, Firefox, and WebKit tests verify label focus, type-ahead selection, and forward tab navigation past the disabled control. Full native-popup keyboard review remains a human check.
- [ ] No keyboard trap. Chromium, Firefox, and WebKit verify Escape preserves control focus and Tab leaves the control; Human native-popup review remains open.
- [ ] Documented keyboard interactions: Tab/Shift+Tab traverse controls; native arrow keys and type-ahead select options; platform open/close keys include Space, Enter, Alt+ArrowDown, and Escape. Type-ahead, Escape, and Tab were tested in Chromium, Firefox, and WebKit. Headless macOS popup arrow navigation did not reliably commit a changed option, so full popup operation needs a human platform review. There are no event handlers, controller, or ARIA popup replacements.

## Focus

- [ ] Visible focus indication uses approved focus tokens. Chromium, Firefox, and WebKit computed styles verify the solid 4px Colorado ring; forced-colors tests verify a solid outline. Human visual review remains open.
- [ ] Focus is placed predictably. Chromium, Firefox, and WebKit keep focus on the select after Escape, and native disabled behavior skips the control. No script moves focus; dynamically inserted errors and application validation focus policy are consumer responsibilities. Native popup review remains open.

## Naming and roles

- [x] Accessible name and role documented for each interactive element. Fixture-derived DOM checks and axe pass in Chromium, Firefox, and WebKit.

  | Element/state                                          | Role                                             | Accessible name source / description                                                                     |
  | ------------------------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
  | Default, focus-visible, disabled, placeholder, success | Native single-choice combobox                    | Visible “County” label via `for`/`id`; associated hint via `aria-describedby`                            |
  | Error                                                  | Native single-choice combobox, required, invalid | “County” label, native `required`; hint and “Please select a county to continue.” via `aria-describedby` |
  | Long content                                           | Native single-choice combobox                    | Expanded visible county label and explanatory hint                                                       |
  | Spanish                                                | Native single-choice combobox                    | Visible “Condado” label; Spanish hint; `lang="es"`                                                       |
  | Arabic                                                 | Native single-choice combobox                    | Visible Arabic label and hint; `lang="ar"`, `dir="rtl"`                                                  |
  | Options                                                | Native option                                    | Visible option text; browser exposes selected value                                                      |

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

## Final validation

`pnpm check` passed on 2026-10-29 with Node 24.21.0: 194 unit tests and 723 browser tests across Chromium, Firefox, WebKit, and Storybook. The first run failed to launch Firefox; the passing run used the shell-level macOS Firefox setup documented on `main`. Workspace validation, token checks, formatting, lint, typecheck, and builds passed.

The Select design was inspected in the Aten Chrome profile on 2026-10-29. The error message is below the field, and the required indicator is a red asterisk. The control uses the shared Phosphor Regular `caret-down` asset; comparison details are recorded in `icons.provenance.json`. Human design acceptance remains open.

## Open items

- CDS-58: human screen-reader review with recorded browser/AT versions and observed announcements.
- CDS-58: native popup arrow/open/close review on supported OS/browser combinations; actual 400% zoom; Windows high contrast; long-option readability and translated-content review.
- CDS-58: design review and accessibility-owner sign-off. Experimental maturity is retained; this file does not grant stable or gate approval.
