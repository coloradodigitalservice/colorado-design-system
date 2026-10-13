# @coloradodigitalservice/colorado-design-tokens

## 0.1.7

### Patch Changes

- f85b635: Add supplemental color tokens for USWDS-theming roles (visited-link, alert tints) and wire overrides in the uswds layer.

  All Figma-supplied values map to existing palette primitives:

  - `text-action-link-visited` → co-plum-80 (#491839)
  - `bg-alert-info` / `border-alert-info` → co-blue-10 / co-blue-60-brand
  - `bg-alert-warning` / `border-alert-warning` → co-yellow-10 / co-yellow-30-brand
  - `bg-alert-urgent` / `border-alert-urgent` → co-red-10 / co-red-60-brand

  No new tokens: Success alerts retain USWDS defaults, Accordion focus reuses color-bg-action-focus, and disabled buttons need no border override.

  Add Link visited contrast pair (17 pairs total). Overrides in _cods-color-overrides.scss are layer-aware and avoid !important. See CODS-P2-010 and ADR-002.

- ff3fa08: Keep TypeScript on 6.x and defer Dependabot updates to 7.x and later until compiler API compatibility is restored.

## 0.1.6

### Patch Changes

- f7e0b57: Add supplemental color tokens for USWDS-theming roles (visited-link, alert tints) and wire overrides in the uswds layer.

  All Figma-supplied values map to existing palette primitives:

  - `text-action-link-visited` → co-plum-80 (#491839)
  - `bg-alert-info` / `border-alert-info` → co-blue-10 / co-blue-60-brand
  - `bg-alert-warning` / `border-alert-warning` → co-yellow-10 / co-yellow-30-brand
  - `bg-alert-urgent` / `border-alert-urgent` → co-red-10 / co-red-60-brand

  No new tokens: Success alerts retain USWDS defaults, Accordion focus reuses color-bg-action-focus, and disabled buttons need no border override.

  Add Link visited contrast pair (17 pairs total). Overrides in _cods-color-overrides.scss are layer-aware and avoid !important. See CODS-P2-010 and ADR-002.

## 0.1.5

### Patch Changes

- 4d94782: Add GitHub Pages deployment workflow to automatically build and deploy the reference site (`apps/web`) to GitHub Pages on pushes to `main` and manual workflow dispatch.

## 0.1.4

No changes in this release.

## 0.1.3

No changes in this release.

## 0.1.2

### Patch Changes

- 33507e6: Document the Site Alert and Accordion vertical-slice components on the Astro docs site, with component summaries, anatomy, accessibility guidance, known limitations, Figma links, and development-release install instructions.
- 5a52cd3: Release 0.1.2

## 0.1.1

No changes in this release.

## 0.1.0

### Minor Changes

- Complete Phase 1: workspace and package foundations, design tokens, USWDS theming and cascade layers, documentation and Storybook foundations, automated validation, and tag-driven release artifacts. Phase 2 Site Alert and Accordion implementations are not included.
