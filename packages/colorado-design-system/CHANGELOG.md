# @coloradodigitalservice/colorado-design-system

## 0.2.7

### Patch Changes

- 8dc4e46: Align Accordion chevrons, focus spread, and variants with Figma. Make bordered the default and provide an explicit transparent borderless variant. Add isolated Accordion border/focus tokens while preserving shared semantic colors and global focus geometry.
- 8dc4e46: Source Accordion caret masks from the shared pinned Phosphor pipeline after comparing the original Figma exports, preserving size, color, spacing, and forced-color behavior.
- 8dc4e46: Complete Accordion production states and usage guidance, consume approved spacing and typography tokens, and wrap the USWDS lifecycle with state observation and focus-safe teardown. Nested accordions remain unenhanced and readable.
- Updated dependencies [8dc4e46]
  - @coloradodigitalservice/colorado-design-tokens@0.2.7

## 0.2.6

### Patch Changes

- f2f31e9: Update Site Alert with informational, warning, and emergency surfaces, an emergency icon, and placement guidance.
- @coloradodigitalservice/colorado-design-tokens@0.2.6

## 0.2.5

### Patch Changes

- b73c24c: Add experimental In-Page Alert with four severity variants, canonical examples, contextual usage and live-region guidance.
- Updated dependencies [b73c24c]
  - @coloradodigitalservice/colorado-design-tokens@0.2.5

## 0.2.4

### Patch Changes

- a47e224: Add the experimental static Link component with inline, standalone, disabled, phone, download, and new-tab examples, documentation, and accessibility regressions. Inherit content leading, expose Link-scoped RTL mirroring, and use shared Phosphor masks. Add six underline foundation dimensions while preserving the catalog's existing Link color aliases.
- Updated dependencies [a47e224]
  - @coloradodigitalservice/colorado-design-tokens@0.2.4

## 0.2.3

### Patch Changes

- 6205f04: Support component CSS masks that reference approved generated Phosphor icon files, with missing-asset validation. Reconcile the shared Icon foundation's token dependencies separately from the approved 28-component inventory and retain both the expanded catalog and icon contrast coverage.
- 3cf641b: Add the experimental static Button component with Primary, Secondary, and Danger
  variants, decorative start/end icons, native disabled behavior, and accessible
  icon-only and navigation examples.
- Updated dependencies [6205f04]
- Updated dependencies [6205f04]
  - @coloradodigitalservice/colorado-design-tokens@0.2.3

## 0.2.2

### Patch Changes

- ace85bc: Add a Phosphor-based icon foundation, including approved icon assets, catalog, and size tokens. Replace packaged USWDS icon assets with equivalent Phosphor icons while retaining non-icon assets.
- Updated dependencies [ace85bc]
  - @coloradodigitalservice/colorado-design-tokens@0.2.2

## 0.2.1

### Patch Changes

- 54440e1: Use a relative documentation link in the accordion fixture so it resolves correctly when the documentation site is hosted at the domain root or under the GitHub Pages repository path.
- Updated dependencies [54440e1]
  - @coloradodigitalservice/colorado-design-tokens@0.2.1

## 0.2.0

### Minor Changes

- e02000c: Refresh the development dependency lockfile, upgrade the internal web app to Astro 7.4.0, update the GitHub Pages artifact action, and align workspace validation with Turbo 2.11.8.

### Patch Changes

- Updated dependencies [e02000c]
  - @coloradodigitalservice/colorado-design-tokens@0.2.0

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
- Updated dependencies [f85b635]
- Updated dependencies [ff3fa08]
  - @coloradodigitalservice/colorado-design-tokens@0.1.7

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

- Updated dependencies [f7e0b57]
  - @coloradodigitalservice/colorado-design-tokens@0.1.6

## 0.1.5

### Patch Changes

- 4d94782: Add GitHub Pages deployment workflow to automatically build and deploy the reference site (`apps/web`) to GitHub Pages on pushes to `main` and manual workflow dispatch.
- Updated dependencies [4d94782]
  - @coloradodigitalservice/colorado-design-tokens@0.1.5

## 0.1.4

### Patch Changes

- 31ab558: Add the `/styles.css` stylesheet export and retain `/styles` as a compatibility
  alias to the same built CSS file. Update repository imports and documentation
  to prefer `/styles.css`, removing the dedicated ambient declarations in the
  web and Storybook apps.
- @coloradodigitalservice/colorado-design-tokens@0.1.4

## 0.1.3

### Patch Changes

- 3f21b23: Validate copied fonts and images while preserving their
  filenames, bytes, and relative CSS URLs. Eliminate expected unresolved-asset
  warnings and fail builds when a stylesheet references a missing packaged file,
  including during watch rebuilds.
- @coloradodigitalservice/colorado-design-tokens@0.1.3

## 0.1.2

### Patch Changes

- 33507e6: Document the Site Alert and Accordion vertical-slice components on the Astro docs site, with component summaries, anatomy, accessibility guidance, known limitations, Figma links, and development-release install instructions.
- 5a52cd3: Release 0.1.2
- Updated dependencies [33507e6]
- Updated dependencies [5a52cd3]
  - @coloradodigitalservice/colorado-design-tokens@0.1.2

## 0.1.1

### Patch Changes

- f1a0604: Generate shared state examples from canonical fixtures and metadata; validate component metadata and detect drift across packaged assets, Storybook, documentation, and the static consumer.
- @coloradodigitalservice/colorado-design-tokens@0.1.1

## 0.1.0

### Minor Changes

- Complete Phase 1: workspace and package foundations, design tokens, USWDS theming and cascade layers, documentation and Storybook foundations, automated validation, and tag-driven release artifacts. Phase 2 Site Alert and Accordion implementations are not included.

### Patch Changes

- Updated dependencies
  - @coloradodigitalservice/colorado-design-tokens@0.1.0
