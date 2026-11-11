# Accessibility Evidence: `cods-modal`

**Maturity:** experimental  
**Reviewer:** Claude, automated checks; human review pending  
**Date:** 2026-11-10  
**Tracking:** CODS-P3-033 / CDS-81

## Keyboard and focus

- [ ] Focus moves into the dialog on open, stays inside it across repeated `Tab` presses, and returns to the trigger on close. Verified by automated tests in Chromium, Firefox and WebKit. A human must confirm tab order and that nothing is reachable behind the dialog.
- [ ] `Escape` closes the dismissible variant and is ignored by the forced-action variant. Verified by automated tests; confirm with assistive technology.
- [ ] The focus trap is USWDS's own (`uswds-core` focus-trap), not a CoDS reimplementation. It works by wrapping at the ends: from the last tab stop `Tab` returns to the first, and `Shift+Tab` from the first goes to the last. Both directions are asserted in Chromium, Firefox and WebKit.
- [ ] WebKit omits buttons from sequential focus navigation unless macOS full keyboard access is enabled, so in Safari a `Tab` sweep of this dialog reaches no button at all. That is browser and OS policy, not component behavior, and it is why the trap is tested by driving its wrap logic rather than by tabbing through the page. A human must confirm real-world tabbing on macOS with and without full keyboard access.

## Names and roles

| Element           | Role   | Name source                                            |
| ----------------- | ------ | ------------------------------------------------------ |
| Dialog wrapper    | dialog | `aria-labelledby` pointing at the dialog heading       |
| Dialog descripton | —      | `aria-describedby` pointing at the description element |
| Trigger           | button | Visible button text                                    |
| Close button      | button | `aria-label` ("Close this window")                     |
| Dialog actions    | button | Visible button text                                    |

- [ ] USWDS moves `id`, `aria-labelledby` and `aria-describedby` from the authored dialog onto the wrapper it builds, and sets `role="dialog"` and `aria-modal="true"` while open. Confirmed by automated tests; accessible-name review remains open.
- [ ] Axe passed on the documentation page with a modal open in Chromium, Firefox and WebKit, and on the Storybook fixture in Chromium.

## Screen readers

- [ ] A human must record NVDA or JAWS and VoiceOver results: dialog announcement on open, the description, the forced-action variant offering no dismiss path, and focus return on close. No announcement has been observed or claimed here.

## Reflow, motion, forced colors and localization

- [ ] Automated 320 CSS-pixel reflow passed with the large variant open in Chromium, Firefox and WebKit; actual 400% browser zoom remains open.
- [ ] The dialog reads as a surface only through its elevation shadow, which forced colors drops, so it takes an explicit `CanvasText` border under `forced-colors: active`; the close icon is pinned to `ButtonText`. Asserted in Chromium, Firefox and WebKit; human high-contrast review remains open.
- [ ] USWDS applies no open/close animation, so there is nothing for `prefers-reduced-motion` to suppress. Confirm if CoDS adds motion later.
- [ ] Long text, translations and right-to-left layout need review. The close button's `aria-label` is authored content and must be translated by consumers.

## Open items

- **Checked against Figma Modal (Desktop) in dev mode** (node `4722-7229`): 480px wide, `--cods-radius-lg` (8px), `surface/modal` background, `elevation-mid` shadow (`0 8px 16px rgba(0,0,0,0.12)`), 24px padding, a filled primary action beside an outline secondary action, and a 24px `x-mark` icon in `icon/action/link/secondary`. The component token inventory's Modal entry did not list the elevation, shadow or secondary-icon tokens; it has been updated from what the design actually specifies, and a design owner should confirm that edit.
- **Overlay color is a known gap.** Figma defines no Colorado overlay or scrim token, so the page overlay keeps USWDS's default rather than a guessed value. A design owner must supply the token, after which the overlay moves into the component partial. Recorded here rather than hard-coded, per the themed-USWDS workflow.
- **Triggers are buttons, not anchors.** USWDS's own example markup uses `<a href="#id">`, which its behavior converts to `role="button"` and binds a `preventDefault` listener that its teardown never removes. CoDS authors the trigger as a `<button>`, which the same behavior supports. This is a markup choice within USWDS's supported options, not a behavioral divergence, so `componentType` stays `A`; a design and accessibility reviewer should confirm.
- **The dialog is relocated on init.** USWDS appends the dialog to `document.body` so the rest of the page can be hidden from assistive technology. Consumers styling or querying ancestors of the authored dialog need to know this; it is documented on the public page.
- **Nested and stacked modals are out of scope** for `1.0.x` and are untested. The controller enhances one dialog per root.
- Without JavaScript the dialog content stays inline and the trigger is inert, so `progressiveEnhancement` is `partial`. A content reviewer must confirm each documented example still reads correctly in place.
- A human screen-reader tester and State accessibility owner must complete the manual evidence and acceptance. The component remains experimental.
