---
@coloradodigitalservice/colorado-design-tokens: patch
@coloradodigitalservice/colorado-design-system: patch
---

Add supplemental color tokens for USWDS-theming roles (visited-link, alert tints) and wire overrides in the uswds layer.

All Figma-supplied values map to existing palette primitives:

- `text-action-link-visited` → co-plum-80 (#491839)
- `bg-alert-info` / `border-alert-info` → co-blue-10 / co-blue-60-brand
- `bg-alert-warning` / `border-alert-warning` → co-yellow-10 / co-yellow-30-brand
- `bg-alert-urgent` / `border-alert-urgent` → co-red-10 / co-red-60-brand

No new tokens: Success alerts retain USWDS defaults, Accordion focus reuses color-bg-action-focus, and disabled buttons need no border override.

Add Link visited contrast pair (17 pairs total). Overrides in _cods-color-overrides.scss are layer-aware and avoid !important. See CODS-P2-010 and ADR-002.
