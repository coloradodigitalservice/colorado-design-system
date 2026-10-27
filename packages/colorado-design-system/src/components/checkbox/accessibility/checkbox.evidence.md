# Accessibility Evidence: `cods-checkbox`

**Component maturity:** experimental

**Date:** 2026-10-27

**Related component metadata:** `checkbox.metadata.json`

## Keyboard

- [ ] Verify all enabled standard and card inputs in visual and DOM order, and that focus can leave each control.
- [x] Documented native interactions: Tab and Shift+Tab navigate; Space toggles the input and clears its mixed state. Clicking a label activates its input.

## Focus

- [ ] Verify visible focus for standard and card states with approved tokens.
- [ ] Verify focus remains on the input after activation. The consuming form owns focus on validation.

## Naming and roles

- [x] Each input has checkbox role and a visible associated label; grouped inputs use a fieldset and legend. Native properties convey checked, mixed, and disabled states; invalid inputs reference their error text.

  | Element                  | Role     | Name or description source                            |
  | ------------------------ | -------- | ----------------------------------------------------- |
  | Standard and card inputs | checkbox | Associated visible label                              |
  | Group                    | group    | Fieldset legend                                       |
  | Invalid input            | checkbox | Label; `aria-describedby` points to the visible error |

## Screen reader verification

- [ ] A human tester must record browser and screen-reader pairings and announcements for standard, grouped, card, mixed, disabled, and error states.

## Zoom and reflow

- [ ] Verify actual 400% browser zoom and 320px reflow with long and translated labels, including cards.

## Motion

- [x] N/A — no animation or transitions are added.

## Forced colors / high contrast

- [ ] Verify standard and card states and focus in Windows High Contrast. The forced-colors implementation exposes native inputs and hides decorative glyphs.

## Localization

- [ ] Verify long and translated labels wrap and remain usable, including Arabic RTL.

## Automated results

On 2026-10-27, the updated Checkbox suite passed locally in Chromium (8 tests), WebKit (8 tests), and Storybook Chromium (1 test), using built files. Firefox could not launch locally, so its 8 tests did not run.

The previous PR head passed GitHub CI: 192 web tests across Chromium, Firefox, and WebKit, and 95 Storybook Chromium tests. Those results predate these changes. The updated head needs CI verification in all browsers. Automated checks do not establish human screen-reader, zoom, or Windows High Contrast results.

## Open items

Tracked in CDS-56:

- Accessibility lead and human testers: screen-reader observations with named browser pairings, actual 400% zoom, and Windows High Contrast for standard and card states.
- Aten design lead and State design owner: visual acceptance, including disabled treatments and the proposed geometry tokens.
- Aten technical lead: implementation and contract review. State accessibility owner: eventual stable sign-off.
