# Accessibility Evidence: `cods-combo-box`

**Maturity:** experimental  
**Reviewer:** Codex, automated checks; human review pending  
**Date:** 2026-10-28  
**Tracking:** CODS-P3-029 / CDS-77

## Keyboard and focus

- [ ] Keyboard selection, filtering, Escape and pointer selection passed automated tests in Chromium and WebKit; Firefox could not launch. Tab order, focus visibility and no keyboard trap still need full browser review.
- [ ] Arrow Down enters results; arrow keys navigate; Enter selects; Escape closes. Clear returns focus to the input. Verify this behavior with assistive technology.

## Names and roles

| Element                        | Role     | Name source                             |
| ------------------------------ | -------- | --------------------------------------- |
| Native select / enhanced input | combobox | Visible label associated with select ID |
| Results                        | listbox  | USWDS associates the visible label      |
| Clear button                   | button   | USWDS English accessible label          |
| Result status                  | status   | USWDS live-region text                  |

- [ ] Axe passed on the documented page in Chromium and WebKit, and the Storybook fixture in Chromium. Firefox did not launch. Accessible-tree and state review remains open.

## Screen readers

- [ ] A human must record NVDA or JAWS and VoiceOver results, including filtering, no results, selection, clearing and focus changes. No announcement has been observed or claimed here.

## Reflow, motion, forced colors and localization

- [ ] 400% zoom and 320px reflow need review in Chromium, Firefox and WebKit.
- [ ] Reduced motion and forced colors need review in all three browsers.
- [ ] Long text, translations and right-to-left layout need review. USWDS generates English control and status strings; localization is an open issue.

## Open items

- Firefox Playwright build 1555 failed to launch: “Could not find profile folder.” Rerun all browser checks with a working Firefox installation.
- Figma shows grouped options. USWDS 3.14.0 flattens groups and permits disabled options to be selected. The current controller leaves these selects unenhanced; the group design and an accessible implementation require follow-up.
- Complete visual alignment, required/error and form reset checks, and design and accessibility owner review.
- A human screen-reader tester and State accessibility owner must complete the manual evidence and acceptance. The component remains experimental.
