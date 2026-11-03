# Accessibility Evidence: `cods-combo-box`

**Maturity:** experimental  
**Reviewer:** Codex, automated checks; human review pending  
**Date:** 2026-10-28  
**Tracking:** CODS-P3-029 / CDS-77

## Keyboard and focus

- [ ] Keyboard selection, filtering, Escape and pointer selection passed automated tests in Chromium, Firefox and WebKit. Tab order, focus visibility and no keyboard trap still need human review.
- [ ] Arrow Down highlights results while focus stays in the input; arrow keys navigate; Enter selects; Escape closes. Clear returns focus to the input. Verify this behavior with assistive technology.

## Names and roles

| Element                        | Role     | Name source                                           |
| ------------------------------ | -------- | ----------------------------------------------------- |
| Native select / enhanced input | combobox | Visible label associated with select ID               |
| Results                        | listbox  | USWDS associates the visible label                    |
| Clear button                   | button   | USWDS English accessible label                        |
| Result status                  | status   | USWDS result counts and CoDS selection/clear messages |

- [ ] Axe passed on the documented page in Chromium, Firefox and WebKit, including the open no-results state, and on the Storybook fixture in Chromium. Accessible-tree and state review remains open.

## Screen readers

- [ ] A human must record NVDA or JAWS and VoiceOver results, including filtering, no results, selection, clearing and focus changes. No announcement has been observed or claimed here.

## Reflow, motion, forced colors and localization

- [ ] Automated 320 CSS-pixel reflow passed in Chromium, Firefox and WebKit; actual 400% browser zoom remains open.
- [ ] Forced-colors focus outline and reduced-motion emulation passed in Chromium, Firefox and WebKit; human high-contrast review remains open.
- [ ] Long text, translations and right-to-left layout need review. USWDS generates English control and status strings; localization is an open issue.

## Open items

- USWDS flattens option groups. CoDS shows group headings and includes each group in the option accessible name; a human screen-reader and design reviewer must verify this treatment. Individually disabled options remain native selects because upstream allows selecting them.
- Required/error, form reset and visual comparison passed the targeted automated and screenshot checks in Chromium; reset and error behavior also passed in WebKit. Complete design and accessibility owner review.
- A human screen-reader tester and State accessibility owner must complete the manual evidence and acceptance. The component remains experimental.
