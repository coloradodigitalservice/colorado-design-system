# Accessibility Evidence: `cods-<component-name>`

**Component maturity at time of review:** experimental | stable | deprecated  
**Reviewer:** _name, role_  
**Date:** _YYYY-MM-DD_  
**Related component metadata:** `<component-name>.metadata.json`

Copy this template into `accessibility/<component-name>.evidence.md` for the component being reviewed. Every checklist item must be checked or explicitly marked "N/A — \<reason>" before the component can be marked `stable`. Leaving an item blank means the evidence is incomplete.

## Keyboard

- [ ] Every interactive element is reachable using only the keyboard, in a logical (visual/DOM-matching) order.
- [ ] No keyboard trap: focus can always move away from the component using standard keys.
- [ ] Documented keyboard interactions: _list keys and resulting behavior_.

## Focus

- [ ] Visible focus indication uses the approved focus tokens at every focusable state.
- [ ] Focus is placed predictably on open, close, add, remove, and error/validation state changes.

## Naming and roles

- [ ] Accessible name and role documented for each interactive element:

  | Element | Role | Accessible name source |
  | ------- | ---- | ---------------------- |
  |         |      |                        |

- [ ] Accessible name/role documented for each state variation (for example expanded vs. collapsed).

## Screen reader verification

- [ ] Screen reader / browser pairing(s) tested: _e.g., VoiceOver + Safari, NVDA + Firefox_.
- [ ] Observed behavior notes: _describe what was announced and any discrepancies from the expected name/role/value_.

## Zoom and reflow

- [ ] Verified usable at 400% zoom / 320px-equivalent reflow without loss of content or function.

## Motion

- [ ] Animation (if any) respects `prefers-reduced-motion`. N/A if the component has no animation.

## Forced colors / high contrast

- [ ] Component remains usable and distinguishable under a forced-colors mode.

## Localization

- [ ] String expansion, truncation, and wrapping behavior noted for long or translated content.
- [ ] Bidirectional text behavior noted, if the component's `localization` metadata is `layout-sensitive`.

## Open items

List any unresolved findings and their tracking issue. A component with open items here cannot be marked `stable`.

- _none_
